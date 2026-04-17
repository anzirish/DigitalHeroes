-- Golf Platform — Supabase Schema

-- CHARITIES
CREATE TABLE charities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  website_url   TEXT,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- USERS
CREATE TABLE users (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                   TEXT UNIQUE NOT NULL,
  password_hash           TEXT NOT NULL,
  full_name               TEXT NOT NULL,
  role                    TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status     TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelling', 'lapsed')),
  subscription_plan       TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_end_date   TIMESTAMPTZ,
  razorpay_payment_id     TEXT,
  charity_id              UUID REFERENCES charities(id),
  charity_percentage      NUMERIC(5,2) DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS 
CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT,
  razorpay_order_id   TEXT,
  plan                TEXT NOT NULL,
  status              TEXT NOT NULL,
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  ended_at            TIMESTAMPTZ
);

-- SCORES
CREATE TABLE scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date  DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, score_date)
);

-- DRAWS
CREATE TABLE draws (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month       DATE NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'published')),
  draw_mode        TEXT NOT NULL DEFAULT 'random' CHECK (draw_mode IN ('random', 'algorithmic')),
  winning_numbers  INTEGER[],
  total_pool       NUMERIC(10,2) DEFAULT 0,
  jackpot_rollover NUMERIC(10,2) DEFAULT 0,
  jackpot_amount   NUMERIC(10,2) DEFAULT 0,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- DRAW WINNERS
CREATE TABLE draw_winners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id          UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type       TEXT NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  prize_amount     NUMERIC(10,2) NOT NULL,
  payment_status   TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'pending_verification', 'approved', 'rejected', 'paid')),
  proof_url        TEXT,
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_scores_user_id       ON scores(user_id);
CREATE INDEX idx_draw_winners_user    ON draw_winners(user_id);
CREATE INDEX idx_draw_winners_draw    ON draw_winners(draw_id);
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_subscription   ON users(subscription_status);

-- SEED: SAMPLE CHARITIES
INSERT INTO charities (name, description, image_url, is_featured) VALUES
  ('Golf Foundation', 'Helping young people access golf and develop life skills through sport.', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400', TRUE),
  ('Macmillan Cancer Support', 'Supporting people living with cancer through every step of their journey.', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', TRUE),
  ('Age UK', 'Improving later life for older people across the UK.', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400', FALSE),
  ('Children in Need', 'Transforming the lives of disadvantaged children and young people across the UK.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400', FALSE);
