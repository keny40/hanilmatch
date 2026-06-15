# Docker 환경과 Alembic 실행 전 점검

이 문서는 Docker 기준 환경파일과 `alembic upgrade head` 실행 전에 확인할 항목을 정리합니다.

## 1. Docker용 환경파일

Docker Compose는 이제 [backend/.env.docker](C:/Users/ss/Documents/hanil-matching/backend/.env.docker:1)를 사용합니다.

가장 먼저 바꿔야 할 값:

- `JWT_SECRET_KEY`
- `OPENAI_API_KEY`

필요 시 바꿀 값:

- `TRANSLATION_PROVIDER`
- `STORAGE_BACKEND`
- `S3_*`
- `RECOMMENDATION_SCHEDULER_*`

## 2. 로컬용과 Docker용 차이

로컬 실행:

- 파일: [backend/.env](C:/Users/ss/Documents/hanil-matching/backend/.env:1)
- DB host: `localhost`

Docker 실행:

- 파일: [backend/.env.docker](C:/Users/ss/Documents/hanil-matching/backend/.env.docker:1)
- DB host: `db`

## 3. Alembic 실행 전 체크

아래 항목을 먼저 확인하면 됩니다.

1. PostgreSQL 컨테이너 또는 로컬 DB가 실제로 떠 있는지
2. `DATABASE_URL`이 현재 실행 방식과 맞는지
3. `backend/alembic/versions`에 최신 마이그레이션이 모두 있는지
4. 백엔드 문법 오류가 없는지
5. 기존 DB에 충돌하는 수동 테이블이 없는지

현재 확인된 마이그레이션은 다음까지 있습니다.

- `20260426_000001_initial_schema.py`
- `20260426_000002_operational_features.py`
- `20260426_000003_sessions_and_integrations.py`
- `20260426_000004_message_read_and_sessions_api.py`
- `20260426_000005_profile_age_group.py`
- `20260426_000006_platform_pair_constraint.py`
- `20260426_000007_match_recommendations_and_notifications.py`

## 4. 권장 실행 순서

Docker 기준:

1. `backend/.env.docker`에서 비밀값 채우기
2. `docker compose up --build -d`
3. `docker compose exec api alembic upgrade head`
4. `docker compose exec api python -m app.db.init_db` 가 필요하면 추가 실행

로컬 기준:

1. `backend/.env` 점검
2. PostgreSQL 실행 확인
3. `cd backend`
4. `alembic upgrade head`

## 5. 이번 점검에서 같이 보완한 것

- Docker가 `.env.example` 대신 실제 Docker 전용 환경파일을 쓰도록 수정
- Alembic `env.py`에서 전체 모델을 불러오도록 보완

이 상태면 다음 단계는 실제 `docker compose up`과 `alembic upgrade head` 실행 검증입니다.
