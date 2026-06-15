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
