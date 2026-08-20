import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt.config';
import { User } from '../types/api.types';

/**
 * Extend Express Request to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded as User;
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid or expired token';
    res.status(401).json({ success: false, message: errorMessage });
  }
};