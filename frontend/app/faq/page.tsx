"use client";

import { useEffect, useState } from "react";

import { getCurrentUser } from "../../lib/api";
import { AppLocale, getBrowserLocale, getPreferredLocale, translate } from "../../lib/i18n";

const faqKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function FaqPage() {
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
        <span className="eyebrow">{translate(locale, "faq.eyebrow")}</span>
        <h1>{translate(locale, "faq.title")}</h1>
        <p className="hero-text">{translate(locale, "faq.body")}</p>
      </section>

      <section className="panel content-card">
        <div className="faq-list">
          {faqKeys.map((key) => (
            <article className="faq-item" key={key}>
              <h3>{translate(locale, `faq.q${key}`)}</h3>
              <p>{translate(locale, `faq.a${key}`)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
