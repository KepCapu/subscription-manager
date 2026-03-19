import { dbPool } from '../db/pool';

export type SubscriptionCandidate = {
  id: string;
  emailAccountId: string;
  syncRunId: string | null;
  sourceMessageId: string;
  rawFrom: string | null;
  rawSubject: string | null;
  merchantName: string | null;
  subscriptionName: string | null;
  amount: number | null;
  currency: string | null;
  detectedCardLast4: string | null;
  detectedChargeDate: string | null;
  detectedRenewalDate: string | null;
  detectedStatus: string;
  sourceLanguage: string | null;
  sourceCountry: string | null;
  confidence: number;
  materializedSubscriptionId: string | null;
  createdAt: string;
};

export type CreateSubscriptionCandidateInput = {
  id: string;
  emailAccountId: string;
  syncRunId?: string | null;
  sourceMessageId: string;
  rawFrom?: string | null;
  rawSubject?: string | null;
  merchantName?: string | null;
  subscriptionName?: string | null;
  amount?: number | null;
  currency?: string | null;
  detectedCardLast4?: string | null;
  detectedChargeDate?: string | null;
  detectedRenewalDate?: string | null;
  detectedStatus?: string;
  sourceLanguage?: string | null;
  sourceCountry?: string | null;
  confidence?: number;
};

export type ConfirmSubscriptionCandidateResult =
  | { ok: true; subscriptionId: string }
  | {
      ok: false;
      reason:
        | 'SUBSCRIPTION_CANDIDATE_NOT_FOUND'
        | 'CANDIDATE_MISSING_REQUIRED_FIELDS'
        | 'CARD_NOT_FOUND'
        | 'SUBSCRIPTION_ALREADY_CREATED';
    };

type SubscriptionCandidateRow = {
  id: string;
  email_account_id: string;
  sync_run_id: string | null;
  source_message_id: string;
  raw_from: string | null;
  raw_subject: string | null;
  merchant_name: string | null;
  subscription_name: string | null;
  amount: string | null;
  currency: string | null;
  detected_card_last4: string | null;
  detected_charge_date: string | null;
  detected_renewal_date: string | null;
  detected_status: string;
  source_language: string | null;
  source_country: string | null;
  confidence: string;
  materialized_subscription_id: string | null;
  created_at: string;
};

type CardLookupRow = {
  id: string;
  name: string;
  last4: string;
};

function mapSubscriptionCandidate(row: SubscriptionCandidateRow): SubscriptionCandidate {
  return {
    id: row.id,
    emailAccountId: row.email_account_id,
    syncRunId: row.sync_run_id,
    sourceMessageId: row.source_message_id,
    rawFrom: row.raw_from,
    rawSubject: row.raw_subject,
    merchantName: row.merchant_name,
    subscriptionName: row.subscription_name,
    amount: row.amount === null ? null : Number(Number(row.amount).toFixed(2)),
    currency: row.currency,
    detectedCardLast4: row.detected_card_last4,
    detectedChargeDate: row.detected_charge_date,
    detectedRenewalDate: row.detected_renewal_date,
    detectedStatus: row.detected_status,
    sourceLanguage: row.source_language,
    sourceCountry: row.source_country,
    confidence: Number(Number(row.confidence).toFixed(2)),
    materializedSubscriptionId: row.materialized_subscription_id,
    createdAt: row.created_at,
  };
}

const subscriptionCandidateSelect = `SELECT
   id,
   email_account_id,
   sync_run_id,
   source_message_id,
   raw_from,
   raw_subject,
   merchant_name,
   subscription_name,
   amount::text,
   currency,
   detected_card_last4,
   detected_charge_date::text,
   detected_renewal_date::text,
   detected_status,
   source_language,
   source_country,
   confidence::text,
   materialized_subscription_id,
   created_at
 FROM subscription_candidates`;

