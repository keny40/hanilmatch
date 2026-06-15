# HanilMatch MVP

HanilMatch는 한국 남성과 일본 여성을 위한 AI 추천형 한일 매칭 MVP입니다. 프로필 필수 정보와 관심사를 바탕으로 자동 매칭을 만들고, 매칭된 사용자가 번역 채팅으로 대화할 수 있게 돕습니다.

현재 서비스는 MVP 테스트 단계입니다. 실제 결제 기능은 아직 연동하지 않았으며, `/billing`은 요금제 안내용입니다. 정식 운영 전 이용약관, 개인정보처리방침, 결제정책, 신고/차단 운영정책은 별도 검토가 필요합니다.

## 기술 구성

- Frontend: Next.js
- Backend: FastAPI
- DB: Windows PostgreSQL 16
- Auth: 이메일 로그인, Google OAuth foundation, JWT/refresh session
- AI/Translation: OpenAI API 설정 시 번역 기능 사용
- Storage: 로컬 `backend/storage` 기반 프로필 사진 저장

## 로컬 실행

### Backend

```powershell
cd C:\Users\keny4\Documents\hanil-matching-finished\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

백엔드 API 문서는 `http://localhost:8000/docs`에서 확인합니다.

### Frontend

```powershell
cd C:\Users\keny4\Documents\hanil-matching-finished\frontend
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 확인합니다.

## 검증 명령

### Backend

```powershell
cd C:\Users\keny4\Documents\hanil-matching-finished\backend
python -m compileall -q app
python -c "import app.main; print('ok')"
```

### Frontend

```powershell
cd C:\Users\keny4\Documents\hanil-matching-finished\frontend
npm run build
npx tsc --noEmit
```

## 환경변수

실제 운영 secret은 `.env.example`에 넣지 않습니다. `.env`와 `.env.local`은 git에 커밋하지 않습니다.

### Backend: `backend/.env`

`backend/.env.example`를 복사해서 사용합니다.

```env
APP_NAME=HanilMatch-api
APP_DEBUG=true
API_V1_PREFIX=/api/v1
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/kr_jp_match
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
AUTH_COOKIE_NAME=krjp_access_token
REFRESH_COOKIE_NAME=krjp_refresh_token
CSRF_COOKIE_NAME=krjp_csrf_token
AUTH_COOKIE_SECURE=false
JWT_SECRET_KEY=change-me
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=14
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TRANSLATION_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4.1-mini
STORAGE_BACKEND=local
STORAGE_PUBLIC_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
FRONTEND_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
ADMIN_EMAILS=keny4000@gmail.com
PAYMENT_PROVIDER=
PAYMENT_SANDBOX=true
PAYMENT_CLIENT_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
RECOMMENDATION_SCHEDULER_BATCH_SIZE=100
RECOMMENDATION_GENERATION_LIMIT=20
```

이 프로젝트의 JWT secret 변수명은 `JWT_SECRET_KEY`입니다. 다른 문서의 `SECRET_KEY` 표현은 이 값으로 대응해서 설정합니다.

### Frontend: `frontend/.env.local`

`frontend/.env.local.example`를 복사해서 사용합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_STORAGE_BACKEND=local
```

운영 배포 시 `NEXT_PUBLIC_API_BASE_URL`은 운영 API 주소로 변경합니다.

## DB 준비

### 1. PostgreSQL 16 설치

Windows PostgreSQL 16을 설치합니다. 로컬 개발 기본값은 아래와 같습니다.

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `kr_jp_match`

### 2. DB 생성

```powershell
& "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres kr_jp_match
```

CMD에서는 아래처럼 실행할 수 있습니다.

```cmd
"C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres kr_jp_match
```

### 3. SQL 적용 순서

현재 저장소의 SQL 파일은 프로젝트 루트에 있습니다. 테스트 서버 신규 DB에는 아래 순서로 적용합니다.

