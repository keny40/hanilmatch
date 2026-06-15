"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CommunityPost, getCommunityPost } from "../../../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../../../lib/i18n";

function formatDate(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocale(getBrowserLocale());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    void (async () => {
      try {
        const loadedPost = await getCommunityPost(params.id);
        if (!cancelled) {
          setPost(loadedPost);
        }
      } catch {
        if (!cancelled) {
          setError(translate(locale, "community.detailNotFound"));
          setPost(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, params.id]);

  return (
    <main className="shell content-page">
      <section className="panel community-detail-card">
        <Link className="button button-secondary" href="/community">
          {translate(locale, "community.backToList")}
        </Link>

        {loading ? <p className="dashboard-muted">{translate(locale, "common.loading")}</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {post ? (
          <article className="community-detail">
            <div className="recommendation-top">
              <span className="tag">{translate(locale, `community.category.${post.category}`)}</span>
              <span className="pill">{translate(locale, `community.status.${post.status}`)}</span>
            </div>
            <h1>{post.title}</h1>
            <p className="dashboard-muted">{formatDate(post.published_at ?? post.created_at, locale)}</p>
            <div className="community-post-content">{post.content}</div>
          </article>
        ) : null}
      </section>
    </main>
  );
}
