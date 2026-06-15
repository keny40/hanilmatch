from __future__ import annotations

from math import sqrt

import httpx

from app.core.config import settings
from app.models.profile import Profile
from app.models.user import User


def is_ai_matching_enabled() -> bool:
    return settings.matching_ai_provider.lower() == "openai" and bool(settings.openai_api_key)


def profile_to_text(user: User, profile: Profile) -> str:
    interests = ", ".join(profile.interests) if profile.interests else "none"
    bio = profile.bio or "no bio"
    return (
        f"nationality={user.nationality}\n"
        f"gender={user.gender}\n"
        f"language={user.language}\n"
        f"age={profile.age}\n"
        f"age_group={profile.age_group}\n"
        f"occupation={profile.occupation or 'none'}\n"
        f"location={profile.location or 'none'}\n"
        f"native_language={profile.native_language or 'none'}\n"
        f"learning_language={profile.learning_language or 'none'}\n"
        f"language_level={profile.language_level or 'none'}\n"
        f"match_purpose={profile.match_purpose or 'none'}\n"
        f"interests={interests}\n"
        f"bio={bio}"
    )


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    dot = sum(a * b for a, b in zip(left, right))
    left_norm = sqrt(sum(a * a for a in left))
    right_norm = sqrt(sum(b * b for b in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)


def _openai_headers() -> dict[str, str]:
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY must be configured for OpenAI matching")
    return {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }


def embedding_similarity_map(
    current_user: User,
    current_profile: Profile,
    candidates: list[tuple[User, Profile]],
) -> dict[str, float]:
    if not is_ai_matching_enabled() or not candidates:
        return {}

    texts = [profile_to_text(current_user, current_profile)] + [
        profile_to_text(candidate, candidate_profile) for candidate, candidate_profile in candidates
    ]
    response = httpx.post(
        f"{settings.openai_base_url.rstrip('/')}/embeddings",
        headers=_openai_headers(),
        json={
            "model": settings.openai_embedding_model,
            "input": texts,
        },
        timeout=30.0,
    )
    response.raise_for_status()
    payload = response.json()
    vectors = [item["embedding"] for item in payload["data"]]
    base_vector = vectors[0]

    similarity_map: dict[str, float] = {}
    for (candidate, _candidate_profile), vector in zip(candidates, vectors[1:]):
        similarity_map[str(candidate.id)] = _cosine_similarity(base_vector, vector)
    return similarity_map


def generate_ai_rationale(
    current_user: User,
    current_profile: Profile,
    candidate: User,
    candidate_profile: Profile,
    base_rationale: str,
) -> str:
    if not is_ai_matching_enabled():
        return base_rationale

    response = httpx.post(
        f"{settings.openai_base_url.rstrip('/')}/chat/completions",
        headers=_openai_headers(),
        json={
            "model": settings.openai_chat_model,
            "temperature": 0.3,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You write concise matchmaking explanations for an international dating app. "
                        "Return one sentence under 140 characters. Focus on compatibility and trust."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Current user:\n{profile_to_text(current_user, current_profile)}\n\n"
                        f"Candidate user:\n{profile_to_text(candidate, candidate_profile)}\n\n"
                        f"Base rationale: {base_rationale}"
                    ),
                },
            ],
        },
        timeout=30.0,
    )
    response.raise_for_status()
    payload = response.json()
    content = payload["choices"][0]["message"]["content"].strip()
    return content or base_rationale
