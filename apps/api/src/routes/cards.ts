import { Router } from 'express';
import { getAllCards } from '../services/cards';

const router = Router();

router.get('/', async (_req, res) => {
  const cards = await getAllCards();

  res.json({
    items: cards,
    total: cards.length,
  });
});

export default router;
