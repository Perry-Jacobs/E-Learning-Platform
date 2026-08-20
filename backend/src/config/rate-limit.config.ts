import { RateLimitRequestHandler } from 'express-rate-limit';
import rateLimit from 'express-rate-limit';
import { constants } from './constants';

/**
 * General rate limiter
 */
export const generalRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: constants.rateLimit.WINDOW_MS,
  max: constants.rateLimit.MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for authentication
 */
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for file uploads
 */
export const uploadRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many uploads, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for API endpoints
 */
export const apiRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many API requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for specific IPs
 */
export const strictRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  general: generalRateLimiter,
  auth: authRateLimiter,
  upload: uploadRateLimiter,
  api: apiRateLimiter,
  strict: strictRateLimiter,
};