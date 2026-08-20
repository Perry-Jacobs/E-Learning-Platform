import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL connection pool
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err: Error & { code?: string }) => {
  console.error('PostgreSQL connection error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection refused. Please check if PostgreSQL is running.');
  }
});

/**
 * Drizzle ORM instance
 */
export const db = drizzle(pool, { schema });

export type DB = typeof db;