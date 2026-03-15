import { apiGet } from './client';
import { OverviewData } from '../types/overview';

export async function fetchOverview(): Promise<OverviewData> {
  return await apiGet<OverviewData>('/overview');
}
