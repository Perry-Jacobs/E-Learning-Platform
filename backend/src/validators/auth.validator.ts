import { z } from 'zod';

/**
 * Validation schema for user registration
 * Validates email format, password strength, and name requirements
 */
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['student', 'lecturer', 'admin']).optional(),
  }),
});

/**
 * Validation schema for user login
 * Validates email format and password
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

/**
 * Validation schema for refresh token
 * Validates that refresh token is provided
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});