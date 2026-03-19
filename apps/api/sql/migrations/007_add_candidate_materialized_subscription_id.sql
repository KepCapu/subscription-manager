ALTER TABLE subscription_candidates
  ADD COLUMN IF NOT EXISTS materialized_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS subscription_candidates_materialized_subscription_id_idx
  ON subscription_candidates (materialized_subscription_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscription_candidates_materialized_subscription_id_fkey'
  ) THEN
    ALTER TABLE subscription_candidates
      ADD CONSTRAINT subscription_candidates_materialized_subscription_id_fkey
      FOREIGN KEY (materialized_subscription_id)
      REFERENCES subscriptions(id)
      ON DELETE SET NULL;
  END IF;
END
$$;
