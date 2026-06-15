from decimal import Decimal
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db, is_admin_user
from app.core.config import settings
from app.models.admin_setting import AdminSetting
from app.models.community_post import CommunityPost
from app.models.inquiry import Inquiry
from app.models.match import Match
from app.models.notification import Notification
from app.models.popup_notice import PopupNotice
from app.models.profile import Profile
from app.models.report import Report
from app.models.user import User
from app.schemas.admin import (
    AdminSettingsRead,
    AdminSettingsUpdate,
    AdminInquiryRead,
    AdminInquiryUpdate,
    AdminInquiryStatusUpdate,
    AdminDailyAutoMatchingResult,
    AdminRecommendationRunRequest,
    AdminRecommendationRunResult,
    AdminUserRecommendationRunResult,
    AdminUserRead,
    AdminUserUpdate,
    BroadcastNotificationCreate,
    PopupNoticeCreate,
    PopupNoticeRead,
    PopupNoticeUpdate,
    AdminReportRead,
    AdminReportUpdate,
)
from app.schemas.community import COMMUNITY_STATUSES, CommunityPostAdminUpdate, CommunityPostRead


router = APIRouter()


def get_or_create_admin_settings(db: Session) -> AdminSetting:
    settings_row = db.get(AdminSetting, 1)
    if settings_row is None:
        settings_row = AdminSetting(id=1)
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row


def community_post_to_read(db: Session, post: CommunityPost) -> CommunityPostRead:
    author = db.get(User, post.author_id)
    return CommunityPostRead(
        id=post.id,
        author_id=post.author_id,
        author_email=author.email if author else None,
        category=post.category,
        title=post.title,
        content=post.content,
        status=post.status,
        is_public=post.is_public,
        admin_note=post.admin_note,
        created_at=post.created_at,
        updated_at=post.updated_at,
        published_at=post.published_at,
    )


def ensure_community_posts_table(db: Session) -> None:
    CommunityPost.__table__.create(bind=db.get_bind(), checkfirst=True)

