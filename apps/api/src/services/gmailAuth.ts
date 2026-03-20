import { dbPool } from '../db/pool';
import { env } from '../config/env';

const GMAIL_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

type GoogleUserInfoResponse = {
  email?: string;
};

export function getGmailAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: env.GMAIL_CLIENT_ID,
    redirect_uri: env.GMAIL_REDIRECT_URI,
    response_type: 'code',
    scope: GMAIL_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });

  if (state) {
    params.set('state', state);
  }

  return `${GMAIL_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGmailCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  email: string;
}> {
  const tokenBody = new URLSearchParams({
    code,
    client_id: env.GMAIL_CLIENT_ID,
    client_secret: env.GMAIL_CLIENT_SECRET,
    redirect_uri: env.GMAIL_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const tokenResponse = await fetch(GMAIL_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenBody.toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange Gmail authorization code');
  }

  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenData.access_token || !tokenData.refresh_token || !tokenData.expires_in) {
    throw new Error('Google OAuth token response is missing required fields');
  }

  const userInfoResponse = await fetch(GMAIL_USER_INFO_URL, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error('Failed to fetch Gmail user info');
  }

  const userInfo = (await userInfoResponse.json()) as GoogleUserInfoResponse;

  if (!userInfo.email) {
    throw new Error('Google user info response is missing email');
  }

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    email: userInfo.email.trim().toLowerCase(),
  };
}

export async function saveGmailTokens(
  emailAccountId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> {
  await dbPool.query(
    `UPDATE email_accounts
     SET access_token = $2,
         refresh_token = $3,
         token_expires_at = NOW() + ($4 * INTERVAL '1 second'),
         updated_at = NOW()
     WHERE id = $1`,
    [emailAccountId, accessToken, refreshToken, expiresIn]
  );
}
