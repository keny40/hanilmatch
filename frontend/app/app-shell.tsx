"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { PopupNotice, User, getActivePopupNotices, getCurrentUser, logout } from "../lib/api";
import { AppLocale, getBrowserLocale, getPreferredLocale, setStoredLocale, translate } from "../lib/i18n";

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [activePopup, setActivePopup] = useState<PopupNotice | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLocale(getBrowserLocale());

    void (async () => {
      setCheckingUser(true);
      try {
        const user = await getCurrentUser();
        if (cancelled) {
          return;
        }
        setCurrentUser(user);
        setLocale(getPreferredLocale(user.language));
      } catch {
        if (cancelled) {
          return;
        }
        setCurrentUser(null);
        return;
      } finally {
        if (!cancelled) {
          setCheckingUser(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    void (async () => {
      try {
        const notices = await getActivePopupNotices(locale);
        setActivePopup(notices[0] ?? null);
      } catch {
        setActivePopup(null);
      }
    })();
  }, [locale]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } finally {
      localStorage.removeItem("krjp_access_token");
      setCurrentUser(null);
      setLoggingOut(false);
      router.replace("/login");
      router.refresh();
    }
  }

  function handleLocaleChange(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      return;
    }
    setStoredLocale(nextLocale);
    setLocale(nextLocale);
    window.location.reload();
  }

  const footerLinks = [
    { href: "/about", label: translate(locale, "footer.about") },
    { href: "/faq", label: translate(locale, "footer.faq") },
    { href: "/contact", label: translate(locale, "footer.contact") },
    { href: "/safety", label: translate(locale, "footer.safety") },
    { href: "/terms", label: translate(locale, "footer.terms") },
    { href: "/privacy", label: translate(locale, "footer.privacy") },
  ];

  return (
    <>
      {activePopup ? (
        <div className="popup-overlay">
          <div className="panel popup-card">
            <div className="recommendation-top">
              <strong>{activePopup.title}</strong>
              <button className="button button-secondary" type="button" onClick={() => setActivePopup(null)}>
                {translate(locale, "popup.close")}
              </button>
            </div>
            <p className="dashboard-muted">{activePopup.body}</p>
          </div>
        </div>
      ) : null}

      <header className="shell site-header">
        <div className="panel site-nav">
          <Link className="site-logo" href="/">
            <img src="/brand/hanilmatch-logo.png" alt="HanilMatch logo" />
            <span className="brand-wordmark" aria-label="HanilMatch">
              <span>Hanil</span>
              <span className="brand-wordmark-accent">Match</span>
            </span>
          </Link>

          <nav className="site-nav-links">
            {checkingUser ? null : currentUser ? (
              <>
                <Link href="/dashboard">{translate(locale, "nav.dashboard")}</Link>
                <Link href="/matches">{translate(locale, "nav.matches")}</Link>
                <Link href="/community">{translate(locale, "nav.community")}</Link>
                <Link href="/notifications">{translate(locale, "nav.notifications")}</Link>
                <Link href="/profile">{translate(locale, "nav.profile")}</Link>
                <Link href="/matches">{translate(locale, "nav.sessions")}</Link>
                <Link href="/billing">{translate(locale, "nav.billing")}</Link>
                {currentUser.is_admin ? <Link href="/admin">{translate(locale, "nav.admin")}</Link> : null}
                <span className="nav-user" title={currentUser.email}>
                  {currentUser.email}
                </span>
                <button className="nav-button" type="button" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? translate(locale, "nav.loggingOut") : translate(locale, "nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/about">{translate(locale, "nav.matchingIntro")}</Link>
                <Link href="/community">{translate(locale, "nav.community")}</Link>
                <Link href="/safety">{translate(locale, "nav.safetyGuide")}</Link>
                <Link href="/signup">{translate(locale, "nav.signup")}</Link>
                <Link href="/login">{translate(locale, "nav.login")}</Link>
              </>
            )}
            <div className="language-switcher" aria-label="Language switcher">
              <button
                className={`language-option ${locale === "ko" ? "active" : ""}`}
                type="button"
                onClick={() => handleLocaleChange("ko")}
                aria-pressed={locale === "ko"}
              >
                KO
              </button>
              <button
                className={`language-option ${locale === "ja" ? "active" : ""}`}
                type="button"
                onClick={() => handleLocaleChange("ja")}
                aria-pressed={locale === "ja"}
              >
                JA
              </button>
            </div>
          </nav>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div className="shell footer-shell">
          <section className="footer-brand">
            <div className="footer-logo">
              <img src="/brand/hanilmatch-logo.png" alt="HanilMatch logo" />
              <h2 className="brand-wordmark">
                <span>Hanil</span>
                <span className="brand-wordmark-accent">Match</span>
              </h2>
            </div>
            <p>{translate(locale, "footer.description")}</p>
            <div className="footer-socials" aria-label="Social links">
              <span>IG</span>
              <span>YT</span>
              <span>JP</span>
            </div>
          </section>

          <section className="footer-illustration" aria-label="HanilMatch brand illustration">
            <img src="/brand/hanilmatch-hero.png" alt="Korean and Japanese cultural connection image" />
          </section>

          <section className="footer-column">
            <h3>{translate(locale, "footer.linksTitle")}</h3>
            <nav className="footer-links">
              {footerLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section className="footer-column">
            <h3>{translate(locale, "footer.supportTitle")}</h3>
            <p>{translate(locale, "footer.supportBody")}</p>
          </section>

          <section className="footer-column">
            <h3>{translate(locale, "footer.safetyTitle")}</h3>
            <p>{translate(locale, "footer.safetyBody")}</p>
          </section>

          <section className="footer-cta">
            <h3>{translate(locale, "footer.ctaTitle")}</h3>
            <p>{translate(locale, "footer.ctaBody")}</p>
            <Link className="button button-primary" href="/contact">
              {translate(locale, "footer.ctaButton")}
            </Link>
          </section>

          <div className="footer-bottom">
            <p>{translate(locale, "footer.mvpNotice")}</p>
            <p>Copyright © HanilMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
