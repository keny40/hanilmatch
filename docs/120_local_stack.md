# Local Stack

## Services

- `db`: PostgreSQL 16
- `redis`: Redis 7
- `api`: FastAPI backend
- `worker`: translation background worker
- `web`: Next.js frontend

## Start

1. Run `docker compose up --build`
2. Open `http://localhost:3000`
3. Open `http://localhost:8000/docs`
4. Run `docker compose exec api alembic upgrade head`

## Notes

- The API waits for PostgreSQL health before starting.
- The frontend expects the backend at `http://localhost:8000/api/v1`.
- For local non-Docker development, keep the same port mapping to avoid CORS confusion.
