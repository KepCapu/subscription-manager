import { Router } from 'express';
import { getOverviewMetrics } from '../services/overview';

const router = Router();

router.get('/', async (_req, res) => {
  const metrics = await getOverviewMetrics();
  res.json(metrics);
});

export default router;
