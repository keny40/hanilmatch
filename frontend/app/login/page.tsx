"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { getCsrfToken, getGoogleOAuthLoginUrl, login } from "../../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../../lib/i18n";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await getCsrfToken();
      const response = await login({ email, password });
      localStorage.setItem("krjp_access_token", response.access_token);
      setResult(translate(locale, "login.result", { token: `${response.access_token.slice(0, 24)}...` }));
      window.setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : translate(locale, "login.failed");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = getGoogleOAuthLoginUrl();
  }

  return (
    <main className="auth-wrap">
      <section className="panel auth-card">
        <h1>{translate(locale, "login.title")}</h1>
        <p className="helper">{translate(locale, "login.helper")}</p>
        <button className="button button-secondary" type="button" onClick={handleGoogleLogin}>
          {translate(locale, "login.google")}
        </button>
        <p className="helper">{translate(locale, "auth.or")}</p>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>{translate(locale, "login.email")}</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>{translate(locale, "login.password")}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? translate(locale, "login.submitting") : translate(locale, "login.submit")}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        {result ? <p className="success">{result}</p> : null}
        <p className="helper">
          {translate(locale, "login.signupPrompt")} <Link href="/signup">{translate(locale, "login.signupLink")}</Link>.
        </p>
      </section>
    </main>
  );
}
