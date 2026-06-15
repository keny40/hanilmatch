
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    nationality TEXT NOT NULL CHECK (nationality IN ('KR', 'JP')),
    CONSTRAINT chk_users_platform_pair
        CHECK (
            (nationality = 'KR' AND gender = 'male')
            OR (nationality = 'JP' AND gender = 'female')
        ),
    language TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    membership_tier TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_nationality_gender ON users (nationality, gender);
CREATE INDEX idx_users_created_at ON users (created_at);

CREATE TABLE refresh_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token_jti TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    user_agent TEXT,
    ip_address TEXT,
    CONSTRAINT fk_refresh_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_refresh_sessions_user_id ON refresh_sessions (user_id);
CREATE INDEX idx_refresh_sessions_token_jti ON refresh_sessions (token_jti);

CREATE TABLE profile_photos (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_profile_photos_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_profile_photos_user_id ON profile_photos (user_id, display_order);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
    age_group TEXT NOT NULL,
    occupation VARCHAR(120),
    location VARCHAR(120),
    native_language VARCHAR(60),
    learning_language VARCHAR(60),
    language_level VARCHAR(60),
    match_purpose VARCHAR(120),
    phone_number VARCHAR(60),
    bio TEXT,
    interests TEXT[] NOT NULL DEFAULT '{}',
    CONSTRAINT fk_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_profiles_age ON profiles (age);
CREATE INDEX idx_profiles_age_group ON profiles (age_group);
CREATE INDEX idx_profiles_interests ON profiles USING GIN (interests);

CREATE TABLE matches (
    id UUID PRIMARY KEY,
    user1_id UUID NOT NULL,
    user2_id UUID NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_matches_user1
        FOREIGN KEY (user1_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_matches_user2
        FOREIGN KEY (user2_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_matches_different_users
        CHECK (user1_id <> user2_id),
    CONSTRAINT chk_matches_order
        CHECK (user1_id < user2_id),
    CONSTRAINT uq_matches_pair
        UNIQUE (user1_id, user2_id)
);

CREATE INDEX idx_matches_user1_id ON matches (user1_id);
CREATE INDEX idx_matches_user2_id ON matches (user2_id);
CREATE INDEX idx_matches_created_at ON matches (created_at);
CREATE INDEX idx_matches_score ON matches (score);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT,
    translation_status TEXT NOT NULL DEFAULT 'pending',
    translated_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    language_from TEXT NOT NULL,
    language_to TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_messages_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_messages_different_users
        CHECK (sender_id <> receiver_id)
);

CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_receiver_id ON messages (receiver_id);
CREATE INDEX idx_messages_created_at ON messages (created_at);
CREATE INDEX idx_messages_translation_status ON messages (translation_status, created_at);

CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID NOT NULL,
    reported_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reports_reported
        FOREIGN KEY (reported_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reports_processed_by
        FOREIGN KEY (processed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT chk_reports_different_users
        CHECK (reporter_id <> reported_id),
    CONSTRAINT chk_reports_status
        CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken'))
);

CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX idx_reports_reported_id ON reports (reported_id);
CREATE INDEX idx_reports_created_at ON reports (created_at);

CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_inquiries_status
        CHECK (status IN ('pending', 'reviewed', 'replied', 'closed'))
);

CREATE INDEX IF NOT EXISTS ix_inquiries_email ON inquiries (email);
CREATE INDEX IF NOT EXISTS ix_inquiries_status ON inquiries (status);

CREATE TABLE match_recommendations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    candidate_user_id UUID NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    status TEXT NOT NULL DEFAULT 'pending',
    rationale TEXT NOT NULL,
    generated_by TEXT NOT NULL DEFAULT 'rule_based',
    last_notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_match_recommendations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_match_recommendations_candidate_user
        FOREIGN KEY (candidate_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_match_recommendations_different_users
        CHECK (user_id <> candidate_user_id),
    CONSTRAINT chk_match_recommendations_status
        CHECK (status IN ('pending', 'accepted', 'dismissed')),
    CONSTRAINT chk_match_recommendations_generated_by
        CHECK (generated_by IN ('rule_based', 'ai_draft')),
    CONSTRAINT uq_match_recommendations_pair
        UNIQUE (user_id, candidate_user_id)
);

CREATE INDEX idx_match_recommendations_user_id ON match_recommendations (user_id, status, score DESC);
CREATE INDEX idx_match_recommendations_candidate_user_id ON match_recommendations (candidate_user_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    payload JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications (notification_type);

CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    match_notification_limit INTEGER NOT NULL DEFAULT 4,
    paid_membership_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 9.99,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT admin_settings_singleton CHECK (id = 1)
);

INSERT INTO admin_settings (
    id,
    match_notification_limit,
    paid_membership_price_usd
)
VALUES (
    1,
    4,
    9.99
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE popup_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'all',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_popup_notices_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT chk_popup_notices_locale
        CHECK (locale IN ('all', 'ko', 'ja'))
);

CREATE INDEX idx_popup_notices_is_active_locale ON popup_notices (is_active, locale, created_at DESC);

CREATE TABLE IF NOT EXISTS popup_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'all',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_popup_notices_locale
        CHECK (locale IN ('all', 'ko', 'ja'))
);

CREATE INDEX IF NOT EXISTS idx_popup_notices_is_active_locale
ON popup_notices (is_active, locale, created_at DESC);
