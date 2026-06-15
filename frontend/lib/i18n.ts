import { Message } from "./api";

export type AppLocale = "ko" | "ja";

type TranslationKey = string;

/*
  | "nav.dashboard"
  | "nav.matches"
  | "nav.notifications"
  | "nav.profile"
  | "nav.sessions"
  | "nav.billing"
  | "nav.admin"
  | "nav.signup"
  | "nav.login"
  | "popup.close"
  | "home.eyebrow"
  | "home.title"
  | "home.body"
  | "home.createAccount"
  | "home.login"
  | "home.coreStack"
  | "home.safety"
  | "home.deployment"
  | "home.feature1Title"
  | "home.feature1Body"
  | "home.feature2Title"
  | "home.feature2Body"
  | "home.feature3Title"
  | "home.feature3Body"
  | "login.title"
  | "login.helper"
  | "login.email"
  | "login.password"
  | "login.submit"
  | "login.submitting"
  | "login.failed"
  | "login.result"
  | "login.signupPrompt"
  | "login.signupLink"
  | "signup.title"
  | "signup.helper"
  | "signup.email"
  | "signup.password"
  | "signup.gender"
  | "signup.nationality"
  | "signup.language"
  | "signup.submit"
  | "signup.submitting"
  | "signup.failed"
  | "signup.result"
  | "signup.loginPrompt"
  | "signup.loginLink"
  | "chat.eyebrow"
  | "chat.conversation"
  | "chat.emptyBio"
  | "chat.socket"
  | "chat.back"
  | "chat.loading"
  | "chat.loadFailed"
  | "chat.sendFailed"
  | "chat.messages"
  | "chat.you"
  | "chat.match"
  | "chat.translationPending"
  | "chat.showTranslation"
  | "chat.translating"
  | "chat.translationFailed"
  | "chat.translationTooLong"
  | "chat.original"
  | "chat.translation"
  | "chat.readAt"
  | "chat.unread"
  | "chat.empty"
  | "chat.profileContext"
  | "chat.newMessage"
  | "chat.translationLimit"
  | "chat.sending"
  | "chat.send"
  | "chat.otherConversations"
  | "chat.noMessages"
  | "chat.reportUser"
  | "chat.reporting"
  | "chat.reportReason"
  | "chat.reportSuccess"
  | "chat.reportFailed"
  | "dashboard.loadFailed"
  | "dashboard.loading"
  | "dashboard.eyebrow"
  | "dashboard.welcome"
  | "dashboard.welcomeBack"
  | "dashboard.hero"
  | "dashboard.editProfile"
  | "dashboard.completeProfile"
  | "dashboard.viewMatches"
  | "dashboard.sessions"
  | "dashboard.logout"
  | "dashboard.accountPulse"
  | "dashboard.verification"
  | "dashboard.verified"
  | "dashboard.pending"
  | "dashboard.profile"
  | "dashboard.ready"
  | "dashboard.incomplete"
  | "dashboard.openMatches"
  | "dashboard.membership"
  | "dashboard.membershipFree"
  | "dashboard.membershipPaid"
  | "dashboard.upgrade"
  | "dashboard.profileSnapshot"
  | "dashboard.ageGroup"
  | "dashboard.profileMissing"
  | "dashboard.startOnboarding"
  | "dashboard.recentMatches"
  | "dashboard.matchScore"
  | "dashboard.pair"
  | "dashboard.openChat"
  | "dashboard.noMatches"
  | "dashboard.waitingDailyMatch"
  | "dashboard.recommendedNext"
  | "dashboard.score"
  | "dashboard.new"
  | "dashboard.recommendationsEmpty"
  | "matches.loadFailed"
  | "matches.acceptFailed"
  | "matches.dismissFailed"
  | "matches.loading"
  | "matches.eyebrow"
  | "matches.title"
  | "matches.hero"
  | "matches.heroSignedIn"
  | "matches.back"
  | "matches.tuneProfile"
  | "matches.accepted"
  | "matches.compatibility"
  | "matches.pairedWith"
  | "matches.created"
  | "matches.openChat"
  | "matches.acceptedEmpty"
  | "matches.recommended"
  | "matches.freeLimit"
  | "matches.verified"
  | "matches.standard"
  | "matches.score"
  | "matches.crossLanguage"
  | "matches.aiDraft"
  | "matches.ruleBased"
  | "matches.refresh"
  | "matches.refreshing"
  | "matches.refreshDone"
  | "matches.refreshFailed"
  | "matches.upgrade"
  | "matches.checkoutFailed"
  | "matches.viewProfile"
  | "matches.viewPartnerProfile"
  | "matches.partnerProfile"
  | "matches.profileLoadFailed"
  | "matches.dismiss"
  | "matches.accept"
  | "matches.recommendationsEmpty"
  | "matches.profileDetail"
  | "matches.recommendationScore"
  | "matches.close"
  | "matches.age"
  | "matches.group"
  | "matches.bio"
  | "matches.interests"
  | "matches.photos"
  | "matches.profileLoading"
  | "matches.acceptedMessage"
  | "matches.dismissedMessage"
  | "notifications.loadFailed"
  | "notifications.markFailed"
  | "notifications.eyebrow"
  | "notifications.title"
  | "notifications.hero"
  | "notifications.unreadCount"
  | "notifications.back"
  | "notifications.openMatches"
  | "notifications.loading"
  | "notifications.recentAlerts"
  | "notifications.read"
  | "notifications.unread"
  | "notifications.markRead"
  | "notifications.open"
  | "notifications.empty"
  | "profile.lookupFailed"
  | "profile.saveFailed"
  | "profile.uploadFailed"
  | "profile.updated"
  | "profile.created"
  | "profile.eyebrow"
  | "profile.title"
  | "profile.hero"
  | "profile.signalTitle"
  | "profile.signalBody"
  | "profile.contextTitle"
  | "profile.contextBody"
  | "profile.updateTitle"
  | "profile.createTitle"
  | "profile.age"
  | "profile.ageGroupSaved"
  | "profile.bio"
  | "profile.bioPlaceholder"
  | "profile.interests"
  | "profile.interestsPlaceholder"
  | "profile.photo"
  | "profile.uploading"
  | "profile.saving"
  | "profile.updateButton"
  | "profile.createButton"
  | "profile.back"
  | "sessions.loadFailed"
  | "sessions.revokeFailed"
  | "sessions.eyebrow"
  | "sessions.title"
  | "sessions.back"
  | "sessions.loading"
  | "sessions.unknownClient"
  | "sessions.unknownIp"
  | "sessions.ip"
  | "sessions.expires"
  | "sessions.revoke";
*/

