import { apiGet } from './client';
import { Card } from '../types/card';

type CardsResponse = {
  items: Card[];
  total: number;
};

export async function fetchCards(): Promise<Card[]> {
  const data = await apiGet<CardsResponse>('/cards');
  return data.items;
}
