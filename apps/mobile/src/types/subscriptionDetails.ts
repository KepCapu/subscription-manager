import { Subscription } from './subscription';
import { Card } from './card';

export type SubscriptionDetails = Subscription & {
  billingCard: Card | null;
};