const translations: Record<AppLocale, Record<string, string>> = {
  ko: {
    "nav.dashboard": "대시보드",
    "nav.matches": "매칭",
    "nav.community": "커뮤니티",
    "nav.notifications": "알림",
    "nav.profile": "프로필",
    "nav.sessions": "대화",
    "nav.billing": "결제",
    "nav.admin": "관리자",
    "nav.matchingIntro": "매칭 소개",
    "nav.safetyGuide": "안전가이드",
    "nav.signup": "회원가입",
    "nav.login": "로그인",
    "nav.logout": "로그아웃",
    "nav.loggingOut": "로그아웃 중...",
    "common.loading": "불러오는 중...",
    "popup.close": "닫기",
    "home.eyebrow": "국제 신뢰 플랫폼",
    "home.title": "한일을 연결합니다.",
    "home.body": "프로필과 관심사를 바탕으로 적합한 상대를 연결하고, 번역 채팅으로 자연스러운 대화를 돕습니다.",
    "home.createAccount": "계정 만들기",
    "home.login": "로그인",
    "home.dashboard": "대시보드로 이동",
    "home.matches": "AI 매칭 보기",
    "home.coreStack": "AI 추천 매칭",
    "home.safety": "한일 번역 채팅",
    "home.deployment": "안전한 신고/문의 관리",
    "home.step1Label": "STEP 1",
    "home.step1Title": "프로필을 완성합니다.",
    "home.step1Body": "국가, 성별, 관심사와 언어 정보를 입력합니다.",
    "home.step2Label": "STEP 2",
    "home.step2Title": "AI가 상대를 연결합니다.",
    "home.step2Body": "조건에 맞는 상대가 있으면 자동으로 매칭됩니다.",
    "home.step3Label": "STEP 3",
    "home.step3Title": "번역 채팅을 시작합니다.",
    "home.step3Body": "원문과 번역문을 함께 보며 대화를 이어갑니다.",
    "home.visualBadge": "AI 추천 한일 매칭",
    "home.point1Title": "신원 인증",
    "home.point1Body": "검증된 프로필 정보를 바탕으로 신뢰할 수 있는 만남을 돕습니다.",
    "home.point2Title": "번역 채팅",
    "home.point2Body": "한국어와 일본어 메시지를 원문과 번역문으로 함께 확인합니다.",
    "home.point3Title": "개인정보 보호",
    "home.point3Body": "전화번호 등 비공개 정보는 상대방에게 노출하지 않습니다.",
    "home.metric1Value": "12,458+",
    "home.metric1Label": "신뢰할 수 있는 회원",
    "home.metric2Value": "3,274+",
    "home.metric2Label": "성공적인 매칭",
    "home.metric3Value": "48,921+",
    "home.metric3Label": "번역 메시지 수",
    "home.metric4Value": "24/7",
    "home.metric4Label": "안전한 서비스 운영",
    "home.feature1Title": "AI 추천 매칭",
    "home.feature1Body": "프로필과 관심사를 바탕으로 적합한 상대를 추천합니다.",
    "home.feature2Title": "한일 번역 채팅",
    "home.feature2Body": "한국어와 일본어 메시지를 원문과 번역문으로 확인할 수 있습니다.",
    "home.feature3Title": "안전한 운영",
    "home.feature3Body": "신고, 문의, 관리자 검토 기능으로 안전한 대화를 돕습니다.",
    "login.title": "로그인",
    "login.helper": "HanilMatch 계정으로 로그인해 오늘의 AI 매칭과 번역 채팅을 확인하세요.",
    "login.email": "이메일",
    "login.password": "비밀번호",
    "login.submit": "로그인",
    "login.google": "Google로 로그인",
    "login.submitting": "로그인 중...",
    "login.failed": "로그인에 실패했습니다",
    "login.result": "로그인되었습니다.",
    "login.signupPrompt": "계정이 없으신가요?",
    "login.signupLink": "여기서 가입하기",
    "signup.title": "계정 만들기",
    "signup.helper": "프로필을 완성하면 AI가 조건에 맞는 한일 매칭을 연결합니다.",
    "signup.email": "이메일",
    "signup.password": "비밀번호",
    "signup.gender": "성별",
    "signup.nationality": "국적",
    "signup.language": "언어",
    "signup.submit": "계정 만들기",
    "signup.google": "Google로 시작하기",
    "signup.submitting": "생성 중...",
    "signup.failed": "회원가입에 실패했습니다",
    "signup.result": "{email} 계정이 생성되었습니다. ({id})",
    "signup.loginPrompt": "이미 가입하셨나요?",
    "signup.loginLink": "로그인으로 이동",
    "auth.or": "또는",
    "auth.googleFailed": "Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    "auth.googleCallbackTitle": "Google 로그인 처리",
    "auth.googleCallbackLoading": "Google 로그인 정보를 확인하는 중입니다...",
    "chat.eyebrow": "채팅",
    "chat.conversation": "대화",
    "chat.emptyBio": "매칭된 사용자들을 위한 번역 대화 공간입니다.",
    "chat.socket": "소켓 상태",
    "chat.back": "매칭으로 돌아가기",
    "chat.loading": "대화를 불러오는 중...",
    "chat.loadFailed": "채팅을 불러올 수 없습니다",
    "chat.sendFailed": "메시지 전송에 실패했습니다",
    "chat.messages": "메시지",
    "chat.you": "나",
    "chat.match": "상대",
    "chat.translationPending": "번역은 워커 파이프라인에서 잠시 후 반영됩니다.",
    "chat.showTranslation": "번역 보기",
    "chat.translating": "번역 중...",
    "chat.translationFailed": "번역에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    "chat.translationTooLong": "200자 초과 메시지는 번역할 수 없습니다.",
    "chat.original": "원문",
    "chat.translation": "번역",
    "chat.readAt": "읽음 {time}",
    "chat.unread": "안 읽음",
    "chat.empty": "아직 메시지가 없습니다. 편안하고 자연스럽게 대화를 시작해보세요.",
    "chat.profileContext": "프로필 정보",
    "chat.newMessage": "새 메시지",
    "chat.translationLimit": "200자 이상은 번역이 제한됩니다.",
    "chat.sending": "전송 중...",
    "chat.send": "메시지 보내기",
    "chat.otherConversations": "다른 대화",
    "chat.noMessages": "아직 메시지가 없습니다",
    "chat.reportUser": "사용자 신고",
    "chat.reporting": "신고 중...",
    "chat.reportReason": "신고 사유를 입력해주세요:",
    "chat.reportSuccess": "신고가 성공적으로 접수되었습니다.",
    "chat.reportFailed": "신고 접수에 실패했습니다",
    "dashboard.loadFailed": "대시보드를 불러올 수 없습니다",
    "dashboard.loading": "대시보드를 불러오는 중...",
    "dashboard.eyebrow": "대시보드",
    "dashboard.welcome": "{email}님, 다시 오신 것을 환영합니다",
    "dashboard.welcomeBack": "다시 오신 것을 환영합니다",
    "dashboard.hero": "프로필을 또렷하게 다듬고, 현재 매칭 흐름을 확인하고, 신뢰할 수 있는 대화로 이어가세요.",
    "dashboard.editProfile": "프로필 수정",
    "dashboard.completeProfile": "프로필 완성",
    "dashboard.viewMatches": "매칭 보기",
    "dashboard.sessions": "로그인 기기 관리",
    "dashboard.logout": "로그아웃",
    "dashboard.accountPulse": "계정 상태",
    "dashboard.verification": "인증",
    "dashboard.verified": "인증 완료",
    "dashboard.pending": "대기 중",
    "dashboard.profile": "프로필",
    "dashboard.ready": "준비됨",
    "dashboard.incomplete": "미완성",
    "dashboard.openMatches": "활성 매칭",
    "dashboard.membership": "회원 등급",
    "dashboard.membershipFree": "무료회원",
    "dashboard.membershipPaid": "유료회원",
    "dashboard.upgrade": "프리미엄 업그레이드",
    "dashboard.profileSnapshot": "프로필 요약",
    "dashboard.ageGroup": "나이 {age} / 그룹 {group}",
    "dashboard.profileMissing": "아직 프로필이 생성되지 않았습니다.",
    "dashboard.startOnboarding": "프로필 시작하기",
    "dashboard.recentMatches": "최근 매칭",
    "dashboard.matchScore": "매칭 점수 {score}",
    "dashboard.pair": "페어: {left} / {right}",
    "dashboard.openChat": "채팅 시작",
    "dashboard.noMatches": "아직 연결된 매칭이 없습니다.",
    "dashboard.waitingDailyMatch": "오늘의 AI 매칭을 기다리고 있습니다. 조건에 맞는 상대가 있으면 자동으로 연결됩니다.",
    "dashboard.recommendedNext": "다음 추천",
    "dashboard.score": "점수 {score}",
    "dashboard.new": "신규",
    "dashboard.recommendationsEmpty": "현재 조건에 맞는 AI 추천 상대가 없습니다. HanilMatch MVP는 한국 남성과 일본 여성 간 추천을 우선 제공합니다.",
    "dashboard.profileRecommendationRequired": "프로필을 완성하면 AI 추천을 받을 수 있습니다.",
    "dashboard.profileRequiredDetail": "AI 추천을 받으려면 국가, 성별, 나이, 언어 정보를 포함한 프로필을 먼저 완성해 주세요.",
    "dashboard.usageStatusTitle": "내 이용 상태",
    "dashboard.currentPlan": "현재 요금제",
    "dashboard.todayAiMatch": "오늘의 AI 매칭",
    "dashboard.monthlyTranslationUsage": "이번 달 번역 사용량",
    "dashboard.tokenBalance": "토큰 잔액",
    "dashboard.planFree": "무료회원",
    "dashboard.planPremium": "프리미엄 회원",
    "dashboard.dailyMatchStatus.completed": "완료",
    "dashboard.dailyMatchStatus.waiting": "대기 중",
    "dashboard.dailyMatchStatus.profile_incomplete": "프로필 미완성",
    "dashboard.dailyMatchStatus.not_eligible": "대상 아님",
    "dashboard.translationCountUnit": "회",
    "dashboard.freePlanNotice": "프리미엄 회원이 되면 하루 1회 AI 매칭과 번역 채팅 제공량을 이용할 수 있습니다.",
    "dashboard.premiumActiveNotice": "프리미엄 이용 중입니다. 오늘의 AI 매칭과 번역 채팅을 이용할 수 있습니다.",
    "dashboard.viewBilling": "요금제 보기",
    "matches.loadFailed": "매칭 정보를 불러올 수 없습니다",
    "matches.acceptFailed": "매칭 생성에 실패했습니다",
    "matches.dismissFailed": "추천 거절에 실패했습니다",
    "matches.loading": "AI 추천 매칭 화면을 불러오는 중...",
    "matches.eyebrow": "AI 추천 매칭",
    "matches.title": "AI 추천 매칭",
    "matches.hero": "프로필 정보와 관심사를 바탕으로 적합한 한일 교류 상대를 추천합니다.",
    "matches.heroSignedIn": "{email} 계정으로 로그인 중입니다. 프로필 정보와 관심사를 바탕으로 적합한 한일 교류 상대를 추천합니다.",
    "matches.back": "대시보드로 돌아가기",
    "matches.tuneProfile": "프로필 다듬기",
    "matches.accepted": "연결된 매칭",
    "matches.compatibility": "궁합 점수",
    "matches.pairedWith": "{left} 와 {right} 연결됨",
    "matches.created": "생성일 {time}",
    "matches.openChat": "채팅 시작",
   "matches.acceptedEmpty": "아직 연결된 매칭이 없습니다. 추천을 수락하면 이곳에 표시됩니다.",
    "matches.recommended": "도착한 추천",
    "matches.freeLimit": "무료회원은 최대 4개의 추천만 볼 수 있습니다. 더 많은 추천과 추천 새로고침은 유료회원 전용입니다.",
    "matches.verified": "인증됨",
    "matches.standard": "일반",
    "matches.score": "점수 {score}",
    "matches.crossLanguage": "한일 번역 채팅",
    "matches.aiDraft": "AI 추천 사유",
    "matches.ruleBased": "기본 추천 사유",
    "matches.rationaleFallback": "프로필 정보와 관심사를 바탕으로 추천되었습니다.",
    "matches.refresh": "프리미엄 추천 새로고침",
    "matches.refreshing": "새로고침 중...",
    "matches.refreshDone": "추천을 새로 생성했습니다.",
    "matches.refreshFailed": "추천 새로고침에 실패했습니다.",
    "matches.upgrade": "유료회원으로 업그레이드",
    "matches.checkoutFailed": "결제 기능은 sandbox/test mode 연결 준비 단계입니다. 요금제 안내 페이지에서 준비 중인 기능을 확인해 주세요.",
    "matches.viewProfile": "추천 상대 보기",
    "matches.viewPartnerProfile": "상대 프로필 보기",
    "matches.partnerProfile": "상대 프로필",
    "matches.profileLoadFailed": "상대 프로필을 불러오지 못했습니다.",
    "matches.dismiss": "추천 거절",
    "matches.accept": "추천 수락",
    "matches.recommendationsEmpty": "현재 조건에 맞는 AI 추천 상대가 없습니다. HanilMatch MVP는 한국 남성과 일본 여성 간 추천을 우선 제공합니다.",
    "matches.profileRecommendationRequired": "프로필을 완성하면 AI 추천을 받을 수 있습니다.",
    "matches.notificationMismatch": "추천 알림은 도착했지만 표시할 추천 항목을 찾을 수 없습니다. 잠시 후 다시 확인하거나 문의해 주세요.",
    "matches.profileDetail": "프로필 상세",
    "matches.recommendationScore": "추천 점수 {score}",
    "matches.close": "닫기",
    "matches.age": "나이",
    "matches.group": "그룹 {group}",
    "matches.bio": "소개",
    "matches.interests": "관심사",
    "matches.photos": "사진",
    "matches.workLocation": "직업/지역",
    "matches.languagePurpose": "언어/목적",
    "matches.nativeLanguage": "모국어",
    "matches.learningLanguage": "학습 언어",
    "matches.profileLoading": "프로필 상세를 불러오는 중...",
    "matches.acceptedMessage": "{email} 님과 매칭을 수락했습니다.",
    "matches.dismissedMessage": "추천을 거절했습니다.",
    "notifications.loadFailed": "알림을 불러올 수 없습니다",
    "notifications.markFailed": "알림을 읽음 처리할 수 없습니다",
    "notifications.eyebrow": "알림",
    "notifications.title": "새로운 AI 추천이 도착했습니다.",
    "notifications.hero": "프로필과 관심사를 바탕으로 추천된 상대를 확인해 보세요. 추천을 수락하면 매칭이 연결됩니다.",
    "notifications.unreadCount": "읽지 않은 알림: {count}",
    "notifications.back": "대시보드로 돌아가기",
    "notifications.openMatches": "AI 추천 확인",
    "notifications.loading": "알림을 불러오는 중...",
    "notifications.recentAlerts": "최근 알림",
    "notifications.read": "읽음",
    "notifications.unread": "안 읽음",
    "notifications.markRead": "읽음 처리",
    "notifications.open": "열기",
    "notifications.empty": "아직 도착한 AI 추천 알림이 없습니다. 프로필을 완성하면 적합한 추천을 받을 수 있습니다.",
    "profile.lookupFailed": "프로필을 조회할 수 없습니다",
    "profile.saveFailed": "프로필 저장에 실패했습니다",
    "profile.uploadFailed": "사진 업로드에 실패했습니다",
    "profile.updated": "프로필이 수정되었습니다.",
    "profile.created": "프로필이 생성되었습니다.",
    "profile.eyebrow": "프로필 작성",
    "profile.title": "진정성 있고 따뜻하며 신뢰하기 쉬운 프로필을 만들어보세요.",
    "profile.hero": "이 단계는 매칭 품질, 언어 맥락, 대화 신뢰도에 직접 연결됩니다. 자연스럽고 구체적으로 적어주세요.",
    "profile.signalTitle": "신호 품질",
    "profile.signalBody": "관심사와 차분한 소개가 분명할수록 더 좋은 매칭이 쉬워집니다.",
    "profile.contextTitle": "한일 생활 맥락",
    "profile.contextBody": "작은 생활 습관과 관계 의도가 추상적인 표현보다 더 중요합니다.",
    "profile.updateTitle": "프로필 수정",
    "profile.createTitle": "프로필 만들기",
    "profile.age": "나이",
    "profile.nationality": "국가",
    "profile.nationalityKr": "한국",
    "profile.nationalityJp": "일본",
    "profile.gender": "성별",
    "profile.genderMale": "남성",
    "profile.genderFemale": "여성",
    "profile.nativeLanguage": "모국어",
    "profile.learningLanguage": "학습 언어",
    "profile.requiredMissing": "필수 프로필 정보를 입력해 주세요.",
    "profile.mvpPairRequired": "HanilMatch MVP에서는 한국 남성과 일본 여성 프로필만 AI 추천 대상입니다.",
    "profile.ageGroupSaved": "나이대는 자동으로 다음 값으로 저장됩니다: {group}",
    "profile.bio": "소개",
    "profile.bioPlaceholder": "자연스럽고 사람다운 방식으로 나를 소개해보세요.",
    "profile.interests": "관심사",
    "profile.interestsPlaceholder": "travel, jazz, hiking, photography",
    "profile.photo": "프로필 사진",
    "profile.uploading": "사진 업로드 중...",
    "profile.photoLimit": "프로필 사진은 최대 3장까지 등록할 수 있습니다.",
    "profile.savingProfile": "프로필을 저장하는 중입니다.",
    "profile.uploadingPhoto": "프로필 사진을 업로드하는 중입니다.",
    "profile.saved": "프로필이 저장되었습니다.",
    "profile.partialPhotoFailure": "프로필은 저장되었지만 사진 업로드에 실패했습니다. 프로필 수정 화면에서 다시 업로드해 주세요.",
    "profile.selectedPhotos": "선택된 사진",
    "profile.saving": "저장 중...",
    "profile.updateButton": "프로필 수정",
    "profile.createButton": "프로필 만들기",
    "profile.back": "대시보드로 돌아가기",
    "sessions.loadFailed": "로그인 기기 정보를 불러올 수 없습니다",
    "sessions.revokeFailed": "로그인 기기 해제에 실패했습니다",
    "sessions.eyebrow": "로그인 기기",
    "sessions.title": "로그인 기기 관리",
    "sessions.back": "대시보드로 돌아가기",
    "sessions.loading": "로그인 기기 정보를 불러오는 중...",
    "sessions.unknownClient": "알 수 없는 클라이언트",
    "sessions.unknownIp": "알 수 없음",
    "sessions.ip": "IP",
    "sessions.expires": "만료",
    "sessions.revoke": "기기 해제",
    "common.start": "시작하기",
    "common.safetyGuide": "안전가이드",
    "common.bilingualNotice": "한국어와 일본어 안내를 모두 지원합니다.",
    "footer.description": "한국 남성과 일본 여성을 위한 AI 추천형 한일 매칭 서비스입니다. 프로필과 관심사를 바탕으로 적합한 상대를 연결하고, 번역 채팅을 통해 자연스러운 대화를 돕습니다.",
    "footer.linksTitle": "주요 링크",
    "footer.supportTitle": "고객지원",
    "footer.supportBody": "문의는 문의 페이지를 통해 접수해 주세요. 운영자가 확인 후 순차적으로 답변드립니다.",
    "footer.safetyTitle": "안전 안내",
    "footer.safetyBody": "불쾌한 메시지, 의심스러운 요구, 금전 요청을 받은 경우 즉시 신고하거나 문의해 주세요.",
    "footer.mvpNotice": "현재 서비스는 MVP 테스트 단계이며, 일부 기능은 운영 정책에 따라 변경될 수 있습니다.",
    "footer.ctaTitle": "도움이 필요하신가요?",
    "footer.ctaBody": "가입, 프로필, 매칭, 안전 신고와 관련한 문의를 남겨주세요.",
    "footer.ctaButton": "문의하기",
    "footer.about": "회사소개",
    "footer.faq": "Q&A",
    "footer.contact": "문의",
    "footer.safety": "안전가이드",
    "footer.terms": "이용약관",
    "footer.privacy": "개인정보처리방침",
    "terms.eyebrow": "이용약관",
    "terms.title": "이용약관 안내",
    "terms.body": "이용약관은 정식 서비스 운영 전 법무 검토 후 제공될 예정입니다.",
    "privacy.eyebrow": "개인정보처리방침",
    "privacy.title": "개인정보처리방침 안내",
    "privacy.body": "개인정보처리방침은 정식 서비스 운영 전 법무 검토 후 제공될 예정입니다.",
    "billing.eyebrow": "Membership",
    "billing.title": "요금제 안내",
    "billing.body": "HanilMatch는 월정액 회원제와 추가 토큰을 함께 사용하는 방식입니다. 유료회원은 매칭 받을 권리와 기본 번역 이용량을 제공받고, 제공량을 초과한 경우 필요한 만큼 토큰을 충전해 이용할 수 있습니다.",
    "billing.mvpNotice": "현재 결제 기능은 MVP 테스트 단계입니다. 실제 결제는 발생하지 않으며, 향후 결제사 sandbox 테스트 후 운영 결제가 적용됩니다.",
    "billing.preparingButton": "결제 기능 준비 중",
    "billing.preparingNotice": "현재 결제 기능은 MVP 테스트 단계입니다. 실제 결제는 발생하지 않으며, sandbox/test mode 연결 준비만 진행 중입니다.",
    "billing.free.label": "FREE",
    "billing.free.title": "무료회원",
    "billing.free.price": "기본 이용",
    "billing.free.feature1": "프로필 작성",
    "billing.free.feature2": "AI 매칭 알림 수신",
    "billing.free.feature3": "서비스 기본 기능 확인",
    "billing.free.feature4": "일부 기능 제한",
    "billing.premium.label": "PREMIUM",
    "billing.premium.title": "프리미엄 회원",
    "billing.premium.price": "월 19,900원",
    "billing.premium.feature1": "하루 1회 AI 매칭 대상",
    "billing.premium.feature2": "매칭 상대 프로필 전체 확인",
    "billing.premium.feature3": "채팅 가능",
    "billing.premium.feature4": "번역 월 300회 또는 30,000자 포함",
    "billing.premium.feature5": "신고 및 문의 지원",
    "billing.premium.feature6": "월 제공량 초과 시 추가 토큰 이용 가능",
    "billing.tokens.label": "TOKENS",
    "billing.tokens.title": "추가 토큰",
    "billing.tokens.price": "필요한 만큼 충전",
    "billing.tokens.feature1": "번역 추가 이용",
    "billing.tokens.feature2": "추가 매칭 요청",
    "billing.tokens.feature3": "특별 관심 표시",
    "billing.tokens.feature4": "향후 부스트 기능에 사용 예정",
    "about.eyebrow": "서비스 소개",
    "about.title": "HanilMatch는 한국과 일본을 잇는 안전한 교류 공간입니다.",
    "about.body": "HanilMatch는 한국과 일본 사용자들이 언어, 문화, 관심사를 바탕으로 자연스럽게 연결될 수 있도록 돕는 한일 특화 매칭 서비스입니다.",
    "about.feature1Title": "한일 특화 매칭",
    "about.feature1Body": "한국과 일본 사용자에게 맞는 프로필 정보와 관심사를 중심으로 연결합니다.",
    "about.feature2Title": "번역 지원 채팅",
    "about.feature2Body": "한국어와 일본어 대화를 더 편하게 이어갈 수 있도록 번역 흐름을 지원합니다.",
    "about.feature3Title": "프로필 기반 추천",
    "about.feature3Body": "직업, 언어, 목적, 관심사 같은 프로필 맥락을 바탕으로 추천 품질을 높입니다.",
    "about.feature4Title": "안전한 이용 환경",
    "about.feature4Body": "전화번호 비공개, 신고, 관리자 확인 흐름으로 더 안전한 교류를 지향합니다.",
    "faq.eyebrow": "Q&A",
    "faq.title": "자주 묻는 질문",
    "faq.body": "가입, 프로필, 추천, 채팅, 번역, 신고, 결제, 문의 흐름을 정리했습니다.",
    "faq.q1": "HanilMatch는 어떤 서비스인가요?",
    "faq.a1": "한국과 일본 사용자가 언어, 문화, 관심사를 바탕으로 자연스럽게 연결될 수 있도록 돕는 한일 특화 매칭 서비스입니다.",
    "faq.q2": "전화번호가 상대방에게 공개되나요?",
    "faq.a2": "아니요. 전화번호는 본인 확인 및 안전 관리를 위한 비공개 정보이며 상대방 프로필, 매칭 카드, 채팅 화면에 표시되지 않습니다.",
    "faq.q3": "프로필 사진은 몇 장까지 등록할 수 있나요?",
    "faq.a3": "프로필 사진은 최대 3장까지 등록할 수 있습니다.",
    "faq.q4": "매칭은 어떻게 이루어지나요?",
    "faq.a4": "HanilMatch는 사용자가 직접 무작위로 상대를 고르는 방식보다, 프로필 정보, 언어 수준, 관심사, 매칭 목적을 바탕으로 적합한 상대를 추천하는 방식을 지향합니다. 추천이 도착하면 사용자는 추천 사유를 확인하고 수락 여부를 선택할 수 있습니다.",
    "faq.q5": "추천은 자동으로 이루어지나요?",
    "faq.a5": "초기 MVP에서는 운영 안정성을 위해 관리자가 추천 생성을 수동으로 실행할 수 있습니다. 향후 운영 안정화 후 자동 추천 기능을 단계적으로 적용할 예정입니다.",
    "faq.q6": "번역 기능은 어떻게 작동하나요?",
    "faq.a6": "채팅에서 상대 메시지의 번역을 요청하면 원문과 번역문을 함께 확인할 수 있습니다.",
    "faq.q7": "불쾌한 메시지를 받으면 어떻게 하나요?",
    "faq.a7": "채팅 화면의 신고 기능으로 사유를 접수하면 관리자가 확인합니다.",
    "faq.q8": "결제 기능은 현재 사용할 수 있나요?",
    "faq.a8": "현재 결제 기능은 MVP 테스트 단계입니다. 실제 결제는 발생하지 않으며, 향후 결제사 sandbox 테스트 후 운영 결제가 적용됩니다.",
    "faq.q9": "문의는 어디에서 하나요?",
    "faq.a9": "문의/상담 페이지에서 이름, 이메일, 문의 내용을 남기면 관리자 문의 관리 화면에 접수됩니다.",
    "faq.q10": "어떤 사용자가 추천 대상인가요?",
    "faq.a10": "현재 MVP에서는 한국 남성과 일본 여성 간의 AI 추천 매칭을 우선 제공합니다. 향후 운영 정책에 따라 대상 범위가 조정될 수 있습니다.",
    "contact.eyebrow": "문의",
    "contact.title": "문의/상담",
    "contact.body": "서비스 이용 중 불편한 점이나 문의사항이 있으면 내용을 남겨주세요.",
    "contact.name": "이름",
    "contact.email": "이메일",
    "contact.message": "문의 내용",
    "contact.submit": "문의 접수",
    "contact.submitting": "접수 중...",
    "contact.validation": "이름, 이메일, 문의 내용을 모두 입력해주세요.",
    "contact.success": "문의가 접수되었습니다. 확인 후 순차적으로 답변드리겠습니다.",
    "contact.failed": "문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.",
    "contact.helper": "긴급한 안전 신고는 채팅 화면의 신고 기능을 함께 사용해 주세요.",
    "community.eyebrow": "Community",
    "community.title": "커뮤니티",
    "community.body": "HanilMatch 이용 후기, 한일 문화 이야기, 매칭과 대화 팁을 함께 나눠보세요.",
    "community.write": "글쓰기",
    "community.all": "전체",
    "community.category.notice": "공지사항",
    "community.category.review": "이용 후기",
    "community.category.culture": "한일 문화 이야기",
    "community.category.tips": "매칭/대화 팁",
    "community.category.feedback": "건의사항",
    "community.empty": "아직 공개된 커뮤니티 글이 없습니다.",
    "community.loadFailed": "커뮤니티 글을 불러오지 못했습니다.",
    "community.newTitle": "커뮤니티 글쓰기",
    "community.newBody": "이용 후기, 한일 문화 이야기, 건의사항을 남겨주세요. 작성한 글은 커뮤니티 목록에 바로 공개됩니다.",
    "community.category": "카테고리",
    "community.postTitle": "제목",
    "community.content": "내용",
    "community.submit": "작성 완료",
    "community.submitting": "접수 중...",
    "community.validation": "카테고리, 제목, 내용을 모두 입력해주세요.",
    "community.success": "글이 등록되었습니다.",
    "community.failed": "글 접수에 실패했습니다. 잠시 후 다시 시도해주세요.",
    "community.safetyNotice": "개인 연락처, 금전 요구, 비방, 광고성 글은 운영 정책에 따라 숨김 처리될 수 있습니다.",
    "community.status.pending": "승인 대기",
    "community.status.approved": "공개",
    "community.status.rejected": "반려",
    "community.status.hidden": "숨김",
    "community.backToList": "목록으로",
    "community.loginRequired": "글쓰기는 로그인 후 이용할 수 있습니다.",
    "community.detailNotFound": "공개된 글을 찾을 수 없습니다.",
    "safety.eyebrow": "Safety",
    "safety.title": "안전가이드",
    "safety.body": "HanilMatch는 건강하고 안전한 한일 교류를 지향합니다.",
    "safety.section1Title": "개인정보 보호",
    "safety.section1Item1": "전화번호는 본인 확인 및 안전 관리를 위한 비공개 정보이며, 상대방에게 공개되지 않습니다.",
    "safety.section1Item2": "상대 프로필, 매칭 카드, 채팅 화면에는 전화번호가 표시되지 않습니다.",
    "safety.section1Item3": "주소, 계좌, 신분증 등 민감한 개인정보는 대화 초기에 공유하지 마세요.",
    "safety.section2Title": "주의해야 할 행동",
    "safety.section2Item1": "외부 결제, 송금, 투자, 금전 요구는 즉시 주의하세요.",
    "safety.section2Item2": "사칭, 허위 프로필, 개인정보 요구가 의심되면 대화를 중단하세요.",
    "safety.section2Item3": "서비스 밖 메신저로 과도하게 이동을 요구하는 행동을 조심하세요.",
    "safety.section3Title": "채팅할 때",
    "safety.section3Item1": "불쾌한 표현, 성희롱, 혐오 표현을 받으면 신고 기능을 사용하세요.",
    "safety.section3Item2": "상대가 신뢰를 쌓기 전까지 사적인 연락처 공유는 신중히 결정하세요.",
    "safety.section4Title": "직접 만날 때",
    "safety.section4Item1": "처음 만날 때는 사람이 많은 공공장소를 선택하세요.",
    "safety.section4Item2": "일정과 장소를 가까운 사람에게 미리 알려두세요.",
    "safety.section5Title": "신고와 문의",
    "safety.section5Item1": "채팅 화면의 신고 버튼으로 부적절한 사용자를 접수할 수 있습니다.",
    "safety.section5Item2": "서비스 이용 문의는 문의/상담 페이지에서 남겨주세요.",
    "safety.section6Title": "아동 및 청소년 안전",
    "safety.section6Item1": "HanilMatch는 성인 사용자를 기준으로 운영됩니다.",
    "safety.section6Item2": "아동 및 청소년을 위험에 빠뜨리는 대화나 요청은 즉시 신고해주세요.",
  },
  ja: {
    "nav.dashboard": "ダッシュボード",
    "nav.matches": "マッチング",
    "nav.community": "コミュニティ",
    "nav.notifications": "通知",
    "nav.profile": "プロフィール",
    "nav.sessions": "会話",
    "nav.billing": "決済",
    "nav.admin": "管理者",
    "nav.matchingIntro": "マッチング紹介",
    "nav.safetyGuide": "安全ガイド",
    "nav.signup": "新規登録",
    "nav.login": "ログイン",
    "nav.logout": "ログアウト",
    "nav.loggingOut": "ログアウト中...",
    "common.loading": "読み込み中...",
    "popup.close": "閉じる",
    "home.eyebrow": "国際信頼プラットフォーム",
    "home.title": "日韓をつなぎます。",
    "home.body": "プロフィールと関心ごとをもとに相性のよい相手をつなぎ、翻訳チャットで自然な会話をサポートします。",
    "home.createAccount": "アカウント作成",
    "home.login": "ログイン",
    "home.dashboard": "ダッシュボードへ移動",
    "home.matches": "AIマッチを見る",
    "home.coreStack": "AIおすすめマッチング",
    "home.safety": "日韓翻訳チャット",
    "home.deployment": "安心の通報・お問い合わせ管理",
    "home.step1Label": "STEP 1",
    "home.step1Title": "プロフィールを完成させます。",
    "home.step1Body": "国籍、性別、関心ごと、言語情報を入力します。",
    "home.step2Label": "STEP 2",
    "home.step2Title": "AIが相手をつなぎます。",
    "home.step2Body": "条件に合う相手がいる場合、自動でマッチします。",
    "home.step3Label": "STEP 3",
    "home.step3Title": "翻訳チャットを始めます。",
    "home.step3Body": "原文と翻訳文を見ながら会話できます。",
    "home.visualBadge": "AIおすすめ日韓マッチング",
    "home.point1Title": "本人確認",
    "home.point1Body": "確認されたプロフィール情報をもとに、信頼できる出会いをサポートします。",
    "home.point2Title": "翻訳チャット",
    "home.point2Body": "韓国語と日本語のメッセージを原文と翻訳文で確認できます。",
    "home.point3Title": "個人情報保護",
    "home.point3Body": "電話番号などの非公開情報は相手に表示されません。",
    "home.metric1Value": "12,458+",
    "home.metric1Label": "信頼できる会員",
    "home.metric2Value": "3,274+",
    "home.metric2Label": "成立したマッチ",
    "home.metric3Value": "48,921+",
    "home.metric3Label": "翻訳メッセージ数",
    "home.metric4Value": "24/7",
    "home.metric4Label": "安全なサービス運営",
    "home.feature1Title": "AIおすすめマッチング",
    "home.feature1Body": "プロフィールと関心ごとをもとに、相性のよい相手をおすすめします。",
    "home.feature2Title": "日韓翻訳チャット",
    "home.feature2Body": "韓国語と日本語のメッセージを原文と翻訳文で確認できます。",
    "home.feature3Title": "安心の運営",
    "home.feature3Body": "通報、お問い合わせ、管理者確認機能で安全な会話をサポートします。",
    "login.title": "ログイン",
    "login.helper": "HanilMatchアカウントでログインして、今日のAIマッチと翻訳チャットを確認しましょう。",
    "login.email": "メールアドレス",
    "login.password": "パスワード",
    "login.submit": "ログイン",
    "login.google": "Googleでログイン",
    "login.submitting": "ログイン中...",
    "login.failed": "ログインに失敗しました",
    "login.result": "ログインしました。",
    "login.signupPrompt": "アカウントをお持ちでないですか？",
    "login.signupLink": "こちらで登録",
    "signup.title": "アカウント作成",
    "signup.helper": "プロフィールを完成させると、AIが条件に合う日韓マッチをつなぎます。",
    "signup.email": "メールアドレス",
    "signup.password": "パスワード",
    "signup.gender": "性別",
    "signup.nationality": "国籍",
    "signup.language": "言語",
    "signup.submit": "アカウント作成",
    "signup.google": "Googleで始める",
    "signup.submitting": "作成中...",
    "signup.failed": "会員登録に失敗しました",
    "signup.result": "{email} のアカウントを作成しました。({id})",
    "signup.loginPrompt": "すでに登録済みですか？",
    "signup.loginLink": "ログインへ移動",
    "auth.or": "または",
    "auth.googleFailed": "Googleログインに失敗しました。しばらくしてからもう一度お試しください。",
    "auth.googleCallbackTitle": "Googleログイン処理",
    "auth.googleCallbackLoading": "Googleログイン情報を確認しています...",
    "chat.eyebrow": "チャット",
    "chat.conversation": "会話",
    "chat.emptyBio": "マッチしたユーザー向けの翻訳対応会話スペースです。",
    "chat.socket": "ソケット状態",
    "chat.back": "マッチへ戻る",
    "chat.loading": "会話を読み込み中...",
    "chat.loadFailed": "チャットを読み込めません",
    "chat.sendFailed": "メッセージ送信に失敗しました",
    "chat.messages": "メッセージ",
    "chat.you": "自分",
    "chat.match": "相手",
    "chat.translationPending": "翻訳はワーカーパイプラインでまもなく反映されます。",
    "chat.showTranslation": "翻訳を見る",
    "chat.translating": "翻訳中...",
    "chat.translationFailed": "翻訳に失敗しました。しばらくしてからもう一度お試しください。",
    "chat.translationTooLong": "200文字を超えるメッセージは翻訳できません。",
    "chat.original": "原文",
    "chat.translation": "翻訳",
    "chat.readAt": "{time} に既読",
    "chat.unread": "未読",
    "chat.empty": "まだメッセージがありません。自然でやさしい一言から始めてみましょう。",
    "chat.profileContext": "プロフィール情報",
    "chat.newMessage": "新しいメッセージ",
    "chat.translationLimit": "200文字以上のメッセージは翻訳が制限されます。",
    "chat.sending": "送信中...",
    "chat.send": "メッセージを送る",
    "chat.otherConversations": "他の会話",
    "chat.noMessages": "まだメッセージがありません",
    "chat.reportUser": "ユーザー通報",
    "chat.reporting": "通報中...",
    "chat.reportReason": "通報理由を入力してください:",
    "chat.reportSuccess": "通報が正常に送信されました。",
    "chat.reportFailed": "通報の送信に失敗しました",
    "dashboard.loadFailed": "ダッシュボードを読み込めません",
    "dashboard.loading": "ダッシュボードを読み込み中...",
    "dashboard.eyebrow": "ダッシュボード",
    "dashboard.welcome": "{email} さん、おかえりなさい",
    "dashboard.welcomeBack": "おかえりなさい",
    "dashboard.hero": "プロフィールを整え、現在のマッチ状況を確認し、信頼できる会話につなげていきましょう。",
    "dashboard.editProfile": "プロフィール編集",
    "dashboard.completeProfile": "プロフィール完成",
    "dashboard.viewMatches": "マッチを見る",
    "dashboard.sessions": "ログイン端末管理",
    "dashboard.logout": "ログアウト",
    "dashboard.accountPulse": "アカウント状況",
    "dashboard.verification": "認証",
    "dashboard.verified": "認証済み",
    "dashboard.pending": "保留中",
    "dashboard.profile": "プロフィール",
    "dashboard.ready": "準備完了",
    "dashboard.incomplete": "未完了",
    "dashboard.openMatches": "進行中マッチ",
    "dashboard.membership": "会員ランク",
    "dashboard.membershipFree": "無料会員",
    "dashboard.membershipPaid": "有料会員",
    "dashboard.upgrade": "プレミアムアップグレード",
    "dashboard.profileSnapshot": "プロフィール概要",
    "dashboard.ageGroup": "年齢 {age} / グループ {group}",
    "dashboard.profileMissing": "まだプロフィールが作成されていません。",
    "dashboard.startOnboarding": "プロフィールを始める",
    "dashboard.recentMatches": "最近のマッチ",
    "dashboard.matchScore": "マッチスコア {score}",
    "dashboard.pair": "ペア: {left} / {right}",
    "dashboard.openChat": "チャットを始める",
    "dashboard.noMatches": "まだ成立したマッチはありません。",
    "dashboard.waitingDailyMatch": "今日のAIマッチを待っています。条件に合う相手がいる場合、自動でマッチします。",
    "dashboard.recommendedNext": "次のおすすめ",
    "dashboard.score": "スコア {score}",
    "dashboard.new": "新規",
    "dashboard.recommendationsEmpty": "現在の条件に合うAIおすすめ相手がいません。HanilMatchのMVPでは、韓国男性と日本女性のマッチングを優先して提供しています。",
    "dashboard.profileRecommendationRequired": "プロフィールを完成させるとAIおすすめを受け取れます。",
    "dashboard.profileRequiredDetail": "AIおすすめを受け取るには、国、性別、年齢、言語情報を含むプロフィールを先に完成させてください。",
    "dashboard.usageStatusTitle": "利用状況",
    "dashboard.currentPlan": "現在のプラン",
    "dashboard.todayAiMatch": "今日のAIマッチ",
    "dashboard.monthlyTranslationUsage": "今月の翻訳利用",
    "dashboard.tokenBalance": "トークン残高",
    "dashboard.planFree": "無料会員",
    "dashboard.planPremium": "プレミアム会員",
    "dashboard.dailyMatchStatus.completed": "完了",
    "dashboard.dailyMatchStatus.waiting": "待機中",
    "dashboard.dailyMatchStatus.profile_incomplete": "プロフィール未完成",
    "dashboard.dailyMatchStatus.not_eligible": "対象外",
    "dashboard.translationCountUnit": "回",
    "dashboard.freePlanNotice": "プレミアム会員になると、1日1回のAIマッチと翻訳チャット利用枠を利用できます。",
    "dashboard.premiumActiveNotice": "プレミアム利用中です。今日のAIマッチと翻訳チャットを利用できます。",
    "dashboard.viewBilling": "料金プランを見る",
    "matches.loadFailed": "マッチ情報を読み込めません",
    "matches.acceptFailed": "マッチ作成に失敗しました",
    "matches.dismissFailed": "おすすめの見送りに失敗しました",
    "matches.loading": "AIおすすめマッチング画面を読み込み中...",
    "matches.eyebrow": "AIおすすめマッチング",
    "matches.title": "AIおすすめマッチング",
    "matches.hero": "プロフィール情報や関心ごとをもとに、日韓交流に合う相手をおすすめします。",
    "matches.heroSignedIn": "{email} としてログイン中です。プロフィール情報や関心ごとをもとに、日韓交流に合う相手をおすすめします。",
    "matches.back": "ダッシュボードへ戻る",
    "matches.tuneProfile": "プロフィールを整える",
    "matches.accepted": "成立したマッチ",
    "matches.compatibility": "相性スコア",
    "matches.pairedWith": "{left} と {right} のペア",
    "matches.created": "作成日時 {time}",
    "matches.openChat": "チャットを始める",
    "matches.acceptedEmpty": "まだ成立したマッチはありません。おすすめを承認するとここに表示されます。",
    "matches.recommended": "届いたおすすめ",
    "matches.freeLimit": "無料会員は最大4件までおすすめを確認できます。追加おすすめとおすすめ更新は有料会員向けです。",
    "matches.verified": "認証済み",
    "matches.standard": "標準",
    "matches.score": "スコア {score}",
    "matches.crossLanguage": "日韓翻訳チャット",
    "matches.aiDraft": "AIおすすめ理由",
    "matches.ruleBased": "基本おすすめ理由",
    "matches.rationaleFallback": "プロフィール情報と関心ごとをもとにおすすめされました。",
    "matches.refresh": "プレミアムおすすめ更新",
    "matches.refreshing": "更新中...",
    "matches.refreshDone": "おすすめを再生成しました。",
    "matches.refreshFailed": "おすすめ更新に失敗しました。",
    "matches.upgrade": "有料会員にアップグレード",
    "matches.checkoutFailed": "決済機能はsandbox/test mode連携の準備段階です。料金プランページで準備中の機能をご確認ください。",
    "matches.viewProfile": "おすすめ相手を見る",
    "matches.viewPartnerProfile": "相手プロフィールを見る",
    "matches.partnerProfile": "相手プロフィール",
    "matches.profileLoadFailed": "相手プロフィールを読み込めませんでした。",
    "matches.dismiss": "おすすめを見送る",
    "matches.accept": "おすすめを承認",
    "matches.recommendationsEmpty": "現在の条件に合うAIおすすめ相手がいません。HanilMatchのMVPでは、韓国男性と日本女性のマッチングを優先して提供しています。",
    "matches.profileRecommendationRequired": "プロフィールを完成させるとAIおすすめを受け取れます。",
    "matches.notificationMismatch": "おすすめ通知は届いていますが、表示できるおすすめ項目が見つかりません。しばらくしてからもう一度確認するか、お問い合わせください。",
    "matches.profileDetail": "プロフィール詳細",
    "matches.recommendationScore": "おすすめスコア {score}",
    "matches.close": "閉じる",
    "matches.age": "年齢",
    "matches.group": "グループ {group}",
    "matches.bio": "自己紹介",
    "matches.interests": "興味",
    "matches.photos": "写真",
    "matches.workLocation": "職業/地域",
    "matches.languagePurpose": "言語/目的",
    "matches.nativeLanguage": "母語",
    "matches.learningLanguage": "学びたい言語",
    "matches.profileLoading": "プロフィール詳細を読み込み中...",
    "matches.acceptedMessage": "{email} さんとのマッチを承認しました。",
    "matches.dismissedMessage": "おすすめを見送りました。",
    "notifications.loadFailed": "通知を読み込めません",
    "notifications.markFailed": "通知を既読にできません",
    "notifications.eyebrow": "通知",
    "notifications.title": "新しいAIおすすめが届きました。",
    "notifications.hero": "プロフィールと関心ごとをもとにおすすめされた相手を確認してみましょう。おすすめを承認するとマッチが成立します。",
    "notifications.unreadCount": "未読通知: {count}",
    "notifications.back": "ダッシュボードへ戻る",
    "notifications.openMatches": "AIおすすめを確認",
    "notifications.loading": "通知を読み込み中...",
    "notifications.recentAlerts": "最近の通知",
    "notifications.read": "既読",
    "notifications.unread": "未読",
    "notifications.markRead": "既読にする",
    "notifications.open": "開く",
    "notifications.empty": "まだAIおすすめ通知は届いていません。プロフィールを完成させると、相性のよいおすすめを受け取れます。",
    "profile.lookupFailed": "プロフィールを取得できません",
    "profile.saveFailed": "プロフィール保存に失敗しました",
    "profile.uploadFailed": "写真アップロードに失敗しました",
    "profile.updated": "プロフィールを更新しました。",
    "profile.created": "プロフィールを作成しました。",
    "profile.eyebrow": "プロフィール作成",
    "profile.title": "誠実で、あたたかく、信頼しやすいプロフィールを作りましょう。",
    "profile.hero": "このステップはマッチ品質、言語コンテキスト、会話の安心感につながります。自然で具体的に書いてみてください。",
    "profile.signalTitle": "伝わる情報の質",
    "profile.signalBody": "興味や落ち着いた自己紹介がはっきりしているほど、より良いマッチにつながります。",
    "profile.contextTitle": "日韓の生活文脈",
    "profile.contextBody": "小さな生活習慣や関係への意図は、抽象的な表現より大切です。",
    "profile.updateTitle": "プロフィール更新",
    "profile.createTitle": "プロフィール作成",
    "profile.age": "年齢",
    "profile.nationality": "国",
    "profile.nationalityKr": "韓国",
    "profile.nationalityJp": "日本",
    "profile.gender": "性別",
    "profile.genderMale": "男性",
    "profile.genderFemale": "女性",
    "profile.nativeLanguage": "母国語",
    "profile.learningLanguage": "学習言語",
    "profile.requiredMissing": "必須プロフィール情報を入力してください。",
    "profile.mvpPairRequired": "HanilMatchのMVPでは、韓国男性と日本女性のプロフィールのみAIおすすめ対象です。",
    "profile.ageGroupSaved": "年齢グループは自動的に次の値で保存されます: {group}",
    "profile.bio": "自己紹介",
    "profile.bioPlaceholder": "自然で人柄が伝わる形で自分を紹介してみましょう。",
    "profile.interests": "興味",
    "profile.interestsPlaceholder": "travel, jazz, hiking, photography",
    "profile.photo": "プロフィール写真",
    "profile.uploading": "写真をアップロード中...",
    "profile.photoLimit": "プロフィール写真は最大3枚まで登録できます。",
    "profile.savingProfile": "プロフィールを保存しています。",
    "profile.uploadingPhoto": "プロフィール写真をアップロードしています。",
    "profile.saved": "プロフィールが保存されました。",
    "profile.partialPhotoFailure": "プロフィールは保存されましたが、写真のアップロードに失敗しました。プロフィール編集画面でもう一度アップロードしてください。",
    "profile.selectedPhotos": "選択した写真",
    "profile.saving": "保存中...",
    "profile.updateButton": "プロフィール更新",
    "profile.createButton": "プロフィール作成",
    "profile.back": "ダッシュボードへ戻る",
    "sessions.loadFailed": "ログイン端末情報を読み込めません",
    "sessions.revokeFailed": "ログイン端末の解除に失敗しました",
    "sessions.eyebrow": "ログイン端末",
    "sessions.title": "ログイン端末管理",
    "sessions.back": "ダッシュボードへ戻る",
    "sessions.loading": "ログイン端末情報を読み込み中...",
    "sessions.unknownClient": "不明なクライアント",
    "sessions.unknownIp": "不明",
    "sessions.ip": "IP",
    "sessions.expires": "期限",
    "sessions.revoke": "端末を解除",
    "common.start": "始める",
    "common.safetyGuide": "安全ガイド",
    "common.bilingualNotice": "韓国語と日本語の案内に対応しています。",
    "footer.description": "HanilMatchは、韓国男性と日本女性のためのAIおすすめ型日韓マッチングサービスです。プロフィールや関心ごとをもとに相性のよい相手をつなぎ、翻訳チャットで自然な会話をサポートします。",
    "footer.linksTitle": "主なリンク",
    "footer.supportTitle": "サポート",
    "footer.supportBody": "お問い合わせページからご連絡ください。運営チームが確認後、順次対応いたします。",
    "footer.safetyTitle": "安全案内",
    "footer.safetyBody": "不快なメッセージ、不審な要求、金銭の要求を受けた場合は、すぐに通報またはお問い合わせください。",
    "footer.mvpNotice": "現在、本サービスはMVPテスト段階であり、一部機能は運営方針により変更される場合があります。",
    "footer.ctaTitle": "お困りですか？",
    "footer.ctaBody": "登録、プロフィール、マッチング、安全通報に関するお問い合わせをお送りください。",
    "footer.ctaButton": "お問い合わせ",
    "footer.about": "サービス紹介",
    "footer.faq": "Q&A",
    "footer.contact": "お問い合わせ",
    "footer.safety": "安全ガイド",
    "footer.terms": "利用規約",
    "footer.privacy": "プライバシーポリシー",
    "terms.eyebrow": "利用規約",
    "terms.title": "利用規約のご案内",
    "terms.body": "利用規約は正式サービス運営前に法務確認後、提供される予定です。",
    "privacy.eyebrow": "プライバシーポリシー",
    "privacy.title": "プライバシーポリシーのご案内",
    "privacy.body": "プライバシーポリシーは正式サービス運営前に法務確認後、提供される予定です。",
    "billing.eyebrow": "Membership",
    "billing.title": "料金プラン",
    "billing.body": "HanilMatchは、月額会員制と追加トークンを組み合わせた料金モデルです。有料会員はマッチングの機会と基本翻訳利用量を受け取り、上限を超えた場合は必要に応じてトークンを追加して利用できます。",
    "billing.mvpNotice": "現在、決済機能はMVPテスト段階です。実際の決済は発生せず、今後決済会社のsandboxテスト後に本番決済を適用します。",
    "billing.preparingButton": "決済機能は準備中",
    "billing.preparingNotice": "現在、決済機能はMVPテスト段階です。実際の決済は発生せず、sandbox/test mode連携の準備のみ行っています。",
    "billing.free.label": "FREE",
    "billing.free.title": "無料会員",
    "billing.free.price": "基本利用",
    "billing.free.feature1": "プロフィール作成",
    "billing.free.feature2": "AIマッチング通知の受信",
    "billing.free.feature3": "サービス基本機能の確認",
    "billing.free.feature4": "一部機能の制限",
    "billing.premium.label": "PREMIUM",
    "billing.premium.title": "プレミアム会員",
    "billing.premium.price": "月額19,900ウォン",
    "billing.premium.feature1": "1日1回AIマッチング対象",
    "billing.premium.feature2": "マッチ相手のプロフィール全体を確認",
    "billing.premium.feature3": "チャット利用可能",
    "billing.premium.feature4": "翻訳 月300回または30,000文字を含む",
    "billing.premium.feature5": "通報・お問い合わせサポート",
    "billing.premium.feature6": "月間提供量を超えた場合は追加トークンを利用可能",
    "billing.tokens.label": "TOKENS",
    "billing.tokens.title": "追加トークン",
    "billing.tokens.price": "必要に応じて追加",
    "billing.tokens.feature1": "翻訳の追加利用",
    "billing.tokens.feature2": "追加マッチングリクエスト",
    "billing.tokens.feature3": "特別な関心表示",
    "billing.tokens.feature4": "今後のブースト機能に使用予定",
    "about.eyebrow": "サービス紹介",
    "about.title": "HanilMatchは韓国と日本をつなぐ安全な交流スペースです。",
    "about.body": "HanilMatchは、韓国と日本のユーザーが言語、文化、関心ごとをきっかけに自然につながれるようサポートする、日韓特化型のマッチングサービスです。",
    "about.feature1Title": "日韓特化型マッチング",
    "about.feature1Body": "韓国と日本のユーザーに合ったプロフィール情報と関心ごとを中心につなぎます。",
    "about.feature2Title": "翻訳サポート付きチャット",
    "about.feature2Body": "韓国語と日本語の会話をよりスムーズに続けられるよう、翻訳の流れをサポートします。",
    "about.feature3Title": "プロフィールに基づくおすすめ",
    "about.feature3Body": "職業、言語、目的、関心ごとなどのプロフィール文脈をもとにおすすめの質を高めます。",
    "about.feature4Title": "安心して利用できる環境",
    "about.feature4Body": "電話番号の非公開、通報、管理者確認の流れにより、より安全な交流を目指します。",
    "faq.eyebrow": "Q&A",
    "faq.title": "よくある質問",
    "faq.body": "登録、プロフィール、おすすめ、チャット、翻訳、通報、決済、お問い合わせの流れをまとめました。",
    "faq.q1": "HanilMatchはどのようなサービスですか？",
    "faq.a1": "韓国と日本のユーザーが言語、文化、関心ごとをきっかけに自然につながれるようサポートする、日韓特化型のマッチングサービスです。",
    "faq.q2": "電話番号は相手に公開されますか？",
    "faq.a2": "いいえ。電話番号は本人確認と安全管理のための非公開情報であり、相手プロフィール、マッチカード、チャット画面には表示されません。",
    "faq.q3": "プロフィール写真は何枚まで登録できますか？",
    "faq.a3": "プロフィール写真は最大3枚まで登録できます。",
    "faq.q4": "マッチングはどのように行われますか？",
    "faq.a4": "HanilMatchは、ユーザーが無作為に相手を探す方式ではなく、プロフィール情報、言語レベル、関心ごと、利用目的をもとに相性のよい相手をおすすめする方式を目指しています。おすすめが届いたら、理由を確認して承認するかどうかを選択できます。",
    "faq.q5": "おすすめは自動で行われますか？",
    "faq.a5": "初期MVPでは運用の安定性を優先し、管理者が手動でおすすめ生成を実行できます。今後、運用が安定した段階で自動おすすめ機能を段階的に導入する予定です。",
    "faq.q6": "翻訳機能はどのように使えますか？",
    "faq.a6": "チャットで相手メッセージの翻訳をリクエストすると、原文と翻訳文を一緒に確認できます。",
    "faq.q7": "不快なメッセージを受け取った場合はどうすればよいですか？",
    "faq.a7": "チャット画面の通報機能から理由を送信すると、管理者が確認します。",
    "faq.q8": "決済機能は現在利用できますか？",
    "faq.a8": "現在、決済機能はMVPテスト段階です。実際の決済は発生せず、今後決済会社のsandboxテスト後に本番決済を適用します。",
    "faq.q9": "問い合わせはどこからできますか？",
    "faq.a9": "お問い合わせページで名前、メールアドレス、内容を送信すると、管理者のお問い合わせ管理画面に受付されます。",
    "faq.q10": "どのようなユーザーが推薦対象ですか？",
    "faq.a10": "現在のMVPでは、韓国男性と日本女性のAIおすすめマッチングを優先して提供しています。今後の運営方針により、対象範囲が変更される場合があります。",
    "contact.eyebrow": "お問い合わせ",
    "contact.title": "お問い合わせ",
    "contact.body": "サービス利用中の不明点やお困りごとがあれば、内容を入力して送信してください。",
    "contact.name": "お名前",
    "contact.email": "メールアドレス",
    "contact.message": "お問い合わせ内容",
    "contact.submit": "送信",
    "contact.submitting": "送信中...",
    "contact.validation": "お名前、メールアドレス、お問い合わせ内容をすべて入力してください。",
    "contact.success": "お問い合わせを受け付けました。確認後、順次対応いたします。",
    "contact.failed": "お問い合わせの送信に失敗しました。しばらくしてからもう一度お試しください。",
    "contact.helper": "緊急の安全通報は、チャット画面の通報機能もあわせてご利用ください。",
    "community.eyebrow": "Community",
    "community.title": "コミュニティ",
    "community.body": "HanilMatchの利用レビュー、日韓文化の話、マッチングや会話のコツを共有しましょう。",
    "community.write": "投稿する",
    "community.all": "すべて",
    "community.category.notice": "お知らせ",
    "community.category.review": "利用レビュー",
    "community.category.culture": "日韓文化の話",
    "community.category.tips": "マッチング・会話のコツ",
    "community.category.feedback": "ご意見・ご要望",
    "community.empty": "公開中のコミュニティ投稿はまだありません。",
    "community.loadFailed": "コミュニティ投稿を読み込めませんでした。",
    "community.newTitle": "コミュニティ投稿",
    "community.newBody": "利用レビュー、日韓文化の話、ご意見をお寄せください。投稿はコミュニティ一覧にすぐ公開されます。",
    "community.category": "カテゴリー",
    "community.postTitle": "タイトル",
    "community.content": "内容",
    "community.submit": "投稿する",
    "community.submitting": "送信中...",
    "community.validation": "カテゴリー、タイトル、内容をすべて入力してください。",
    "community.success": "投稿が登録されました。",
    "community.failed": "投稿の送信に失敗しました。しばらくしてからもう一度お試しください。",
    "community.safetyNotice": "個人の連絡先、金銭の要求、誹謗中傷、広告目的の投稿は運営方針により非表示になる場合があります。",
    "community.status.pending": "承認待ち",
    "community.status.approved": "公開",
    "community.status.rejected": "却下",
    "community.status.hidden": "非表示",
    "community.backToList": "一覧へ",
    "community.loginRequired": "投稿するにはログインが必要です。",
    "community.detailNotFound": "公開中の投稿が見つかりません。",
    "safety.eyebrow": "Safety",
    "safety.title": "安全ガイド",
    "safety.body": "HanilMatchは、健全で安全な日韓交流を目指しています。",
    "safety.section1Title": "個人情報の保護",
    "safety.section1Item1": "電話番号は本人確認と安全管理のための非公開情報であり、相手には公開されません。",
    "safety.section1Item2": "相手プロフィール、マッチカード、チャット画面には電話番号は表示されません。",
    "safety.section1Item3": "住所、口座、身分証などの機密性の高い個人情報は、会話の初期段階で共有しないでください。",
    "safety.section2Title": "注意が必要な行動",
    "safety.section2Item1": "外部決済、送金、投資、金銭要求には十分注意してください。",
    "safety.section2Item2": "なりすまし、虚偽プロフィール、個人情報要求が疑われる場合は会話を中断してください。",
    "safety.section2Item3": "サービス外のメッセンジャーへ過度に移動を求める行動に注意してください。",
    "safety.section3Title": "チャット利用時の注意",
    "safety.section3Item1": "不快な表現、セクハラ、差別的な表現を受けた場合は通報機能を使ってください。",
    "safety.section3Item2": "信頼関係ができるまでは、個人的な連絡先の共有は慎重に判断してください。",
    "safety.section4Title": "実際に会うときの注意",
    "safety.section4Item1": "初めて会うときは人の多い公共の場所を選びましょう。",
    "safety.section4Item2": "予定と場所を身近な人に事前に伝えておきましょう。",
    "safety.section5Title": "通報とお問い合わせ",
    "safety.section5Item1": "チャット画面の通報ボタンから不適切なユーザーを報告できます。",
    "safety.section5Item2": "サービス利用に関するお問い合わせは、お問い合わせページから送信してください。",
    "safety.section6Title": "児童・青少年の安全",
    "safety.section6Item1": "HanilMatchは成人ユーザーを前提として運営されています。",
    "safety.section6Item2": "児童・青少年を危険にさらす会話や要求は、すぐに通報してください。",
  },
};

