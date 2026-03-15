import { Router } from 'express';
import { buildOverviewMetrics } from '../services/overview';

const router = Router();

router.get('/', (_req, res) => {
  res.json(buildOverviewMetrics());
});

export default router;
