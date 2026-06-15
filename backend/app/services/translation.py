from datetime import datetime, timezone
import hashlib

import httpx
from openai import OpenAI
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.message import Message
from app.models.translation_cache import TranslationCache


def normalize_translation_language(language: str | None) -> str:
    value = (language or "").strip().lower()
    if value in {"ko", "kr", "korean", "korea", "한국어", "한국", "韓国語"}:
        return "ko"
    if value in {"ja", "jp", "japanese", "japan", "일본어", "일본", "日本語"}:
        return "ja"
    return value


def translate_text(original_text: str, language_from: str, language_to: str) -> str:
    provider = settings.translation_provider.lower()

    if provider == "openai":
        return _translate_with_openai(original_text, language_from, language_to)

    if provider == "deepl":
        return _translate_with_deepl(original_text, language_from, language_to)

    if provider == "google":
        return _translate_with_google(original_text, language_from, language_to)

    return _translate_with_local_dictionary(original_text, language_from, language_to)


def _translate_with_openai(original_text: str, language_from: str, language_to: str) -> str:
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY must be configured for OpenAI translation")

    language_names = {
        "ko": "Korean",
        "ja": "Japanese",
        "en": "English",
    }

    source_language = language_names.get(language_from.strip().lower(), language_from)
    target_language = language_names.get(language_to.strip().lower(), language_to)

    client = OpenAI(api_key=settings.openai_api_key)

    response = client.responses.create(
        model=settings.openai_translation_model,
        input=[
            {
                "role": "system",
                "content": (
                    "You are a professional Korean-Japanese chat translator. "
                    "Translate the user's message naturally for a dating or matching app chat. "
                    "Preserve meaning, politeness, and tone. "
                    "Return only the translated text. Do not add explanations."
                ),
            },
            {
                "role": "user",
                "content": f"Translate from {source_language} to {target_language}:\n{original_text}",
            },
        ],
    )

    return response.output_text.strip()


def _translate_with_deepl(original_text: str, language_from: str, language_to: str) -> str:
    if not settings.deepl_api_key:
        raise ValueError("DEEPL_API_KEY must be configured for DeepL translation")

    response = httpx.post(
        "https://api-free.deepl.com/v2/translate",
        data={
            "text": original_text,
            "source_lang": language_from.upper(),
            "target_lang": language_to.upper(),
        },
        headers={"Authorization": f"DeepL-Auth-Key {settings.deepl_api_key}"},
        timeout=20.0,
    )
    response.raise_for_status()
    payload = response.json()
    return payload["translations"][0]["text"]


def _translate_with_google(original_text: str, language_from: str, language_to: str) -> str:
    if not settings.google_translate_api_key:
        raise ValueError("GOOGLE_TRANSLATE_API_KEY must be configured for Google translation")

    response = httpx.post(
        f"https://translation.googleapis.com/language/translate/v2?key={settings.google_translate_api_key}",
        json={
            "q": original_text,
            "source": language_from,
            "target": language_to,
            "format": "text",
        },
        timeout=20.0,
    )
    response.raise_for_status()
    payload = response.json()
    return payload["data"]["translations"][0]["translatedText"]


