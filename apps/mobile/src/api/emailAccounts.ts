import { apiGet, apiPatch, apiPost } from './client';
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

export type CreateEmailAccountPayload = {
  id: string;
  email: string;
  provider: string;
  status: string;
};

export type UpdateEmailAccountStatusPayload = {
  status: string;
};

export async function fetchEmailAccounts(): Promise<EmailAccount[]> {
  const data = await apiGet<ListResponse<EmailAccount>>('/email-accounts');
  return data.items;
}

export async function createEmailAccount(
  payload: CreateEmailAccountPayload
): Promise<EmailAccount> {
  return apiPost<EmailAccount, CreateEmailAccountPayload>('/email-accounts', payload);
}

export async function updateEmailAccountStatus(
  emailAccountId: string,
  payload: UpdateEmailAccountStatusPayload
): Promise<EmailAccount> {
  return apiPatch<EmailAccount, UpdateEmailAccountStatusPayload>(
    '/email-accounts/' + emailAccountId + '/status',
    payload
  );
}
