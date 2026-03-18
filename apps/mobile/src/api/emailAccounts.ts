import { apiGet } from './client';
import { ListResponse } from '../types/listResponse';

export type EmailAccount = {
  id: string;
  email: string;
  provider: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};

export async function fetchEmailAccounts(): Promise<EmailAccount[]> {
  const data = await apiGet<ListResponse<EmailAccount>>('/email-accounts');
  return data.items;
}
