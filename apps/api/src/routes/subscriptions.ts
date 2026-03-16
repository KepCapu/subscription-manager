import { Router } from 'express';
import { getAllSubscriptions, getSubscriptionById } from '../services/subscriptions';
import { ListResponse } from '../types/listResponse';
import { Subscription } from '../types/subscription';
import { ApiErrorResponse } from '../types/apiError';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const items = await getAllSubscriptions();

    const response: ListResponse<Subscription> = {
      items,
      total: items.length,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await getSubscriptionById(req.params.id);

    if (!item) {
      const errorResponse: ApiErrorResponse = {
        error: 'Subscription not found',
        code: 'SUBSCRIPTION_NOT_FOUND',
      };

      res.status(404).json(errorResponse);
      return;
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
