import { apiGet } from './client';
import { Subscription } from '../types/subscription';
import { ListResponse } from '../types/listResponse';

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const data = await apiGet<ListResponse<Subscription>>('/subscriptions');
  return data.items;
}
