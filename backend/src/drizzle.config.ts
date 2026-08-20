import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the config with proper dialect
const config: Config = {
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql', // ✅ This is required
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
};

export default config;