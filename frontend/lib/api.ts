const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const API_V1_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "").replace(/\/api\/v1$/, "") + "/api/v1";
const API_ORIGIN = API_V1_BASE_URL.replace(/\/api\/v1$/, "");

const csrfCookieName = "krjp_csrf_token";

type JsonValue = Record<string, unknown>;

export type User = {
  id: string;
  email: string;
  gender: string;
  nationality: string;
  language: string;
  is_verified: boolean;
  is_admin: boolean;
  membership_tier: "free" | "paid";
  created_at: string;
};

export type Profile = {
  user_id: string;
  age: number;
  age_group: string | null;
  nationality: string | null;
  gender: string | null;
  occupation: string | null;
  location: string | null;
  native_language: string | null;
  learning_language: string | null;
  language_level: string | null;
  match_purpose: string | null;
  phone_number?: string | null;
  bio: string | null;
  interests: string[];
  photos: {
    id: string;
    user_id: string;
    file_url: string;
    display_order: number;
    created_at: string;
  }[];
};

export type PublicProfile = Omit<Profile, "phone_number">;

export function formatAgeGroup(ageGroup: string | null | undefined) {
  switch (ageGroup) {
    case "18_24":
      return "18-24";
    case "25_29":
      return "25-29";
    case "30_34":
      return "30-34";
    case "35_39":
      return "35-39";
    case "40_44":
      return "40-44";
    case "45_plus":
      return "45+";
    default:
      return "-";
  }
}

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  score: number;
  created_at: string;
};

export type MatchRecommendation = {
  id: string;
  user_id: string;
  candidate_user_id: string;
  score: number;
  status: string;
  rationale: string;
  generated_by: string;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
  candidate: User;
  candidate_profile: PublicProfile;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  original_text: string;
  translated_text: string | null;
  translation_status: string;
  translated_at: string | null;
  read_at: string | null;
  language_from: string;
  language_to: string;
  created_at: string;
};

export type ConversationSummary = {
  partner_id: string;
  match_id: string;
  last_message: string | null;
  translated_preview: string | null;
};

export type SessionInfo = {
  id: string;
  user_id: string;
  token_jti: string;
  issued_at: string;
  expires_at: string;
  revoked_at: string | null;
  user_agent: string | null;
  ip_address: string | null;
};

