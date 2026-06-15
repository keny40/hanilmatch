from dataclasses import dataclass
from datetime import datetime, time, timedelta, timezone
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.api.v1.endpoints.admin import get_or_create_admin_settings
from app.models.match import Match
from app.models.match_recommendation import MatchRecommendation
from app.models.notification import Notification
from app.models.profile import Profile
from app.models.report import Report
from app.models.user import User
from app.schemas.match import MatchRecommendationRead
from app.schemas.profile import PublicProfileRead
from app.schemas.user import UserRead
from app.services.ai_matching import embedding_similarity_map, generate_ai_rationale, is_ai_matching_enabled


AGE_GROUP_ORDER = {
    "18_24": 0,
    "25_29": 1,
    "30_34": 2,
    "35_39": 3,
    "40_44": 4,
    "45_plus": 5,
}
MATCH_ALERT_THRESHOLD = 40.0
MATCH_ALERT_COOLDOWN = timedelta(days=3)


@dataclass
class RecommendationGenerationResult:
    recommendations: list[MatchRecommendation]
    connected_matches: int = 0
    skipped_incomplete_profiles: int = 0


@dataclass
class DailyAutoMatchingResult:
    processed_users: int = 0
    connected_matches: int = 0
    skipped_already_matched_today: int = 0
    skipped_no_candidates: int = 0
    skipped_incomplete_profiles: int = 0


def _normalize_nationality(value: str | None) -> str | None:
    normalized = (value or "").strip().lower()
    if normalized in {"kr", "korea", "korean", "south korea", "한국", "대한민국"}:
        return "KR"
    if normalized in {"jp", "japan", "japanese", "일본"}:
        return "JP"
    return None


def _normalize_gender(value: str | None) -> str | None:
    normalized = (value or "").strip().lower()
    if normalized in {"male", "man", "m", "남성", "남자"}:
        return "male"
    if normalized in {"female", "woman", "f", "여성", "여자"}:
        return "female"
    return None


def _is_korean_male(user: User) -> bool:
    return _normalize_nationality(user.nationality) == "KR" and _normalize_gender(user.gender) == "male"


def _is_japanese_female(user: User) -> bool:
    return _normalize_nationality(user.nationality) == "JP" and _normalize_gender(user.gender) == "female"


def _profile_required_for_recommendation(profile: Profile | None) -> bool:
    return bool(
        profile
        and profile.age
        and profile.native_language
        and profile.learning_language
        and (profile.match_purpose or profile.bio)
    )


def is_recommendation_eligible(user: User, profile: Profile | None = None) -> bool:
    return (_is_korean_male(user) or _is_japanese_female(user)) and _profile_required_for_recommendation(profile)


def is_allowed_recommendation_pair(user: User, candidate: User) -> bool:
    return (_is_korean_male(user) and _is_japanese_female(candidate)) or (
        _is_japanese_female(user) and _is_korean_male(candidate)
    )


def _mvp_candidate_filter_for(user: User):
    if _is_korean_male(user):
        return and_(User.nationality.in_(("JP", "일본", "Japan", "japan")), User.gender.in_(("female", "여성", "여자", "woman", "f")))
    if _is_japanese_female(user):
        return and_(User.nationality.in_(("KR", "한국", "대한민국", "Korea", "korea")), User.gender.in_(("male", "남성", "남자", "man", "m")))
    return None


def _excluded_candidate_ids(db: Session, user_id: UUID) -> set[UUID]:
    excluded_ids = {user_id}

    matched_pairs = db.execute(
        select(Match.user1_id, Match.user2_id).where(or_(Match.user1_id == user_id, Match.user2_id == user_id))
    )
    for user1_id, user2_id in matched_pairs:
        excluded_ids.add(user1_id)
        excluded_ids.add(user2_id)

    reported_ids = db.execute(
        select(Report.reported_id).where(Report.reporter_id == user_id).union(
            select(Report.reporter_id).where(Report.reported_id == user_id)
        )
    )
    excluded_ids.update(reported_ids.scalars())
    return excluded_ids


