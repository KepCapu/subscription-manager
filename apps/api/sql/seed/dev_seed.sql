-- dev seed only

INSERT INTO email_sync_runs (
  id,
  email_account_id,
  status,
  started_at,
  completed_at,
  candidates_found,
  error_message
)
VALUES
  ('sync-1', 'email-1', 'completed', '2026-03-17 10:00:00+00', '2026-03-17 10:02:30+00', 5, NULL),
  ('sync-2', 'email-1', 'completed', '2026-03-18 10:00:00+00', '2026-03-18 10:01:45+00', 3, NULL),
  ('sync-3', 'email-1', 'failed', '2026-03-19 10:00:00+00', '2026-03-19 10:00:15+00', 0, 'IMAP connection timeout'),
  ('sync-4', 'email-stladin228-gmail-com-422652', 'running', '2026-03-19 14:00:00+00', NULL, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  email_account_id = EXCLUDED.email_account_id,
  status = EXCLUDED.status,
  started_at = EXCLUDED.started_at,
  completed_at = EXCLUDED.completed_at,
  candidates_found = EXCLUDED.candidates_found,
  error_message = EXCLUDED.error_message;

UPDATE subscription_candidates
SET sync_run_id = CASE id
  WHEN 'cand-1' THEN 'sync-1'
  WHEN 'cand-2' THEN 'sync-1'
  WHEN 'cand-3' THEN 'sync-2'
  WHEN 'cand-4' THEN 'sync-3'
  ELSE sync_run_id
END
WHERE id IN ('cand-1', 'cand-2', 'cand-3', 'cand-4')
  AND email_account_id = 'email-1';
