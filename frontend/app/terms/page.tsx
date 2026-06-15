"use client";

import { useEffect, useState } from "react";

import { getCurrentUser } from "../../lib/api";
import { AppLocale, getBrowserLocale, getPreferredLocale, translate } from "../../lib/i18n";

export default function TermsPage() {
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
        <span className="eyebrow">{translate(locale, "terms.eyebrow")}</span>
        <h1>{translate(locale, "terms.title")}</h1>
        <p className="hero-text">{translate(locale, "terms.body")}</p>
      </section>
    </main>
  );
}
