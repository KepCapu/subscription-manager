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
  upcoming_renewals: string;
  possible_recurring: string;
};

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const result = await dbPool.query<OverviewRow>(
    `SELECT
       COALESCE(SUM(monthly_price) FILTER (WHERE status = 'Active'), 0)::text AS total_monthly_cost,
       COUNT(*) FILTER (WHERE status = 'Active')::text AS active_subscriptions,
       COALESCE(
         SUM(monthly_price) FILTER (
           WHERE status = 'Active'
             AND renewal_date IS NOT NULL
             AND renewal_date >= CURRENT_DATE
             AND renewal_date <= CURRENT_DATE + INTERVAL '7 days'
         ),
         0
       )::text AS upcoming_renewals,
       COUNT(*) FILTER (
         WHERE status = 'Active'
           AND renewal_date IS NOT NULL
       )::text AS possible_recurring
     FROM subscriptions`
  );

  const row = result.rows[0];

  return {
    totalMonthlyCost: Number(Number(row.total_monthly_cost).toFixed(2)),
    activeSubscriptions: Number(row.active_subscriptions),
    upcomingRenewals: Number(Number(row.upcoming_renewals).toFixed(2)),
    possibleRecurring: Number(row.possible_recurring),
  };
}
