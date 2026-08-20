import express, { Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import { generalRateLimiter } from './config/rate-limit.config';

const app = express();

/**
 * Configure Express middleware
 * - CORS: Cross-Origin Resource Sharing with configured options
 * - JSON: Parse JSON request bodies
 * - URL-encoded: Parse URL-encoded request bodies
 * - Rate Limiting: Apply general rate limiting to all routes
 */
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimiter);

/**
 * Health check endpoint
 * @route GET /
 * @returns {Object} 200 - Success response with API status
 */
app.get('/', (_: Request, res: Response) => {
  res.status(200).json({ 
    success: true, 
    message: 'E-Learning API is running!' 
  });
});

// Import and mount API routes
import routes from './routes';
app.use('/api', routes);

/**
 * Global error handling middleware
 * Catches any unhandled errors and returns a consistent error response
 */
app.use((err: any, _: Request, res: Response, __: any) => {
  console.error(`Error: ${err.stack}`);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

export default app;