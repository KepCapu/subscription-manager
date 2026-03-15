import { API_BASE_URL } from '../config/api';
import { Subscription } from '../types/subscription';

type SubscriptionsResponse = {
  items: Subscription[];
  total: number;
};

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const response = await fetch(API_BASE_URL + '/subscriptions');

  if (!response.ok) {
    throw new Error('Failed to fetch subscriptions');
  }

  const data = (await response.json()) as SubscriptionsResponse;
  return data.items;
}
