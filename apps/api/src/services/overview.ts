import { dbPool } from '../db/pool';

export type OverviewMetrics = {
  totalMonthlyCost: number;
  activeSubscriptions: number;
  upcomingRenewals: number;
  possibleRecurring: number;
};

type OverviewRow = {
  total_monthly_cost: string;
  active_subscriptions: string;
};

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const result = await dbPool.query<OverviewRow>(
    `SELECT
       COALESCE(SUM(monthly_price), 0)::text AS total_monthly_cost,
       COUNT(*)::text AS active_subscriptions
     FROM subscriptions
     WHERE status = 'Active'`
  );

  const row = result.rows[0];

  const totalMonthlyCost = Number(Number(row.total_monthly_cost).toFixed(2));
  const activeSubscriptions = Number(row.active_subscriptions);

  // TODO: replace this placeholder logic with real renewal-date based computation
  // when renewal dates are stored in PostgreSQL.
  const upcomingRenewals = 25.98;

  // TODO: replace this placeholder value with real recurring-detection logic
  // after recurring pattern analysis is implemented.
  const possibleRecurring = 2;

  return {
    totalMonthlyCost,
    activeSubscriptions,
    upcomingRenewals,
    possibleRecurring,
  };
}
