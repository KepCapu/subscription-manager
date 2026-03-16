import { dbPool } from '../db/pool';
import { Subscription } from '../types/subscription';

type SubscriptionRow = {
  id: string;
  name: string;
  monthly_price: string;
  billing_card_name: string;
  status: string;
};

function mapSubscriptionRow(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    monthlyPrice: Number(row.monthly_price),
    billingCardName: row.billing_card_name,
    status: row.status,
  };
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const result = await dbPool.query<SubscriptionRow>(
    'SELECT id, name, monthly_price, billing_card_name, status FROM subscriptions ORDER BY name ASC'
  );

  return result.rows.map(mapSubscriptionRow);
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const result = await dbPool.query<SubscriptionRow>(
    'SELECT id, name, monthly_price, billing_card_name, status FROM subscriptions WHERE id = $1 LIMIT 1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapSubscriptionRow(result.rows[0]);
}
