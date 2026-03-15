import { Router } from 'express';
import { buildOverviewMetrics } from '../services/overview';

const router = Router();

router.get('/', async (_req, res) => {
  const metrics = await buildOverviewMetrics();
  res.json(metrics);
});

export default router;
