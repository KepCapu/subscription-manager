import { Pool, PoolConfig } from 'pg';
import { env } from '../config/env';

const config: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 10,
};

export const dbPool = new Pool(config);
