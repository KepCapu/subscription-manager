import { Router } from 'express';
import {
  confirmSubscriptionCandidate,
  createSubscriptionCandidate,
  getSubscriptionCandidates,
  updateSubscriptionCandidateStatus,
} from '../services/subscriptionCandidates';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const detectedStatus =
      typeof req.query.status === 'string' && req.query.status.trim()
        ? req.query.status.trim()
        : undefined;

    const items = await getSubscriptionCandidates(detectedStatus);

    res.json({
      items,
      total: items.length,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      id,
      emailAccountId,
      syncRunId,
      sourceMessageId,
      rawFrom,
      rawSubject,
      merchantName,
      subscriptionName,
      amount,
      currency,
      detectedCardLast4,
      detectedChargeDate,
      detectedRenewalDate,
      detectedStatus,
      sourceLanguage,
      sourceCountry,
      confidence,
    } = req.body ?? {};

    if (!id || !emailAccountId || !sourceMessageId) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'id, emailAccountId, and sourceMessageId are required',
      });
      return;
    }

    const item = await createSubscriptionCandidate({
      id,
      emailAccountId,
      syncRunId,
      sourceMessageId,
      rawFrom,
      rawSubject,
      merchantName,
      subscriptionName,
      amount,
      currency,
      detectedCardLast4,
      detectedChargeDate,
      detectedRenewalDate,
      detectedStatus,
      sourceLanguage,
      sourceCountry,
      confidence,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/confirm', async (req, res, next) => {
  try {
    const result = await confirmSubscriptionCandidate(req.params.id);

    if (!result.ok) {
      if (result.reason === 'SUBSCRIPTION_CANDIDATE_NOT_FOUND') {
        res.status(404).json({
          error: result.reason,
          message: 'Subscription candidate not found',
        });
        return;
      }

      if (
        result.reason === 'CANDIDATE_MISSING_REQUIRED_FIELDS' ||
        result.reason === 'CARD_NOT_FOUND'
      ) {
        res.status(400).json({
          error: result.reason,
          message: result.reason,
        });
        return;
      }

      if (result.reason === 'SUBSCRIPTION_ALREADY_CREATED') {
        res.status(409).json({
          error: result.reason,
          message: 'Subscription already created from this candidate',
        });
        return;
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { detectedStatus } = req.body ?? {};

    if (!detectedStatus) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'detectedStatus is required',
      });
      return;
    }

    const item = await updateSubscriptionCandidateStatus(
      req.params.id,
      String(detectedStatus)
    );

    if (!item) {
      res.status(404).json({
        error: 'SUBSCRIPTION_CANDIDATE_NOT_FOUND',
        message: 'Subscription candidate not found',
      });
      return;
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
