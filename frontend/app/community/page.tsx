"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CommunityPost, CommunityPostCategory, getCommunityPosts } from "../../lib/api";
import { AppLocale, getBrowserLocale, translate } from "../../lib/i18n";

const categories: Array<CommunityPostCategory | "all"> = ["all", "notice", "review", "culture", "tips", "feedback"];

function categoryLabel(locale: AppLocale, category: CommunityPostCategory | "all") {
  return category === "all" ? translate(locale, "community.all") : translate(locale, `community.category.${category}`);
}

function formatDate(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function CommunityPage() {
  const [locale, setLocale] = useState<AppLocale>("ko");
  const [selectedCategory, setSelectedCategory] = useState<CommunityPostCategory | "all">("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
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
        const loadedPosts = await getCommunityPosts(selectedCategory === "all" ? undefined : selectedCategory);
        if (!cancelled) {
          setPosts(loadedPosts);
        }
      } catch {
        if (!cancelled) {
          setError(translate(locale, "community.loadFailed"));
          setPosts([]);
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
  }, [locale, selectedCategory]);

  const postList = useMemo(
    () =>
      posts.map((post) => (
        <Link className="community-post-card" href={`/community/${post.id}`} key={post.id}>
          <span className="tag">{categoryLabel(locale, post.category)}</span>
          <strong>{post.title}</strong>
          <span className="dashboard-muted">{formatDate(post.published_at ?? post.created_at, locale)}</span>
        </Link>
      )),
    [locale, posts],
  );

  return (
    <main className="shell content-page">
      <section className="panel content-hero">
        <div>
          <p className="eyebrow">{translate(locale, "community.eyebrow")}</p>
          <h1>{translate(locale, "community.title")}</h1>
          <p>{translate(locale, "community.body")}</p>
        </div>
        <Link className="button" href="/community/new">
          {translate(locale, "community.write")}
        </Link>
      </section>

      <section className="panel community-shell">
        <div className="community-filter-row" aria-label={translate(locale, "community.category")}>
          {categories.map((category) => (
            <button
              className={`filter-chip ${selectedCategory === category ? "active" : ""}`}
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {categoryLabel(locale, category)}
            </button>
          ))}
        </div>

        <p className="helper">{translate(locale, "community.safetyNotice")}</p>

        {loading ? <p className="dashboard-muted">{translate(locale, "common.loading")}</p> : null}
        {error ? <p className="error">{error}</p> : null}
        {!loading && !error && posts.length === 0 ? (
          <p className="dashboard-muted">{translate(locale, "community.empty")}</p>
        ) : null}
        {postList.length > 0 ? <div className="community-list">{postList}</div> : null}
      </section>
    </main>
  );
}
