# 프로젝트 구조와 사용법

## 1. 이 프로젝트가 무엇인지

이 프로젝트는 신뢰 기반 국제 매칭 플랫폼을 목표로 합니다.

핵심 대상:

- 한국 남성 사용자
- 일본 여성 사용자
- 검증된 프로필
- 번역 기반 메시징
- 신고/운영 관리
- 구조화된 매칭 데이터

즉, 단순 소개용 문서가 아니라 웹앱으로 바로 확장 가능한 풀스택 기반 프로젝트입니다.

## 2. 저장소 구조

### 루트

- `README.md`: 프로젝트 입문 안내
- `docker-compose.yml`: 로컬 전체 실행 스택
- `000_run_order.txt`: SQL 및 문서 읽기 순서
- `001_users.sql` ~ `006_seed_sample.sql`: 분리형 스키마/시드 파일
- `010_all_in_one_schema.sql`: 단일 스키마 파일
- `docs/`: 설계, 운영, 구조, 보안 문서 모음

### 백엔드

경로: [backend](C:/Users/ss/Documents/hanil-matching/backend)

역할:

- REST API 제공
- 인증/session/csrf 처리
- DB 접근 관리
- 번역 및 저장소 연동
- WebSocket 채팅 제공
- 워커 실행

중요 경로:

- [backend/app/main.py](C:/Users/ss/Documents/hanil-matching/backend/app/main.py:1): 앱 진입점
- [backend/app/api/router.py](C:/Users/ss/Documents/hanil-matching/backend/app/api/router.py:1): API 및 WebSocket 라우팅
- [backend/app/core/config.py](C:/Users/ss/Documents/hanil-matching/backend/app/core/config.py:1): 환경설정
- [backend/app/core/security.py](C:/Users/ss/Documents/hanil-matching/backend/app/core/security.py:1): 비밀번호/JWT 로직
- [backend/app/middleware/csrf.py](C:/Users/ss/Documents/hanil-matching/backend/app/middleware/csrf.py:1): CSRF 미들웨어
- [backend/app/services/translation.py](C:/Users/ss/Documents/hanil-matching/backend/app/services/translation.py:1): 번역 provider 연동
- [backend/app/services/storage.py](C:/Users/ss/Documents/hanil-matching/backend/app/services/storage.py:1): 로컬/S3 저장소 추상화
- [backend/app/workers/translation_worker.py](C:/Users/ss/Documents/hanil-matching/backend/app/workers/translation_worker.py:1): 번역 워커

### 프론트엔드

경로: [frontend](C:/Users/ss/Documents/hanil-matching/frontend)

역할:

- 랜딩 페이지
- 회원가입/로그인
- 프로필 온보딩
- 대시보드
- 매칭 추천
- 채팅
- 세션 관리

중요 경로:

- [frontend/app/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/page.tsx:1): 랜딩 페이지
- [frontend/app/login/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/login/page.tsx:1): 로그인
- [frontend/app/signup/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/signup/page.tsx:1): 회원가입
- [frontend/app/onboarding/profile/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/onboarding/profile/page.tsx:1): 프로필 및 사진 업로드
- [frontend/app/dashboard/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/dashboard/page.tsx:1): 대시보드
- [frontend/app/matches/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/matches/page.tsx:1): 매칭 추천/수락
- [frontend/app/chat/[userId]/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/chat/[userId]/page.tsx:1): 채팅
- [frontend/app/settings/sessions/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/settings/sessions/page.tsx:1): 세션 해지 UI
- [frontend/lib/api.ts](C:/Users/ss/Documents/hanil-matching/frontend/lib/api.ts:1): 프론트 API 클라이언트

### 문서

경로: [docs](C:/Users/ss/Documents/hanil-matching/docs)

역할:

- DB 구조 설명
- API 계약
- 백엔드 구조 설명
- 로컬 실행 가이드
- 운영/보안/실시간 처리 메모

## 3. 데이터베이스 구조

핵심 테이블:

- `users`
- `profiles`
- `profile_photos`
- `matches`
- `messages`
- `reports`
- `refresh_sessions`

역할:

- `users`: 사용자 식별, 인증, 국적, 검증 상태
- `profiles`: 자기소개, 나이, 연령대, 관심사
- `profile_photos`: 프로필 사진 메타데이터
- `matches`: 수락된 매치와 점수
- `messages`: 원문, 번역문, 번역 상태, 읽음 상태
- `reports`: 안전 신고
- `refresh_sessions`: refresh-token 회전 상태

먼저 보면 좋은 파일:

- [docs/020_erd.md](C:/Users/ss/Documents/hanil-matching/docs/020_erd.md:1)
- [010_all_in_one_schema.sql](C:/Users/ss/Documents/hanil-matching/010_all_in_one_schema.sql:1)

## 4. 인증 방식

로그인 흐름:

1. 사용자가 `/api/v1/auth/login`으로 로그인
2. 백엔드가 아래 쿠키를 설정
   - access token cookie
   - refresh token cookie
   - csrf token cookie
