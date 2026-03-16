import { mockSubscriptions } from '../data/mockSubscriptions';

export type OverviewMetrics = {
  totalMonthlyCost: number;
  activeSubscriptions: number;
  upcomingRenewals: number;
  possibleRecurring: number;
};

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const totalMonthlyCost = Number(
    mockSubscriptions.reduce((sum, item) => sum + item.monthlyPrice, 0).toFixed(2)
  );

  const activeSubscriptions = mockSubscriptions.length;

  // TODO: replace this placeholder logic with real renewal-date based computation
  // when subscriptions and charges are stored in PostgreSQL.
  const upcomingRenewals = Number(
    mockSubscriptions.slice(0, 2).reduce((sum, item) => sum + item.monthlyPrice, 0).toFixed(2)
  );

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
