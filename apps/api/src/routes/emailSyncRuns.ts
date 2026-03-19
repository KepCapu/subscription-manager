import { Router } from 'express';
import {
  getSyncRunById,
  getSyncRuns,
  getSyncRunsByEmailAccountId,
} from '../services/emailSyncRuns';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const emailAccountId =
      typeof req.query.emailAccountId === 'string' && req.query.emailAccountId.trim()
        ? req.query.emailAccountId.trim()
        : undefined;

    const items = emailAccountId
      ? await getSyncRunsByEmailAccountId(emailAccountId)
      : await getSyncRuns();

    res.json({
      items,
      total: items.length,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await getSyncRunById(req.params.id);

    if (!item) {
      res.status(404).json({
        error: 'EMAIL_SYNC_RUN_NOT_FOUND',
        message: 'Email sync run not found',
      });
      return;
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
