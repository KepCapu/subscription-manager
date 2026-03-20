import { Router } from 'express';
import { dbPool } from '../db/pool';
import { exchangeGmailCode, getGmailAuthUrl, saveGmailTokens } from '../services/gmailAuth';

type EmailAccountIdRow = {
  id: string;
};

function createEmailAccountId(email: string) {
  const slug = email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return 'email-' + slug + '-' + Date.now().toString().slice(-6);
}

const router = Router();

router.get('/gmail', (req, res) => {
  const state = typeof req.query.state === 'string' ? req.query.state : undefined;
  const authUrl = getGmailAuthUrl(state);
  res.redirect(authUrl);
});

router.get('/gmail/callback', async (req, res, next) => {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';

    if (!code) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'code is required',
      });
      return;
    }

    const { accessToken, refreshToken, expiresIn, email } = await exchangeGmailCode(code);

    let emailAccountId: string;
    const existingResult = await dbPool.query<EmailAccountIdRow>(
      `SELECT id
       FROM email_accounts
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    if (existingResult.rows.length > 0) {
      emailAccountId = existingResult.rows[0].id;
    } else {
      emailAccountId = createEmailAccountId(email);

      const createdResult = await dbPool.query<EmailAccountIdRow>(
        `INSERT INTO email_accounts (
           id,
           email,
           provider,
           status
         )
         VALUES ($1, $2, 'gmail', 'active')
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [emailAccountId, email]
      );

      if (createdResult.rows.length === 0) {
        const fallbackResult = await dbPool.query<EmailAccountIdRow>(
          `SELECT id
           FROM email_accounts
           WHERE LOWER(email) = LOWER($1)
           LIMIT 1`,
          [email]
        );

        if (fallbackResult.rows.length === 0) {
          throw new Error('Failed to create or load Gmail email account');
        }

        emailAccountId = fallbackResult.rows[0].id;
      } else {
        emailAccountId = createdResult.rows[0].id;
      }
    }

    await saveGmailTokens(emailAccountId, accessToken, refreshToken, expiresIn);

    res
      .status(200)
      .type('html')
      .send('<html><body><h1>Gmail connected! You can close this window.</h1></body></html>');
  } catch (error) {
    next(error);
  }
});

export default router;
