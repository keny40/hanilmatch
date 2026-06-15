"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AdminReport,
  AdminSettings,
  AdminStats,
  CommunityPost,
  CommunityPostStatus,
  Inquiry,
  getAdminStats,
  PopupNotice,
  User,
  createPopupNotice,
  getAdminCommunityPosts,
  getAdminInquiries,
  getAdminReports,
  getAdminSettings,
  getAdminUsers,
  getCurrentUser,
  getPopupNotices,
  runAdminDailyAutoMatching,
  runAdminRecommendations,
  runAdminUserRecommendations,
  sendBroadcastNotification,
  updateAdminContactInquiry,
  updateAdminCommunityPost,
  updateAdminReportStatus,
  updateAdminInquiryStatus,
  updateAdminSettings,
  updateAdminUser,
  updatePopupNotice,
} from "../../lib/api";

const T = {
  checkingAuth: "관리자 권한을 확인하는 중입니다...",
  accessDenied: "관리자 권한이 없습니다. / 管理者権限がありません。",
  dashboardLink: "대시보드로 이동",
  loading: "관리자 화면을 불러오는 중...",
  loadFailed: "관리자 정보를 불러오지 못했습니다.",
  page: "운영자 페이지",
  intro: "운영 기능을 관리합니다.",

  memberSection: "회원 관리",
  memberHelp: "신규 가입자는 기본적으로 무료회원이며, 체크박스로 유료회원/인증/관리자 여부를 조정할 수 있습니다.",
  email: "이메일",
  nationLang: "국가/언어",
  free: "무료",
  paid: "유료",
  verified: "인증",
  admin: "관리자",
  noUsers: "회원이 없습니다.",
  dashboardStats: "운영 요약",
  totalUsers: "전체 회원 수",
  completedProfiles: "프로필 완료 회원 수",
  todayMatches: "오늘 생성된 매칭 수",
  pendingReports: "대기 중 신고 수",
  pendingInquiries: "대기 중 문의 수",
  pendingCommunityPosts: "승인 대기 커뮤니티 글 수",
  reportSection: "신고 관리",
  reportHelp: "최근 신고 내역을 확인하고 처리 상태를 변경할 수 있습니다.",
  reporter: "신고자",
  reported: "신고 대상",
  reason: "신고 사유",
  status: "처리 상태",
  noReports: "접수된 신고가 없습니다. 문제가 접수되면 이곳에서 처리 상태를 변경할 수 있습니다.",
  pending: "접수",
  reviewed: "검토 완료",
  dismissed: "기각",
  actionTaken: "조치 완료",
  inquirySection: "문의 관리",
  inquiryHelp: "문의/상담 페이지로 접수된 내용을 확인하고 처리 상태를 변경할 수 있습니다.",
  inquiryName: "이름",
  inquiryMessage: "문의 내용",
  inquiryAdminNote: "관리자 메모",
  inquirySave: "메모 저장",
  inquirySaving: "저장 중...",
  noInquiries: "접수된 문의가 없습니다.",
  inquiryPending: "접수 / 受付",
  inquiryReviewed: "검토 / 確認済み",
  inquiryReplied: "답변 / 返信済み",
  inquiryClosed: "종료 / 完了",
  inquiryStatusDone: "문의 처리 상태가 업데이트되었습니다.",
  inquiryNoteDone: "관리자 메모가 저장되었습니다.",

  communitySection: "커뮤니티 관리",
  communityHelp: "사용자가 작성한 글을 승인형으로 검토합니다. 승인된 공개 글만 커뮤니티 목록에 표시됩니다.",
  communityCategory: "카테고리",
  communityAuthor: "작성자",
  communityContent: "내용",
  communityAdminNote: "관리자 메모",
  communityNoPosts: "커뮤니티 글이 없습니다.",
  communityAllStatuses: "전체 상태",
  communityPending: "승인 대기 / 承認待ち",
  communityApproved: "공개 / 公開",
  communityRejected: "반려 / 却下",
  communityHidden: "숨김 / 非表示",
  communityApprove: "승인",
  communityReject: "반려",
  communityHide: "숨김",
  communityRestore: "다시 공개",
  communitySaveNote: "메모 저장",
  communityUpdated: "커뮤니티 글 상태가 업데이트되었습니다.",
  communityNoteSaved: "커뮤니티 관리자 메모가 저장되었습니다.",

  settings: "운영 설정",
  notifyLimit: "매칭 추천 알림 최대 개수",
  notifyLimitHelp:
    "읽지 않은 추천 알림이 이 개수 이상이면 새 추천 알림을 보내지 않습니다. 추천 생성 수와 알림 발송 수는 다릅니다. 현재 추천 생성은 관리자 수동 실행을 기본으로 합니다.",
  priceUsd: "유료회원 가격 (USD)",
  currencyHelp: "유료회원 결제 통화는 달러(USD)로 고정됩니다.",
  save: "설정 저장",
  saving: "저장 중...",
  currentSettings: "현재 설정",

  broadcast: "전체 알림 발송",
  title: "제목",
  body: "내용",
  sendAll: "전체 알림 보내기",
  sending: "발송 중...",

  popup: "팝업 공지",
  popupHelp: "사용자에게 노출할 공지 팝업을 관리합니다.",
  popupCreate: "팝업 공지 등록",
  popupCreating: "등록 중...",
  locale: "노출 언어",
  all: "전체",
  ko: "한국어 사용자",
  ja: "일본어 사용자",
  active: "활성",
  inactive: "비활성",
  createdAt: "생성일",
  noPopups: "등록된 팝업 공지가 없습니다.",

  userUpdated: "회원 정보가 업데이트되었습니다.",
  reportStatusDone: "신고 처리 상태가 업데이트되었습니다.",
  settingsSaved: "운영 설정이 저장되었습니다.",
  invalidSettings: "운영 설정 값을 확인해주세요. 매칭 알림 개수는 1 이상, 유료회원 가격은 0 이상이어야 합니다.",
  broadcastDone: "전체 알림을 {count}명에게 발송했습니다.",
  invalidBroadcast: "알림 제목과 내용을 입력해주세요.",
  popupDone: "팝업 공지가 등록되었습니다.",
  popupStatusDone: "팝업 공지 상태가 업데이트되었습니다.",
  recommendationSection: "추천 관리",
  recommendationHelp:
    "사용자의 프로필, 관심사, 언어 정보, 매칭 목적을 바탕으로 추천 후보를 생성합니다. 초기 MVP에서는 운영자가 수동으로 추천 생성을 실행합니다. 자동 추천 스케줄러는 운영 안정화 후 별도로 실행할 수 있습니다.",
  dailyMatchingHelp: "프로필이 완성된 eligible 사용자에게 오늘 1회 자동 매칭을 생성합니다.",
  runDailyMatching: "오늘 자동 매칭 실행",
  runAllRecommendations: "전체 사용자 추천 생성",
  runningRecommendations: "추천 생성 중...",
  selectUser: "사용자 선택",
  runSelectedRecommendations: "선택 사용자 추천 생성",
  recommendationFailed: "추천 생성에 실패했습니다. 백엔드 서버 상태를 확인해주세요.",
  recommendationAllDone: "AI 매칭 {matches}건을 연결했습니다. 처리 사용자: {count}명",
  recommendationAllEmpty: "추천 가능한 대상이 없어 매칭이 생성되지 않았습니다. 처리 사용자: {count}명",
  recommendationUserDone: "{email} AI 매칭 {matches}건을 연결했습니다. 남은 추천 수: {count}개",
  recommendationUserEmpty: "{email} 추천 가능한 대상이 없어 매칭이 생성되지 않았습니다.",
  dailyMatchingDone:
    "오늘 자동 매칭 {matches}건을 연결했습니다. 처리 사용자: {count}명, 오늘 이미 매칭됨: {matched}명, 후보 없음: {empty}명",
  dailyMatchingEmpty:
    "오늘 자동 매칭으로 연결된 건이 없습니다. 처리 사용자: {count}명, 오늘 이미 매칭됨: {matched}명, 후보 없음: {empty}명",
  updateFailed: "업데이트에 실패했습니다.",
  sectionLoadFailed: "데이터를 불러오지 못했습니다.",
} as const;

