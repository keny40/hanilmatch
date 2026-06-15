"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProfilePhotoStrip from "../../components/ProfilePhotoStrip";
import {
  Match,
  MatchRecommendation,
  Profile,
  PublicProfile,
  User,
  acceptRecommendation,
  dismissRecommendation,
  formatAgeGroup,
  generateRecommendations,
  getBillingStatus,
  getCurrentUser,
  getMyMatches,
  getMyProfile,
  getProfileByUserId,
  getNotifications,
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


export default function MatchesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<MatchRecommendation | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null);
  const [selectedProfileHeading, setSelectedProfileHeading] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [isPremium, setIsPremium] = useState(false);
  const [refreshingRecommendations, setRefreshingRecommendations] = useState(false);
  const [hasRecommendationNotification, setHasRecommendationNotification] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  function isProfileComplete(profile: Profile | null) {
    return Boolean(
      profile?.nationality?.trim() &&
        profile.gender?.trim() &&
        profile.native_language?.trim() &&
        profile.learning_language?.trim() &&
        (profile.match_purpose?.trim() || profile.bio?.trim()),
    );
  }

  function getRecommendationReasonLabel(recommendation: MatchRecommendation) {
    return recommendation.generated_by === "ai_draft"
      ? translate(locale, "matches.aiDraft")
      : translate(locale, "matches.ruleBased");
  }

  useEffect(() => {
    setLocale(getBrowserLocale());
    void loadPage();
  }, []);

  useEffect(() => {
    if (loading || typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "recommendations") {
      document.getElementById("recommendations")?.scrollIntoView({ block: "start" });
    }
  }, [loading]);

  async function loadPage() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLocale(getPreferredLocale(currentUser.language));

      try {
        setMatches(await getMyMatches());
      } catch (matchesError) {
        console.error("Failed to fetch matches:", matchesError);
        setMatches([]);
      }

      try {
        const profile = await getMyProfile();
        setProfileComplete(isProfileComplete(profile));
      } catch (profileError) {
        console.error("Failed to fetch profile:", profileError);
        setProfileComplete(false);
      }

      try {
        setRecommendations(await getRecommendations(12));
        setMatches(await getMyMatches());
      } catch (recommendationsError) {
        console.error("Failed to fetch recommendations:", recommendationsError);
        setRecommendations([]);
        setError(translate(getPreferredLocale(currentUser.language), "matches.loadFailed"));
      }

      try {
        const billing = await getBillingStatus();
        setIsPremium(billing.is_premium);
      } catch (billingError) {
        console.error("Failed to fetch billing status:", billingError);
        setIsPremium(false);
      }

      try {
        const notifications = await getNotifications(20);
        setHasRecommendationNotification(
          notifications.some(
            (notification) => notification.notification_type === "match_recommendation" && !notification.is_read,
          ),
        );
      } catch (notificationsError) {
        console.error("Failed to fetch recommendation notifications:", notificationsError);
        setHasRecommendationNotification(false);
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : translate(locale, "matches.loadFailed");
      if (message === "Could not validate credentials") {
        router.replace("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshRecommendations() {
    setRefreshingRecommendations(true);
    setError("");
    setActionMessage("");
    try {
      const refreshed = await generateRecommendations(12);
      setRecommendations(refreshed);
      setMatches(await getMyMatches());
      setActionMessage(translate(locale, "matches.refreshDone"));
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : translate(locale, "matches.refreshFailed"));
    } finally {
      setRefreshingRecommendations(false);
    }
  }

  async function handleViewProfile(recommendation: MatchRecommendation) {
    setSelectedRecommendation(recommendation);
    setSelectedProfile(recommendation.candidate_profile);
    setSelectedProfileHeading(recommendation.candidate.email);
    setActionMessage("");
  }

  async function handleViewConnectedProfile(partnerId: string) {
    setActionMessage("");
    setError("");
    setSelectedRecommendation(null);
    setSelectedProfile(null);
    setSelectedProfileHeading(translate(locale, "matches.partnerProfile"));

    try {
      setSelectedProfile(await getProfileByUserId(partnerId));
    } catch (profileError) {
      console.error("Failed to fetch partner profile:", profileError);
      setSelectedProfileHeading("");
      setError(translate(locale, "matches.profileLoadFailed"));
    }
  }

  async function handleAcceptMatch(recommendation: MatchRecommendation) {
    if (!user) {
      return;
    }
    setActionMessage("");
    try {
      const newMatch = await acceptRecommendation(recommendation.id);
      setMatches((current) => [newMatch, ...current]);
      setRecommendations((current) => current.filter((candidate) => candidate.id !== recommendation.id));
      setActionMessage(translate(locale, "matches.acceptedMessage", { email: recommendation.candidate.email }));
    } catch (matchError) {
      const message = matchError instanceof Error ? matchError.message : translate(locale, "matches.acceptFailed");
      setError(message);
    }
  }

  async function handleDismissRecommendation(recommendation: MatchRecommendation) {
    setActionMessage("");
    try {
      await dismissRecommendation(recommendation.id);
      setRecommendations((current) => current.filter((candidate) => candidate.id !== recommendation.id));
      if (selectedRecommendation?.id === recommendation.id) {
        setSelectedRecommendation(null);
        setSelectedProfile(null);
        setSelectedProfileHeading("");
      }
      setActionMessage(translate(locale, "matches.dismissedMessage"));
    } catch (dismissError) {
      const message = dismissError instanceof Error ? dismissError.message : translate(locale, "matches.dismissFailed");
      setError(message);
    }
  }

  return (
    <main className="shell section">
      <section className="matches-shell">
        <div className="panel dashboard-hero">
          <div>
            <span className="eyebrow">{translate(locale, "matches.eyebrow")}</span>
            <h1 style={{ marginBottom: 10 }}>{translate(locale, "matches.title")}</h1>
            <p className="hero-text">
              {user
                ? translate(locale, "matches.heroSignedIn", { email: user.email })
                : translate(locale, "matches.hero")}
            </p>
          </div>
          <div className="actions">
            <Link className="button button-secondary" href="/dashboard">
              {translate(locale, "matches.back")}
            </Link>
            <Link className="button button-primary" href="/profile">
              {translate(locale, "matches.tuneProfile")}
            </Link>
            {isPremium ? (
              <button className="button button-primary" type="button" onClick={handleRefreshRecommendations} disabled={refreshingRecommendations}>
                {refreshingRecommendations ? translate(locale, "matches.refreshing") : translate(locale, "matches.refresh")}
              </button>
            ) : (
              <Link className="button button-primary" href="/billing">
                {translate(locale, "matches.upgrade")}
              </Link>
            )}
          </div>
        </div>

        {loading ? <p>{translate(locale, "matches.loading")}</p> : null}
        {error ? <p className="error">{error}</p> : null}
        {actionMessage ? <p className="success">{actionMessage}</p> : null}

        <div className="match-columns">
          <section className="panel dashboard-card">
            <h2>{translate(locale, "matches.accepted")}</h2>
            {matches.length ? (
              <div className="stack-list">
                {matches.map((match) => {
                  const partnerId = user && match.user1_id === user.id ? match.user2_id : match.user1_id;
                  return (
                    <article className="match-entry" key={match.id}>
                      <div className="match-score-ring">
                        <span>{Math.round(Number(match.score))}</span>
                      </div>
                      <div>
                        <strong>{translate(locale, "matches.compatibility")}</strong>
                        <p className="dashboard-muted">
                          {translate(locale, "matches.pairedWith", { left: match.user1_id.slice(0, 8), right: match.user2_id.slice(0, 8) })}
                        </p>
                        <p className="dashboard-muted">
                          {translate(locale, "matches.created", { time: new Date(match.created_at).toLocaleString() })}
                        </p>
                        <div className="actions compact-actions">
                          <Link className="button button-secondary" href={`/chat/${partnerId}`}>
                            {translate(locale, "matches.openChat")}
                          </Link>
                          <button className="button button-secondary" type="button" onClick={() => handleViewConnectedProfile(partnerId)}>
                            {translate(locale, "matches.viewPartnerProfile")}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="dashboard-muted">{translate(locale, "matches.acceptedEmpty")}</p>
            )}
          </section>

          <section className="panel dashboard-card" id="recommendations">
            <h2>{translate(locale, "matches.recommended")}</h2>
            {!isPremium ? <p className="helper">{translate(locale, "matches.freeLimit")}</p> : null}
            {recommendations.length ? (
              <div className="recommendation-grid">
                {recommendations.map((recommendation) => (
                  <article className="recommendation-card" key={recommendation.id}>
                    <div className="recommendation-top">
                      <strong>{recommendation.candidate.email}</strong>
                      <span className="pill">
                        {recommendation.candidate.is_verified ? translate(locale, "matches.verified") : translate(locale, "matches.standard")}
                      </span>
                    </div>
                    <p className="dashboard-muted">
                      {localizeNationality(locale, recommendation.candidate.nationality)} / {localizeLanguage(locale, recommendation.candidate.language)} / {localizeGender(locale, recommendation.candidate.gender)}
                    </p>
                    <p className="dashboard-muted">{translate(locale, "matches.score", { score: Math.round(Number(recommendation.score)) })}</p>
                    <p className="dashboard-muted">
                      <strong>{getRecommendationReasonLabel(recommendation)}: </strong>
                      {recommendation.rationale || translate(locale, "matches.rationaleFallback")}
                    </p>
                    <div className="tag-row">
                      <span className="tag">{translate(locale, "matches.crossLanguage")}</span>
                      <span className="tag">{getRecommendationReasonLabel(recommendation)}</span>
                    </div>
                    <div className="actions compact-actions">
                      <button className="button button-secondary" type="button" onClick={() => handleViewProfile(recommendation)}>
                        {translate(locale, "matches.viewProfile")}
                      </button>
                      <button className="button button-secondary" type="button" onClick={() => handleDismissRecommendation(recommendation)}>
                        {translate(locale, "matches.dismiss")}
                      </button>
                      <button className="button button-primary" type="button" onClick={() => handleAcceptMatch(recommendation)}>
                        {translate(locale, "matches.accept")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="dashboard-muted">
                {hasRecommendationNotification
                  ? translate(locale, "matches.notificationMismatch")
                  : profileComplete
                    ? translate(locale, "matches.recommendationsEmpty")
                    : translate(locale, "matches.profileRecommendationRequired")}
              </p>
            )}
          </section>
        </div>

        {selectedRecommendation || selectedProfileHeading ? (
          <section className="panel profile-detail-card">
            <div className="recommendation-top">
              <div>
                <span className="eyebrow">{translate(locale, "matches.profileDetail")}</span>
                <h2 style={{ marginBottom: 6 }}>{selectedProfileHeading}</h2>
                {selectedRecommendation ? (
                  <>
                    <p className="dashboard-muted">
                      {localizeNationality(locale, selectedRecommendation.candidate.nationality)} / {localizeLanguage(locale, selectedRecommendation.candidate.language)} / {localizeGender(locale, selectedRecommendation.candidate.gender)}
                    </p>
                    <p className="dashboard-muted">{translate(locale, "matches.recommendationScore", { score: Math.round(Number(selectedRecommendation.score)) })}</p>
                    <p className="dashboard-muted">
                      <strong>{getRecommendationReasonLabel(selectedRecommendation)}: </strong>
                      {selectedRecommendation.rationale || translate(locale, "matches.rationaleFallback")}
                    </p>
                  </>
                ) : null}
              </div>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setSelectedRecommendation(null);
                  setSelectedProfile(null);
                  setSelectedProfileHeading("");
                }}
              >
                {translate(locale, "matches.close")}
              </button>
            </div>
            {selectedProfile ? (
              <div className="profile-detail-grid">
                <div className="stat-card">
                  <div className="stat-label">{translate(locale, "matches.age")}</div>
                  <div className="stat-value">{selectedProfile.age}</div>
                  <p className="helper">{translate(locale, "matches.group", { group: formatAgeGroup(selectedProfile.age_group) })}</p>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{translate(locale, "matches.workLocation")}</div>
                  <div className="tag-row">
                    {selectedProfile.occupation ? <span className="tag">{selectedProfile.occupation}</span> : null}
                    {selectedProfile.location ? <span className="tag">{selectedProfile.location}</span> : null}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{translate(locale, "matches.languagePurpose")}</div>
                  <div className="tag-row">
                    {selectedProfile.native_language ? <span className="tag">{translate(locale, "matches.nativeLanguage")}: {selectedProfile.native_language}</span> : null}
                    {selectedProfile.learning_language ? <span className="tag">{translate(locale, "matches.learningLanguage")}: {selectedProfile.learning_language}</span> : null}
                    {selectedProfile.language_level ? <span className="tag">{selectedProfile.language_level}</span> : null}
                    {selectedProfile.match_purpose ? <span className="tag">{selectedProfile.match_purpose}</span> : null}
                  </div>
                </div>
                <div className="stat-card profile-detail-bio">
                  <div className="stat-label">{translate(locale, "matches.bio")}</div>
                  <p className="dashboard-muted">{selectedProfile.bio}</p>
                </div>
                <div className="stat-card profile-detail-bio">
                  <div className="stat-label">{translate(locale, "matches.interests")}</div>
                  <div className="tag-row">
                    {selectedProfile.interests.map((interest) => (
                      <span className="tag" key={interest}>
                        {localizeInterest(locale, interest)}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedProfile.photos.length ? (
                  <div className="stat-card profile-detail-bio">
                    <div className="stat-label">{translate(locale, "matches.photos")}</div>
                    <ProfilePhotoStrip photos={selectedProfile.photos} alt="Profile" />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="dashboard-muted">{translate(locale, "matches.profileLoading")}</p>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}