def _age_group_distance(left: str, right: str) -> int | None:
    if left not in AGE_GROUP_ORDER or right not in AGE_GROUP_ORDER:
        return None
    return abs(AGE_GROUP_ORDER[left] - AGE_GROUP_ORDER[right])


def calculate_match_score(user: User, profile: Profile, candidate: User, candidate_profile: Profile) -> tuple[float, list[str], str]:
    score = 45.0
    reasons: list[str] = []

    shared_interests = sorted(set(profile.interests) & set(candidate_profile.interests))
    if shared_interests:
        shared_bonus = min(24, len(shared_interests) * 6)
        score += shared_bonus
        reasons.append(f"공통 관심사 {len(shared_interests)}개 일치")

    distance = _age_group_distance(profile.age_group, candidate_profile.age_group)
    if distance == 0:
        score += 16
        reasons.append("연령대가 잘 맞음")
    elif distance == 1:
        score += 10
        reasons.append("연령대가 인접해 대화 흐름이 자연스러움")
    elif distance is not None:
        score += max(0, 6 - distance * 2)

    if candidate.is_verified:
        score += 8
        reasons.append("상대가 본인 인증을 완료함")

    if candidate.language in {"ja", "ko"}:
        score += 6
        reasons.append("핵심 지원 언어 사용")

    if profile.bio and candidate_profile.bio:
        score += 5
        reasons.append("서로 자기소개가 있어 매칭 판단 정보가 충분함")

    if user.language != candidate.language:
        score += 4
        reasons.append("상호 언어 교환 흐름에 적합함")

    score = min(99.0, round(score, 2))
    if not reasons:
        reasons.append("기본 국적/성별 조건과 프로필 정보를 충족함")

    rationale = " / ".join(reasons[:4])
    return score, reasons, rationale


def _apply_embedding_bonus(
    score: float,
    reasons: list[str],
    candidate_id: str,
    similarity_map: dict[str, float],
) -> float:
    similarity = similarity_map.get(candidate_id)
    if similarity is None:
        return score

    if similarity >= 0.75:
        score += 14
        reasons.append("프로필 의미 유사도가 높음")
    elif similarity >= 0.6:
        score += 9
        reasons.append("프로필 맥락이 잘 맞음")
    elif similarity >= 0.45:
        score += 5
        reasons.append("프로필 결이 무난하게 맞음")
    return score


def _create_notification(db: Session, user_id: UUID, recommendation: MatchRecommendation, candidate: User) -> None:
    user = db.get(User, user_id)
    if user and user.language.lower().startswith("ja"):
        title = "新しいAIおすすめが届きました。"
        body = f"{candidate.email} さんはプロフィールと関心ごとをもとにおすすめされました。おすすめを承認するとマッチが成立します。"
    else:
        title = "새로운 AI 추천이 도착했습니다."
        body = f"{candidate.email} 님은 프로필과 관심사를 바탕으로 추천되었습니다. 추천을 수락하면 매칭이 연결됩니다."
    notification = Notification(
        user_id=user_id,
        notification_type="match_recommendation",
        title=title,
        body=body,
        payload={
            "recommendation_id": str(recommendation.id),
            "candidate_user_id": str(candidate.id),
            "score": float(recommendation.score),
        },
        is_read=False,
    )
    db.add(notification)


def _create_match_connected_notification(db: Session, user: User, partner: User, match: Match, *, daily: bool = False) -> None:
    if user.language and user.language.lower().startswith("ja"):
        title = "今日のAIマッチが成立しました。" if daily else "新しいAIマッチが成立しました。"
        body = (
            "プロフィールと関心ごとをもとに、今日のおすすめ相手とマッチしました。チャットを始めてみましょう。"
            if daily
            else "プロフィールと関心ごとをもとに、相性のよい相手とマッチしました。チャットを始めてみましょう。"
        )
    else:
        title = "오늘의 AI 매칭이 연결되었습니다." if daily else "새로운 AI 매칭이 연결되었습니다."
        body = (
            "프로필과 관심사를 바탕으로 오늘의 추천 상대와 매칭되었습니다. 채팅을 시작해 보세요."
            if daily
            else "프로필과 관심사를 바탕으로 적합한 상대와 매칭되었습니다. 채팅을 시작해 보세요."
        )

    db.add(
        Notification(
            user_id=user.id,
            notification_type="daily_ai_match_connected" if daily else "ai_match_connected",
            title=title,
            body=body,
            payload={
                "match_id": str(match.id),
                "partner_user_id": str(partner.id),
                "score": float(match.score),
            },
            is_read=False,
        )
    )