function t(template: string, values?: Record<string, string | number>) {
  if (!values) return template;

  let next = template;
  for (const [key, value] of Object.entries(values)) {
    next = next.replace(`{${key}}`, String(value));
  }
  return next;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function reportStatusLabel(status: AdminReport["status"]) {
  switch (status) {
    case "pending":
      return T.pending;
    case "reviewed":
      return T.reviewed;
    case "dismissed":
      return T.dismissed;
    case "action_taken":
      return T.actionTaken;
    default:
      return status;
  }
}

function inquiryStatusLabel(status: Inquiry["status"]) {
  switch (status) {
    case "pending":
      return T.inquiryPending;
    case "reviewed":
      return T.inquiryReviewed;
    case "replied":
      return T.inquiryReplied;
    case "closed":
      return T.inquiryClosed;
    default:
      return status;
  }
}

function communityStatusLabel(status: CommunityPostStatus) {
  switch (status) {
    case "pending":
      return T.communityPending;
    case "approved":
      return T.communityApproved;
    case "rejected":
      return T.communityRejected;
    case "hidden":
      return T.communityHidden;
    default:
      return status;
  }
}

function communityCategoryLabel(category: CommunityPost["category"]) {
  switch (category) {
    case "notice":
      return "공지사항 / お知らせ";
    case "review":
      return "이용 후기 / 利用レビュー";
    case "culture":
      return "한일 문화 이야기 / 日韓文化の話";
    case "tips":
      return "매칭/대화 팁 / マッチング・会話のコツ";
    case "feedback":
      return "건의사항 / ご意見・ご要望";
    default:
      return category;
  }
}

function isAuthFailure(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("401") ||
    message.includes("403") ||
    message.includes("credentials") ||
    message.includes("not authenticated") ||
    message.includes("forbidden") ||
    message.includes("failed to fetch")
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [popupNotices, setPopupNotices] = useState<PopupNotice[]>([]);

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupBody, setPopupBody] = useState("");
  const [popupLocale, setPopupLocale] = useState<"all" | "ko" | "ja">("all");

  const [matchNotificationLimit, setMatchNotificationLimit] = useState("3");
  const [paidMembershipPriceUsd, setPaidMembershipPriceUsd] = useState("9.99");
  const [selectedRecommendationUserId, setSelectedRecommendationUserId] = useState("");

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingPopup, setCreatingPopup] = useState(false);
  const [runningAllRecommendations, setRunningAllRecommendations] = useState(false);
  const [runningUserRecommendations, setRunningUserRecommendations] = useState(false);
  const [runningDailyMatching, setRunningDailyMatching] = useState(false);
  const [savingInquiryId, setSavingInquiryId] = useState<string | null>(null);
  const [inquiryNotes, setInquiryNotes] = useState<Record<string, string>>({});
  const [communityStatusFilter, setCommunityStatusFilter] = useState<CommunityPostStatus | "all">("all");
  const [savingCommunityPostId, setSavingCommunityPostId] = useState<string | null>(null);
  const [communityNotes, setCommunityNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      setCheckingAuth(true);
      setIsAllowed(false);
      setCurrentUser(null);
      setLoading(true);
      setError("");
      setMessage("");
      setSectionErrors({});

      try {
        const me = await getCurrentUser();

        if (cancelled) {
          return;
        }

        if (!me) {
          router.replace("/login");
          return;
        }

        if (!me.is_admin) {
          setCurrentUser(me);
          setIsAllowed(false);
          return;
        }

        setCurrentUser(me);
        setIsAllowed(true);
        setCheckingAuth(false);
        await loadAdminData(() => cancelled);
      } catch (loadError) {
        console.error("Admin auth check failed:", loadError);
        if (!cancelled) {
          setIsAllowed(false);
          setCurrentUser(null);
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
          setLoading(false);
        }
      }
    }

    void checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function loadAdminData(isCancelled: () => boolean) {
      try {
        const loadedUsers = await getAdminUsers();
        if (isCancelled()) return;
        setUsers(loadedUsers);
        setSelectedRecommendationUserId((current) => current || loadedUsers[0]?.id || "");
      } catch (sectionError) {
        console.error("Failed to fetch admin users:", sectionError);
        if (isAuthFailure(sectionError)) {
          throw sectionError;
        }
        setUsers([]);
        setSectionErrors((prev) => ({ ...prev, users: T.sectionLoadFailed }));
      }

      try {
        const loadedReports = await getAdminReports();
        if (isCancelled()) return;
        setReports(loadedReports);
      } catch (sectionError) {
        console.error("Failed to fetch admin reports:", sectionError);
        if (isAuthFailure(sectionError)) {
          throw sectionError;
        }
        setReports([]);
        setSectionErrors((prev) => ({ ...prev, reports: T.sectionLoadFailed }));
      }

      try {
        const loadedInquiries = await getAdminInquiries();
        if (isCancelled()) return;
        setInquiries(loadedInquiries);
        setInquiryNotes(
          Object.fromEntries(loadedInquiries.map((inquiry) => [inquiry.id, inquiry.admin_note ?? ""])),
        );
      } catch (sectionError) {
        console.error("Failed to fetch admin inquiries:", sectionError);
        if (isAuthFailure(sectionError)) {
          throw sectionError;
        }
        setInquiries([]);
        setSectionErrors((prev) => ({ ...prev, inquiries: T.sectionLoadFailed }));
      }

      try {
        const loadedCommunityPosts = await getAdminCommunityPosts(communityStatusFilter);
        if (isCancelled()) return;
        setCommunityPosts(loadedCommunityPosts);
        setCommunityNotes(
          Object.fromEntries(loadedCommunityPosts.map((post) => [post.id, post.admin_note ?? ""])),
        );
      } catch (sectionError) {
        console.error("Failed to fetch admin community posts:", sectionError);
        if (isAuthFailure(sectionError)) {
          throw sectionError;
        }
        setCommunityPosts([]);
        setSectionErrors((prev) => ({ ...prev, community: T.sectionLoadFailed }));
      }

      try {
  const loadedStats = await getAdminStats();
  if (isCancelled()) return;
  setStats(loadedStats);
} catch (sectionError) {
  console.error("Failed to fetch admin stats:", sectionError);
  if (isAuthFailure(sectionError)) {
    throw sectionError;
  }
  setStats(null);
}

      try {
        const loadedSettings = await getAdminSettings();
        if (isCancelled()) return;
        setSettings(loadedSettings);
        setMatchNotificationLimit(String(loadedSettings.match_notification_limit));
        setPaidMembershipPriceUsd(String(loadedSettings.paid_membership_price_usd));
      } catch (sectionError) {
        console.error("Failed to fetch admin settings:", sectionError);
        if (isAuthFailure(sectionError)) {
          throw sectionError;
        }
        setSettings(null);
        setSectionErrors((prev) => ({ ...prev, settings: T.sectionLoadFailed }));
      }

      try {
        const loadedPopups = await getPopupNotices();
        if (isCancelled()) return;
        setPopupNotices(loadedPopups);
      } catch (sectionError) {
        console.error("Failed to fetch popup notices:", sectionError);
        if (isAuthFailure(sectionError)) {
          throw sectionError;
        }
        setPopupNotices([]);
        setSectionErrors((prev) => ({ ...prev, popups: T.sectionLoadFailed }));
      }
  }

  async function handleUserBooleanChange(user: User, field: "is_verified" | "is_admin", value: boolean) {
    setMessage("");
    setError("");

    try {
      const updated = await updateAdminUser(user.id, { [field]: value });
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
      setMessage(T.userUpdated);
    } catch (updateError) {
      console.error(updateError);
      setError(T.updateFailed);
    }
  }

  async function handleMembershipChange(user: User, paid: boolean) {
    setMessage("");
    setError("");

    try {
      const updated = await updateAdminUser(user.id, {
        membership_tier: paid ? "paid" : "free",
      });
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)));
      setMessage(T.userUpdated);
    } catch (updateError) {
      console.error(updateError);
      setError(T.updateFailed);
    }
  }

  async function refreshAdminStats() {
  try {
    const loadedStats = await getAdminStats();
    setStats(loadedStats);
  } catch (sectionError) {
    console.error("Failed to refresh admin stats:", sectionError);
  }
}

  async function handleReportStatusChange(reportId: string, status: AdminReport["status"]) {
    setMessage("");
    setError("");

    try {
      const updated = await updateAdminReportStatus(reportId, status);
setReports((prev) => prev.map((item) => (item.id === reportId ? updated : item)));
await refreshAdminStats();
setMessage(T.reportStatusDone);
    } catch (updateError) {
      console.error(updateError);
      setError(T.updateFailed);
    }
  }

  async function handleInquiryStatusChange(inquiryId: string, status: Inquiry["status"]) {
    setMessage("");
    setError("");

    try {
      const updated = await updateAdminInquiryStatus(inquiryId, status);
      setInquiries((prev) => prev.map((item) => (item.id === inquiryId ? updated : item)));
      setInquiryNotes((prev) => ({ ...prev, [updated.id]: updated.admin_note ?? "" }));
      setMessage(T.inquiryStatusDone);
    } catch (updateError) {
      console.error(updateError);
      setError(T.updateFailed);
    }
  }

  async function handleInquiryNoteSave(inquiry: Inquiry) {
    setSavingInquiryId(inquiry.id);
    setMessage("");
    setError("");

    try {
      const updated = await updateAdminContactInquiry(inquiry.id, {
        status: inquiry.status,
        admin_note: inquiryNotes[inquiry.id] ?? "",
      });
      setInquiries((prev) => prev.map((item) => (item.id === inquiry.id ? updated : item)));
      setInquiryNotes((prev) => ({ ...prev, [updated.id]: updated.admin_note ?? "" }));
      setMessage(T.inquiryNoteDone);
    } catch (updateError) {
      console.error(updateError);
      setError(T.updateFailed);
    } finally {
      setSavingInquiryId(null);
    }
  }

  async function loadCommunityPosts(statusFilter: CommunityPostStatus | "all") {
    try {
      const loadedCommunityPosts = await getAdminCommunityPosts(statusFilter);
      setCommunityPosts(loadedCommunityPosts);
      setCommunityNotes(
        Object.fromEntries(loadedCommunityPosts.map((post) => [post.id, post.admin_note ?? ""])),
      );
      setSectionErrors((prev) => {
        const next = { ...prev };
        delete next.community;
        return next;
      });
    } catch (loadError) {
      console.error(loadError);
      if (isAuthFailure(loadError)) {
        router.replace("/login");
        return;
      }
      setCommunityPosts([]);
      setSectionErrors((prev) => ({ ...prev, community: T.sectionLoadFailed }));
    }
  }

  async function handleCommunityStatusFilterChange(statusFilter: CommunityPostStatus | "all") {
    setCommunityStatusFilter(statusFilter);
    await loadCommunityPosts(statusFilter);
  }

  async function handleCommunityPostUpdate(
    post: CommunityPost,
    statusValue?: CommunityPostStatus,
    noteOnly = false,
  ) {
    setSavingCommunityPostId(post.id);
    setMessage("");
    setError("");

    try {
      const updated = await updateAdminCommunityPost(post.id, {
        status: statusValue ?? post.status,
        admin_note: communityNotes[post.id] ?? "",
      });
      setCommunityPosts((prev) => prev.map((item) => (item.id === post.id ? updated : item)));
      setCommunityNotes((prev) => ({ ...prev, [updated.id]: updated.admin_note ?? "" }));
      setMessage(noteOnly ? T.communityNoteSaved : T.communityUpdated);
    } catch (updateError) {
      console.error(updateError);
      setError(T.updateFailed);
    } finally {
      setSavingCommunityPostId(null);
    }
  }

  async function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const nextMatchNotificationLimit = Number(matchNotificationLimit);
  const nextPaidMembershipPriceUsd = Number(paidMembershipPriceUsd);

  if (
    !Number.isFinite(nextMatchNotificationLimit) ||
    !Number.isFinite(nextPaidMembershipPriceUsd) ||
    nextMatchNotificationLimit < 1 ||
    nextPaidMembershipPriceUsd < 0
  ) {
    setMessage("");
    setError(T.invalidSettings);
    return;
  }

  setSaving(true);
  setMessage("");
  setError("");

  try {
    const updated = await updateAdminSettings({
      match_notification_limit: nextMatchNotificationLimit,
      paid_membership_price_usd: nextPaidMembershipPriceUsd,
      billing_currency: "USD",
    });

    setSettings(updated);
    setMessage(T.settingsSaved);
  } catch (saveError) {
    console.error(saveError);
    setError(T.updateFailed);
  } finally {
    setSaving(false);
  }
}

  async function handleRunAllRecommendations() {
    setRunningAllRecommendations(true);
    setMessage("");
    setError("");

    try {
      const result = await runAdminRecommendations();
      setMessage(
        result.connected_matches > 0
          ? t(T.recommendationAllDone, {
              count: result.processed_users,
              matches: result.connected_matches,
            })
          : t(T.recommendationAllEmpty, { count: result.processed_users }),
      );
    } catch (recommendationError) {
      console.error(recommendationError);
      setError(T.recommendationFailed);
    } finally {
      setRunningAllRecommendations(false);
    }
  }

  async function handleRunUserRecommendations() {
    if (!selectedRecommendationUserId) {
      return;
    }

    setRunningUserRecommendations(true);
    setMessage("");
    setError("");

    try {
      const result = await runAdminUserRecommendations(selectedRecommendationUserId);
      const selectedUser = users.find((user) => user.id === selectedRecommendationUserId);
      const selectedEmail = selectedUser?.email ?? result.user_id;
      setMessage(
        result.connected_matches > 0
          ? t(T.recommendationUserDone, {
              email: selectedEmail,
              count: result.created_count,
              matches: result.connected_matches,
            })
          : t(T.recommendationUserEmpty, { email: selectedEmail }),
      );
    } catch (recommendationError) {
      console.error(recommendationError);
      setError(T.recommendationFailed);
    } finally {
      setRunningUserRecommendations(false);
    }
  }

  async function handleRunDailyMatching() {
    setRunningDailyMatching(true);
    setMessage("");
    setError("");

    try {
      const result = await runAdminDailyAutoMatching();
      setMessage(
        result.connected_matches > 0
          ? t(T.dailyMatchingDone, {
              count: result.processed_users,
              matches: result.connected_matches,
              matched: result.skipped_already_matched_today,
              empty: result.skipped_no_candidates,
            })
          : t(T.dailyMatchingEmpty, {
              count: result.processed_users,
              matched: result.skipped_already_matched_today,
              empty: result.skipped_no_candidates,
            }),
      );
    } catch (recommendationError) {
      console.error(recommendationError);
      setError(T.recommendationFailed);
    } finally {
      setRunningDailyMatching(false);
    }
  }


  async function handleBroadcastSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const nextTitle = broadcastTitle.trim();
  const nextBody = broadcastBody.trim();

  if (!nextTitle || !nextBody) {
    setMessage("");
    setError(T.invalidBroadcast);
    return;
  }

  setSending(true);
  setMessage("");
  setError("");

  try {
    const result = await sendBroadcastNotification({
      title: nextTitle,
      body: nextBody,
    });

    setBroadcastTitle("");
    setBroadcastBody("");
    setMessage(t(T.broadcastDone, { count: result.sent_count }));
  } catch (sendError) {
    console.error(sendError);
    setError(T.updateFailed);
  } finally {
    setSending(false);
  }
}

  async function handlePopupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingPopup(true);
    setMessage("");
    setError("");

    try {
      const created = await createPopupNotice({
        title: popupTitle,
        body: popupBody,
        locale: popupLocale,
        is_active: true,
      });

      setPopupNotices((prev) => [created, ...prev]);
      setPopupTitle("");
      setPopupBody("");
      setPopupLocale("all");
      setMessage(T.popupDone);
    } catch (createError) {
      console.error(createError);
      setError(T.updateFailed);
    } finally {
      setCreatingPopup(false);
    }
  }

  async function handlePopupStatusToggle(notice: PopupNotice) {
    setMessage("");
    setError("");

    try {
      const updated = await updatePopupNotice(notice.id, {
        is_active: !notice.is_active,
      });

      setPopupNotices((prev) => prev.map((item) => (item.id === notice.id ? updated : item)));
      setMessage(T.popupStatusDone);
    } catch (updateError) {
      console.error(updateError);
      setError(T.updateFailed);
    }
  }

  if (checkingAuth) {
    return (
      <main className="shell section">
        <section className="panel dashboard-card">
          <p>{T.checkingAuth}</p>
        </section>
      </main>
    );
  }

  if (!isAllowed || !currentUser?.is_admin) {
    return (
      <main className="shell section">
        <section className="panel dashboard-card">
          <p>{T.accessDenied}</p>
          <button className="button" type="button" onClick={() => router.replace("/dashboard")}>
            {T.dashboardLink}
          </button>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="shell section">
        <section className="panel dashboard-card">
          <p>{T.loading}</p>
        </section>
      </main>
    );
  }

  return (
  <main className="shell section">
    <section className="admin-grid">
      <div className="panel dashboard-hero">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 style={{ marginBottom: 10 }}>{T.page}</h1>
          <p className="hero-text">
            {currentUser ? `${currentUser.email} ${T.intro}` : T.intro}
          </p>
        </div>
      </div>

      <div className="panel">
  <h2>{T.dashboardStats}</h2>

  <div className="admin-stat-grid">
    <div className="admin-stat-card">
      <span>{T.totalUsers}</span>
      <strong>{stats?.total_users ?? "-"}</strong>
    </div>

    <div className="admin-stat-card">
      <span>{T.completedProfiles}</span>
      <strong>{stats?.completed_profiles ?? "-"}</strong>
    </div>

    <div className="admin-stat-card">
      <span>{T.todayMatches}</span>
      <strong>{stats?.today_matches ?? "-"}</strong>
    </div>

    <div className="admin-stat-card">
      <span>{T.pendingReports}</span>
      <strong>{stats?.pending_reports ?? "-"}</strong>
    </div>

    <div className="admin-stat-card">
      <span>{T.pendingInquiries}</span>
      <strong>{stats?.pending_inquiries ?? "-"}</strong>
    </div>

    <div className="admin-stat-card">
      <span>{T.pendingCommunityPosts}</span>
      <strong>{stats?.pending_community_posts ?? "-"}</strong>
    </div>
  </div>
</div>

        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}

        <section className="panel dashboard-card">
          <h2>{T.recommendationSection}</h2>
          <p className="helper">{T.recommendationHelp}</p>
          <p className="helper">{T.dailyMatchingHelp}</p>

          <div className="actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => void handleRunDailyMatching()}
              disabled={runningDailyMatching}
            >
              {runningDailyMatching ? T.runningRecommendations : T.runDailyMatching}
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => void handleRunAllRecommendations()}
              disabled={runningAllRecommendations}
            >
              {runningAllRecommendations ? T.runningRecommendations : T.runAllRecommendations}
            </button>
          </div>

          <div className="actions">
            <label className="field" style={{ minWidth: 280, marginBottom: 0 }}>
              <span>{T.selectUser}</span>
              <select
                value={selectedRecommendationUserId}
                onChange={(event) => setSelectedRecommendationUserId(event.target.value)}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => void handleRunUserRecommendations()}
              disabled={!selectedRecommendationUserId || runningUserRecommendations}
            >
              {runningUserRecommendations ? T.runningRecommendations : T.runSelectedRecommendations}
            </button>
          </div>
        </section>

        <section className="panel dashboard-card">
          <h2>{T.memberSection}</h2>
          <p className="helper">{T.memberHelp}</p>

          {sectionErrors.users ? <p className="error">{sectionErrors.users}</p> : null}

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{T.email}</th>
                  <th>{T.nationLang}</th>
                  <th>{T.free}</th>
                  <th>{T.paid}</th>
                  <th>{T.verified}</th>
                  <th>{T.admin}</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>
                        {user.nationality} / {user.language}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={user.membership_tier === "free"}
                          onChange={() => void handleMembershipChange(user, false)}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={user.membership_tier === "paid"}
                          onChange={() => void handleMembershipChange(user, true)}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={user.is_verified}
                          onChange={(event) => void handleUserBooleanChange(user, "is_verified", event.target.checked)}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={user.is_admin}
                          onChange={(event) => void handleUserBooleanChange(user, "is_admin", event.target.checked)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>{T.noUsers}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel dashboard-card">
          <h2>{T.reportSection}</h2>
          <p className="helper">{T.reportHelp}</p>

          {sectionErrors.reports ? <p className="error">{sectionErrors.reports}</p> : null}

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{T.reporter}</th>
                  <th>{T.reported}</th>
                  <th>{T.reason}</th>
                  <th>{T.status}</th>
                  <th>{T.createdAt}</th>
                </tr>
              </thead>
              <tbody>
                {reports.length ? (
                  reports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.reporter_email}</td>
                      <td>{report.reported_email}</td>
                      <td>{report.reason}</td>
                      <td>
                        <select
                          value={report.status}
                          onChange={(event) =>
                            void handleReportStatusChange(report.id, event.target.value as AdminReport["status"])
                          }
                        >
                          <option value="pending">{reportStatusLabel("pending")}</option>
                          <option value="reviewed">{reportStatusLabel("reviewed")}</option>
                          <option value="dismissed">{reportStatusLabel("dismissed")}</option>
                          <option value="action_taken">{reportStatusLabel("action_taken")}</option>
                        </select>
                      </td>
                      <td>{formatDate(report.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>{T.noReports}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel dashboard-card">
          <h2>{T.communitySection}</h2>
          <p className="helper">{T.communityHelp}</p>

          {sectionErrors.community ? <p className="error">{sectionErrors.community}</p> : null}

          <div className="admin-toolbar">
            <label className="field compact-field">
              <span>{T.status}</span>
              <select
                value={communityStatusFilter}
                onChange={(event) =>
                  void handleCommunityStatusFilterChange(event.target.value as CommunityPostStatus | "all")
                }
              >
                <option value="all">{T.communityAllStatuses}</option>
                <option value="pending">{communityStatusLabel("pending")}</option>
                <option value="approved">{communityStatusLabel("approved")}</option>
                <option value="rejected">{communityStatusLabel("rejected")}</option>
                <option value="hidden">{communityStatusLabel("hidden")}</option>
              </select>
            </label>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{T.communityCategory}</th>
                  <th>{T.title}</th>
                  <th>{T.communityAuthor}</th>
                  <th>{T.communityContent}</th>
                  <th>{T.communityAdminNote}</th>
                  <th>{T.status}</th>
                  <th>{T.createdAt}</th>
                </tr>
              </thead>
              <tbody>
                {communityPosts.length ? (
                  communityPosts.map((post) => (
                    <tr key={post.id}>
                      <td>{communityCategoryLabel(post.category)}</td>
                      <td>{post.title}</td>
                      <td>{post.author_email ?? "-"}</td>
                      <td className="admin-text-cell">{post.content}</td>
                      <td className="admin-note-cell">
                        <textarea
                          value={communityNotes[post.id] ?? ""}
                          onChange={(event) =>
                            setCommunityNotes((prev) => ({ ...prev, [post.id]: event.target.value }))
                          }
                          rows={4}
                        />
                        <button
                          className="button button-secondary"
                          type="button"
                          onClick={() => void handleCommunityPostUpdate(post, undefined, true)}
                          disabled={savingCommunityPostId === post.id}
                        >
                          {savingCommunityPostId === post.id ? T.inquirySaving : T.communitySaveNote}
                        </button>
                      </td>
                      <td>
                        <div className="admin-action-stack">
                          <span className="pill">{communityStatusLabel(post.status)}</span>
                          {post.status !== "approved" ? (
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => void handleCommunityPostUpdate(post, "approved")}
                              disabled={savingCommunityPostId === post.id}
                            >
                              {post.status === "hidden" ? T.communityRestore : T.communityApprove}
                            </button>
                          ) : null}
                          {post.status !== "rejected" ? (
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => void handleCommunityPostUpdate(post, "rejected")}
                              disabled={savingCommunityPostId === post.id}
                            >
                              {T.communityReject}
                            </button>
                          ) : null}
                          {post.status !== "hidden" ? (
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => void handleCommunityPostUpdate(post, "hidden")}
                              disabled={savingCommunityPostId === post.id}
                            >
                              {T.communityHide}
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td>{formatDate(post.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>{T.communityNoPosts}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel dashboard-card">
          <h2>{T.inquirySection}</h2>
          <p className="helper">{T.inquiryHelp}</p>

          {sectionErrors.inquiries ? <p className="error">{sectionErrors.inquiries}</p> : null}

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{T.inquiryName}</th>
                  <th>{T.email}</th>
                  <th>{T.inquiryMessage}</th>
                  <th>{T.inquiryAdminNote}</th>
                  <th>{T.status}</th>
                  <th>{T.createdAt}</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length ? (
                  inquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td>{inquiry.name}</td>
                      <td>{inquiry.email}</td>
                      <td className="admin-text-cell">{inquiry.message}</td>
                      <td className="admin-note-cell">
                        <textarea
                          value={inquiryNotes[inquiry.id] ?? ""}
                          onChange={(event) =>
                            setInquiryNotes((prev) => ({ ...prev, [inquiry.id]: event.target.value }))
                          }
                          rows={4}
                        />
                        <button
                          className="button button-secondary"
                          type="button"
                          onClick={() => void handleInquiryNoteSave(inquiry)}
                          disabled={savingInquiryId === inquiry.id}
                        >
                          {savingInquiryId === inquiry.id ? T.inquirySaving : T.inquirySave}
                        </button>
                      </td>
                      <td>
                        <select
                          value={inquiry.status}
                          onChange={(event) =>
                            void handleInquiryStatusChange(inquiry.id, event.target.value as Inquiry["status"])
                          }
                        >
                          <option value="pending">{inquiryStatusLabel("pending")}</option>
                          <option value="reviewed">{inquiryStatusLabel("reviewed")}</option>
                          <option value="replied">{inquiryStatusLabel("replied")}</option>
                          <option value="closed">{inquiryStatusLabel("closed")}</option>
                        </select>
                      </td>
                      <td>{formatDate(inquiry.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>{T.noInquiries}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel dashboard-card">
          <h2>{T.settings}</h2>

          {sectionErrors.settings ? <p className="error">{sectionErrors.settings}</p> : null}

          <form onSubmit={handleSettingsSubmit} className="stack">
            <label className="field">
              <span>{T.notifyLimit}</span>
              <input
                type="number"
                min="1"
                value={matchNotificationLimit}
                onChange={(event) => setMatchNotificationLimit(event.target.value)}
              />
            </label>
            <p className="helper">{T.notifyLimitHelp}</p>

            <label className="field">
              <span>{T.priceUsd}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paidMembershipPriceUsd}
                onChange={(event) => setPaidMembershipPriceUsd(event.target.value)}
              />
            </label>

            <p className="helper">{T.currencyHelp}</p>

            {settings ? (
              <p className="helper">
                {T.currentSettings}: {settings.match_notification_limit} / {settings.paid_membership_price_usd}{" "}
                {settings.billing_currency}
              </p>
            ) : null}

            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? T.saving : T.save}
            </button>
          </form>
        </section>

        <section className="panel dashboard-card">
          <h2>{T.broadcast}</h2>

          <form onSubmit={handleBroadcastSubmit} className="stack">
            <label className="field">
              <span>{T.title}</span>
              <input value={broadcastTitle} onChange={(event) => setBroadcastTitle(event.target.value)} required />
            </label>

            <label className="field">
              <span>{T.body}</span>
              <textarea value={broadcastBody} onChange={(event) => setBroadcastBody(event.target.value)} required />
            </label>

            <button className="button button-primary" type="submit" disabled={sending}>
              {sending ? T.sending : T.sendAll}
            </button>
          </form>
        </section>

        <section className="panel dashboard-card">
          <h2>{T.popup}</h2>
          <p className="helper">{T.popupHelp}</p>

          {sectionErrors.popups ? <p className="error">{sectionErrors.popups}</p> : null}

          <form onSubmit={handlePopupSubmit} className="stack">
            <label className="field">
              <span>{T.title}</span>
              <input value={popupTitle} onChange={(event) => setPopupTitle(event.target.value)} required />
            </label>

            <label className="field">
              <span>{T.body}</span>
              <textarea value={popupBody} onChange={(event) => setPopupBody(event.target.value)} required />
            </label>

            <label className="field">
              <span>{T.locale}</span>
              <select value={popupLocale} onChange={(event) => setPopupLocale(event.target.value as "all" | "ko" | "ja")}>
                <option value="all">{T.all}</option>
                <option value="ko">{T.ko}</option>
                <option value="ja">{T.ja}</option>
              </select>
            </label>

            <button className="button button-primary" type="submit" disabled={creatingPopup}>
              {creatingPopup ? T.popupCreating : T.popupCreate}
            </button>
          </form>

          <div style={{ overflowX: "auto", marginTop: 24 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{T.title}</th>
                  <th>{T.locale}</th>
                  <th>{T.active}</th>
                  <th>{T.createdAt}</th>
                </tr>
              </thead>
              <tbody>
                {popupNotices.length ? (
                  popupNotices.map((notice) => (
                    <tr key={notice.id}>
                      <td>{notice.title}</td>
                      <td>{notice.locale}</td>
                      <td>
                        <button className="button button-secondary" type="button" onClick={() => void handlePopupStatusToggle(notice)}>
                          {notice.is_active ? T.active : T.inactive}
                        </button>
                      </td>
                      <td>{formatDate(notice.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>{T.noPopups}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
