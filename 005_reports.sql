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
