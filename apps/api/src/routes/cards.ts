import { Router } from 'express';
import { getAllCards } from '../services/cards';
import { ListResponse } from '../types/listResponse';
import { Card } from '../types/card';

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

export default router;
