import { Router } from 'express';
import {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionDetailsById,
} from '../services/subscriptions';
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

router.post('/', async (req, res, next) => {
  try {
    const body = req.body as Partial<{
      id: string;
      name: string;
      monthlyPrice: number;
      cardId: string;
      status: string;
      renewalDate: string | null;
    }>;

    if (
      typeof body.id !== 'string' ||
      body.id.trim() === '' ||
      typeof body.name !== 'string' ||
      body.name.trim() === '' ||
      typeof body.monthlyPrice !== 'number' ||
      Number.isNaN(body.monthlyPrice) ||
      typeof body.cardId !== 'string' ||
      body.cardId.trim() === '' ||
      typeof body.status !== 'string' ||
      body.status.trim() === ''
    ) {
      const errorResponse: ApiErrorResponse = {
        error: 'Invalid subscription payload',
        code: 'INVALID_SUBSCRIPTION_PAYLOAD',
      };

      res.status(400).json(errorResponse);
      return;
    }

    if (
      body.renewalDate !== undefined &&
      body.renewalDate !== null &&
      (typeof body.renewalDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.renewalDate))
    ) {
      const errorResponse: ApiErrorResponse = {
        error: 'Invalid renewalDate format',
        code: 'INVALID_RENEWAL_DATE',
      };

      res.status(400).json(errorResponse);
      return;
    }

    const result = await createSubscription({
      id: body.id.trim(),
      name: body.name.trim(),
      monthlyPrice: body.monthlyPrice,
      cardId: body.cardId.trim(),
      status: body.status.trim(),
      renewalDate: body.renewalDate ?? null,
    });

    if (!result.ok) {
      if (result.reason === 'CARD_NOT_FOUND') {
        const errorResponse: ApiErrorResponse = {
          error: 'Card not found',
          code: 'CARD_NOT_FOUND',
        };

        res.status(404).json(errorResponse);
        return;
      }

      if (result.reason === 'SUBSCRIPTION_ID_ALREADY_EXISTS') {
        const errorResponse: ApiErrorResponse = {
          error: 'Subscription id already exists',
          code: 'SUBSCRIPTION_ID_ALREADY_EXISTS',
        };

        res.status(409).json(errorResponse);
        return;
      }
    }

    res.status(201).json(result.item);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/details', async (req, res, next) => {
  try {
    const item = await getSubscriptionDetailsById(req.params.id);

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
