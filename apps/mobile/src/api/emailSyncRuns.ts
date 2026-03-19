import { apiGet } from './client';
import { EmailSyncRun } from '../types/emailSyncRun';
import { ListResponse } from '../types/listResponse';

export async function fetchSyncRunsByEmailAccountId(
  emailAccountId: string
): Promise<EmailSyncRun[]> {
  const data = await apiGet<ListResponse<EmailSyncRun>>(
    '/email-sync-runs?emailAccountId=' + encodeURIComponent(emailAccountId)
  );
  return data.items;
}
