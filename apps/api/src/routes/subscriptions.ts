import { Router } from 'express';
import { getAllSubscriptions } from '../services/subscriptions';
import { ListResponse } from '../types/listResponse';
import { Subscription } from '../types/subscription';

const router = Router();

router.get('/', async (_req, res) => {
  const items = await getAllSubscriptions();

  const response: ListResponse<Subscription> = {
    items,
    total: items.length,
  };

  res.json(response);
});

export default router;
