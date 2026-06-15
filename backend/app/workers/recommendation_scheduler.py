import time
from dataclasses import dataclass

from sqlalchemy import select

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.profile import Profile
from app.models.user import User
from app.services.matching import generate_match_recommendation_result


@dataclass
class RecommendationBatchResult:
    processed_users: int
    connected_matches: int
    skipped_incomplete_profiles: int


def process_recommendation_batch_result(limit: int | None = None) -> RecommendationBatchResult:
    with SessionLocal() as db:
        users = list(
            db.scalars(
                select(User)
                .join(Profile, Profile.user_id == User.id)
                .order_by(User.created_at.asc())
                .limit(limit or settings.recommendation_scheduler_batch_size)
            )
        )
        connected_matches = 0
        skipped_incomplete_profiles = 0
        for user in users:
            result = generate_match_recommendation_result(db, user, limit=settings.recommendation_generation_limit)
            connected_matches += result.connected_matches
            skipped_incomplete_profiles += result.skipped_incomplete_profiles
        return RecommendationBatchResult(
            processed_users=len(users),
            connected_matches=connected_matches,
            skipped_incomplete_profiles=skipped_incomplete_profiles,
        )


def process_recommendation_batch(limit: int | None = None) -> int:
    return process_recommendation_batch_result(limit).processed_users


def run_scheduler(poll_seconds: int | None = None) -> None:
    interval = poll_seconds or settings.recommendation_scheduler_poll_seconds
    while True:
        result = process_recommendation_batch_result()
        print(
            "recommendation-scheduler "
            f"processed_users={result.processed_users} connected_matches={result.connected_matches}"
        )
        time.sleep(interval)


if __name__ == "__main__":
    run_scheduler()
