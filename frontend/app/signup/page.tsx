"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createUser, getGoogleOAuthLoginUrl } from "../../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../../lib/i18n";


export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [nationality, setNationality] = useState("KR");
  const [language, setLanguage] = useState("ko");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState<AppLocale>("ko");

  useEffect(() => {
    setLocale(getBrowserLocale());
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await createUser({
        email,
        password,
        gender,
        nationality,
        language,
      });
      const typedResponse = response as { email: string; id: string };
      setResult(translate(locale, "signup.result", { email: typedResponse.email, id: typedResponse.id }));
      window.setTimeout(() => {
        router.push("/login");
      }, 900);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : translate(locale, "signup.failed");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignup() {
    window.location.href = getGoogleOAuthLoginUrl();
  }

  return (
    <main className="auth-wrap">
      <section className="panel auth-card">
        <h1>{translate(locale, "signup.title")}</h1>
        <p className="helper">{translate(locale, "signup.helper")}</p>
        <button className="button button-secondary" type="button" onClick={handleGoogleSignup}>
          {translate(locale, "signup.google")}
        </button>
        <p className="helper">{translate(locale, "auth.or")}</p>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>{translate(locale, "signup.email")}</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>{translate(locale, "signup.password")}</span>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>{translate(locale, "signup.gender")}</span>
            <select value={gender} onChange={(event) => setGender(event.target.value)}>
              <option value="male">male</option>
              <option value="female">female</option>
            </select>
          </label>
          <label className="field">
            <span>{translate(locale, "signup.nationality")}</span>
            <select value={nationality} onChange={(event) => setNationality(event.target.value)}>
              <option value="KR">KR</option>
              <option value="JP">JP</option>
            </select>
          </label>
          <label className="field">
            <span>{translate(locale, "signup.language")}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="ko">ko</option>
              <option value="ja">ja</option>
              <option value="en">en</option>
            </select>
          </label>
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? translate(locale, "signup.submitting") : translate(locale, "signup.submit")}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        {result ? <p className="success">{result}</p> : null}
        <p className="helper">
          {translate(locale, "signup.loginPrompt")} <Link href="/login">{translate(locale, "signup.loginLink")}</Link>.
        </p>
      </section>
    </main>
  );
}
