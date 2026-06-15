import time

from app.db.session import SessionLocal
from app.services.translation import process_pending_translations


def run_worker(poll_seconds: int = 5) -> None:
    while True:
        with SessionLocal() as db:
            processed = process_pending_translations(db)
            print(f"translation-worker processed={processed}")
        time.sleep(poll_seconds)


if __name__ == "__main__":
    run_worker()
