"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { User, getCurrentUser } from "../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../lib/i18n";

const features = [
  ["home.point1Title", "home.point1Body", "ID"],
  ["home.point2Title", "home.point2Body", "TR"],
  ["home.point3Title", "home.point3Body", "PR"],
] as const;

const steps = [
  ["home.step1Label", "home.step1Title", "home.step1Body"],
  ["home.step2Label", "home.step2Title", "home.step2Body"],
  ["home.step3Label", "home.step3Title", "home.step3Body"],
] as const;

const metrics = [
  ["home.metric1Value", "home.metric1Label"],
  ["home.metric2Value", "home.metric2Label"],
  ["home.metric3Value", "home.metric3Label"],
  ["home.metric4Value", "home.metric4Label"],
] as const;

export default function HomePage() {
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setLocale(getBrowserLocale());
    void (async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    })();
  }, []);

  return (
    <main>
      <section className="landing-hero shell">
        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <span className="eyebrow">{translate(locale, "home.eyebrow")}</span>
            <h1>{translate(locale, "home.title")}</h1>
            <p>{translate(locale, "home.body")}</p>
            <div className="actions">
              {currentUser ? (
                <>
                  <Link className="button button-primary" href="/dashboard">
                    {translate(locale, "home.dashboard")}
                  </Link>
                  <Link className="button button-secondary" href="/matches">
                    {translate(locale, "home.matches")}
                  </Link>
                </>
              ) : (
                <>
                  <Link className="button button-primary" href="/signup">
                    {translate(locale, "home.createAccount")}
                  </Link>
                  <Link className="button button-secondary" href="/login">
                    {translate(locale, "home.login")}
                  </Link>
                </>
              )}
            </div>
            <div className="landing-point-row">
              {features.map(([titleKey, bodyKey, icon]) => (
                <article className="landing-point-card" key={titleKey}>
                  <span>{icon}</span>
                  <div>
                    <strong>{translate(locale, titleKey)}</strong>
                    <p>{translate(locale, bodyKey)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="landing-hero-side">
            <div className="landing-visual-card">
              <img src="/brand/hanilmatch-hero.png" alt="Korean and Japanese cultural connection image" />
              <div className="landing-visual-badge">{translate(locale, "home.visualBadge")}</div>
            </div>
            <div className="landing-steps">
              {steps.map(([labelKey, titleKey, bodyKey]) => (
                <div className="landing-step-card" key={labelKey}>
                  <div className="stat-label">{translate(locale, labelKey)}</div>
                  <div className="stat-value">{translate(locale, titleKey)}</div>
                  <p>{translate(locale, bodyKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-metrics shell">
        <div className="landing-metric-grid">
          {metrics.map(([valueKey, labelKey]) => (
            <article className="landing-metric-card" key={valueKey}>
              <strong>{translate(locale, valueKey)}</strong>
              <span>{translate(locale, labelKey)}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
