"use client";

import { useEffect, useState } from "react";

import { getCurrentUser } from "../../lib/api";
import { AppLocale, getBrowserLocale, getPreferredLocale, translate } from "../../lib/i18n";

const safetySections = [
  { key: "1", items: ["1", "2", "3"] },
  { key: "2", items: ["1", "2", "3"] },
  { key: "3", items: ["1", "2"] },
  { key: "4", items: ["1", "2"] },
  { key: "5", items: ["1", "2"] },
  { key: "6", items: ["1", "2"] },
];

export default function SafetyPage() {
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
        <span className="eyebrow">{translate(locale, "safety.eyebrow")}</span>
        <h1>{translate(locale, "safety.title")}</h1>
        <p className="hero-text">{translate(locale, "safety.body")}</p>
      </section>

      {safetySections.map((section) => (
        <section className="panel content-card" key={section.key}>
          <h2>{translate(locale, `safety.section${section.key}Title`)}</h2>
          <ul className="content-list">
            {section.items.map((item) => (
              <li key={item}>{translate(locale, `safety.section${section.key}Item${item}`)}</li>
            ))}
          </ul>
        </section>
      ))}

      <p className="helper">{translate(locale, "common.bilingualNotice")}</p>
    </main>
  );
}