export type AppNotification = {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

export type AdminSettings = {
  match_notification_limit: number;
  paid_membership_price_usd: number;
  billing_currency: string;
};

export type AdminReport = {
  id: string;
  reporter_id: string;
  reporter_email: string;
  reported_id: string;
  reported_email: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed" | "action_taken";
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "pending" | "reviewed" | "replied" | "closed";
  admin_note: string | null;
  created_at: string;
};

export type CommunityPostStatus = "pending" | "approved" | "rejected" | "hidden";
export type CommunityPostCategory = "notice" | "review" | "culture" | "tips" | "feedback";

export type CommunityPost = {
  id: string;
  author_id: string;
  author_email: string | null;
  category: CommunityPostCategory;
  title: string;
  content: string;
  status: CommunityPostStatus;
  is_public: boolean;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type AdminStats = {
  total_users: number;
  completed_profiles: number;
  verified_users: number;
  paid_users: number;
  today_matches: number;
  pending_reports: number;
  pending_inquiries: number;
  pending_community_posts: number;
};

export type AdminRecommendationRunResult = {
  processed_users: number;
  connected_matches: number;
  skipped_incomplete_profiles: number;
  message: string;
};

export type AdminUserRecommendationRunResult = {
  user_id: string;
  created_count: number;
  connected_matches: number;
  skipped_incomplete_profiles: number;
  message: string;
};

export type AdminDailyAutoMatchingResult = {
  processed_users: number;
  connected_matches: number;
  skipped_already_matched_today: number;
  skipped_no_candidates: number;
  skipped_incomplete_profiles: number;
  message: string;
};

export type PopupNotice = {
  id: string;
  title: string;
  body: string;
  locale: "all" | "ko" | "ja";
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type BillingStatus = {
  membership_tier: "free" | "paid";
  is_premium: boolean;
  paid_membership_price_usd: number;
  billing_currency: string;
  plan: "free" | "premium";
  token_balance: number;
  translation_used_count: number;
  translation_monthly_limit_count: number;
  daily_match_status: "completed" | "waiting" | "profile_incomplete" | "not_eligible";
};

export type AuthToken = {
  access_token: string;
  token_type: string;
};

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }
  const prefix = `${name}=`;
  const found = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

export async function apiRequest<TResponse>(
  path: string,
  options?: RequestInit & { retryOnUnauthorized?: boolean },
): Promise<TResponse> {
  const headers = new Headers(options?.headers);
  if (!(options?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

    if (options?.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method.toUpperCase())) {
    const csrfToken = readCookie(csrfCookieName);
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("krjp_access_token")
      : null;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_V1_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
    credentials: "include",
  });

  if (response.status === 401 && options?.retryOnUnauthorized !== false && path !== "/auth/refresh") {
    const refreshed = await fetch(`${API_V1_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: (() => {
        const refreshHeaders = new Headers();
        const csrfToken = readCookie(csrfCookieName);
        if (csrfToken) {
          refreshHeaders.set("X-CSRF-Token", csrfToken);
        }
        return refreshHeaders;
      })(),
    });

    if (refreshed.ok) {
      return apiRequest<TResponse>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;
    try {
      const errorBody = await response.json() as { detail?: string };
      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      const raw = await response.text();
      if (raw) {
        message = raw;
      }
    }
    console.error("API request failed", {
      path,
      status: response.status,
      body: message,
    });
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function createUser(payload: JsonValue) {
  return apiRequest("/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: JsonValue) {
  return apiRequest<AuthToken>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getGoogleOAuthLoginUrl() {
  return `${API_V1_BASE_URL}/auth/google/login`;
}

export async function getCurrentUser() {
  return apiRequest<User>("/auth/me");
}

export async function logout() {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
  });
}

export async function getMyProfile() {
  return apiRequest<Profile>("/profiles/me");
}

export async function getProfileByUserId(userId: string) {
  return apiRequest<PublicProfile>(`/profiles/${userId}`);
}

export async function getUserById(userId: string) {
  return apiRequest<User>(`/users/${userId}`);
}

export async function createProfile(payload: JsonValue) {
  return apiRequest<Profile>("/profiles/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(payload: JsonValue) {
  return apiRequest<Profile>("/profiles/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getMyMatches() {
  return apiRequest<Match[]>("/matches/");
}

export async function getRecommendations(limit = 8) {
  return apiRequest<MatchRecommendation[]>(`/matches/recommendations?limit=${limit}`);
}

export async function generateRecommendations(limit = 8) {
  return apiRequest<MatchRecommendation[]>(`/matches/recommendations/generate?limit=${limit}`, {
    method: "POST",
  });
}

export async function acceptRecommendation(recommendationId: string) {
  return apiRequest<Match>(`/matches/recommendations/${recommendationId}/accept`, {
    method: "POST",
  });
}

export async function dismissRecommendation(recommendationId: string) {
  return apiRequest<MatchRecommendation>(`/matches/recommendations/${recommendationId}/dismiss`, {
    method: "POST",
  });
}

export async function createMatch(payload: JsonValue) {
  return apiRequest<Match>("/matches/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMessages(matchUserId: string, limit = 100, offset = 0) {
  return apiRequest<Message[]>(`/messages?match_user_id=${matchUserId}&limit=${limit}&offset=${offset}`);
}

export async function sendMessage(payload: JsonValue) {
  return apiRequest<Message>("/messages/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createReport(payload: { reported_id: string; reason: string }) {
  return apiRequest<JsonValue>("/reports/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createInquiry(payload: { name: string; email: string; message: string }) {
  return apiRequest<{ id: string; message: string }>("/inquiries/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCommunityPosts(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiRequest<CommunityPost[]>(`/community/posts${query}`);
}

export async function getCommunityPost(postId: string) {
  return apiRequest<CommunityPost>(`/community/posts/${postId}`);
}

export async function createCommunityPost(payload: {
  category: CommunityPostCategory;
  title: string;
  content: string;
}) {
  return apiRequest<CommunityPost>("/community/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getConversations() {
  return apiRequest<ConversationSummary[]>("/messages/conversations");
}

export async function getCsrfToken() {
  return apiRequest<{ csrf_token: string }>("/auth/csrf", { retryOnUnauthorized: false });
}

export async function uploadProfilePhoto(file: File, displayOrder = 0) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("display_order", String(displayOrder));
  return apiRequest<{
    id: string;
    user_id: string;
    file_url: string;
    display_order: number;
    created_at: string;
  }>("/profile-photos/", {
    method: "POST",
    body: formData,
  });
}

export async function registerProfilePhoto(fileUrl: string, displayOrder = 0) {
  return apiRequest<{
    id: string;
    user_id: string;
    file_url: string;
    display_order: number;
    created_at: string;
  }>("/profile-photos/register", {
    method: "POST",
    body: JSON.stringify({ file_url: fileUrl, display_order: displayOrder }),
  });
}

export async function getMyProfilePhotos() {
  return apiRequest<
    {
      id: string;
      user_id: string;
      file_url: string;
      display_order: number;
      created_at: string;
    }[]
  >("/profile-photos/me");
}

export async function getMySessions() {
  return apiRequest<SessionInfo[]>("/sessions/me");
}

export async function revokeSession(sessionId: string) {
  return apiRequest<void>(`/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function getNotifications(limit = 20) {
  return apiRequest<AppNotification[]>(`/notifications/me?limit=${limit}`);
}

export async function markNotificationRead(notificationId: string) {
  return apiRequest<AppNotification>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function translateMessage(messageId: string, targetLanguage?: string) {
  return apiRequest<Message>(`/messages/${messageId}/translate`, {
    method: "POST",
    body: JSON.stringify({ target_language: targetLanguage }),
  });
}

export async function getAdminUsers() {
  return apiRequest<User[]>("/admin/users");
}

export async function updateAdminUser(userId: string, payload: JsonValue) {
  return apiRequest<User>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminSettings() {
  return apiRequest<AdminSettings>("/admin/settings");
}

export async function updateAdminSettings(payload: JsonValue) {
  return apiRequest<AdminSettings>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function runAdminRecommendations(payload?: { limit?: number }) {
  return apiRequest<AdminRecommendationRunResult>("/admin/recommendations/run", {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function runAdminUserRecommendations(userId: string) {
  return apiRequest<AdminUserRecommendationRunResult>(`/admin/recommendations/users/${userId}/run`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function runAdminDailyAutoMatching(payload?: { limit?: number }) {
  return apiRequest<AdminDailyAutoMatchingResult>("/admin/recommendations/daily/run", {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function sendBroadcastNotification(payload: JsonValue) {
  return apiRequest<{ sent_count: number }>("/admin/broadcast-notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminStats() {
  return apiRequest<AdminStats>("/admin/stats");
}

export async function getAdminReports() {
  return apiRequest<AdminReport[]>("/admin/reports");
}

export async function updateAdminReportStatus(
  reportId: string,
  status: AdminReport["status"],
) {
  return apiRequest<AdminReport>(`/admin/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminInquiries() {
  return apiRequest<Inquiry[]>("/admin/inquiries");
}

export async function updateAdminInquiryStatus(inquiryId: string, status: Inquiry["status"]) {
  return apiRequest<Inquiry>(`/admin/inquiries/${inquiryId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateAdminContactInquiry(
  inquiryId: string,
  payload: { status?: Inquiry["status"]; admin_note?: string },
) {
  return apiRequest<Inquiry>(`/admin/contact-inquiries/${inquiryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminCommunityPosts(status?: CommunityPostStatus | "all") {
  const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<CommunityPost[]>(`/admin/community-posts${query}`);
}

export async function updateAdminCommunityPost(
  postId: string,
  payload: { status?: CommunityPostStatus; admin_note?: string },
) {
  return apiRequest<CommunityPost>(`/admin/community-posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}


export async function getPopupNotices() {
  return apiRequest<PopupNotice[]>("/admin/popup-notices");
}

export async function createPopupNotice(payload: JsonValue) {
  return apiRequest<PopupNotice>("/admin/popup-notices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePopupNotice(noticeId: string, payload: JsonValue) {
  return apiRequest<PopupNotice>(`/admin/popup-notices/${noticeId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getActivePopupNotices(locale = "all") {
  return apiRequest<PopupNotice[]>(`/admin/popup-notices/active?locale=${locale}`);
}

export async function getBillingStatus() {
  return apiRequest<BillingStatus>("/billing/me");
}

export async function createProfilePhotoPresign(filename: string, contentType: string) {
  return apiRequest<{
    upload_url: string;
    file_url: string;
    object_key: string;
    method: string;
  }>("/storage/presign/profile-photo", {
    method: "POST",
    body: JSON.stringify({ filename, content_type: contentType }),
  });
}

export function buildAssetUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_ORIGIN}${path}`;
}

export function getWebSocketUrl(otherUserId: string) {
  const wsOrigin = API_ORIGIN.replace(/^http/, "ws");
  return `${wsOrigin}/ws/chat/${otherUserId}`;
}
