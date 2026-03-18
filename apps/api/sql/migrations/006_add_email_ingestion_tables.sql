CREATE TABLE IF NOT EXISTS email_accounts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS email_accounts_email_idx
  ON email_accounts (LOWER(email));

CREATE TABLE IF NOT EXISTS email_sync_runs (
  id TEXT PRIMARY KEY,
  email_account_id TEXT NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  messages_scanned INT NOT NULL DEFAULT 0,
  candidates_found INT NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS email_sync_runs_email_account_id_idx
  ON email_sync_runs (email_account_id);

CREATE INDEX IF NOT EXISTS email_sync_runs_started_at_idx
  ON email_sync_runs (started_at DESC);

CREATE TABLE IF NOT EXISTS subscription_candidates (
  id TEXT PRIMARY KEY,
  email_account_id TEXT NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  sync_run_id TEXT REFERENCES email_sync_runs(id) ON DELETE SET NULL,
  source_message_id TEXT NOT NULL,
  raw_from TEXT,
  raw_subject TEXT,
  merchant_name TEXT,
  subscription_name TEXT,
  amount NUMERIC(10,2),
  currency TEXT,
  detected_card_last4 TEXT,
  detected_charge_date DATE,
  detected_renewal_date DATE,
  detected_status TEXT NOT NULL DEFAULT 'uncertain',
  source_language TEXT,
  source_country TEXT,
  confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscription_candidates_email_account_id_idx
  ON subscription_candidates (email_account_id);

CREATE INDEX IF NOT EXISTS subscription_candidates_sync_run_id_idx
  ON subscription_candidates (sync_run_id);

CREATE INDEX IF NOT EXISTS subscription_candidates_detected_status_idx
  ON subscription_candidates (detected_status);

CREATE INDEX IF NOT EXISTS subscription_candidates_detected_renewal_date_idx
  ON subscription_candidates (detected_renewal_date);

CREATE UNIQUE INDEX IF NOT EXISTS subscription_candidates_source_message_id_idx
  ON subscription_candidates (email_account_id, source_message_id);
