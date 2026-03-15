import { mockSubscriptions } from '../data/mockSubscriptions';
import { Subscription } from '../types/subscription';

export async function getAllSubscriptions(): Promise<Subscription[]> {
  return mockSubscriptions;
}
