"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CommunityPostCategory, createCommunityPost, getCurrentUser } from "../../../lib/api";
import { AppLocale, getBrowserLocale, getPreferredLocale, translate } from "../../../lib/i18n";

const writableCategories: CommunityPostCategory[] = ["review", "culture", "feedback"];

function categoryLabel(locale: AppLocale, category: CommunityPostCategory) {
  return translate(locale, `community.category.${category}`);
}

export default function NewCommunityPostPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLocale(getBrowserLocale());

    void (async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled) {
          return;
        }
        setLocale(getPreferredLocale(user.language));
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const category = String(formData.get("category") ?? "") as CommunityPostCategory;
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();

    setSubmitting(true);
    setMessage("");
    setError("");

    if (!category || !title || !content) {
      setError(translate(locale, "community.validation"));
      setSubmitting(false);
      return;
    }

    try {
      await createCommunityPost({ category, title, content });
      setMessage(translate(locale, "community.success"));
      form.reset();
    } catch (submitError) {
      console.error("Community post creation failed:", submitError);
      setError(translate(locale, "community.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="shell content-page">
        <section className="panel">
          <p className="dashboard-muted">{translate(locale, "community.loginRequired")}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell content-page">
      <section className="panel contact-card">
        <p className="eyebrow">{translate(locale, "community.eyebrow")}</p>
        <h1>{translate(locale, "community.newTitle")}</h1>
        <p>{translate(locale, "community.newBody")}</p>
        <p className="helper">{translate(locale, "community.safetyNotice")}</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>{translate(locale, "community.category")}</span>
            <select name="category" defaultValue="review" required>
              {writableCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(locale, category)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>{translate(locale, "community.postTitle")}</span>
            <input name="title" type="text" maxLength={180} required />
          </label>

          <label className="form-field">
            <span>{translate(locale, "community.content")}</span>
            <textarea name="content" rows={10} maxLength={8000} required />
          </label>

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? translate(locale, "community.submitting") : translate(locale, "community.submit")}
          </button>
        </form>

        {message ? <p className="form-message success">{message}</p> : null}
        {error ? <p className="form-message error">{error}</p> : null}
      </section>
    </main>
  );
}
