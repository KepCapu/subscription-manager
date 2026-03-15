import { Router } from 'express';
import { getAllSubscriptions } from '../services/subscriptions';

const router = Router();

router.get('/', async (_req, res) => {
  const subscriptions = await getAllSubscriptions();

  res.json({
    items: subscriptions,
    total: subscriptions.length,
  });
});

export default router;
