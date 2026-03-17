CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  last4 TEXT NOT NULL,
  monthly_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  active_subscriptions_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  billing_card_name TEXT,
  card_id TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  renewal_date DATE
);

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS last4 TEXT;

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS monthly_total NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS active_subscriptions_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS billing_card_name TEXT;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS card_id TEXT;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active';

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS renewal_date DATE;

INSERT INTO cards (id, name, last4, monthly_total, active_subscriptions_count)
VALUES
  ('card_visa_4421', 'Visa', '4421', 34.48, 3),
  ('card_mc_7710', 'Mastercard', '7710', 41.94, 2),
  ('card_revolut_0023', 'Revolut', '0023', 11.99, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscriptions (id, name, monthly_price, billing_card_name, card_id, status, renewal_date)
VALUES
  ('sub_netflix', 'Netflix', 15.99, 'Visa ending 4421', 'card_visa_4421', 'Active', DATE '2026-03-18'),
  ('sub_spotify', 'Spotify', 9.99, 'Visa ending 4421', 'card_visa_4421', 'Active', DATE '2026-03-20'),
  ('sub_adobe', 'Adobe', 24.99, 'Mastercard ending 7710', 'card_mc_7710', 'Active', DATE '2026-04-05'),
  ('sub_youtube', 'YouTube Premium', 8.50, 'Visa ending 4421', 'card_visa_4421', 'Active', DATE '2026-03-25'),
  ('sub_apple_one', 'Apple One', 16.95, 'Mastercard ending 7710', 'card_mc_7710', 'Active', DATE '2026-03-28'),
  ('sub_canva', 'Canva', 11.99, 'Revolut ending 0023', 'card_revolut_0023', 'Active', DATE '2026-04-10')
ON CONFLICT (id) DO NOTHING;

UPDATE subscriptions AS s
SET card_id = c.id
FROM cards AS c
WHERE s.card_id IS NULL
  AND s.billing_card_name = (c.name || ' ending ' || c.last4);

CREATE INDEX IF NOT EXISTS idx_subscriptions_card_id
  ON subscriptions(card_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_card_id_fkey'
  ) THEN
    ALTER TABLE subscriptions
      ADD CONSTRAINT subscriptions_card_id_fkey
      FOREIGN KEY (card_id)
      REFERENCES cards(id);
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'subscriptions'
      AND column_name = 'card_id'
      AND is_nullable = 'YES'
  ) AND NOT EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE card_id IS NULL
  ) THEN
    ALTER TABLE subscriptions
      ALTER COLUMN card_id SET NOT NULL;
  END IF;
END
$$;
