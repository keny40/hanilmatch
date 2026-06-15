ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS chk_inquiries_status;
ALTER TABLE inquiries ALTER COLUMN status SET DEFAULT 'pending';
UPDATE inquiries SET status = 'pending' WHERE status = 'new';
UPDATE inquiries SET status = 'reviewed' WHERE status = 'reviewing';
ALTER TABLE inquiries
    ADD CONSTRAINT chk_inquiries_status
    CHECK (status IN ('pending', 'reviewed', 'replied', 'closed'));
