import { Router } from 'express';
import {
  createEmailAccount,
  getEmailAccounts,
  updateEmailAccountStatus,
  VALID_EMAIL_ACCOUNT_STATUSES,
} from '../services/emailAccounts';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const items = await getEmailAccounts();

    res.json({
      items,
      total: items.length,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, email, provider, status } = req.body ?? {};

    if (!id || !email || !provider) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'id, email, and provider are required',
      });
      return;
    }

    const item = await createEmailAccount({
      id,
      email,
      provider,
      status,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body ?? {};

    if (!status) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'status is required',
      });
      return;
    }

    const nextStatus = String(status);

    if (!VALID_EMAIL_ACCOUNT_STATUSES.includes(nextStatus as (typeof VALID_EMAIL_ACCOUNT_STATUSES)[number])) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'status must be one of: active, inactive',
      });
      return;
    }

    const item = await updateEmailAccountStatus(req.params.id, nextStatus);

    if (!item) {
      res.status(404).json({
        error: 'EMAIL_ACCOUNT_NOT_FOUND',
        message: 'Email account not found',
      });
      return;
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
