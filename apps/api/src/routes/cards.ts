import { Router } from 'express';
import { getAllCards } from '../services/cards';

const router = Router();

router.get('/', async (_req, res) => {
  const items = await getAllCards();

  res.json({
    items,
    total: items.length,
  });
});

export default router;