const interestLabels: Record<string, Record<AppLocale, string>> = {
  travel: { ko: "여행", ja: "旅行" },
  culture: { ko: "문화", ja: "文化" },
  "language exchange": { ko: "언어교류", ja: "言語交流" },
  coffee: { ko: "커피", ja: "コーヒー" },
  design: { ko: "디자인", ja: "デザイン" },
  movies: { ko: "영화", ja: "映画" },
  coding: { ko: "코딩", ja: "コーディング" },
  fitness: { ko: "운동", ja: "フィットネス" },
  music: { ko: "음악", ja: "音楽" },
  photography: { ko: "사진", ja: "写真" },
  art: { ko: "예술", ja: "アート" },
  cooking: { ko: "요리", ja: "料理" },
  kdrama: { ko: "한국 드라마", ja: "韓国ドラマ" },
  hiking: { ko: "등산", ja: "ハイキング" },
  jazz: { ko: "재즈", ja: "ジャズ" },
};

export function normalizeLocale(value?: string | null): AppLocale {
  if (!value) {
    return "ko";
  }

  const lowered = value.toLowerCase();
  if (lowered.startsWith("ja")) {
    return "ja";
  }
  return "ko";
}

export const LOCALE_STORAGE_KEY = "krjp_locale";

export function getStoredLocale(): AppLocale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "ko" || stored === "ja") {
    return stored;
  }
  return null;
}

