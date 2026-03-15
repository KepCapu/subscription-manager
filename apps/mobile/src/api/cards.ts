import { API_BASE_URL } from '../config/api';
import { Card } from '../types/card';

type CardsResponse = {
  items: Card[];
  total: number;
};

export async function fetchCards(): Promise<Card[]> {
  const response = await fetch(API_BASE_URL + '/cards');

  if (!response.ok) {
    throw new Error('Failed to fetch cards');
  }

  const data = (await response.json()) as CardsResponse;
  return data.items;
}