def _mark_recommendation_notifications_read(db: Session, recommendation: MatchRecommendation) -> None:
    notifications = db.scalars(
        select(Notification).where(
            and_(
                Notification.user_id == recommendation.user_id,
                Notification.notification_type == "match_recommendation",
                Notification.is_read.is_(False),
            )
        )
    )
    for notification in notifications:
        payload = notification.payload or {}
        if str(payload.get("recommendation_id")) == str(recommendation.id):
            notification.is_read = True


def _get_or_create_match(db: Session, recommendation: MatchRecommendation) -> tuple[Match, bool]:
    user1_id, user2_id = sorted([recommendation.user_id, recommendation.candidate_user_id], key=str)
    match = db.scalar(select(Match).where(and_(Match.user1_id == user1_id, Match.user2_id == user2_id)))
    if match is not None:
        return match, False

    match = Match(user1_id=user1_id, user2_id=user2_id, score=float(recommendation.score))
    db.add(match)
    db.flush()
    return match, True


def _connect_recommendation(
    db: Session,
    recommendation: MatchRecommendation,
    user: User,
    candidate: User,
    *,
    daily: bool = False,
) -> bool:
    match, created = _get_or_create_match(db, recommendation)
    recommendation.status = "accepted"
    _mark_recommendation_notifications_read(db, recommendation)

    reciprocal = db.scalar(
        select(MatchRecommendation).where(
            and_(
                MatchRecommendation.user_id == candidate.id,
                MatchRecommendation.candidate_user_id == user.id,
                MatchRecommendation.status != "dismissed",
            )
        )
    )
    if reciprocal is not None:
        reciprocal.status = "accepted"
        _mark_recommendation_notifications_read(db, reciprocal)

    if created:
        _create_match_connected_notification(db, user, candidate, match, daily=daily)
        _create_match_connected_notification(db, candidate, user, match, daily=daily)
    return created


def _today_window(now: datetime | None = None) -> tuple[datetime, datetime]:
    current = now or datetime.now(timezone.utc)
    start = datetime.combine(current.date(), time.min, tzinfo=timezone.utc)
    return start, start + timedelta(days=1)


def _has_match_created_today(db: Session, user_id: UUID, now: datetime | None = None) -> bool:
    today_start, tomorrow_start = _today_window(now)
    return bool(
        db.scalar(
            select(Match.id)
            .where(
                and_(
                    or_(Match.user1_id == user_id, Match.user2_id == user_id),
                    Match.created_at >= today_start,
                    Match.created_at < tomorrow_start,
                )
            )
            .limit(1)
        )
    )


def get_daily_match_status(db: Session, user: User) -> str:
    profile = db.get(Profile, user.id)
    if not profile or not _profile_required_for_recommendation(profile):
        return "profile_incomplete"

    nationality = _normalize_nationality(profile.nationality or user.nationality)
    gender = _normalize_gender(profile.gender or user.gender)
    is_eligible_pair_target = (nationality == "KR" and gender == "male") or (nationality == "JP" and gender == "female")
    if not is_eligible_pair_target:
        return "not_eligible"

    if _has_match_created_today(db, user.id):
        return "completed"

    return "waiting"


def _should_notify(db: Session, recommendation: MatchRecommendation, notification_limit: int) -> bool:
    if recommendation.status != "pending":
        return False
    if float(recommendation.score) < MATCH_ALERT_THRESHOLD:
        return False
    unread_count = db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == recommendation.user_id,
            Notification.notification_type == "match_recommendation",
            Notification.is_read.is_(False),
        )
    ) or 0
    if unread_count >= notification_limit:
        return False
    if recommendation.last_notified_at is None:
        return True
    return recommendation.last_notified_at <= datetime.now(timezone.utc) - MATCH_ALERT_COOLDOWN


