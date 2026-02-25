import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@/models/Schema';

import { Env } from './Env';

if (!Env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Add it to .env.local to connect to your Railway PostgreSQL database.',
  );
}

// Use a connection pool for PostgreSQL (Railway)
const pool = new Pool({
  connectionString: Env.DATABASE_URL,
  max: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