export async function getSubscriptionCandidates(
  detectedStatus?: string
): Promise<SubscriptionCandidate[]> {
  const params: Array<string> = [];
  let query = subscriptionCandidateSelect;

  if (detectedStatus) {
    params.push(detectedStatus);
    query += ` WHERE detected_status = $1`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await dbPool.query<SubscriptionCandidateRow>(query, params);

  return result.rows.map(mapSubscriptionCandidate);
}

export async function getSubscriptionCandidateById(
  id: string
): Promise<SubscriptionCandidate | null> {
  const result = await dbPool.query<SubscriptionCandidateRow>(
    `${subscriptionCandidateSelect}
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapSubscriptionCandidate(result.rows[0]);
}

export async function createSubscriptionCandidate(
  input: CreateSubscriptionCandidateInput
): Promise<SubscriptionCandidate> {
  const result = await dbPool.query<SubscriptionCandidateRow>(
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
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING
       id,
       email_account_id,
       sync_run_id,
       source_message_id,
       raw_from,
       raw_subject,
       merchant_name,
       subscription_name,
       amount::text,
       currency,
       detected_card_last4,
       detected_charge_date::text,
       detected_renewal_date::text,
       detected_status,
       source_language,
       source_country,
       confidence::text,
       materialized_subscription_id,
       created_at`,
    [
      input.id,
      input.emailAccountId,
      input.syncRunId ?? null,
      input.sourceMessageId,
      input.rawFrom ?? null,
      input.rawSubject ?? null,
      input.merchantName ?? null,
      input.subscriptionName ?? null,
      input.amount ?? null,
      input.currency ?? null,
      input.detectedCardLast4 ?? null,
      input.detectedChargeDate ?? null,
      input.detectedRenewalDate ?? null,
      input.detectedStatus ?? 'uncertain',
      input.sourceLanguage ?? null,
      input.sourceCountry ?? null,
      input.confidence ?? 0,
    ]
  );

  return mapSubscriptionCandidate(result.rows[0]);
}

export async function updateSubscriptionCandidateStatus(
  id: string,
  detectedStatus: string
): Promise<SubscriptionCandidate | null> {
  const result = await dbPool.query<SubscriptionCandidateRow>(
    `UPDATE subscription_candidates
     SET detected_status = $2
     WHERE id = $1
     RETURNING
       id,
       email_account_id,
       sync_run_id,
       source_message_id,
       raw_from,
       raw_subject,
       merchant_name,
       subscription_name,
       amount::text,
       currency,
       detected_card_last4,
       detected_charge_date::text,
       detected_renewal_date::text,
       detected_status,
       source_language,
       source_country,
       confidence::text,
       materialized_subscription_id,
       created_at`,
    [id, detectedStatus]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapSubscriptionCandidate(result.rows[0]);
}

export async function confirmSubscriptionCandidate(
  candidateId: string
): Promise<ConfirmSubscriptionCandidateResult> {
  await dbPool.query('BEGIN');

  try {
    const candidateResult = await dbPool.query<SubscriptionCandidateRow>(
      `${subscriptionCandidateSelect}
       WHERE id = $1
       LIMIT 1
       FOR UPDATE`,
      [candidateId]
    );

    if (candidateResult.rows.length === 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'SUBSCRIPTION_CANDIDATE_NOT_FOUND' };
    }

    const candidate = mapSubscriptionCandidate(candidateResult.rows[0]);
    const subscriptionName = candidate.subscriptionName ?? candidate.merchantName;

    if (!subscriptionName || candidate.amount === null || !candidate.detectedCardLast4) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'CANDIDATE_MISSING_REQUIRED_FIELDS' };
    }

    if (candidate.materializedSubscriptionId) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'SUBSCRIPTION_ALREADY_CREATED' };
    }

    const cardResult = await dbPool.query<CardLookupRow>(
      `SELECT id, name, last4
       FROM cards
       WHERE last4 = $1
       ORDER BY id ASC
       LIMIT 1`,
      [candidate.detectedCardLast4]
    );

    if (cardResult.rows.length === 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'CARD_NOT_FOUND' };
    }

    const card = cardResult.rows[0];
    const subscriptionId = 'sub-from-' + candidate.id;
    const billingCardName = `${card.name} ending ${card.last4}`;

    try {
      await dbPool.query(
        `INSERT INTO subscriptions (
          id,
          name,
          monthly_price,
          billing_card_name,
          card_id,
          status,
          renewal_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::date)`,
        [
          subscriptionId,
          subscriptionName,
          candidate.amount,
          billingCardName,
          card.id,
          'active',
          candidate.detectedRenewalDate,
        ]
      );
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        await dbPool.query('ROLLBACK');
        return { ok: false, reason: 'SUBSCRIPTION_ALREADY_CREATED' };
      }

      throw error;
    }

    await dbPool.query(
      `UPDATE cards
       SET monthly_total = monthly_total + $1,
           active_subscriptions_count = active_subscriptions_count + 1
       WHERE id = $2`,
      [candidate.amount, card.id]
    );

    const materializeResult = await dbPool.query<{ id: string }>(
      `UPDATE subscription_candidates
       SET detected_status = 'confirmed_subscription',
           materialized_subscription_id = $2
       WHERE id = $1
         AND materialized_subscription_id IS NULL
       RETURNING id`,
      [candidateId, subscriptionId]
    );

    if (materializeResult.rows.length === 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'SUBSCRIPTION_ALREADY_CREATED' };
    }

    await dbPool.query('COMMIT');
    return { ok: true, subscriptionId };
  } catch (error) {
    try {
      await dbPool.query('ROLLBACK');
    } catch {
      // no-op
    }

    throw error;
  }
}
