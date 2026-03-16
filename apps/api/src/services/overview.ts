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

  const upcomingRenewals = Number(
    mockSubscriptions.slice(0, 2).reduce((sum, item) => sum + item.monthlyPrice, 0).toFixed(2)
  );

  const possibleRecurring = 2;

  return {
    totalMonthlyCost,
    activeSubscriptions,
    upcomingRenewals,
    possibleRecurring,
  };
}