export function setStoredLocale(locale: AppLocale) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

export function getPreferredLocale(fallback?: string | null): AppLocale {
  return getStoredLocale() ?? normalizeLocale(fallback);
}

export function getBrowserLocale() {
  const stored = getStoredLocale();
  if (stored) {
    return stored;
  }
  if (typeof navigator === "undefined") {
    return "ko" as AppLocale;
  }
  return normalizeLocale(navigator.language);
}

export function translate(locale: AppLocale, key: TranslationKey, variables?: Record<string, string | number>) {
  let text = translations[locale][key] ?? translations.ko[key] ?? key;
  if (!variables) {
    return text;
  }

  for (const [name, value] of Object.entries(variables)) {
    text = text.replace(`{${name}}`, String(value));
  }
  return text;
}

export function localizeInterest(locale: AppLocale, interest: string) {
  const normalized = interest.trim().toLowerCase();
  return interestLabels[normalized]?.[locale] ?? interest;
}

export function localizeGender(locale: AppLocale, gender: string) {
  const normalized = gender.trim().toLowerCase();
  if (normalized === "male") {
    return locale === "ja" ? "男性" : "남성";
  }
  if (normalized === "female") {
    return locale === "ja" ? "女性" : "여성";
  }
  return gender;
}

export function localizeNationality(locale: AppLocale, nationality: string) {
  const normalized = nationality.trim().toUpperCase();
  if (normalized === "KR") {
    return locale === "ja" ? "韓国" : "한국";
  }
  if (normalized === "JP") {
    return locale === "ja" ? "日本" : "일본";
  }
  return nationality;
}

export function localizeLanguage(locale: AppLocale, language: string) {
  const normalized = language.trim().toLowerCase();
  if (normalized === "ko") {
    return locale === "ja" ? "韓国語" : "한국어";
  }
  if (normalized === "ja") {
    return locale === "ja" ? "日本語" : "일본어";
  }
  if (normalized === "en") {
    return locale === "ja" ? "英語" : "영어";
  }
  return language;
}

export function getMessageTextForViewer(message: Message, viewerId?: string) {
  const mine = viewerId === message.sender_id;
  return mine ? message.original_text : message.translated_text ?? message.original_text;
}
