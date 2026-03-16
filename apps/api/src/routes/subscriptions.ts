import { Router } from 'express';
import { getAllSubscriptions } from '../services/subscriptions';

const router = Router();

router.get('/', async (_req, res) => {
  const items = await getAllSubscriptions();

  res.json({
    items,
    total: items.length,
  });
});

export default router;
