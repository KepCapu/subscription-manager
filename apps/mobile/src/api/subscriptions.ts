import { apiGet } from './client';
import { Subscription } from '../types/subscription';
import { SubscriptionDetails } from '../types/subscriptionDetails';
import { ListResponse } from '../types/listResponse';

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const data = await apiGet<ListResponse<Subscription>>('/subscriptions');
  return data.items;
}

export async function fetchSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetails> {
  return apiGet<SubscriptionDetails>(`/subscriptions/${subscriptionId}/details`);
}
