"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import ProfilePhotoStrip from "../../../components/ProfilePhotoStrip";
import {
  Message,
  PublicProfile,
  User,
  ConversationSummary,
  getConversations,
  getCurrentUser,
  getMessages,
  getMyMatches,
  getProfileByUserId,
  translateMessage,
  getUserById,
  getWebSocketUrl,
  sendMessage,
  createReport,
} from "../../../lib/api";
import {
  AppLocale,
  getBrowserLocale,
  getPreferredLocale,
  localizeGender,
  localizeInterest,
  localizeLanguage,
  localizeNationality,
  translate,
} from "../../../lib/i18n";

function isMessageCreatedPayload(payload: unknown): payload is { type: "message.created"; data: Message } {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as { type?: unknown; data?: unknown };
  return candidate.type === "message.created" && !!candidate.data && typeof candidate.data === "object";
}

const TRANSLATION_MAX_CHARS = 200;

function normalizeChatLanguage(language: string | null | undefined): AppLocale | null {
  const value = (language ?? "").trim().toLowerCase();
  if (["ko", "kr", "korean", "korea", "한국어", "한국"].includes(value)) {
    return "ko";
  }
  if (["ja", "jp", "japanese", "japan", "일본어", "일본"].includes(value)) {
    return "ja";
  }
  return null;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [otherProfile, setOtherProfile] = useState<PublicProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
  const [translationErrors, setTranslationErrors] = useState<Record<string, string>>({});
  const [socketState, setSocketState] = useState("connecting");
  const [locale, setLocale] = useState<AppLocale>("ko");
  
  const [reporting, setReporting] = useState(false);

  const orderedMessages = useMemo(
    () => [...messages].sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime()),
    [messages],
  );

  useEffect(() => {
    setLocale(getBrowserLocale());
    void loadChat();
  }, [userId]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }
      setSocketState("connecting");
     const token =
  typeof window !== "undefined"
    ? localStorage.getItem("krjp_access_token")
    : null;

const wsUrl = token
  ? `${getWebSocketUrl(userId)}?token=${encodeURIComponent(token)}`
  : getWebSocketUrl(userId);

