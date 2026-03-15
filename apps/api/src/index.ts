import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subscriptionsRouter from './routes/subscriptions';
import cardsRouter from './routes/cards';
import overviewRouter from './routes/overview';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'subscription-manager-api' });
});

app.use('/subscriptions', subscriptionsRouter);
app.use('/cards', cardsRouter);
app.use('/overview', overviewRouter);

app.listen(PORT, () => {
  console.log('API running on port ' + PORT);
});
