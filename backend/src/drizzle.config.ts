import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Drizzle ORM configuration
 * Defines database schema, migration paths, and connection settings
 */
const config: Config = {
  // Path to schema files
  schema: './src/db/schema/*.ts',
  
  // Output directory for generated migrations
  out: './src/db/migrations',
  
  // Database dialect (PostgreSQL)
  dialect: 'postgresql',
  
  // Database connection credentials
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  
  // Enable verbose logging for debugging
  verbose: true,
  
  // Enable strict mode for better type safety
  strict: true,
};

export default config;