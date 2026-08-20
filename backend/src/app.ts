import express, { Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import { generalRateLimiter } from './config/rate-limit.config';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimiter);

// Test route
app.get('/', (_: Request, res: Response) => {  // 👈 Note the types
  res.status(200).json({ 
    success: true, 
    message: 'E-Learning API is running!' 
  });
});

import routes from './routes';  // ✅ Now includes all 7 route modules
app.use('/api', routes);

// Error handling middleware
app.use((err: any, _: Request, res: Response, __: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

export default app;