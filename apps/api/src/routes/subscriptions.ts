import { Router } from 'express';
import {
  createSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionDetailsById,
  updateSubscription,
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

router.patch('/:id', async (req, res, next) => {
  try {
    const body = req.body as Partial<{
      name: string;
      monthlyPrice: number;
      cardId: string;
      status: string;
      renewalDate: string | null;
    }>;

    const hasAnyField =
      body.name !== undefined ||
      body.monthlyPrice !== undefined ||
      body.cardId !== undefined ||
      body.status !== undefined ||
      body.renewalDate !== undefined;

    if (!hasAnyField) {
      const errorResponse: ApiErrorResponse = {
        error: 'No fields to update',
        code: 'EMPTY_SUBSCRIPTION_PATCH',
      };

      res.status(400).json(errorResponse);
      return;
    }

    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      const errorResponse: ApiErrorResponse = {
        error: 'Invalid name',
        code: 'INVALID_SUBSCRIPTION_NAME',
      };

      res.status(400).json(errorResponse);
      return;
    }

    if (
      body.monthlyPrice !== undefined &&
      (typeof body.monthlyPrice !== 'number' || Number.isNaN(body.monthlyPrice))
    ) {
      const errorResponse: ApiErrorResponse = {
        error: 'Invalid monthlyPrice',
        code: 'INVALID_SUBSCRIPTION_MONTHLY_PRICE',
      };

      res.status(400).json(errorResponse);
      return;
    }

    if (
      body.cardId !== undefined &&
      (typeof body.cardId !== 'string' || body.cardId.trim() === '')
    ) {
      const errorResponse: ApiErrorResponse = {
        error: 'Invalid cardId',
        code: 'INVALID_SUBSCRIPTION_CARD_ID',
      };

      res.status(400).json(errorResponse);
      return;
    }

    if (
      body.status !== undefined &&
      (typeof body.status !== 'string' || body.status.trim() === '')
    ) {
      const errorResponse: ApiErrorResponse = {
        error: 'Invalid status',
        code: 'INVALID_SUBSCRIPTION_STATUS',
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

    const result = await updateSubscription(req.params.id, {
      name: body.name?.trim(),
      monthlyPrice: body.monthlyPrice,
      cardId: body.cardId?.trim(),
      status: body.status?.trim(),
      renewalDate: body.renewalDate,
    });

    if (!result.ok) {
      if (result.reason === 'SUBSCRIPTION_NOT_FOUND') {
        const errorResponse: ApiErrorResponse = {
          error: 'Subscription not found',
          code: 'SUBSCRIPTION_NOT_FOUND',
        };

        res.status(404).json(errorResponse);
        return;
      }

      if (result.reason === 'CARD_NOT_FOUND') {
        const errorResponse: ApiErrorResponse = {
          error: 'Card not found',
          code: 'CARD_NOT_FOUND',
        };

        res.status(404).json(errorResponse);
        return;
      }
    }

    res.json(result.item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteSubscription(req.params.id);

    if (!result.ok) {
      const errorResponse: ApiErrorResponse = {
        error: 'Subscription not found',
        code: 'SUBSCRIPTION_NOT_FOUND',
      };

      res.status(404).json(errorResponse);
      return;
    }

    res.status(204).send();
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
