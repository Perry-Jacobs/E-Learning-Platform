/**
 * Database Configuration
 * Re-exports from db/index.ts to keep config centralized
 */

import { db, pool, type DB } from '../db';

export { db, pool, type DB };

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    const err = error as Error;
    console.error('Database connection failed:', err.message);
    return false;
  }
}

/**
 * Get database connection status
 */
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  timestamp: string;
}> {
  try {
    await pool.query('SELECT 1');
    return {
      connected: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connected: false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get database version
 */
export async function getDatabaseVersion(): Promise<string | null> {
  try {
    const result = await pool.query('SELECT version()');
    return result.rows[0]?.version || null;
  } catch (error) {
    const err = error as Error;
    console.error('Error getting database version:', err.message);
    return null;
  }
}

export default db;