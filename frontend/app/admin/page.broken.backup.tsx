"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AdminReport,
  AdminSettings,
  PopupNotice,
  User,
  createPopupNotice,
  getAdminReports,
  updateAdminReportStatus,
  getAdminSettings,
  getAdminUsers,
  getCurrentUser,
  getPopupNotices,
  sendBroadcastNotification,
  updateAdminSettings,
  updateAdminUser,
  updatePopupNotice,
} from "../../lib/api";

const T = {
  loading: "관리자 화면을 불러오는 중...",
  loadFailed: "관리자 정보를 불러오지 못했습니다.",
  page: "운영자 페이지",
  intro: "운영 기능을 관리합니다.",
  memberSection: "회원 관리",
  memberHelp: "신규 가입자는 기본적으로 무료회원이며, 체크박스로 유료회원/인증/관리자 여부를 조정할 수 있습니다.",
  reportSection: "신고 관리",
  reportHelp: "최근 신고 내역을 확인하고 처리 상태를 변경할 수 있습니다.",
  reporter: "신고자",
  reported: "신고 대상",
  reason: "신고 사유",
  noReports: "접수된 신고가 없습니다.",
  status: "처리 상태",
  pending: "접수",
  reviewed: "검토 완료",
  dismissed: "기각",
  actionTaken: "조치 완료",
  reportStatusDone: "신고 처리 상태가 업데이트되었습니다.",
  email: "이메일",
  nationLang: "국가/언어",
  free: "무료",
  paid: "유료",
  verified: "인증",
  admin: "관리자",
  userUpdated: "회원 정보가 업데이트되었습니다.",
  memberUpdated: "회원 등급이 업데이트되었습니다.",
  updateFailed: "업데이트에 실패했습니다.",
  settings: "운영 설정",
  notifyLimit: "매칭 알림 허용 개수",
  priceUsd: "유료회원 가격 (USD)",
  currencyHelp: "유료회원 결제 통화는 달러(USD)로 고정됩니다.",
  save: "설정 저장",
  saving: "저장 중...",
  settingsSaved: "운영 설정이 저장되었습니다.",
  currentSettings: "현재 설정",
  broadcast: "전체 알림 발송",
  title: "제목",
  body: "내용",
  sendAll: "전체 알림 보내기",
  sending: "발송 중...",
  broadcastDone: "전체 알림을 {count}명에게 발송했습니다.",
  popup: "팝업 공지",
  locale: "노출 언어",
  all: "전체",
  ko: "한국어 사용자",
  ja: "일본어 사용자",
  popupCreate: "팝업 공지 등록",
  popupCreating: "등록 중...",
  popupDone: "팝업 공지가 등록되었습니다.",
  popupStatusDone: "팝업 공지 상태가 업데이트되었습니다.",
  active: "활성",
  createdAt: "생성일",
  sectionLoadFailed: "데이터를 불러오지 못했습니다.",
} as const;

function t(template: string, values?: Record<string, string | number>) {
  if (!values) {
    return template;
  }
  let next = template;
  for (const [key, value] of Object.entries(values)) {
    next = next.replace(`{${key}}`, String(value));
  }
  return next;
}

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [popupNotices, setPopupNotices] = useState<PopupNotice[]>([]);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupBody, setPopupBody] = useState("");
  const [popupLocale, setPopupLocale] = useState("all");
  const [matchNotificationLimit, setMatchNotificationLimit] = useState("3");
  const [paidMembershipPriceUsd, setPaidMembershipPriceUsd] = useState("9.99");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void loadAdmin();
  }, []);

  async function loadAdmin() {
    try {
      // 1. 필수: 관리자 권한 확인
      const me = await getCurrentUser();
      if (!me.is_admin) {
        router.replace("/dashboard");
        return;
      }
      setCurrentUser(me);

      // 2. 개별 데이터 로드 (섹션별 에러 처리)
      
      // 회원 목록
      try {
        const loadedUsers = await getAdminUsers();
        setUsers(loadedUsers);
      } catch (e) {
        console.error("Failed to fetch admin users:", e);
        setSectionErrors(prev => ({ ...prev, users: T.sectionLoadFailed }));
      }

      // 신고 내역
      try {
        const loadedReports = await getAdminReports();
        setReports(loadedReports);
      } catch (e) {
        console.error("Failed to fetch admin reports:", e);
        setSectionErrors(prev => ({ ...prev, reports: T.sectionLoadFailed }));
      }

      // 운영 설정
      try {
        const loadedSettings = await getAdminSettings();
        setSettings(loadedSettings);
        setMatchNotificationLimit(String(loadedSettings.match_notification_limit));
        setPaidMembershipPriceUsd(String(loadedSettings.paid_membership_price_usd));
      } catch (e) {
        console.error("Failed to fetch admin settings:", e);
        setSectionErrors(prev => ({ ...prev, settings: T.sectionLoadFailed }));
      }

      // 팝업 공지
      try {
        const loadedNotices = await getPopupNotices();
        setPopupNotices(loadedNotices);
      } catch (e) {
        console.error("Failed to fetch popup notices:", e);
        setSectionErrors(prev => ({ ...prev, popups: T.sectionLoadFailed }));
      }

    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : T.loadFailed);
    } finally {
      setLoading(false);
    }
  }

  // ... (중간 핸들러 함수들 생략: handleUserCheckbox, handleMembershipToggle 등)

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

        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}

        <section className="panel dashboard-card">
          <h2>{T.memberSection}</h2>
          <p className="helper">{T.memberHelp}</p>
          {sectionErrors.users ? (
            <p className="error">{sectionErrors.users}</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                {/* ... 테이블 내용 ... */}
              </table>
            </div>
          )}
        </section>

        {/* ... 신고 관리, 운영 설정, 전체 알림, 팝업 공지 섹션들도 동일하게 sectionErrors 체크 적용 ... */}
      </section>
    </main>
  );
}
