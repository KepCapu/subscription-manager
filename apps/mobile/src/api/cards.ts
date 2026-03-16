import { apiGet } from './client';
import { Card } from '../types/card';
import { ListResponse } from '../types/listResponse';

export async function fetchCards(): Promise<Card[]> {
  const data = await apiGet<ListResponse<Card>>('/cards');
  return data.items;
}
