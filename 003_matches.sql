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
