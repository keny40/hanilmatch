"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { getMyProfile } from "../../../../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../../../../lib/i18n";


function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [error, setError] = useState("");

  useEffect(() => {
    setLocale(getBrowserLocale());
    const accessToken = searchParams.get("access_token");
    const errorCode = searchParams.get("error");
    if (errorCode || !accessToken) {
      setError(translate(getBrowserLocale(), "auth.googleFailed"));
      return;
    }

    localStorage.setItem("krjp_access_token", accessToken);
    void (async () => {
      try {
        await getMyProfile();
        router.replace("/dashboard");
      } catch {
        router.replace("/onboarding/profile");
      }
    })();
  }, [router, searchParams]);

  return (
    <main className="auth-wrap">
      <section className="panel auth-card">
        <h1>{translate(locale, "auth.googleCallbackTitle")}</h1>
        {error ? (
          <>
            <p className="error">{error}</p>
            <Link className="button button-primary" href="/login">
              {translate(locale, "nav.login")}
            </Link>
          </>
        ) : (
          <p className="helper">{translate(locale, "auth.googleCallbackLoading")}</p>
        )}
      </section>
    </main>
  );
}


export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