def _translate_with_local_dictionary(original_text: str, language_from: str, language_to: str) -> str:
    text = original_text.strip()
    source = normalize_translation_language(language_from)
    target = normalize_translation_language(language_to)

    ko_to_ja = {
        "안녕하세요": "こんにちは",
        "안녕하세요.": "こんにちは。",
        "안녕하세요?": "こんにちは。",
        "번역이 되나요?": "翻訳できますか？",
        "어디에 사세요?": "どこに住んでいますか？",
        "나는 도쿄에 삽니다": "私は東京に住んでいます",
        "나는 서울에 삽니다": "私はソウルに住んでいます",
        "사진 정말 멋지네요.": "写真がとても素敵ですね。",
        "감사합니다": "ありがとうございます",
        "감사합니다.": "ありがとうございます。",
        "새로운 메시지": "新しいメッセージ",
        "부모님은 안녕하신가?": "ご両親はお元気ですか？",
        "동생들도 잘 지내는가?": "弟妹たちも元気にしていますか？",
    }

    ja_to_ko = {
        "こんにちは": "안녕하세요",
        "こんにちは。": "안녕하세요.",
        "特に問題なく過ごしています": "특별한 문제 없이 지내고 있습니다.",
        "翻訳がうまくいきません？": "번역이 잘 안 되나요?",
        "どこに住んでいますか？": "어디에 사세요?",
        "私は東京に住んでいます": "나는 도쿄에 삽니다",
        "私はソウルに住んでいます": "나는 서울에 삽니다",
        "写真がとても素敵ですね。": "사진이 정말 멋지네요.",
        "ありがとうございます": "감사합니다",
        "ありがとうございます。": "감사합니다.",
        "新しいメッセージ": "새로운 메시지",
        "ご両親はお元気ですか？": "부모님은 안녕하신가?",
        "弟妹たちも元気にしていますか？": "동생들도 잘 지내는가?",
    }

    if source == "ko" and target == "ja":
        return ko_to_ja.get(text, text)

    if source == "ja" and target == "ko":
        return ja_to_ko.get(text, text)

    return text


def build_translation_cache_key(original_text: str, language_from: str, language_to: str) -> str:
    normalized = f"{normalize_translation_language(language_from)}::{normalize_translation_language(language_to)}::{original_text.strip()}"
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def get_cached_translation(db: Session, original_text: str, language_from: str, language_to: str) -> str | None:
    cache_key = build_translation_cache_key(original_text, language_from, language_to)
    cached = db.scalar(select(TranslationCache).where(TranslationCache.cache_key == cache_key))
    return cached.translated_text if cached else None


def cache_translation(db: Session, original_text: str, language_from: str, language_to: str, translated_text: str) -> None:
    cache_key = build_translation_cache_key(original_text, language_from, language_to)
    existing = db.scalar(select(TranslationCache).where(TranslationCache.cache_key == cache_key))
    if existing is not None:
        return

    db.add(
        TranslationCache(
            cache_key=cache_key,
            original_text=original_text,
            language_from=language_from,
            language_to=language_to,
            translated_text=translated_text,
        )
    )


def translate_message_on_demand(db: Session, message: Message, target_language: str | None = None) -> Message:
    if len(message.original_text.strip()) > settings.translation_max_chars:
        raise ValueError(f"Message is too long to translate. Limit: {settings.translation_max_chars} characters")

    language_from = normalize_translation_language(message.language_from)
    language_to = normalize_translation_language(target_language or message.language_to)

    if language_from == language_to:
        message.translated_text = message.original_text
        message.translation_status = "translated"
        message.language_to = language_to
        message.translated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(message)
        return message

    cached_translation = get_cached_translation(db, message.original_text, language_from, language_to)
    if cached_translation is not None:
        message.translated_text = cached_translation
        message.translation_status = "translated"
        message.language_to = language_to
        message.translated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(message)
        return message

    translated = translate_text(message.original_text, language_from, language_to)
    cache_translation(db, message.original_text, language_from, language_to, translated)
    message.translated_text = translated
    message.translation_status = "translated"
    message.language_to = language_to
    message.translated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(message)
    return message


def process_pending_translations(db: Session, batch_size: int = 50) -> int:
    statement = (
        select(Message)
        .where(Message.translation_status == "pending")
        .order_by(Message.created_at.asc())
        .limit(batch_size)
    )
    messages = list(db.scalars(statement))

    for message in messages:
        try:
            message.translated_text = translate_text(message.original_text, message.language_from, message.language_to)
            message.translation_status = "translated"
            message.translated_at = datetime.now(timezone.utc)
        except Exception as exc:
            message.translation_status = "failed"
            message.translated_text = f"Translation failed: {exc}"
            message.translated_at = None

    if messages:
        db.commit()

    return len(messages)
