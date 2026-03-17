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

type ExistingSubscriptionRow = {
  id: string;
  name: string;
  monthly_price: string;
  billing_card_name: string;
  card_id: string;
  status: string;
  renewal_date: string | null;
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

export type UpdateSubscriptionInput = {
  name?: string;
  monthlyPrice?: number;
  cardId?: string;
  status?: string;
  renewalDate?: string | null;
};

export type UpdateSubscriptionResult =
  | { ok: true; item: Subscription }
  | { ok: false; reason: 'SUBSCRIPTION_NOT_FOUND' | 'CARD_NOT_FOUND' };

export type DeleteSubscriptionResult =
  | { ok: true }
  | { ok: false; reason: 'SUBSCRIPTION_NOT_FOUND' };

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

export async function updateSubscription(
  id: string,
  input: UpdateSubscriptionInput
): Promise<UpdateSubscriptionResult> {
  await dbPool.query('BEGIN');

  try {
    const existingResult = await dbPool.query<ExistingSubscriptionRow>(
      `SELECT id, name, monthly_price, billing_card_name, card_id, status, renewal_date::text AS renewal_date
       FROM subscriptions
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'SUBSCRIPTION_NOT_FOUND' };
    }

    const existing = existingResult.rows[0];

    const nextName = input.name ?? existing.name;
    const nextMonthlyPrice = input.monthlyPrice ?? Number(existing.monthly_price);
    const nextCardId = input.cardId ?? existing.card_id;
    const nextStatus = input.status ?? existing.status;
    const nextRenewalDate =
      input.renewalDate !== undefined ? input.renewalDate : existing.renewal_date;

    const targetCardResult = await dbPool.query<CardRow>(
      `SELECT id, name, last4, monthly_total, active_subscriptions_count
       FROM cards
       WHERE id = $1
       LIMIT 1`,
      [nextCardId]
    );

    if (targetCardResult.rows.length === 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'CARD_NOT_FOUND' };
    }

    const targetCard = targetCardResult.rows[0];
    const nextBillingCardName = `${targetCard.name} ending ${targetCard.last4}`;
    const previousMonthlyPrice = Number(existing.monthly_price);

    await dbPool.query(
      `UPDATE subscriptions
       SET name = $2,
           monthly_price = $3,
           billing_card_name = $4,
           card_id = $5,
           status = $6,
           renewal_date = $7::date
       WHERE id = $1`,
      [
        id,
        nextName,
        nextMonthlyPrice,
        nextBillingCardName,
        nextCardId,
        nextStatus,
        nextRenewalDate,
      ]
    );

    if (existing.card_id === nextCardId) {
      const monthlyDelta = nextMonthlyPrice - previousMonthlyPrice;

      if (monthlyDelta !== 0) {
        await dbPool.query(
          `UPDATE cards
           SET monthly_total = monthly_total + $1
           WHERE id = $2`,
          [monthlyDelta, nextCardId]
        );
      }
    } else {
      await dbPool.query(
        `UPDATE cards
         SET monthly_total = monthly_total - $1,
             active_subscriptions_count = active_subscriptions_count - 1
         WHERE id = $2`,
        [previousMonthlyPrice, existing.card_id]
      );

      await dbPool.query(
        `UPDATE cards
         SET monthly_total = monthly_total + $1,
             active_subscriptions_count = active_subscriptions_count + 1
         WHERE id = $2`,
        [nextMonthlyPrice, nextCardId]
      );
    }

    await dbPool.query('COMMIT');

    const updatedSubscription = await getSubscriptionById(id);

    if (!updatedSubscription) {
      throw new Error('Updated subscription could not be loaded');
    }

    return { ok: true, item: updatedSubscription };
  } catch (error) {
    try {
      await dbPool.query('ROLLBACK');
    } catch {
      // no-op
    }

    throw error;
  }
}

export async function deleteSubscription(id: string): Promise<DeleteSubscriptionResult> {
  await dbPool.query('BEGIN');

  try {
    const existingResult = await dbPool.query<ExistingSubscriptionRow>(
      `SELECT id, name, monthly_price, billing_card_name, card_id, status, renewal_date::text AS renewal_date
       FROM subscriptions
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      await dbPool.query('ROLLBACK');
      return { ok: false, reason: 'SUBSCRIPTION_NOT_FOUND' };
    }

    const existing = existingResult.rows[0];
    const previousMonthlyPrice = Number(existing.monthly_price);

    await dbPool.query(
      `DELETE FROM subscriptions
       WHERE id = $1`,
      [id]
    );

    await dbPool.query(
      `UPDATE cards
       SET monthly_total = monthly_total - $1,
           active_subscriptions_count = active_subscriptions_count - 1
       WHERE id = $2`,
      [previousMonthlyPrice, existing.card_id]
    );

    await dbPool.query('COMMIT');

    return { ok: true };
  } catch (error) {
    try {
      await dbPool.query('ROLLBACK');
    } catch {
      // no-op
    }

    throw error;
  }
}
