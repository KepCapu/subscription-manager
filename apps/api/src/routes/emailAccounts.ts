import { Router } from 'express';
import { createEmailAccount, getEmailAccounts } from '../services/emailAccounts';

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

export default router;
