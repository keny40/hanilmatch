# 자동 후보 추천과 알림 구조

이 문서는 자동 후보 추천, 알림, AI 매칭 초안이 현재 프로젝트에 어떻게 들어간 상태인지 정리합니다.

## 1. 자동 후보 추천 흐름

현재 추천 흐름은 아래 순서로 동작합니다.

1. 사용자가 로그인하고 프로필을 작성합니다.
2. 백엔드는 현재 사용자 프로필을 기준으로 후보를 찾습니다.
3. 이미 매치된 사용자, 본인이 신고했거나 본인을 신고한 사용자는 제외합니다.
4. 후보별 점수를 계산합니다.
5. 점수가 높은 순으로 `match_recommendations` 테이블에 저장합니다.
6. 높은 점수 후보는 `notifications` 테이블에도 저장합니다.

## 2. 점수 계산 기준

현재는 운영 가능한 규칙 기반 추천 + AI 추천 문구 초안 형태입니다.

- 공통 관심사 개수
- 연령대 거리
- 본인 인증 여부
- 지원 언어 적합도
- 자기소개 존재 여부
- 언어 교환 적합성

추천 사유는 사람이 읽기 쉬운 문장으로 `rationale`에 저장됩니다.

## 3. 새로 추가된 테이블

### `match_recommendations`

- 추천 대상 사용자
- 후보 사용자
- 추천 점수
- 상태(`pending`, `accepted`, `dismissed`)
- 추천 사유
- 생성 방식(`rule_based`, `ai_draft`)
- 최근 알림 시각

### `notifications`

- 사용자별 알림 저장
- 알림 종류
- 제목/본문
- payload JSON
- 읽음 여부

## 4. 새 API

### 추천 관련

- `GET /api/v1/matches/recommendations`
  - 현재 사용자 추천 목록 조회
  - 없으면 자동 생성

- `POST /api/v1/matches/recommendations/generate`
  - 추천 강제 재생성

- `POST /api/v1/matches/recommendations/{recommendation_id}/accept`
  - 추천을 수락하고 실제 `matches` 생성

- `POST /api/v1/matches/recommendations/{recommendation_id}/dismiss`
  - 추천 보류/제외 처리

### 알림 관련

- `GET /api/v1/notifications/me`
  - 내 알림 목록

- `PATCH /api/v1/notifications/{notification_id}/read`
  - 알림 읽음 처리

## 5. AI 매칭 초안의 의미

현재 구현은 완전한 LLM 추천 엔진이 아니라, 아래 중간 단계입니다.

- 점수 계산은 규칙 기반
- 추천 사유 문구는 AI 설명형 UI에 맞게 저장
- 이후 실제 LLM/임베딩 추천기로 교체하기 쉬운 구조

즉, 지금 상태는 `즉시 운영 가능한 추천 엔진 + AI 확장 준비` 단계입니다.
