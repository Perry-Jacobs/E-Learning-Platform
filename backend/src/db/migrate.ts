import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../config/index';
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

/**
 * Run database migrations
 */
async function main() {
  try {
    console.log('Starting database migration...');
    
    await db.execute(sql`SELECT 1`);
    console.log('Database connection established');

    await migrate(db, { 
      migrationsFolder: './src/db/migrations',
    });
    
    console.log('Migrations completed successfully');
    console.log('Database schema is up to date');
    
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    console.error('Migration failed:', err.message);
    if (err.stack) {
      console.error('Stack trace:', err.stack);
    }
    process.exit(1);
  }
}

main();