def _generate_match_recommendation_result(
    db: Session,
    current_user: User,
    limit: int = 20,
    *,
    daily: bool = False,
    commit: bool = True,
) -> RecommendationGenerationResult:
    profile = db.get(Profile, current_user.id)
    if not is_recommendation_eligible(current_user, profile):
        return RecommendationGenerationResult(recommendations=[], skipped_incomplete_profiles=1)

    excluded_ids = _excluded_candidate_ids(db, current_user.id)
    mvp_candidate_filter = _mvp_candidate_filter_for(current_user)
    if mvp_candidate_filter is None:
        return RecommendationGenerationResult(recommendations=[], skipped_incomplete_profiles=1)

    candidates = db.execute(
        select(User, Profile)
        .join(Profile, Profile.user_id == User.id)
        .where(User.id.not_in(excluded_ids), mvp_candidate_filter)
        .order_by(User.is_verified.desc(), User.created_at.desc())
    ).all()
    try:
        similarity_map = embedding_similarity_map(current_user, profile, candidates)
    except Exception:
        similarity_map = {}

    existing_recommendations = {
        recommendation.candidate_user_id: recommendation
        for recommendation in db.scalars(select(MatchRecommendation).where(MatchRecommendation.user_id == current_user.id))
    }

    ranked: list[tuple[MatchRecommendation, User, Profile]] = []
    now = datetime.now(timezone.utc)
    admin_settings = get_or_create_admin_settings(db)

    for candidate, candidate_profile in candidates:
        if not is_recommendation_eligible(candidate, candidate_profile):
            continue
        if not is_allowed_recommendation_pair(current_user, candidate):
            continue
        score, reasons, rationale = calculate_match_score(current_user, profile, candidate, candidate_profile)
        score = _apply_embedding_bonus(score, reasons, str(candidate.id), similarity_map)
        score = min(99.0, round(score, 2))
        rationale = " / ".join(reasons[:4])
        recommendation = existing_recommendations.get(candidate.id)
        if recommendation is None:
            recommendation = MatchRecommendation(
                user_id=current_user.id,
                candidate_user_id=candidate.id,
                score=score,
                status="pending",
                rationale=rationale,
                generated_by="ai_draft",
            )
            db.add(recommendation)
        elif recommendation.status in {"dismissed", "accepted"}:
            continue
        else:
            recommendation.score = score
            recommendation.rationale = rationale
            recommendation.generated_by = "ai_draft"

        ranked.append((recommendation, candidate, candidate_profile))

    ranked.sort(key=lambda item: (float(item[0].score), item[1].is_verified), reverse=True)
    selected = ranked[:limit]

    if is_ai_matching_enabled():
        for recommendation, candidate, candidate_profile in selected[:5]:
            try:
                recommendation.rationale = generate_ai_rationale(
                    current_user,
                    profile,
                    candidate,
                    candidate_profile,
                    recommendation.rationale,
                )
                recommendation.generated_by = "ai_draft"
            except Exception:
                recommendation.generated_by = "rule_based"

    db.flush()

    connected_matches = 0
    auto_connected_recommendation: MatchRecommendation | None = None
    if selected:
        auto_connected_recommendation, auto_connected_candidate, _auto_connected_profile = selected[0]
        if _connect_recommendation(db, auto_connected_recommendation, current_user, auto_connected_candidate, daily=daily):
            connected_matches += 1

    pending_selected = [
        (recommendation, candidate, candidate_profile)
        for recommendation, candidate, candidate_profile in selected
        if recommendation is not auto_connected_recommendation and recommendation.status == "pending"
    ]

    for recommendation, candidate, _candidate_profile in pending_selected:
        if _should_notify(db, recommendation, admin_settings.match_notification_limit):
            recommendation.last_notified_at = now
            _create_notification(db, current_user.id, recommendation, candidate)

    if commit:
        db.commit()
    return RecommendationGenerationResult(
        recommendations=[recommendation for recommendation, _candidate, _candidate_profile in pending_selected],
        connected_matches=connected_matches,
    )


