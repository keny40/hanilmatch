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
