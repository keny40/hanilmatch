"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SessionInfo, getMySessions, revokeSession } from "../../../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../../../lib/i18n";


export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<AppLocale>("ko");

  useEffect(() => {
    setLocale(getBrowserLocale());
    void (async () => {
      try {
        setSessions(await getMySessions());
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : translate(locale, "sessions.loadFailed");
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleRevoke(sessionId: string) {
    try {
      await revokeSession(sessionId);
      setSessions((current) => current.filter((session) => session.id !== sessionId));
    } catch (revokeError) {
      const message = revokeError instanceof Error ? revokeError.message : translate(locale, "sessions.revokeFailed");
      setError(message);
    }
  }

  return (
    <main className="shell section">
      <section className="panel dashboard-card">
        <div className="recommendation-top">
          <div>
            <span className="eyebrow">{translate(locale, "sessions.eyebrow")}</span>
            <h1 style={{ marginBottom: 8 }}>{translate(locale, "sessions.title")}</h1>
          </div>
          <Link className="button button-secondary" href="/dashboard">
            {translate(locale, "sessions.back")}
          </Link>
        </div>
        {loading ? <p>{translate(locale, "sessions.loading")}</p> : null}
        {error ? <p className="error">{error}</p> : null}
        <div className="stack-list">
          {sessions.map((session) => (
            <article className="list-item" key={session.id}>
              <div>
                <strong>{session.user_agent ?? translate(locale, "sessions.unknownClient")}</strong>
                <p className="dashboard-muted">{translate(locale, "sessions.ip")}: {session.ip_address ?? translate(locale, "sessions.unknownIp")} / {translate(locale, "sessions.expires")}: {new Date(session.expires_at).toLocaleString()}</p>
              </div>
              <button className="button button-secondary" type="button" onClick={() => handleRevoke(session.id)}>
                {translate(locale, "sessions.revoke")}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
