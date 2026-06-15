CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(30) NOT NULL,
    title VARCHAR(180) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'approved',
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    CONSTRAINT chk_community_posts_category CHECK (category IN ('notice', 'review', 'culture', 'tips', 'feedback')),
    CONSTRAINT chk_community_posts_status CHECK (status IN ('pending', 'approved', 'rejected', 'hidden'))
);

CREATE INDEX IF NOT EXISTS ix_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS ix_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS ix_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS ix_community_posts_is_public ON community_posts(is_public);
