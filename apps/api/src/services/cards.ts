import { dbPool } from '../db/pool';
import { Card } from '../types/card';
import { Subscription } from '../types/subscription';
import { CardDetails } from '../types/cardDetails';

type CardRow = {
  id: string;
  name: string;
  last4: string;
  monthly_total: string;
  active_subscriptions_count: number;
};

type SubscriptionRow = {
  id: string;
  name: string;
  monthly_price: string;
  billing_card_name: string;
  card_id: string | null;
  status: string;
  renewal_date: string | null;
};

function mapCardRow(row: CardRow): Card {
  return {
    id: row.id,
    name: row.name,
    last4: row.last4,
    monthlyTotal: Number(row.monthly_total),
    activeSubscriptionsCount: row.active_subscriptions_count,
  };
}

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

export async function getAllCards(): Promise<Card[]> {
  const result = await dbPool.query<CardRow>(
    'SELECT id, name, last4, monthly_total, active_subscriptions_count FROM cards ORDER BY name ASC'
  );

  return result.rows.map(mapCardRow);
}

export async function getCardById(id: string): Promise<Card | null> {
  const result = await dbPool.query<CardRow>(
    'SELECT id, name, last4, monthly_total, active_subscriptions_count FROM cards WHERE id = $1 LIMIT 1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapCardRow(result.rows[0]);
}

export async function getCardDetailsById(id: string): Promise<CardDetails | null> {
  const card = await getCardById(id);

  if (!card) {
    return null;
  }

  const subscriptionsResult = await dbPool.query<SubscriptionRow>(
    'SELECT id, name, monthly_price, billing_card_name, card_id, status, renewal_date::text AS renewal_date FROM subscriptions WHERE card_id = $1 ORDER BY name ASC',
    [card.id]
  );

  return {
    ...card,
    subscriptions: subscriptionsResult.rows.map(mapSubscriptionRow),
  };
}
