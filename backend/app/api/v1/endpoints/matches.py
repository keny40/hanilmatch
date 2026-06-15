from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.api.v1.endpoints.billing import premium_enabled_for
from app.models.match import Match
from app.models.match_recommendation import MatchRecommendation
from app.models.notification import Notification
from app.models.user import User
from app.schemas.match import MatchCreate, MatchRead, MatchRecommendationRead
from app.services.matching import generate_match_recommendations, list_match_recommendations, recommendation_to_read


router = APIRouter()


def mark_recommendation_notifications_read(db: Session, current_user: User, recommendation_id: UUID) -> None:
    notifications = db.scalars(
        select(Notification).where(
            and_(
                Notification.user_id == current_user.id,
                Notification.notification_type == "match_recommendation",
                Notification.is_read.is_(False),
            )
        )
    )
    for notification in notifications:
        payload = notification.payload or {}
        if str(payload.get("recommendation_id")) == str(recommendation_id):
            notification.is_read = True


@router.get("/recommendations", response_model=list[MatchRecommendationRead])
def get_recommendations(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MatchRecommendationRead]:
    effective_limit = limit if premium_enabled_for(current_user) else min(limit, 4)
    recommendations = list_match_recommendations(db, current_user, limit=effective_limit)
    if not recommendations:
        recommendations = generate_match_recommendations(db, current_user, limit=effective_limit)
    return [recommendation_to_read(db, recommendation) for recommendation in recommendations]


@router.post("/recommendations/generate", response_model=list[MatchRecommendationRead], status_code=201)
def generate_recommendations(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MatchRecommendationRead]:
    if not premium_enabled_for(current_user):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Premium membership is required to refresh recommendations",
        )
    recommendations = generate_match_recommendations(db, current_user, limit=limit)
    return [recommendation_to_read(db, recommendation) for recommendation in recommendations]


@router.post("/recommendations/{recommendation_id}/accept", response_model=MatchRead, status_code=201)
def accept_recommendation(
    recommendation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MatchRead:
    recommendation = db.get(MatchRecommendation, recommendation_id)
    if recommendation is None or recommendation.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
    if recommendation.status != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Recommendation is no longer active")

    user1_id, user2_id = sorted([recommendation.user_id, recommendation.candidate_user_id], key=str)
    match = db.scalar(select(Match).where(and_(Match.user1_id == user1_id, Match.user2_id == user2_id)))
    if match is None:
        match = Match(user1_id=user1_id, user2_id=user2_id, score=float(recommendation.score))
        db.add(match)

    recommendation.status = "accepted"
    mark_recommendation_notifications_read(db, current_user, recommendation.id)
    db.commit()
    db.refresh(match)
    return MatchRead.model_validate(match)


@router.post("/recommendations/{recommendation_id}/dismiss", response_model=MatchRecommendationRead)
def dismiss_recommendation(
    recommendation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MatchRecommendationRead:
    recommendation = db.get(MatchRecommendation, recommendation_id)
    if recommendation is None or recommendation.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")

    recommendation.status = "dismissed"
    mark_recommendation_notifications_read(db, current_user, recommendation.id)
    db.commit()
    db.refresh(recommendation)
    return recommendation_to_read(db, recommendation)


@router.post("/", response_model=MatchRead, status_code=201)
def create_match(
    payload: MatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MatchRead:
    if current_user.id not in {payload.user1_id, payload.user2_id}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Match must include current user")

    user1_id, user2_id = sorted([payload.user1_id, payload.user2_id], key=str)
    if user1_id == user2_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot match a user with themselves")

    existing_match = db.scalar(
        select(Match).where(and_(Match.user1_id == user1_id, Match.user2_id == user2_id))
    )
    if existing_match is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match already exists")

    match = Match(user1_id=user1_id, user2_id=user2_id, score=payload.score)
    db.add(match)
    db.commit()
    db.refresh(match)
    return MatchRead.model_validate(match)


@router.get("/", response_model=list[MatchRead])
def list_my_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MatchRead]:
    statement = (
        select(Match)
        .where(or_(Match.user1_id == current_user.id, Match.user2_id == current_user.id))
        .order_by(Match.created_at.desc())
    )
    return [MatchRead.model_validate(match) for match in db.scalars(statement)]
