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

type EmailAccountStatusRow = {
  id: string;
  status: string;
};

type InsertedSyncRunRow = {
  id: string;
};

const MOCK_CANDIDATE_TEMPLATES = [
  {
    merchantName: 'Notion',
    subscriptionName: 'Notion Plus',
    amount: 10,
    rawFrom: 'team@makenotion.com',
    rawSubject: 'Your Notion invoice',
  },
  {
    merchantName: 'Figma',
    subscriptionName: 'Figma Professional',
    amount: 15,
    rawFrom: 'billing@figma.com',
    rawSubject: 'Payment receipt from Figma',
  },
  {
    merchantName: 'Linear',
    subscriptionName: 'Linear Standard',
    amount: 8,
    rawFrom: 'receipts@linear.app',
    rawSubject: 'Your Linear receipt',
  },
  {
    merchantName: 'Vercel',
    subscriptionName: 'Vercel Pro',
    amount: 20,
    rawFrom: 'billing@vercel.com',
    rawSubject: 'Vercel subscription payment',
  },
  {
    merchantName: 'Spotify',
    subscriptionName: 'Spotify Premium',
    amount: 9.99,
    rawFrom: 'no-reply@spotify.com',
    rawSubject: 'Your Spotify receipt',
  },
  {
    merchantName: '1Password',
    subscriptionName: '1Password Families',
    amount: 4.99,
    rawFrom: 'billing@1password.com',
    rawSubject: 'Receipt for 1Password',
  },
] as const;

const MOCK_CARD_LAST4_VALUES = ['4421', '7710', '0023'] as const;

export type RunMockSyncResult =
  | { ok: true; item: EmailSyncRun }
  | { ok: false; reason: 'EMAIL_ACCOUNT_NOT_FOUND' | 'EMAIL_ACCOUNT_INACTIVE' };

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

export async function runMockSync(emailAccountId: string): Promise<RunMockSyncResult> {
  await dbPool.query('BEGIN');

  try {
    const emailAccountResult = await dbPool.query<EmailAccountStatusRow>(
      `SELECT id, status
       FROM email_accounts
       WHERE id = $1
       LIMIT 1`,
      [emailAccountId]
    );

    if (emailAccountResult.rows.length === 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'EMAIL_ACCOUNT_NOT_FOUND' };
    }

    if (emailAccountResult.rows[0].status !== 'active') {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'EMAIL_ACCOUNT_INACTIVE' };
    }

    const now = new Date();
    const baseTimestamp = Date.now();
    const syncRunId = 'sync-' + baseTimestamp;
    const candidateCount = Math.floor(Math.random() * 2) + 2;

    const createdSyncRunResult = await dbPool.query<InsertedSyncRunRow>(
      `INSERT INTO email_sync_runs (
         id,
         email_account_id,
         status,
         started_at,
         completed_at,
         candidates_found,
         error_message
       )
       VALUES ($1, $2, 'completed', $3, $3, $4, NULL)
       RETURNING id`,
      [syncRunId, emailAccountId, now.toISOString(), candidateCount]
    );

    const renewalDate = new Date(now);
    renewalDate.setDate(renewalDate.getDate() + 30);

    for (let index = 0; index < candidateCount; index += 1) {
      const template =
        MOCK_CANDIDATE_TEMPLATES[Math.floor(Math.random() * MOCK_CANDIDATE_TEMPLATES.length)];
      const cardLast4 =
        MOCK_CARD_LAST4_VALUES[Math.floor(Math.random() * MOCK_CARD_LAST4_VALUES.length)];
      const confidence = Number((0.7 + Math.random() * 0.25).toFixed(2));
      const rowTimestamp = baseTimestamp + index;

      await dbPool.query(
        `INSERT INTO subscription_candidates (
           id,
           email_account_id,
           sync_run_id,
           source_message_id,
           raw_from,
           raw_subject,
           merchant_name,
           subscription_name,
           amount,
           currency,
           detected_card_last4,
           detected_charge_date,
           detected_renewal_date,
           detected_status,
           source_language,
           source_country,
           confidence
         )
         VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, 'EUR', $10, $11::date, $12::date,
           'possible_subscription', 'en', 'PL', $13
         )`,
        [
          'cand-' + rowTimestamp + '-' + (index + 1),
          emailAccountId,
          syncRunId,
          'mock-msg-' + rowTimestamp + '-' + (index + 1),
          template.rawFrom,
          template.rawSubject,
          template.merchantName,
          template.subscriptionName,
          template.amount,
          cardLast4,
          now.toISOString(),
          renewalDate.toISOString(),
          confidence,
        ]
      );
    }

    await dbPool.query(
      `UPDATE email_accounts
       SET last_synced_at = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [emailAccountId, now.toISOString()]
    );

    await dbPool.query('COMMIT');

    const createdSyncRun = await getSyncRunById(createdSyncRunResult.rows[0].id);

    if (!createdSyncRun) {
      throw new Error('Created sync run could not be loaded');
    }

    return { ok: true, item: createdSyncRun };
  } catch (error) {
    try {
      await dbPool.query('ROLLBACK');
    } catch {
      // no-op
    }

    throw error;
  }
}
