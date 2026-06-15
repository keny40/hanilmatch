from app.db.base import Base
from app.db.session import engine
from app.models import community_post, inquiry, match, message, profile, profile_photo, refresh_session, report, user  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
