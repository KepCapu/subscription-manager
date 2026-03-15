import { API_BASE_URL } from '../config/api';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(API_BASE_URL + path);

  if (!response.ok) {
    throw new Error('API error: ' + path + ' returned ' + response.status);
  }

  return (await response.json()) as T;
}
