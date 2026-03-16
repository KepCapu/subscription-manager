import { dbPool } from '../db/pool';
import { Card } from '../types/card';

type CardRow = {
  id: string;
  name: string;
  last4: string;
  monthly_total: string;
  active_subscriptions_count: number;
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
