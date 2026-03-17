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
