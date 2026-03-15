import { Router } from 'express';
import { mockSubscriptions } from '../data/mockSubscriptions';
import { mockCards } from '../data/mockCards';

const router = Router();

router.get('/', (_req, res) => {
  const totalMonthlyCost = Number(
    mockSubscriptions.reduce((sum, item) => sum + item.monthlyPrice, 0).toFixed(2)
  );

  const activeSubscriptions = mockSubscriptions.length;

  const upcomingRenewals = Number(
    mockSubscriptions.slice(0, 2).reduce((sum, item) => sum + item.monthlyPrice, 0).toFixed(2)
  );

  const possibleRecurring = 2;

  const topExpensive = [...mockSubscriptions]
    .sort((a, b) => b.monthlyPrice - a.monthlyPrice)
    .slice(0, 3);

  res.json({
    totalMonthlyCost,
    activeSubscriptions,
    upcomingRenewals,
    possibleRecurring,
    topExpensive,
    linkedCards: mockCards,
  });
});

export default router;
