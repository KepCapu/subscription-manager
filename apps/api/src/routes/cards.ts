import { Router } from 'express';
import { mockCards } from '../data/mockCards';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    items: mockCards,
    total: mockCards.length,
  });
});

export default router;