socket = new WebSocket(wsUrl);
      socket.onopen = () => setSocketState("connected");
      socket.onclose = () => {
        if (!cancelled) {
          setSocketState("reconnecting");
          reconnectTimer = window.setTimeout(connect, 2000);
        }
      };
      socket.onerror = () => {
        setSocketState("error");
      };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as unknown;
          if (isMessageCreatedPayload(payload)) {
            const newMessage = payload.data;
            setMessages((current) => {
              const exists = current.some((message) => message.id === newMessage.id);
              return exists ? current : [newMessage, ...current];
            });
          }
        } catch {
          return;
        }
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [userId]);

  async function loadChat() {
    try {
      const [me, candidate, profile, currentMessages, matches] = await Promise.all([
        getCurrentUser(),
        getUserById(userId),
        getProfileByUserId(userId),
        getMessages(userId),
        getMyMatches(),
      ]);
      const conversationList = await getConversations();

      const connected = matches.some(
        (match) =>
          (match.user1_id === me.id && match.user2_id === userId) ||
          (match.user1_id === userId && match.user2_id === me.id),
      );
      if (!connected) {
        router.replace("/matches");
        return;
      }

      setCurrentUser(me);
      setLocale(getPreferredLocale(me.language));
      setOtherUser(candidate);
      setOtherProfile(profile);
      setMessages(currentMessages);
      setConversations(conversationList);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : translate(locale, "chat.loadFailed");
      if (message === "Could not validate credentials") {
        router.replace("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser || !otherUser || !draft.trim()) {
      return;
    }

    setSending(true);
    setError("");
    try {
  const newMessage = await sendMessage({
  receiver_id: otherUser.id,
  original_text: draft.trim(),
  language_from: currentUser.language,
  language_to: otherUser.language,
});

setMessages((current) => {
  const exists = current.some((message) => message.id === newMessage.id);
  return exists ? current : [newMessage, ...current];
});

setDraft("");
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : translate(locale, "chat.sendFailed");
      setError(message);
    } finally {
      setSending(false);
    }
  }

  async function handleTranslate(message: Message) {
    if (message.original_text.trim().length > TRANSLATION_MAX_CHARS) {
      setError(translate(locale, "chat.translationTooLong"));
      setTranslationErrors((current) => ({
        ...current,
        [message.id]: translate(locale, "chat.translationTooLong"),
      }));
      return;
    }

    const messageId = message.id;
    setTranslatingMessageId(messageId);
    setError("");
    setTranslationErrors((current) => {
      const next = { ...current };
      delete next[messageId];
      return next;
    });

    try {
      const updated = await translateMessage(messageId, getTranslationTargetLanguage(message));
      setMessages((current) => current.map((item) => (item.id === messageId ? updated : item)));
    } catch (translateError) {
      const message =
        translateError instanceof Error
          ? translateError.message.includes("too long") || translateError.message.includes("Limit:")
            ? translate(locale, "chat.translationTooLong")
            : translate(locale, "chat.translationFailed")
          : translate(locale, "chat.translationFailed");
      setError(message);
      setTranslationErrors((current) => ({ ...current, [messageId]: message }));
    } finally {
      setTranslatingMessageId(null);
    }
  }

  function getTranslationTargetLanguage(message: Message) {
    const mine = currentUser?.id === message.sender_id;
    const target = mine ? otherUser?.language : currentUser?.language;
    return normalizeChatLanguage(target) ?? locale;
  }

  async function handleReport() {
    if (!otherUser) return;
    const reason = prompt(translate(locale, "chat.reportReason"));
    if (!reason?.trim()) return;
    
    setReporting(true);
    try {
      await createReport({ reported_id: otherUser.id, reason: reason.trim() });
      alert(translate(locale, "chat.reportSuccess"));
    } catch (reportError) {
      const message = reportError instanceof Error ? reportError.message : translate(locale, "chat.reportFailed");
      alert(message);
    } finally {
      setReporting(false);
    }
  }

  return (
    <main className="shell section">
      <section className="chat-shell">
        <div className="panel dashboard-hero">
          <div>
            <span className="eyebrow">{translate(locale, "chat.eyebrow")}</span>
            <h1 style={{ marginBottom: 10 }}>{otherUser ? otherUser.email : translate(locale, "chat.conversation")}</h1>
            <p className="hero-text">
              {otherProfile?.bio ?? translate(locale, "chat.emptyBio")}
            </p>
            <p className="helper">{translate(locale, "chat.socket")}: {socketState}</p>
          </div>
          <div className="actions">
            <Link className="button button-secondary" href="/matches">
              {translate(locale, "chat.back")}
            </Link>
          </div>
        </div>

        {loading ? <p>{translate(locale, "chat.loading")}</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <div className="chat-layout">
          <section className="panel chat-thread">
            <h2>{translate(locale, "chat.messages")}</h2>
            {orderedMessages.length ? (
              <div className="message-list">
                {orderedMessages.map((message) => {
  const mine = currentUser?.id === message.sender_id;
  const isTranslating = translatingMessageId === message.id;
  const translationError = translationErrors[message.id];
  const translationTargetLanguage = getTranslationTargetLanguage(message);

  const shouldShowTranslation =
    Boolean(message.translated_text) && normalizeChatLanguage(message.language_to) === translationTargetLanguage;

  return (
    <article className={`message-bubble ${mine ? "mine" : "theirs"}`} key={message.id}>
      <div className="message-meta">
        <span>{mine ? translate(locale, "chat.you") : otherUser?.email ?? translate(locale, "chat.match")}</span>
        <span>{new Date(message.created_at).toLocaleString()}</span>
      </div>

      <p>{message.original_text}</p>

      {shouldShowTranslation ? (
        <div className="message-translation">
          <strong>{translate(locale, "chat.translation")}</strong>
          <p>{message.translated_text}</p>
        </div>
      ) : null}

      {translationError ? <p className="error">{translationError}</p> : null}

      {!shouldShowTranslation ? (
        <div className="actions compact-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void handleTranslate(message)}
            disabled={isTranslating}
          >
            {isTranslating ? translate(locale, "chat.translating") : translate(locale, "chat.showTranslation")}
          </button>
        </div>
      ) : null}

      <div className="helper">
        {message.read_at
          ? translate(locale, "chat.readAt", { time: new Date(message.read_at).toLocaleString() })
          : translate(locale, "chat.unread")}
      </div>
    </article>
  );
})}
              </div>
            ) : (
              <p className="dashboard-muted">{translate(locale, "chat.empty")}</p>
            )}
          </section>

          <aside className="panel chat-sidebar">
            <h2>{translate(locale, "chat.profileContext")}</h2>
            {otherUser ? (
              <>
                <p className="dashboard-muted">
                  {localizeNationality(locale, otherUser.nationality)} / {localizeLanguage(locale, otherUser.language)} / {localizeGender(locale, otherUser.gender)}
                </p>
                <div className="tag-row">
                  {otherProfile?.occupation ? <span className="tag">{otherProfile.occupation}</span> : null}
                  {otherProfile?.language_level ? <span className="tag">{otherProfile.language_level}</span> : null}
                </div>
                <div className="tag-row">
                  {otherProfile?.interests.map((interest) => (
                    <span className="tag" key={interest}>
                      {localizeInterest(locale, interest)}
                    </span>
                  ))}
                </div>
                {otherProfile?.photos.length ? <ProfilePhotoStrip photos={otherProfile.photos} alt="Profile" /> : null}
                <button 
                  className="button button-secondary" 
                  style={{ marginTop: "10px", width: "100%" }} 
                  onClick={handleReport} 
                  disabled={reporting}
                >
                  {reporting ? translate(locale, "chat.reporting") : translate(locale, "chat.reportUser")}
                </button>
              </>
            ) : null}
            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>{translate(locale, "chat.newMessage")}</span>
                <textarea rows={6} value={draft} onChange={(event) => setDraft(event.target.value)} />
              </label>
              <p className="helper">{translate(locale, "chat.translationLimit")}</p>
              <button className="button button-primary" type="submit" disabled={sending}>
                {sending ? translate(locale, "chat.sending") : translate(locale, "chat.send")}
              </button>
            </form>
            {conversations.length ? (
              <div className="chat-related">
                <h3>{translate(locale, "chat.otherConversations")}</h3>
                <div className="stack-list">
                  {conversations
                    .filter((conversation) => conversation.partner_id !== userId)
                    .slice(0, 4)
                    .map((conversation) => (
                      <Link className="list-item" href={`/chat/${conversation.partner_id}`} key={conversation.match_id}>
                        <div>
                          <strong>{conversation.partner_id.slice(0, 8)}</strong>
                          <p className="dashboard-muted">{conversation.translated_preview ?? conversation.last_message ?? translate(locale, "chat.noMessages")}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