def generate_match_recommendation_result(db: Session, current_user: User, limit: int = 20) -> RecommendationGenerationResult:
    return _generate_match_recommendation_result(db, current_user, limit=limit)


def generate_match_recommendations(db: Session, current_user: User, limit: int = 20) -> list[MatchRecommendation]:
    return generate_match_recommendation_result(db, current_user, limit=limit).recommendations


def run_daily_auto_matching(db: Session, limit: int | None = None) -> DailyAutoMatchingResult:
    statement = (
        select(User)
        .join(Profile, Profile.user_id == User.id)
        .order_by(User.created_at.asc())
    )
    if limit is not None:
        statement = statement.limit(limit)

    users = list(
        db.scalars(statement)
    )
    result = DailyAutoMatchingResult()

    for user in users:
        profile = db.get(Profile, user.id)
        if not is_recommendation_eligible(user, profile):
            result.skipped_incomplete_profiles += 1
            continue

        result.processed_users += 1
        if _has_match_created_today(db, user.id):
            result.skipped_already_matched_today += 1
            continue

        generation_result = _generate_match_recommendation_result(
            db,
            user,
            limit=1,
            daily=True,
            commit=False,
        )
        if generation_result.connected_matches:
            result.connected_matches += generation_result.connected_matches
        else:
            result.skipped_no_candidates += 1

    db.commit()
    return result


def list_match_recommendations(db: Session, current_user: User, limit: int = 20) -> list[MatchRecommendation]:
    current_profile = db.get(Profile, current_user.id)
    if not is_recommendation_eligible(current_user, current_profile):
        return []
    mvp_candidate_filter = _mvp_candidate_filter_for(current_user)
    if mvp_candidate_filter is None:
        return []
    excluded_ids = _excluded_candidate_ids(db, current_user.id)
    return list(
        db.scalars(
            select(MatchRecommendation)
            .join(User, User.id == MatchRecommendation.candidate_user_id)
            .join(Profile, Profile.user_id == MatchRecommendation.candidate_user_id)
            .where(
                and_(
                    MatchRecommendation.user_id == current_user.id,
                    MatchRecommendation.status.in_(("pending", "recommended", "active")),
                    MatchRecommendation.candidate_user_id.not_in(excluded_ids),
                    mvp_candidate_filter,
                    Profile.age.is_not(None),
                    Profile.native_language.is_not(None),
                    Profile.learning_language.is_not(None),
                    or_(Profile.match_purpose.is_not(None), Profile.bio.is_not(None)),
                )
            )
            .order_by(MatchRecommendation.score.desc(), MatchRecommendation.created_at.desc())
            .limit(limit)
        )
    )


def recommendation_to_read(db: Session, recommendation: MatchRecommendation) -> MatchRecommendationRead:
    candidate = db.get(User, recommendation.candidate_user_id)
    candidate_profile = db.get(Profile, recommendation.candidate_user_id)
    if candidate is None or candidate_profile is None:
        raise ValueError("Recommendation candidate is missing")
    candidate_profile_data = PublicProfileRead.model_validate(candidate_profile).model_dump()
    candidate_profile_data["nationality"] = candidate.nationality
    candidate_profile_data["gender"] = candidate.gender

    return MatchRecommendationRead(
        id=recommendation.id,
        user_id=recommendation.user_id,
        candidate_user_id=recommendation.candidate_user_id,
        score=float(recommendation.score),
        status=recommendation.status,
        rationale=recommendation.rationale,
        generated_by=recommendation.generated_by,
        last_notified_at=recommendation.last_notified_at,
        created_at=recommendation.created_at,
        updated_at=recommendation.updated_at,
        candidate=UserRead.model_validate(candidate),
        candidate_profile=PublicProfileRead(**candidate_profile_data),
    )
