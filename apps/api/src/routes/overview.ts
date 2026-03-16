import { Router } from 'express';
import { getOverviewMetrics } from '../services/overview';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const metrics = await getOverviewMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

export default router;
