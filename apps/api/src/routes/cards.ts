import { Router } from 'express';
import { getAllCards, getCardById } from '../services/cards';
import { ListResponse } from '../types/listResponse';
import { Card } from '../types/card';
import { ApiErrorResponse } from '../types/apiError';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const items = await getAllCards();

    const response: ListResponse<Card> = {
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
    const item = await getCardById(req.params.id);

    if (!item) {
      const errorResponse: ApiErrorResponse = {
        error: 'Card not found',
        code: 'CARD_NOT_FOUND',
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
