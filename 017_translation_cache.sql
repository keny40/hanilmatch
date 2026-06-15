CREATE TABLE IF NOT EXISTS translation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR NOT NULL,
    original_text TEXT NOT NULL,
    language_from VARCHAR NOT NULL,
    language_to VARCHAR NOT NULL,
    translated_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_translation_cache_cache_key UNIQUE (cache_key)
);

CREATE INDEX IF NOT EXISTS ix_translation_cache_cache_key ON translation_cache (cache_key);