1. `001_users.sql` - 사용자, refresh session, 프로필 사진 기본 테이블
2. `002_profiles.sql` - 프로필 테이블
3. `003_matches.sql` - 매칭 테이블
4. `004_messages.sql` - 채팅 메시지 테이블
5. `005_reports.sql` - 신고 테이블
6. `007_matching_automation.sql` - 추천, 알림 테이블
7. `011_profile_mvp_fields.sql` - 직업, 지역, 언어, 목적, 비공개 전화번호 컬럼
8. `012_inquiries.sql` - 문의 테이블
9. `013_update_inquiry_statuses.sql` - 문의 상태값 정리
10. `014_inquiry_admin_note.sql` - 문의 관리자 메모 컬럼
11. `015_google_oauth_fields.sql` - Google OAuth 사용자 컬럼
12. `016_community_posts.sql` - 관리자 승인형 커뮤니티 게시글 테이블
13. `017_translation_cache.sql` - 번역 캐시 테이블
14. `018_community_immediate_public.sql` - 커뮤니티 글 즉시 공개 정책 적용
15. `006_seed_sample_utf8_nobom.sql` 또는 `006_seed_sample.sql` - 선택 사항, 로컬 테스트용 샘플 사용자

`010_all_in_one_schema.sql`은 초기 단일 스키마 참고용입니다. 최신 MVP 기능을 모두 맞추려면 위 분리 SQL 순서 적용을 기본으로 사용합니다.

### 4. PowerShell SQL 실행 예시

```powershell
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$root = "C:\Users\keny4\Documents\hanil-matching-finished"

& $psql -U postgres -d kr_jp_match -f "$root\001_users.sql"
& $psql -U postgres -d kr_jp_match -f "$root\002_profiles.sql"
& $psql -U postgres -d kr_jp_match -f "$root\003_matches.sql"
& $psql -U postgres -d kr_jp_match -f "$root\004_messages.sql"
& $psql -U postgres -d kr_jp_match -f "$root\005_reports.sql"
& $psql -U postgres -d kr_jp_match -f "$root\007_matching_automation.sql"
& $psql -U postgres -d kr_jp_match -f "$root\011_profile_mvp_fields.sql"
& $psql -U postgres -d kr_jp_match -f "$root\012_inquiries.sql"
& $psql -U postgres -d kr_jp_match -f "$root\013_update_inquiry_statuses.sql"
& $psql -U postgres -d kr_jp_match -f "$root\014_inquiry_admin_note.sql"
& $psql -U postgres -d kr_jp_match -f "$root\015_google_oauth_fields.sql"
& $psql -U postgres -d kr_jp_match -f "$root\016_community_posts.sql"
& $psql -U postgres -d kr_jp_match -f "$root\017_translation_cache.sql"
& $psql -U postgres -d kr_jp_match -f "$root\018_community_immediate_public.sql"
```

### 5. CMD SQL 실행 예시

```cmd
cd C:\Users\keny4\Documents\hanil-matching-finished
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "001_users.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "002_profiles.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "003_matches.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "004_messages.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "005_reports.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "007_matching_automation.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "011_profile_mvp_fields.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "012_inquiries.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "013_update_inquiry_statuses.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "014_inquiry_admin_note.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "015_google_oauth_fields.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "016_community_posts.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "017_translation_cache.sql"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d kr_jp_match -f "018_community_immediate_public.sql"
```

## Google OAuth 설정

Google 로그인 foundation을 사용하려면 Google Cloud Console에서 OAuth Client를 생성합니다.

- Application type: `Web application`
- Authorized redirect URI, 로컬: `http://localhost:8000/api/v1/auth/google/callback`
- Authorized redirect URI, 운영: `https://운영도메인/api/v1/auth/google/callback`

백엔드 `.env`에 아래 값을 설정합니다.

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

운영 배포 시 `GOOGLE_REDIRECT_URI`, `FRONTEND_URL`, `CORS_ORIGINS`를 운영 도메인으로 변경하고, Google Cloud Console에도 운영 redirect URI를 별도로 등록해야 합니다.

## 관리자 계정

관리자 접근은 이메일 기준으로 판단합니다. MVP 기본 관리자 이메일은 `keny4000@gmail.com`입니다.

```env
ADMIN_EMAILS=keny4000@gmail.com
```

기존 DB의 `is_admin` 값이 있더라도 관리자 접근 최종 판단은 위 이메일 목록을 기준으로 합니다. Google 로그인과 일반 이메일 로그인 모두 로그인된 사용자의 이메일로 판단합니다.

## OpenAI 번역 설정

- 번역 기능은 `OPENAI_API_KEY`가 있어야 정상 동작합니다.
- 키가 없거나 provider 설정이 맞지 않으면 화면에 번역 실패 안내가 표시될 수 있습니다.
- 실제 API key는 `backend/.env`에만 보관합니다.
- 코드, README, 커밋 메시지, 이슈 등에 실제 key를 남기지 않습니다.

