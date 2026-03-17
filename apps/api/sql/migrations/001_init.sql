CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  last4 TEXT NOT NULL,
  monthly_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  active_subscriptions_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  billing_card_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  renewal_date DATE
);

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS last4 TEXT;

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS monthly_total NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS active_subscriptions_count INT NOT NULL DEFAULT 0;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS billing_card_name TEXT;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS renewal_date DATE;
