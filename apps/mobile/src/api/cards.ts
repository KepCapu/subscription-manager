import { apiGet } from './client';
import { Card } from '../types/card';
import { CardDetails } from '../types/cardDetails';
import { ListResponse } from '../types/listResponse';

export async function fetchCards(): Promise<Card[]> {
  const data = await apiGet<ListResponse<Card>>('/cards');
  return data.items;
}

export async function fetchCardDetails(cardId: string): Promise<CardDetails> {
  return apiGet<CardDetails>(`/cards/${cardId}/details`);
}