@router.get("/stats")
def read_admin_stats(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> dict[str, int]:
    ensure_community_posts_table(db)
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    total_users = db.scalar(select(func.count()).select_from(User)) or 0
    completed_profiles = db.scalar(
        select(func.count())
        .select_from(Profile)
        .where(
            Profile.age.is_not(None),
            Profile.native_language.is_not(None),
            Profile.learning_language.is_not(None),
            or_(Profile.match_purpose.is_not(None), Profile.bio.is_not(None)),
        )
    ) or 0
    verified_users = db.scalar(
        select(func.count()).select_from(User).where(User.is_verified.is_(True))
    ) or 0
    paid_users = db.scalar(
        select(func.count()).select_from(User).where(User.membership_tier == "paid")
    ) or 0
    today_matches = db.scalar(
        select(func.count()).select_from(Match).where(Match.created_at >= today_start)
    ) or 0
    pending_reports = db.scalar(
        select(func.count()).select_from(Report).where(Report.status == "pending")
    ) or 0
    pending_inquiries = db.scalar(
        select(func.count()).select_from(Inquiry).where(Inquiry.status == "pending")
    ) or 0
    pending_community_posts = db.scalar(
        select(func.count()).select_from(CommunityPost).where(CommunityPost.status == "pending")
    ) or 0

    return {
        "total_users": total_users,
        "completed_profiles": completed_profiles,
        "verified_users": verified_users,
        "paid_users": paid_users,
        "today_matches": today_matches,
        "pending_reports": pending_reports,
        "pending_inquiries": pending_inquiries,
        "pending_community_posts": pending_community_posts,
    }

@router.get("/users", response_model=list[AdminUserRead])
def list_users(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> list[AdminUserRead]:
    users = list(db.scalars(select(User).order_by(User.created_at.desc())))
    result: list[AdminUserRead] = []
    for user in users:
        data = AdminUserRead.model_validate(user).model_dump()
        data["is_admin"] = is_admin_user(user)
        result.append(AdminUserRead(**data))
    return result


@router.patch("/users/{user_id}", response_model=AdminUserRead)
def update_user(
    user_id: UUID,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> AdminUserRead:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.is_verified is not None:
        user.is_verified = payload.is_verified
    if payload.is_admin is not None:
        user.is_admin = payload.is_admin
    if payload.membership_tier is not None:
        if payload.membership_tier not in {"free", "paid"}:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="membership_tier must be free or paid")
        user.membership_tier = payload.membership_tier

    db.commit()
    db.refresh(user)
    data = AdminUserRead.model_validate(user).model_dump()
    data["is_admin"] = is_admin_user(user)
    return AdminUserRead(**data)


@router.get("/settings", response_model=AdminSettingsRead)
def read_admin_settings(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> AdminSettingsRead:
    settings_row = get_or_create_admin_settings(db)
    return AdminSettingsRead(
        match_notification_limit=settings_row.match_notification_limit,
        paid_membership_price_usd=float(settings_row.paid_membership_price_usd),
    )


@router.put("/settings", response_model=AdminSettingsRead)
def update_admin_settings(
    payload: AdminSettingsUpdate,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> AdminSettingsRead:
    settings_row = get_or_create_admin_settings(db)
    settings_row.match_notification_limit = payload.match_notification_limit
    settings_row.paid_membership_price_usd = Decimal(str(payload.paid_membership_price_usd))
    db.commit()
    db.refresh(settings_row)
    return AdminSettingsRead(
        match_notification_limit=settings_row.match_notification_limit,
        paid_membership_price_usd=float(settings_row.paid_membership_price_usd),
    )


@router.get("/inquiries", response_model=list[AdminInquiryRead])
def list_inquiries(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> list[AdminInquiryRead]:
    inquiries = list(db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc())))
    return [AdminInquiryRead.model_validate(inquiry) for inquiry in inquiries]


@router.patch("/inquiries/{inquiry_id}/status", response_model=AdminInquiryRead)
def update_inquiry_status(
    inquiry_id: UUID,
    payload: AdminInquiryStatusUpdate,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> AdminInquiryRead:
    if payload.status not in {"pending", "reviewed", "replied", "closed"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="status must be pending, reviewed, replied, or closed")

    inquiry = db.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")

    inquiry.status = payload.status
    db.commit()
    db.refresh(inquiry)
    return AdminInquiryRead.model_validate(inquiry)


@router.patch("/contact-inquiries/{inquiry_id}", response_model=AdminInquiryRead)
def update_contact_inquiry(
    inquiry_id: UUID,
    payload: AdminInquiryUpdate,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> AdminInquiryRead:
    inquiry = db.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")

    if payload.status is not None:
        if payload.status not in {"pending", "reviewed", "replied", "closed"}:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="status must be pending, reviewed, replied, or closed")
        inquiry.status = payload.status

    if payload.admin_note is not None:
        normalized_note = payload.admin_note.strip()
        inquiry.admin_note = normalized_note or None

    db.commit()
    db.refresh(inquiry)
    return AdminInquiryRead.model_validate(inquiry)


@router.post("/recommendations/run", response_model=AdminRecommendationRunResult)
def run_recommendations(
    payload: AdminRecommendationRunRequest | None = None,
    _admin_user: User = Depends(get_current_admin_user),
) -> AdminRecommendationRunResult:
    from app.workers.recommendation_scheduler import process_recommendation_batch_result

    limit = payload.limit if payload and payload.limit is not None else settings.recommendation_scheduler_batch_size
    result = process_recommendation_batch_result(limit)
    if result.connected_matches > 0:
        message = f"AI 매칭 {result.connected_matches}건을 연결했습니다. 프로필이 미완성인 사용자는 매칭 대상에서 제외되었습니다."
    else:
        message = "추천 가능한 대상이 없어 매칭이 생성되지 않았습니다. 프로필이 미완성인 사용자는 매칭 대상에서 제외되었습니다."
    return AdminRecommendationRunResult(
        processed_users=result.processed_users,
        connected_matches=result.connected_matches,
        skipped_incomplete_profiles=result.skipped_incomplete_profiles,
        message=message,
    )


@router.post("/recommendations/users/{user_id}/run", response_model=AdminUserRecommendationRunResult)
def run_user_recommendations(
    user_id: UUID,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> AdminUserRecommendationRunResult:
    from app.services.matching import generate_match_recommendation_result

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = generate_match_recommendation_result(db, user, limit=settings.recommendation_generation_limit)
    if result.connected_matches > 0:
        message = f"AI 매칭 {result.connected_matches}건을 연결했습니다."
    else:
        message = "추천 가능한 대상이 없어 매칭이 생성되지 않았습니다."
    return AdminUserRecommendationRunResult(
        user_id=user.id,
        created_count=len(result.recommendations),
        connected_matches=result.connected_matches,
        skipped_incomplete_profiles=result.skipped_incomplete_profiles,
        message=message,
    )


@router.post("/recommendations/daily/run", response_model=AdminDailyAutoMatchingResult)
def run_daily_auto_matching_endpoint(
    payload: AdminRecommendationRunRequest | None = None,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> AdminDailyAutoMatchingResult:
    from app.services.matching import run_daily_auto_matching

    result = run_daily_auto_matching(db, limit=payload.limit if payload and payload.limit is not None else None)
    if result.connected_matches > 0:
        message = (
            f"오늘 자동 매칭 {result.connected_matches}건을 연결했습니다. "
            "이미 오늘 매칭된 사용자는 건너뛰었습니다. 추천 가능한 상대가 없는 사용자는 제외되었습니다."
        )
    else:
        message = (
            "오늘 자동 매칭으로 연결된 건이 없습니다. "
            "이미 오늘 매칭된 사용자는 건너뛰었고, 추천 가능한 상대가 없는 사용자는 제외되었습니다."
        )
    return AdminDailyAutoMatchingResult(
        processed_users=result.processed_users,
        connected_matches=result.connected_matches,
        skipped_already_matched_today=result.skipped_already_matched_today,
        skipped_no_candidates=result.skipped_no_candidates,
        skipped_incomplete_profiles=result.skipped_incomplete_profiles,
        message=message,
    )


@router.post("/broadcast-notifications", status_code=201)
def broadcast_notification(
    payload: BroadcastNotificationCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> dict[str, int]:
    users = list(db.scalars(select(User.id)))
    for user_id in users:
        db.add(
            Notification(
                user_id=user_id,
                notification_type="admin_broadcast",
                title=payload.title,
                body=payload.body,
                payload={"created_by": str(admin_user.id)},
                is_read=False,
            )
        )
    db.commit()
    return {"sent_count": len(users)}


@router.get("/community-posts", response_model=list[CommunityPostRead])
def list_community_posts(
    post_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> list[CommunityPostRead]:
    ensure_community_posts_table(db)
    if post_status and post_status not in COMMUNITY_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid community post status")

    stmt = select(CommunityPost).order_by(CommunityPost.created_at.desc())
    if post_status:
        stmt = stmt.where(CommunityPost.status == post_status)

    posts = list(db.scalars(stmt))
    return [community_post_to_read(db, post) for post in posts]


@router.patch("/community-posts/{post_id}", response_model=CommunityPostRead)
def update_community_post(
    post_id: UUID,
    payload: CommunityPostAdminUpdate,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> CommunityPostRead:
    ensure_community_posts_table(db)
    post = db.get(CommunityPost, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found")

    if payload.status is not None:
        post.status = payload.status
        post.is_public = payload.status == "approved"
        if payload.status == "approved" and post.published_at is None:
            post.published_at = func.now()

    if payload.admin_note is not None:
        post.admin_note = payload.admin_note

    db.commit()
    db.refresh(post)
    return community_post_to_read(db, post)


@router.get("/popup-notices", response_model=list[PopupNoticeRead])
def list_popup_notices(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> list[PopupNoticeRead]:
    notices = list(db.scalars(select(PopupNotice).order_by(PopupNotice.created_at.desc())))
    return [PopupNoticeRead.model_validate(notice) for notice in notices]


@router.post("/popup-notices", response_model=PopupNoticeRead, status_code=201)
def create_popup_notice(
    payload: PopupNoticeCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> PopupNoticeRead:
    if payload.locale not in {"all", "ko", "ja"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="locale must be all, ko, or ja")

    notice = PopupNotice(
        title=payload.title,
        body=payload.body,
        locale=payload.locale,
        is_active=payload.is_active,
        created_by=admin_user.id,
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return PopupNoticeRead.model_validate(notice)


@router.patch("/popup-notices/{notice_id}/status", response_model=PopupNoticeRead)
def update_popup_notice(
    notice_id: UUID,
    payload: PopupNoticeUpdate,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> PopupNoticeRead:
    notice = db.get(PopupNotice, notice_id)
    if notice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Popup notice not found")
    notice.is_active = payload.is_active
    db.commit()
    db.refresh(notice)
    return PopupNoticeRead.model_validate(notice)


@router.get("/reports", response_model=list[AdminReportRead])
def list_reports(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
) -> list[AdminReportRead]:
    reports = list(db.scalars(select(Report).order_by(Report.created_at.desc())))
    result: list[AdminReportRead] = []
    for report in reports:
        result.append(
            AdminReportRead(
                id=report.id,
                reporter_id=report.reporter_id,
                reporter_email=report.reporter.email if report.reporter else "-",
                reported_id=report.reported_id,
                reported_email=report.reported.email if report.reported else "-",
                reason=report.reason,
                created_at=report.created_at,
                status=report.status,
processed_by=report.processed_by,
processed_at=report.processed_at,
            )
        )
    return result

@router.patch("/reports/{report_id}", response_model=AdminReportRead)
def update_report_status(
    report_id: UUID,
    payload: AdminReportUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
) -> AdminReportRead:
    if payload.status not in {"pending", "reviewed", "dismissed", "action_taken"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="status must be pending, reviewed, dismissed, or action_taken",
        )

    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    report.status = payload.status
    report.processed_by = admin_user.id
    report.processed_at = func.now()

    db.commit()
    db.refresh(report)

    return AdminReportRead(
        id=report.id,
        reporter_id=report.reporter_id,
        reporter_email=report.reporter.email if report.reporter else "-",
        reported_id=report.reported_id,
        reported_email=report.reported.email if report.reported else "-",
        reason=report.reason,
        status=report.status,
        processed_by=report.processed_by,
        processed_at=report.processed_at,
        created_at=report.created_at,
    )

@router.get("/popup-notices/active", response_model=list[PopupNoticeRead])
def list_active_popup_notices(
    locale: str = Query(default="all"),
    db: Session = Depends(get_db),
) -> list[PopupNoticeRead]:
    if locale not in {"all", "ko", "ja"}:
        locale = "all"

    notices = list(
        db.scalars(
            select(PopupNotice)
            .where(PopupNotice.is_active.is_(True))
            .where(or_(PopupNotice.locale == "all", PopupNotice.locale == locale))
            .order_by(PopupNotice.created_at.desc())
        )
    )
    return [PopupNoticeRead.model_validate(notice) for notice in notices]

class AdminReportRead(BaseModel):
    id: UUID
    reporter_id: UUID
    reporter_email: str
    reported_id: UUID
    reported_email: str
    reason: str
    status: str
    processed_by: UUID | None = None
    processed_at: datetime | None = None
    created_at: datetime


class AdminReportUpdate(BaseModel):
    status: str
