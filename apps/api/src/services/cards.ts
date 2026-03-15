import { mockCards } from '../data/mockCards';
import { Card } from '../types/card';

export async function getAllCards(): Promise<Card[]> {
  return mockCards;
}
