"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppNotification, getNotifications, markNotificationRead } from "../../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../../lib/i18n";


function notificationLink(notification: AppNotification) {
  if (notification.notification_type === "match_recommendation") {
    return "/matches?tab=recommendations";
  }
  return "/matches";
}


export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState<AppLocale>("ko");

  useEffect(() => {
    setLocale(getBrowserLocale());
    void loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const items = await getNotifications(40);
      setNotifications(items);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : translate(locale, "notifications.loadFailed");
      if (message === "Could not validate credentials") {
        router.replace("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(notificationId: string) {
    try {
      const updated = await markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (markError) {
      const message = markError instanceof Error ? markError.message : translate(locale, "notifications.markFailed");
      setError(message);
    }
  }

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <main className="shell section">
      <section className="dashboard-shell">
        <div className="panel dashboard-hero">
          <div>
            <span className="eyebrow">{translate(locale, "notifications.eyebrow")}</span>
            <h1 style={{ marginBottom: 10 }}>{translate(locale, "notifications.title")}</h1>
            <p className="hero-text">
              {translate(locale, "notifications.unreadCount", { count: unreadCount })}. {translate(locale, "notifications.hero")}
            </p>
          </div>
          <div className="actions">
            <Link className="button button-secondary" href="/dashboard">
              {translate(locale, "notifications.back")}
            </Link>
            <Link className="button button-primary" href="/matches?tab=recommendations">
              {translate(locale, "notifications.openMatches")}
            </Link>
          </div>
        </div>

        {loading ? <p>{translate(locale, "notifications.loading")}</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <section className="panel dashboard-card">
          <h2>{translate(locale, "notifications.recentAlerts")}</h2>
          {notifications.length ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <article
                  className={`notification-card ${notification.is_read ? "notification-read" : ""}`}
                  key={notification.id}
                >
                  <div className="recommendation-top">
                    <div>
                      <strong>{notification.title}</strong>
                      <p className="dashboard-muted">{notification.body}</p>
                      <p className="helper">{new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                    <span className="pill">{notification.is_read ? translate(locale, "notifications.read") : translate(locale, "notifications.unread")}</span>
                  </div>
                  <div className="actions compact-actions">
                    {!notification.is_read ? (
                      <button className="button button-secondary" type="button" onClick={() => handleMarkRead(notification.id)}>
                        {translate(locale, "notifications.markRead")}
                      </button>
                    ) : null}
                    <Link className="button button-primary" href={notificationLink(notification)}>
                      {translate(locale, "notifications.open")}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="dashboard-muted">{translate(locale, "notifications.empty")}</p>
          )}
        </section>
      </section>
    </main>
  );
}