권장 예시:

```env
TRANSLATION_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_TRANSLATION_MODEL=gpt-4o-mini
```

## 결제 sandbox/test mode 정책

현재 실제 카드 결제는 발생하지 않습니다. `/billing`은 요금제와 MVP 결제 준비 상태를 안내하는 화면이며, 결제 버튼도 실제 결제창으로 이동하지 않습니다.

추후 결제사를 선택한 뒤 sandbox/test mode에서 먼저 검증합니다. 운영 결제 key는 sandbox 검증 전까지 사용하지 않습니다.

```env
PAYMENT_PROVIDER=
PAYMENT_SANDBOX=true
PAYMENT_CLIENT_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
```

특정 결제사는 아직 확정하지 않습니다. 실제 secret은 `backend/.env`에만 보관하고 문서나 코드에 넣지 않습니다.

## 프로필 사진 storage

- 프로필 사진은 기본적으로 `backend/storage/profile_photos` 아래에 저장됩니다.
- `backend/storage`는 git에 커밋하지 않습니다.
- 운영 서버에서는 `backend/storage` 폴더가 없으면 생성하고, 백엔드 프로세스가 읽기/쓰기 가능한 권한을 가져야 합니다.
- 운영 전 storage 백업 정책을 별도로 준비합니다.
- S3 등 외부 storage로 전환하려면 `STORAGE_BACKEND`, `STORAGE_PUBLIC_BASE_URL`, S3 관련 값을 별도로 설정하고 업로드 흐름을 스테이징에서 검증합니다.

## Daily AI Matching

서버 시작 시 자동 매칭은 실행하지 않습니다. 개발/테스트 환경에서는 관리자 페이지의 `오늘 자동 매칭 실행` 버튼을 사용하거나 아래 배치 파일을 수동 실행합니다.

```bat
run_daily_matching.bat
```

Windows 작업 스케줄러에 등록할 때는 작업 만들기에서 트리거를 매일 오전 9시 또는 오후 12시로 설정하고, 동작 프로그램에 아래 파일을 지정합니다.

```text
C:\Users\keny4\Documents\hanil-matching-finished\run_daily_matching.bat
```

## 테스트 서버 업로드 전 체크리스트

- [ ] `npm run build` 통과
- [ ] `npx tsc --noEmit` 통과
- [ ] `python -m compileall -q app` 통과
- [ ] `python -c "import app.main; print('ok')"` 통과
- [ ] `backend/.env` 운영값 설정
- [ ] `frontend/.env.local` 운영값 설정
- [ ] DB 테이블/컬럼 적용 완료
- [ ] Google OAuth 운영 redirect URI 등록
- [ ] `OPENAI_API_KEY` 설정
- [ ] `backend/storage` 폴더 생성/권한 확인
- [ ] 관리자 계정 생성/권한 확인
- [ ] `/admin` 접근 확인
- [ ] `/community` 글쓰기/승인 확인
- [ ] `/matches` 연결된 매칭과 대화 진입 확인
- [ ] 채팅 `번역하기` 확인
- [ ] 모바일 화면 확인

## MVP 주요 수동 테스트

1. 회원가입 또는 Google 로그인
2. 프로필 필수 정보 입력
3. 프로필 사진 업로드
4. 관리자 페이지에서 오늘 자동 매칭 실행
5. 일반 사용자 대시보드에서 최근 매칭 확인
6. `/matches`에서 연결된 매칭 확인
7. 대화방 진입, 메시지 전송, 번역하기 확인
8. 신고 등록 및 관리자 신고 관리 확인
9. `/contact` 문의 등록 및 관리자 문의 메모 저장 확인
10. `/community/new` 글 작성, 관리자 승인, 공개 목록 표시 확인
11. `/billing`이 실제 결제로 이동하지 않고 안내용으로 표시되는지 확인

## 보안 주의

- 실제 Google client secret, OpenAI key, DB 운영 비밀번호는 문서와 코드에 넣지 않습니다.
- `.env`, `.env.local`, `backend/storage`, `.next`, `node_modules`, `venv`는 커밋하지 않습니다.
- 운영에서는 `AUTH_COOKIE_SECURE=true`와 HTTPS 적용을 검토합니다.
- 관리자 계정은 `ADMIN_EMAILS` 또는 DB 권한값을 운영 전에 확인합니다.
