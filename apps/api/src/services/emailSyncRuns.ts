import { dbPool } from '../db/pool';
import { EmailSyncRun } from '../types/emailSyncRun';

type EmailSyncRunRow = {
  id: string;
  email_account_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  candidates_found: number;
  error_message: string | null;
  created_at: string;
};

function mapEmailSyncRun(row: EmailSyncRunRow): EmailSyncRun {
  return {
    id: row.id,
    emailAccountId: row.email_account_id,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    candidatesFound: row.candidates_found,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  };
}

const emailSyncRunSelect = `SELECT
  id,
  email_account_id,
  status,
  started_at,
  completed_at,
  candidates_found,
  error_message,
  created_at
 FROM email_sync_runs`;

export async function getSyncRuns(): Promise<EmailSyncRun[]> {
  const result = await dbPool.query<EmailSyncRunRow>(
    `${emailSyncRunSelect}
     ORDER BY started_at DESC`
  );

  return result.rows.map(mapEmailSyncRun);
}

export async function getSyncRunsByEmailAccountId(emailAccountId: string): Promise<EmailSyncRun[]> {
  const result = await dbPool.query<EmailSyncRunRow>(
    `${emailSyncRunSelect}
     WHERE email_account_id = $1
     ORDER BY started_at DESC`,
    [emailAccountId]
  );

  return result.rows.map(mapEmailSyncRun);
}

export async function getSyncRunById(id: string): Promise<EmailSyncRun | null> {
  const result = await dbPool.query<EmailSyncRunRow>(
    `${emailSyncRunSelect}
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapEmailSyncRun(result.rows[0]);
}
