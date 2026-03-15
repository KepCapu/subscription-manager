import { Subscription } from './subscription';
import { Card } from './card';

export type OverviewData = {
  totalMonthlyCost: number;
  activeSubscriptions: number;
  upcomingRenewals: number;
  possibleRecurring: number;
  topExpensive: Subscription[];
  linkedCards: Card[];
};
