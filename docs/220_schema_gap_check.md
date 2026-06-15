# 기획안 대비 스키마 점검

이 문서는 처음 제시된 PostgreSQL 기획안과 현재 구현 상태를 비교한 결과입니다.

## 1. 필수 테이블 점검

아래 5개 필수 테이블은 모두 구현되어 있습니다.

- `users`
- `profiles`
- `matches`
- `messages`
- `reports`

## 2. 필수 컬럼 점검

### users

기획안 필수 항목

- `id`
- `email`
- `gender`
- `nationality`
- `language`
- `is_verified`
- `created_at`

현재 구현 상태

- 필수 항목 모두 포함
- 운영용 확장 컬럼 추가: `password_hash`

추가 보완

- `gender IN ('male', 'female')`
- `nationality IN ('KR', 'JP')`
- 플랫폼 대상 제약 추가:
  - `KR + male`
  - `JP + female`

### profiles

기획안 필수 항목

- `user_id`
- `age`
- `bio`
- `interests`

현재 구현 상태

- 필수 항목 모두 포함
- 운영용 확장 컬럼 추가: `age_group`

추가 보완

- `age` 범위 검증
- `age` 입력 시 `age_group` 자동 계산

### matches

기획안 필수 항목

- `id`
- `user1_id`
- `user2_id`
- `score`
- `created_at`

현재 구현 상태

- 필수 항목 모두 포함
- 중복 방지와 자기 자신 매칭 방지 제약 포함

### messages

기획안 필수 항목

- `id`
- `sender_id`
- `receiver_id`
- `original_text`
- `translated_text`
- `language_from`
- `language_to`
- `created_at`

현재 구현 상태

- 필수 항목 모두 포함
- 운영용 확장 컬럼 추가:
  - `translation_status`
  - `translated_at`
  - `read_at`

### reports

기획안 필수 항목

- `id`
- `reporter_id`
- `reported_id`
- `reason`
- `created_at`

현재 구현 상태

- 필수 항목 모두 포함
- 자기 자신 신고 방지 제약 포함

## 3. 인덱스와 외래키

기획안 요구사항인 인덱스와 외래키는 모두 반영되어 있습니다.

- 외래키:
  - `profiles.user_id -> users.id`
  - `matches.user1_id -> users.id`
  - `matches.user2_id -> users.id`
  - `messages.sender_id -> users.id`
  - `messages.receiver_id -> users.id`
  - `reports.reporter_id -> users.id`
  - `reports.reported_id -> users.id`

- 주요 인덱스:
  - `users`
  - `profiles`
  - `matches`
  - `messages`
  - `reports`

## 4. 결론

처음 기획안 기준으로 빠진 필수 테이블이나 필수 컬럼은 없습니다.

이번 점검에서 실제로 보완한 항목은 아래입니다.

- 플랫폼 대상 제약을 DB와 백엔드 검증에 명시적으로 추가
- 가입 입력값 검증 강화
- 프로필 나이/관심사 입력 정규화 강화

즉, 현재 구조는 `기획안 충족 + 웹앱 운영 확장` 상태입니다.
