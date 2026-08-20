import type { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Catches and formats all errors consistently
 */
export const errorHandler = (
  err: any,
  _: Request,
  res: Response,
  __: NextFunction
): void => {
  console.error('Error:', err.stack || err.message);

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  const response: any = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found middleware
 * Handles routes that don't exist
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};