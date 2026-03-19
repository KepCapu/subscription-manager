ALTER TABLE email_sync_runs
  ALTER COLUMN status SET DEFAULT 'running';

ALTER TABLE email_sync_runs
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE email_sync_runs
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'email_sync_runs'
      AND column_name = 'finished_at'
  ) THEN
    UPDATE email_sync_runs
    SET completed_at = finished_at
    WHERE completed_at IS NULL
      AND finished_at IS NOT NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_email_sync_runs_status
  ON email_sync_runs(status);
