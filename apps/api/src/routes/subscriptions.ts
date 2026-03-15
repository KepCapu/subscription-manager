import { Router } from 'express';
import { mockSubscriptions } from '../data/mockSubscriptions';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    items: mockSubscriptions,
    total: mockSubscriptions.length,
  });
});

export default router;
