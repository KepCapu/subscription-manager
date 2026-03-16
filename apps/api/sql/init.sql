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
  monthly_price NUMERIC(10,2) NOT NULL,
  billing_card_name TEXT NOT NULL,
  status TEXT NOT NULL
);

INSERT INTO cards (id, name, last4, monthly_total, active_subscriptions_count)
VALUES
  ('card_visa_4421', 'Visa', '4421', 34.48, 3),
  ('card_mc_7710', 'Mastercard', '7710', 41.94, 2),
  ('card_revolut_0023', 'Revolut', '0023', 11.99, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscriptions (id, name, monthly_price, billing_card_name, status)
VALUES
  ('sub_netflix', 'Netflix', 15.99, 'Visa ending 4421', 'Active'),
  ('sub_spotify', 'Spotify', 9.99, 'Visa ending 4421', 'Active'),
  ('sub_adobe', 'Adobe', 24.99, 'Mastercard ending 7710', 'Active'),
  ('sub_youtube', 'YouTube Premium', 8.50, 'Visa ending 4421', 'Active'),
  ('sub_apple_one', 'Apple One', 16.95, 'Mastercard ending 7710', 'Active'),
  ('sub_canva', 'Canva', 11.99, 'Revolut ending 0023', 'Active')
ON CONFLICT (id) DO NOTHING;