3. 프론트는 `credentials: include`로 요청
4. 쓰기 요청은 `X-CSRF-Token` 헤더 전송
5. access token 만료 시 `/api/v1/auth/refresh`로 1회 재시도

관련 파일:

- [backend/app/api/v1/endpoints/auth.py](C:/Users/ss/Documents/hanil-matching/backend/app/api/v1/endpoints/auth.py:1)
- [backend/app/middleware/csrf.py](C:/Users/ss/Documents/hanil-matching/backend/app/middleware/csrf.py:1)
- [frontend/lib/api.ts](C:/Users/ss/Documents/hanil-matching/frontend/lib/api.ts:1)

## 5. 채팅 구조

REST:

- 메시지 전송
- 메시지 조회
- 대화 목록 조회

워커:

- `pending` 상태 메시지를 번역 워커가 처리

실시간:

- 매치된 사용자 쌍 기준 WebSocket 채널
- 새 메시지 생성 시 브로드캐스트
- 프론트 재연결 루프 포함

관련 파일:

- [backend/app/api/v1/endpoints/messages.py](C:/Users/ss/Documents/hanil-matching/backend/app/api/v1/endpoints/messages.py:1)
- [backend/app/api/v1/endpoints/realtime.py](C:/Users/ss/Documents/hanil-matching/backend/app/api/v1/endpoints/realtime.py:1)
- [backend/app/services/realtime.py](C:/Users/ss/Documents/hanil-matching/backend/app/services/realtime.py:1)
- [backend/app/workers/translation_worker.py](C:/Users/ss/Documents/hanil-matching/backend/app/workers/translation_worker.py:1)
- [frontend/app/chat/[userId]/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/chat/[userId]/page.tsx:1)

## 6. 사진 업로드 구조

로컬 모드:

- 프론트가 백엔드로 업로드
- 백엔드는 로컬 `storage/`에 저장

S3 모드:

1. 프론트가 백엔드에 presigned upload URL 요청
2. 프론트가 S3에 직접 업로드
3. 프론트가 업로드된 파일 URL을 백엔드 DB에 등록

관련 파일:

- [backend/app/services/storage.py](C:/Users/ss/Documents/hanil-matching/backend/app/services/storage.py:1)
- [backend/app/api/v1/endpoints/storage.py](C:/Users/ss/Documents/hanil-matching/backend/app/api/v1/endpoints/storage.py:1)
- [backend/app/api/v1/endpoints/profile_photos.py](C:/Users/ss/Documents/hanil-matching/backend/app/api/v1/endpoints/profile_photos.py:1)
- [frontend/app/onboarding/profile/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/onboarding/profile/page.tsx:1)

## 7. 실행 방법

### Docker로 전체 실행

1. `docker compose up --build`
2. `docker compose exec api alembic upgrade head`
3. 접속:
   - `http://localhost:3000`
   - `http://localhost:8000/docs`

### 백엔드만 실행

1. `backend` 이동
2. 가상환경 생성
3. `requirements.txt` 설치
4. `.env.example`를 `.env`로 복사
5. DB와 provider 값 설정
6. `alembic upgrade head`
7. `uvicorn app.main:app --reload`

### 프론트엔드만 실행

1. `frontend` 이동
2. 의존성 설치
3. `NEXT_PUBLIC_API_BASE_URL` 설정
4. Next.js 개발 서버 실행

## 8. 자주 만질 환경변수

백엔드:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `TRANSLATION_PROVIDER`
- `DEEPL_API_KEY`
- `GOOGLE_TRANSLATE_API_KEY`
- `STORAGE_BACKEND`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_ENDPOINT_URL`

프론트엔드:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_STORAGE_BACKEND`

## 9. 권장 읽기 순서

1. [README.md](C:/Users/ss/Documents/hanil-matching/README.md:1)
2. [000_run_order.txt](C:/Users/ss/Documents/hanil-matching/000_run_order.txt:1)
3. [docs/020_erd.md](C:/Users/ss/Documents/hanil-matching/docs/020_erd.md:1)
4. [docs/040_api_contract.md](C:/Users/ss/Documents/hanil-matching/docs/040_api_contract.md:1)
5. [docs/090_backend_structure.md](C:/Users/ss/Documents/hanil-matching/docs/090_backend_structure.md:1)
6. [docs/120_local_stack.md](C:/Users/ss/Documents/hanil-matching/docs/120_local_stack.md:1)
7. [docs/180_external_integrations.md](C:/Users/ss/Documents/hanil-matching/docs/180_external_integrations.md:1)
8. [docs/190_realtime_and_sessions.md](C:/Users/ss/Documents/hanil-matching/docs/190_realtime_and_sessions.md:1)

## 10. 아직 프로덕션 완성 전인 부분

- 실제 provider 키 기준 스테이징 검증
- 브라우저 WebSocket 실운영 테스트
- S3 버킷 정책/CORS 검증
- 현재 디바이스 표시 포함 session 관리 강화
- 번역 실패 재시도 전략
- rate limiting / abuse control
- production logging / monitoring / alerting
