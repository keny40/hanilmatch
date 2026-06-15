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
