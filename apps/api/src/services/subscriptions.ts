import { dbPool } from '../db/pool';
import { Subscription } from '../types/subscription';
import { Card } from '../types/card';
import { SubscriptionDetails } from '../types/subscriptionDetails';

type SubscriptionRow = {
  id: string;
  name: string;
  monthly_price: string;
  billing_card_name: string;
  card_id: string | null;
  status: string;
  renewal_date: string | null;
};

type CardRow = {
  id: string;
  name: string;
  last4: string;
  monthly_total: string;
  active_subscriptions_count: number;
};

export type CreateSubscriptionInput = {
  id: string;
  name: string;
  monthlyPrice: number;
  cardId: string;
  status: string;
  renewalDate: string | null;
};

export type CreateSubscriptionResult =
  | { ok: true; item: Subscription }
  | { ok: false; reason: 'CARD_NOT_FOUND' | 'SUBSCRIPTION_ID_ALREADY_EXISTS' };

function mapSubscriptionRow(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    monthlyPrice: Number(row.monthly_price),
    billingCardName: row.billing_card_name,
    cardId: row.card_id,
    status: row.status,
    renewalDate: row.renewal_date,
  };
}

function mapCardRow(row: CardRow): Card {
  return {
    id: row.id,
    name: row.name,
    last4: row.last4,
    monthlyTotal: Number(row.monthly_total),
    activeSubscriptionsCount: row.active_subscriptions_count,
  };
}

const subscriptionSelect = `
  SELECT
    s.id,
    s.name,
    s.monthly_price,
    COALESCE(c.name || ' ending ' || c.last4, s.billing_card_name) AS billing_card_name,
    s.card_id,
    s.status,
    s.renewal_date::text AS renewal_date
  FROM subscriptions s
  LEFT JOIN cards c ON c.id = s.card_id
`;

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const result = await dbPool.query<SubscriptionRow>(
    `${subscriptionSelect}
     ORDER BY s.name ASC`
  );

  return result.rows.map(mapSubscriptionRow);
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const result = await dbPool.query<SubscriptionRow>(
    `${subscriptionSelect}
     WHERE s.id = $1
     LIMIT 1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapSubscriptionRow(result.rows[0]);
}

export async function getSubscriptionDetailsById(id: string): Promise<SubscriptionDetails | null> {
  const subscriptionResult = await dbPool.query<SubscriptionRow>(
    `${subscriptionSelect}
     WHERE s.id = $1
     LIMIT 1`,
    [id]
  );

  if (subscriptionResult.rows.length === 0) {
    return null;
  }

  const subscription = mapSubscriptionRow(subscriptionResult.rows[0]);

  const cardResult = await dbPool.query<CardRow>(
    `SELECT id, name, last4, monthly_total, active_subscriptions_count
     FROM cards
     WHERE id = $1
     LIMIT 1`,
    [subscription.cardId]
  );

  const billingCard = cardResult.rows.length > 0 ? mapCardRow(cardResult.rows[0]) : null;

  return {
    ...subscription,
    billingCard,
  };
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<CreateSubscriptionResult> {
  await dbPool.query('BEGIN');

  try {
    const existingSubscriptionResult = await dbPool.query<{ id: string }>(
      'SELECT id FROM subscriptions WHERE id = $1 LIMIT 1',
      [input.id]
    );

    if (existingSubscriptionResult.rows.length > 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'SUBSCRIPTION_ID_ALREADY_EXISTS' };
    }

    const cardResult = await dbPool.query<CardRow>(
      `SELECT id, name, last4, monthly_total, active_subscriptions_count
       FROM cards
       WHERE id = $1
       LIMIT 1`,
      [input.cardId]
    );

    if (cardResult.rows.length === 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'CARD_NOT_FOUND' };
    }

    const card = cardResult.rows[0];
    const billingCardName = `${card.name} ending ${card.last4}`;

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
        input.id,
        input.name,
        input.monthlyPrice,
        billingCardName,
        input.cardId,
        input.status,
        input.renewalDate,
      ]
    );

    await dbPool.query(
      `UPDATE cards
       SET monthly_total = monthly_total + $1,
           active_subscriptions_count = active_subscriptions_count + 1
       WHERE id = $2`,
      [input.monthlyPrice, input.cardId]
    );

    await dbPool.query('COMMIT');

    const createdSubscription = await getSubscriptionById(input.id);

    if (!createdSubscription) {
      throw new Error('Created subscription could not be loaded');
    }

    return { ok: true, item: createdSubscription };
  } catch (error) {
    try {
      await dbPool.query('ROLLBACK');
    } catch {
      // no-op
    }

    throw error;
  }
}
