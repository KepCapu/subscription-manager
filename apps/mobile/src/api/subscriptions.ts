import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import { Subscription } from '../types/subscription';
import { SubscriptionDetails } from '../types/subscriptionDetails';
import { ListResponse } from '../types/listResponse';

export type CreateSubscriptionPayload = {
  id: string;
  name: string;
  monthlyPrice: number;
  cardId: string;
  status: string;
  renewalDate: string | null;
};

export type UpdateSubscriptionPayload = {
  name?: string;
  monthlyPrice?: number;
  cardId?: string;
  status?: string;
  renewalDate?: string | null;
};

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const data = await apiGet<ListResponse<Subscription>>('/subscriptions');
  return data.items;
}

export async function fetchSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetails> {
  return apiGet<SubscriptionDetails>(`/subscriptions/${subscriptionId}/details`);
}

export async function createSubscription(
  payload: CreateSubscriptionPayload
): Promise<Subscription> {
  return apiPost<Subscription, CreateSubscriptionPayload>('/subscriptions', payload);
}

export async function updateSubscription(
  subscriptionId: string,
  payload: UpdateSubscriptionPayload
): Promise<Subscription> {
  return apiPatch<Subscription, UpdateSubscriptionPayload>(
    `/subscriptions/${subscriptionId}`,
    payload
  );
}

export async function deleteSubscription(subscriptionId: string): Promise<void> {
  await apiDelete(`/subscriptions/${subscriptionId}`);
}
