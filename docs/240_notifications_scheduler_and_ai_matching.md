# 알림 UI, 정기 추천 스케줄러, AI 매칭 보강

이 문서는 최근 추가된 운영 기능 3가지를 설명합니다.

## 1. 알림 UI

프론트엔드에 [frontend/app/notifications/page.tsx](C:/Users/ss/Documents/hanil-matching/frontend/app/notifications/page.tsx:1) 페이지가 추가되었습니다.

기능:

- 내 알림 목록 조회
- 읽음/안읽음 상태 표시
- 읽음 처리
- 관련 화면으로 이동

현재는 추천 알림 중심으로 동작합니다.

## 2. 정기 추천 스케줄러

백엔드에 [backend/app/workers/recommendation_scheduler.py](C:/Users/ss/Documents/hanil-matching/backend/app/workers/recommendation_scheduler.py:1) 가 추가되었습니다.

역할:

- 프로필이 있는 사용자를 순회
- 추천 후보를 다시 계산
- 높은 점수 추천은 `notifications`에 저장

Docker에서는 `recommendation-scheduler` 서비스가 이 작업을 담당합니다.

## 3. AI 매칭 보강층

AI 관련 로직은 [backend/app/services/ai_matching.py](C:/Users/ss/Documents/hanil-matching/backend/app/services/ai_matching.py:1)에 들어 있습니다.

현재 구조:

- 기본 점수 계산은 규칙 기반
- OpenAI Embeddings가 켜지면 프로필 의미 유사도를 추가 점수로 반영
- OpenAI Chat 모델이 켜지면 상위 추천 후보의 추천 사유 문구를 더 자연스럽게 생성

즉, 추천 엔진 전체가 AI만으로 동작하는 방식이 아니라:

- 기본은 규칙 기반
- 설정 시 AI가 의미 유사도와 설명 문구를 보강

형태입니다.

## 4. 환경변수

다음 항목이 [backend/.env.example](C:/Users/ss/Documents/hanil-matching/backend/.env.example:1)에 추가되었습니다.

- `MATCHING_AI_PROVIDER`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_EMBEDDING_MODEL`
- `OPENAI_CHAT_MODEL`
- `RECOMMENDATION_SCHEDULER_POLL_SECONDS`
- `RECOMMENDATION_SCHEDULER_BATCH_SIZE`
- `RECOMMENDATION_GENERATION_LIMIT`

## 5. 권장 운영 순서

1. 규칙 기반 추천으로 먼저 운영
2. 스케줄러로 정기 추천 생성 활성화
3. 알림 UI로 사용자 복귀 흐름 확인
4. 그 다음 OpenAI 키를 연결해 의미 유사도와 추천 사유를 강화
