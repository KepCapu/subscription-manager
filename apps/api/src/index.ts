import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subscriptionsRouter from './routes/subscriptions';
import cardsRouter from './routes/cards';
import overviewRouter from './routes/overview';
import emailAccountsRouter from './routes/emailAccounts';
import subscriptionCandidatesRouter from './routes/subscriptionCandidates';
import { errorHandler } from './middleware/errorHandler';
import { dbPool } from './db/pool';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'subscription-manager-api' });
});

app.get('/health/db', async (_req, res) => {
  try {
    const result = await dbPool.query('SELECT NOW() as now');

    res.json({
      status: 'ok',
      database: 'connected',
      now: result.rows[0].now,
    });
  } catch (error) {
    console.error('DB health check failed:', error);

    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: 'Could not connect to PostgreSQL',
    });
  }
});

app.use('/subscriptions', subscriptionsRouter);
app.use('/cards', cardsRouter);
app.use('/overview', overviewRouter);
app.use('/email-accounts', emailAccountsRouter);
app.use('/subscription-candidates', subscriptionCandidatesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log('API running on port ' + PORT);
});
