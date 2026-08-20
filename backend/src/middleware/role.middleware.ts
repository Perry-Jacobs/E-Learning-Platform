import type { Request, Response, NextFunction } from 'express';

/**
 * Role-based authorization middleware factory
 * @param roles - List of roles allowed to access the route
 * @returns Middleware function that checks user role
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    next();
  };
};