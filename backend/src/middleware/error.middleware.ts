import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _: Request,
  res: Response,
  __: NextFunction
): void => {
  console.error('Error:', err.stack || err.message);

  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};