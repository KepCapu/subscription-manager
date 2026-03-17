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

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const result = await dbPool.query<SubscriptionRow>(
    'SELECT id, name, monthly_price, billing_card_name, card_id, status, renewal_date::text AS renewal_date FROM subscriptions ORDER BY name ASC'
  );

  return result.rows.map(mapSubscriptionRow);
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const result = await dbPool.query<SubscriptionRow>(
    'SELECT id, name, monthly_price, billing_card_name, card_id, status, renewal_date::text AS renewal_date FROM subscriptions WHERE id = $1 LIMIT 1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapSubscriptionRow(result.rows[0]);
}

export async function getSubscriptionDetailsById(id: string): Promise<SubscriptionDetails | null> {
  const subscriptionResult = await dbPool.query<SubscriptionRow>(
    'SELECT id, name, monthly_price, billing_card_name, card_id, status, renewal_date::text AS renewal_date FROM subscriptions WHERE id = $1 LIMIT 1',
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
