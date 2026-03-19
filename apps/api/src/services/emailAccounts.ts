import { dbPool } from '../db/pool';

export type EmailAccount = {
  id: string;
  email: string;
  provider: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};

export type CreateEmailAccountInput = {
  id: string;
  email: string;
  provider: string;
  status?: string;
};

type EmailAccountRow = {
  id: string;
  email: string;
  provider: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
};

function mapEmailAccount(row: EmailAccountRow): EmailAccount {
  return {
    id: row.id,
    email: row.email,
    provider: row.provider,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastSyncedAt: row.last_synced_at,
  };
}

export async function getEmailAccounts(): Promise<EmailAccount[]> {
  const result = await dbPool.query<EmailAccountRow>(
    `SELECT
       id,
       email,
       provider,
       status,
       created_at,
       updated_at,
       last_synced_at
     FROM email_accounts
     ORDER BY created_at DESC`
  );

  return result.rows.map(mapEmailAccount);
}

export async function createEmailAccount(
  input: CreateEmailAccountInput
): Promise<EmailAccount> {
  const result = await dbPool.query<EmailAccountRow>(
    `INSERT INTO email_accounts (
       id,
       email,
       provider,
       status
     )
     VALUES ($1, $2, $3, $4)
     RETURNING
       id,
       email,
       provider,
       status,
       created_at,
       updated_at,
       last_synced_at`,
    [input.id, input.email.trim(), input.provider.trim(), input.status ?? 'active']
  );

  return mapEmailAccount(result.rows[0]);
}

export async function updateEmailAccountStatus(
  id: string,
  status: string
): Promise<EmailAccount | null> {
  const result = await dbPool.query<EmailAccountRow>(
    `UPDATE email_accounts
     SET status = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING
       id,
       email,
       provider,
       status,
       created_at,
       updated_at,
       last_synced_at`,
    [id, status]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapEmailAccount(result.rows[0]);
}
