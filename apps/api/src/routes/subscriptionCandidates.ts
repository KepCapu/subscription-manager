import { Router } from 'express';
import {
  confirmSubscriptionCandidate,
  createSubscriptionCandidate,
  getSubscriptionCandidateById,
  getSubscriptionCandidates,
  updateSubscriptionCandidateStatus,
  VALID_CANDIDATE_STATUSES,
} from '../services/subscriptionCandidates';

const router = Router();
const CANDIDATE_STATUS_VALIDATION_MESSAGE =
  'detectedStatus must be one of: possible_subscription, confirmed_subscription, one_time_purchase, ignored, uncertain';

router.get('/', async (req, res, next) => {
  try {
    const detectedStatus =
      typeof req.query.status === 'string' && req.query.status.trim()
        ? req.query.status.trim()
        : undefined;
    const emailAccountId =
      typeof req.query.emailAccountId === 'string' && req.query.emailAccountId.trim()
        ? req.query.emailAccountId.trim()
        : undefined;

    if (
      detectedStatus &&
      !VALID_CANDIDATE_STATUSES.includes(
        detectedStatus as (typeof VALID_CANDIDATE_STATUSES)[number]
      )
    ) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: CANDIDATE_STATUS_VALIDATION_MESSAGE,
      });
      return;
    }

    const filters: { detectedStatus?: string; emailAccountId?: string } = {};

    if (detectedStatus) {
      filters.detectedStatus = detectedStatus;
    }

    if (emailAccountId) {
      filters.emailAccountId = emailAccountId;
    }

    const items = await getSubscriptionCandidates(filters);

    res.json({
      items,
      total: items.length,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await getSubscriptionCandidateById(req.params.id);

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

    if (
      detectedStatus !== undefined &&
      !VALID_CANDIDATE_STATUSES.includes(
        String(detectedStatus) as (typeof VALID_CANDIDATE_STATUSES)[number]
      )
    ) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: CANDIDATE_STATUS_VALIDATION_MESSAGE,
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

    const nextDetectedStatus = String(detectedStatus);

    if (
      !VALID_CANDIDATE_STATUSES.includes(
        nextDetectedStatus as (typeof VALID_CANDIDATE_STATUSES)[number]
      )
    ) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: CANDIDATE_STATUS_VALIDATION_MESSAGE,
      });
      return;
    }

    const item = await updateSubscriptionCandidateStatus(
      req.params.id,
      nextDetectedStatus
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
