"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getCurrentUser } from "../../lib/api";
import { AppLocale, getBrowserLocale, getPreferredLocale, translate } from "../../lib/i18n";

const featureKeys = ["1", "2", "3", "4"];

export default function AboutPage() {
  const [locale, setLocale] = useState<AppLocale>("ko");

  useEffect(() => {
    setLocale(getBrowserLocale());
    void (async () => {
      try {
        const user = await getCurrentUser();
        setLocale(getPreferredLocale(user.language));
      } catch {
        return;
      }
    })();
  }, []);

  return (
    <main className="shell section content-page">
      <section className="panel content-hero">
        <span className="eyebrow">{translate(locale, "about.eyebrow")}</span>
        <h1>{translate(locale, "about.title")}</h1>
        <p className="hero-text">{translate(locale, "about.body")}</p>
        <div className="actions">
          <Link className="button button-primary" href="/signup">
            {translate(locale, "common.start")}
          </Link>
          <Link className="button button-secondary" href="/safety">
            {translate(locale, "common.safetyGuide")}
          </Link>
        </div>
      </section>

      <section className="feature-grid">
        {featureKeys.map((key) => (
          <article className="panel feature" key={key}>
            <h3>{translate(locale, `about.feature${key}Title`)}</h3>
            <p>{translate(locale, `about.feature${key}Body`)}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
