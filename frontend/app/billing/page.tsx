"use client";

import { useEffect, useState } from "react";

import { getCurrentUser } from "../../lib/api";
import { AppLocale, getBrowserLocale, getPreferredLocale, translate } from "../../lib/i18n";

const freeFeatureKeys = ["1", "2", "3", "4"];
const premiumFeatureKeys = ["1", "2", "3", "4", "5", "6"];
const tokenFeatureKeys = ["1", "2", "3", "4"];

export default function BillingPage() {
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [notice, setNotice] = useState("");

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

  function handlePreparedBillingClick() {
    setNotice(translate(locale, "billing.preparingNotice"));
  }

  return (
    <main className="shell section billing-shell">
      <section className="panel content-hero billing-hero">
        <span className="eyebrow">{translate(locale, "billing.eyebrow")}</span>
        <h1>{translate(locale, "billing.title")}</h1>
        <p className="hero-text">{translate(locale, "billing.body")}</p>
        <p className="helper">{translate(locale, "billing.mvpNotice")}</p>
      </section>

      <section className="billing-plan-grid">
        <article className="panel billing-plan-card">
          <span className="billing-plan-label">{translate(locale, "billing.free.label")}</span>
          <h2>{translate(locale, "billing.free.title")}</h2>
          <p className="billing-price">{translate(locale, "billing.free.price")}</p>
          <ul>
            {freeFeatureKeys.map((key) => (
              <li key={key}>{translate(locale, `billing.free.feature${key}`)}</li>
            ))}
          </ul>
        </article>

        <article className="panel billing-plan-card billing-plan-card-featured">
          <span className="billing-plan-label">{translate(locale, "billing.premium.label")}</span>
          <h2>{translate(locale, "billing.premium.title")}</h2>
          <p className="billing-price">{translate(locale, "billing.premium.price")}</p>
          <ul>
            {premiumFeatureKeys.map((key) => (
              <li key={key}>{translate(locale, `billing.premium.feature${key}`)}</li>
            ))}
          </ul>
          <button className="button button-primary" type="button" onClick={handlePreparedBillingClick}>
            {translate(locale, "billing.preparingButton")}
          </button>
        </article>

        <article className="panel billing-plan-card">
          <span className="billing-plan-label">{translate(locale, "billing.tokens.label")}</span>
          <h2>{translate(locale, "billing.tokens.title")}</h2>
          <p className="billing-price">{translate(locale, "billing.tokens.price")}</p>
          <ul>
            {tokenFeatureKeys.map((key) => (
              <li key={key}>{translate(locale, `billing.tokens.feature${key}`)}</li>
            ))}
          </ul>
        </article>
      </section>

      {notice ? <p className="form-message success billing-notice">{notice}</p> : null}
    </main>
  );
}
