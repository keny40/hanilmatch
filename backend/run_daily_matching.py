from app.db.session import SessionLocal
from app.services.matching import run_daily_auto_matching


def main() -> None:
    with SessionLocal() as db:
        result = run_daily_auto_matching(db)
        print(
            "daily-auto-matching "
            f"processed_users={result.processed_users} "
            f"connected_matches={result.connected_matches} "
            f"skipped_already_matched_today={result.skipped_already_matched_today} "
            f"skipped_no_candidates={result.skipped_no_candidates} "
            f"skipped_incomplete_profiles={result.skipped_incomplete_profiles}"
        )


if __name__ == "__main__":
    main()
