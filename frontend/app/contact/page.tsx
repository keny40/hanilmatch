"use client";

import { FormEvent, useEffect, useState } from "react";

import { createInquiry, getCurrentUser } from "../../lib/api";
import { AppLocale, getBrowserLocale, getPreferredLocale, translate } from "../../lib/i18n";

export default function ContactPage() {
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    setSubmitted(false);
    setError("");

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setError(translate(locale, "contact.validation"));
      setSubmitting(false);
      return;
    }

    try {
      await createInquiry({
        name,
        email,
        message,
      });
      setSubmitted(true);
      form.reset();
    } catch (submitError) {
      console.error(submitError);
      setError(translate(locale, "contact.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell section contact-shell">
      <section className="panel content-hero">
        <span className="eyebrow">{translate(locale, "contact.eyebrow")}</span>
        <h1>{translate(locale, "contact.title")}</h1>
        <p className="hero-text">{translate(locale, "contact.body")}</p>
      </section>

      <section className="panel contact-card">
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>{translate(locale, "contact.name")}</span>
            <input name="name" required />
          </label>
          <label className="form-field">
            <span>{translate(locale, "contact.email")}</span>
            <input name="email" type="email" required />
          </label>
          <label className="form-field">
            <span>{translate(locale, "contact.message")}</span>
            <textarea name="message" rows={7} required />
          </label>
          <button className="button button-primary contact-submit" type="submit" disabled={submitting}>
            {submitting ? translate(locale, "contact.submitting") : translate(locale, "contact.submit")}
          </button>
        </form>
        {error ? <p className="form-message error">{error}</p> : null}
        {submitted ? <p className="form-message success">{translate(locale, "contact.success")}</p> : null}
        <div className="contact-notes">
          <p className="helper">{translate(locale, "contact.helper")}</p>
          <p className="helper">{translate(locale, "common.bilingualNotice")}</p>
        </div>
      </section>
    </main>
  );
}
