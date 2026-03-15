import { apiGet } from './client';
import { Subscription } from '../types/subscription';

type SubscriptionsResponse = {
  items: Subscription[];
  total: number;
};

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const data = await apiGet<SubscriptionsResponse>('/subscriptions');
  return data.items;
}
