import { apiGet, apiPatch, apiPost } from './client';
import { ListResponse } from '../types/listResponse';

export type SubscriptionCandidate = {
  id: string;
  emailAccountId: string;
  syncRunId: string | null;
  sourceMessageId: string;
  rawFrom: string | null;
  rawSubject: string | null;
  merchantName: string | null;
  subscriptionName: string | null;
  amount: number | null;
  currency: string | null;
  detectedCardLast4: string | null;
  detectedChargeDate: string | null;
  detectedRenewalDate: string | null;
  detectedStatus: string;
  sourceLanguage: string | null;
  sourceCountry: string | null;
  confidence: number;
  createdAt: string;
};

export type UpdateSubscriptionCandidateStatusPayload = {
  detectedStatus: string;
};

export type ConfirmSubscriptionCandidateResponse = {
  ok: true;
  subscriptionId: string;
};

export async function fetchSubscriptionCandidates(
  status?: string
): Promise<SubscriptionCandidate[]> {
  const suffix = status ? '?status=' + encodeURIComponent(status) : '';
  const data = await apiGet<ListResponse<SubscriptionCandidate>>(
    '/subscription-candidates' + suffix
  );
  return data.items;
}

export async function updateSubscriptionCandidateStatus(
  candidateId: string,
  payload: UpdateSubscriptionCandidateStatusPayload
): Promise<SubscriptionCandidate> {
  return apiPatch<SubscriptionCandidate, UpdateSubscriptionCandidateStatusPayload>(
    '/subscription-candidates/' + candidateId + '/status',
    payload
  );
}

export async function confirmSubscriptionCandidate(
  candidateId: string
): Promise<ConfirmSubscriptionCandidateResponse> {
  return apiPost<ConfirmSubscriptionCandidateResponse, Record<string, never>>(
    '/subscription-candidates/' + candidateId + '/confirm',
    {}
  );
}
