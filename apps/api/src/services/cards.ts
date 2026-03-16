import { dbPool } from '../db/pool';
import { Card } from '../types/card';

type CardRow = {
  id: string;
  name: string;
  last4: string;
  monthly_total: string;
  active_subscriptions_count: number;
};

export async function getAllCards(): Promise<Card[]> {
  const result = await dbPool.query<CardRow>(
    'SELECT id, name, last4, monthly_total, active_subscriptions_count FROM cards ORDER BY name ASC'
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    last4: row.last4,
    monthlyTotal: Number(row.monthly_total),
    activeSubscriptionsCount: row.active_subscriptions_count,
  }));
}
