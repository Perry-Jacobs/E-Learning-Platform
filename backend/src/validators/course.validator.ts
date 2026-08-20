import { z } from 'zod';

/**
 * Validation schema for creating a new course
 * Validates course details including title, description, level, and pricing
 */
export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    category: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    thumbnail_url: z.string().url('Invalid URL format').optional(),
  }),
});

/**
 * Validation schema for updating an existing course
 * Validates course ID in params and optional update fields in body
 */
export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID format'),
  }),
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    thumbnail_url: z.string().url('Invalid URL format').optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});

/**
 * Validation schema for course enrollment
 * Validates course ID format in params
 */
export const enrollCourseSchema = z.object({
  params: z.object({
    courseId: z.string().uuid('Invalid course ID format'),
  }),
});