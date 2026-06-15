ALTER TABLE community_posts ALTER COLUMN status SET DEFAULT 'approved';
ALTER TABLE community_posts ALTER COLUMN is_public SET DEFAULT TRUE;

UPDATE community_posts
SET
    status = 'approved',
    is_public = TRUE,
    published_at = COALESCE(published_at, NOW()),
    updated_at = NOW()
WHERE status = 'pending';
