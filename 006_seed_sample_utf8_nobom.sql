INSERT INTO users (id, email, password_hash, gender, nationality, language, is_verified, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'minsu@example.com', '03LM8GGxu/dNkosxR9QXIw==:6GsbwywutU33ajWoXs0Z8J8evcIq58Y1W+g1HeDXPjg=', 'male', 'KR', 'ko', TRUE, NOW()),
    ('22222222-2222-2222-2222-222222222222', 'jihoon@example.com', '03LM8GGxu/dNkosxR9QXIw==:6GsbwywutU33ajWoXs0Z8J8evcIq58Y1W+g1HeDXPjg=', 'male', 'KR', 'ko', TRUE, NOW()),
    ('33333333-3333-3333-3333-333333333333', 'yuki@example.jp', '03LM8GGxu/dNkosxR9QXIw==:6GsbwywutU33ajWoXs0Z8J8evcIq58Y1W+g1HeDXPjg=', 'female', 'JP', 'ja', TRUE, NOW()),
    ('44444444-4444-4444-4444-444444444444', 'sakura@example.jp', '03LM8GGxu/dNkosxR9QXIw==:6GsbwywutU33ajWoXs0Z8J8evcIq58Y1W+g1HeDXPjg=', 'female', 'JP', 'ja', FALSE, NOW());

INSERT INTO profiles (user_id, age, age_group, bio, interests) VALUES
('11111111-1111-1111-1111-111111111111', 31, '30s', 'Seoul-based product designer who enjoys travel and language exchange.', ARRAY['travel', 'coffee', 'design', 'movies']),
('22222222-2222-2222-2222-222222222222', 29, '20s', 'Software engineer looking for a sincere international relationship.', ARRAY['coding', 'fitness', 'music']),
('33333333-3333-3333-3333-333333333333', 28, '20s', 'Tokyo photographer who likes calm conversations and weekend trips.', ARRAY['photography', 'travel', 'art']),
('44444444-4444-4444-4444-444444444444', 27, '20s', 'Osaka-based marketer interested in Korean culture and cooking.', ARRAY['cooking', 'kdrama', 'hiking']);

INSERT INTO matches (id, user1_id, user2_id, score, created_at) VALUES
    ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 92.50, NOW()),
    ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 84.20, NOW());

INSERT INTO messages (id, sender_id, receiver_id, original_text, translated_text, language_from, language_to, created_at) VALUES
    ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '?덈뀞?섏꽭?? ?ъ쭊 ?뺣쭚 硫뗭??ㅼ슂.', '?볝굯?ャ걾??귛넍?잆걣?ⓦ겍?귞킔?듐겎?쇻겖??, 'ko', 'ja', NOW()),
    ('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '?귙굤?뚣겏?녴걫?뽧걚?얇걲?귙궫?╉꺂?ャ겘?덀걦烏뚣걤?얇걲?뗣?, '媛먯궗?⑸땲?? ?쒖슱?먮뒗 ?먯＜ 媛?쒕굹??', 'ja', 'ko', NOW());

INSERT INTO reports (id, reporter_id, reported_id, reason, created_at) VALUES
    ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Inappropriate repeated messages', NOW());

