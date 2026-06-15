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
