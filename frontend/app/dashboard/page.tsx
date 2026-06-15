"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProfilePhotoStrip from "../../components/ProfilePhotoStrip";
import {
  Match,
  MatchRecommendation,
  Profile,
  User,
  BillingStatus,
  formatAgeGroup,
  getBillingStatus,
  getCurrentUser,
  getMyMatches,
  getMyProfile,
  getRecommendations,
} from "../../lib/api";
import {
  AppLocale,
  getBrowserLocale,
  getPreferredLocale,
  localizeGender,
  localizeInterest,
  localizeLanguage,
  localizeNationality,
  translate,
} from "../../lib/i18n";

function isProfileComplete(profile: Profile | null) {
  if (!profile) {
    return false;
  }
  return Boolean(
    profile.nationality?.trim() &&
      profile.gender?.trim() &&
      profile.occupation?.trim() &&
      profile.native_language?.trim() &&
      profile.learning_language?.trim() &&
      profile.language_level?.trim() &&
      profile.match_purpose?.trim() &&
      profile.bio?.trim() &&
      profile.interests.length,
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [isPremium, setIsPremium] = useState(false);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);

  useEffect(() => {
    setLocale(getBrowserLocale());
    void (async () => {
      try {
        // 1. 필수 데이터: 현재 사용자 정보
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          setLocale(getPreferredLocale(currentUser.language));
        } catch (userError) {
          const message = userError instanceof Error ? userError.message : "";
          if (message.includes("status 401") || message.includes("credentials")) {
            router.replace("/login");
            return;
          }
          throw userError; // 필수 데이터 실패 시 전체 에러로 처리
        }

        // 2. 선택적 데이터: 개별적으로 로드하여 하나가 실패해도 대시보드가 깨지지 않게 함
        
        // 매칭 목록
        try {
          const currentMatches = await getMyMatches();
          setMatches(currentMatches);
        } catch (e) {
          console.error("Failed to fetch matches:", e);
          setMatches([]);
        }

        // 추천 목록
        try {
          const currentRecommendations = await getRecommendations(4);
          setRecommendations(currentRecommendations);
          setMatches(await getMyMatches());
        } catch (e) {
          console.error("Failed to fetch recommendations:", e);
          setRecommendations([]);
        }

        // 결제 상태
        try {
          const billing = await getBillingStatus();
          setBillingStatus(billing);
          setIsPremium(billing.is_premium);
        } catch (e) {
          console.error("Failed to fetch billing status:", e);
          setBillingStatus(null);
          setIsPremium(false);
        }

        // 프로필 정보
        try {
          const currentProfile = await getMyProfile();
          setProfile(currentProfile);
        } catch (profileError) {
          console.error("Failed to fetch profile:", profileError);
          setProfile(null);
        }

      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : translate(locale, "dashboard.loadFailed");
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

 

  if (loading) {
    return (
      <main className="shell section">
        <section className="panel dashboard-shell">
          <p>{translate(locale, "dashboard.loading")}</p>
        </section>
      </main>
    );
  }

  const profileCta = profile
    ? isProfileComplete(profile)
      ? { href: "/profile", label: translate(locale, "dashboard.editProfile") }
      : { href: "/profile", label: translate(locale, "dashboard.completeProfile") }
    : { href: "/onboarding/profile", label: translate(locale, "dashboard.startOnboarding") };

  const plan = billingStatus?.plan ?? (isPremium ? "premium" : "free");
  const dailyMatchStatus = billingStatus?.daily_match_status ?? (isProfileComplete(profile) ? "waiting" : "profile_incomplete");
  const translationUsed = billingStatus?.translation_used_count ?? 0;
  const translationLimit = billingStatus?.translation_monthly_limit_count ?? 300;
  const tokenBalance = billingStatus?.token_balance ?? 0;

  return (
    <main className="shell section">
      <section className="dashboard-shell">
        <div className="dashboard-hero panel">
          <div>
            <span className="eyebrow">{translate(locale, "dashboard.eyebrow")}</span>
            <h1 style={{ marginBottom: 10 }}>
              {user ? translate(locale, "dashboard.welcome", { email: user.email }) : translate(locale, "dashboard.welcomeBack")}
            </h1>
            <p className="hero-text">{translate(locale, "dashboard.hero")}</p>
          </div>
          <div className="actions">
            <Link className="button button-primary" href={profileCta.href}>
              {profileCta.label}
            </Link>
            {!isPremium ? (
              <Link className="button button-primary" href="/billing">
                {translate(locale, "dashboard.upgrade")}
              </Link>
            ) : null}
            <Link className="button button-secondary" href="/matches">
              {translate(locale, "dashboard.viewMatches")}
            </Link>
            <Link className="button button-secondary" href="/settings/sessions">
              {translate(locale, "dashboard.sessions")}
            </Link>
                      </div>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {!isProfileComplete(profile) ? <p className="helper">{translate(locale, "dashboard.profileRequiredDetail")}</p> : null}

        <div className="dashboard-grid">
          <section className="panel dashboard-card usage-status-card">
            <div className="dashboard-card-heading">
              <h2>{translate(locale, "dashboard.usageStatusTitle")}</h2>
              <Link className="button button-secondary" href="/billing">
                {translate(locale, "dashboard.viewBilling")}
              </Link>
            </div>
            <div className="usage-status-grid">
              <div>
                <span className="metric-label">{translate(locale, "dashboard.currentPlan")}</span>
                <strong>{translate(locale, plan === "premium" ? "dashboard.planPremium" : "dashboard.planFree")}</strong>
              </div>
              <div>
                <span className="metric-label">{translate(locale, "dashboard.todayAiMatch")}</span>
                <strong>{translate(locale, `dashboard.dailyMatchStatus.${dailyMatchStatus}`)}</strong>
              </div>
              <div>
                <span className="metric-label">{translate(locale, "dashboard.monthlyTranslationUsage")}</span>
                <strong>
                  {translationUsed} / {translationLimit}
                  {translate(locale, "dashboard.translationCountUnit")}
                </strong>
              </div>
              <div>
                <span className="metric-label">{translate(locale, "dashboard.tokenBalance")}</span>
                <strong>{tokenBalance}</strong>
              </div>
            </div>
            <p className="helper">
              {plan === "premium"
                ? translate(locale, "dashboard.premiumActiveNotice")
                : translate(locale, "dashboard.freePlanNotice")}
            </p>
          </section>

          <section className="panel dashboard-card">
            <h2>{translate(locale, "dashboard.accountPulse")}</h2>
            <div className="metric-row">
              <div>
                <span className="metric-label">{translate(locale, "dashboard.verification")}</span>
                <strong>{user?.is_verified ? translate(locale, "dashboard.verified") : translate(locale, "dashboard.pending")}</strong>
              </div>
              <div>
                <span className="metric-label">{translate(locale, "dashboard.profile")}</span>
                <strong>{profile ? translate(locale, "dashboard.ready") : translate(locale, "dashboard.incomplete")}</strong>
              </div>
              <div>
                <span className="metric-label">{translate(locale, "dashboard.openMatches")}</span>
                <strong>{matches.length}</strong>
              </div>
              <div>
                <span className="metric-label">{translate(locale, "dashboard.membership")}</span>
                <strong>{isPremium ? translate(locale, "dashboard.membershipPaid") : translate(locale, "dashboard.membershipFree")}</strong>
              </div>
            </div>
          </section>

          <section className="panel dashboard-card">
            <h2>{translate(locale, "dashboard.profileSnapshot")}</h2>
            {profile ? (
              <>
                <p className="dashboard-muted">{profile.bio}</p>
                <p className="helper">{translate(locale, "dashboard.ageGroup", { age: profile.age, group: formatAgeGroup(profile.age_group) })}</p>
                <div className="tag-row">
                  {profile.occupation ? <span className="tag">{profile.occupation}</span> : null}
                  {profile.location ? <span className="tag">{profile.location}</span> : null}
                  {profile.nationality ? <span className="tag">{localizeNationality(locale, profile.nationality)}</span> : null}
                  {profile.gender ? <span className="tag">{localizeGender(locale, profile.gender)}</span> : null}
                  {profile.native_language ? <span className="tag">모국어: {profile.native_language}</span> : null}
                  {profile.learning_language ? <span className="tag">학습 언어: {profile.learning_language}</span> : null}
                  {profile.language_level ? <span className="tag">{profile.language_level}</span> : null}
                  {profile.match_purpose ? <span className="tag">{profile.match_purpose}</span> : null}
                </div>
                <ProfilePhotoStrip photos={profile.photos} alt="Profile" className="profile-photo-strip-spaced" />
                <div className="tag-row">
                  {profile.interests.map((interest) => (
                    <span className="tag" key={interest}>
                      {localizeInterest(locale, interest)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p className="dashboard-muted">{translate(locale, "dashboard.profileMissing")}</p>
              </div>
            )}
          </section>

          <section className="panel dashboard-card">
            <h2>{translate(locale, "dashboard.recentMatches")}</h2>
            {matches.length ? (
              <div className="stack-list">
                {matches.slice(0, 3).map((match) => (
                  <div className="list-item" key={match.id}>
                    <div>
                      <strong>{translate(locale, "dashboard.matchScore", { score: Number(match.score).toFixed(2) })}</strong>
                      <p className="dashboard-muted">
                        {translate(locale, "dashboard.pair", { left: match.user1_id.slice(0, 8), right: match.user2_id.slice(0, 8) })}
                      </p>
                    </div>
                    <div className="actions" style={{ marginTop: 0 }}>
                      <span className="pill">{new Date(match.created_at).toLocaleDateString()}</span>
                      {user ? (
                        <Link
                          className="button button-secondary"
                          href={`/chat/${match.user1_id === user.id ? match.user2_id : match.user1_id}`}
                        >
                          {translate(locale, "dashboard.openChat")}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-muted">
                {isProfileComplete(profile)
                  ? translate(locale, "dashboard.waitingDailyMatch")
                  : translate(locale, "dashboard.profileRecommendationRequired")}
              </p>
            )}
          </section>

          <section className="panel dashboard-card">
            <h2>{translate(locale, "dashboard.recommendedNext")}</h2>
            {recommendations.length ? (
              <div className="stack-list">
                {recommendations.map((recommendation) => (
                  <div className="list-item" key={recommendation.id}>
                    <div>
                      <strong>{recommendation.candidate.email}</strong>
                      <p className="dashboard-muted">
                        {localizeNationality(locale, recommendation.candidate.nationality)} / {localizeLanguage(locale, recommendation.candidate.language)} / {localizeGender(locale, recommendation.candidate.gender)}
                      </p>
                      <p className="dashboard-muted">{translate(locale, "dashboard.score", { score: Math.round(Number(recommendation.score)) })}</p>
                    </div>
                    <span className="pill">
                      {recommendation.candidate.is_verified ? translate(locale, "dashboard.verified") : translate(locale, "dashboard.new")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-muted">
                {isProfileComplete(profile)
                  ? translate(locale, "dashboard.recommendationsEmpty")
                  : translate(locale, "dashboard.profileRecommendationRequired")}
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
