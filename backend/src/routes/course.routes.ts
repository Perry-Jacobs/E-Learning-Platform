import { Router } from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyCourses,
} from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

/**
 * Public course routes (read-only)
 */
router.get('/', getAllCourses);

/**
 * IMPORTANT: '/me' must be registered BEFORE '/:id'
 * to avoid it being captured as an id parameter
 */
router.get('/me', authenticate, getMyCourses);
router.get('/:id', getCourseById);

/**
 * Protected course routes (require authentication)
 */
router.use(authenticate);

/**
 * Student-specific routes
 */
router.post('/:courseId/enroll', enrollCourse);

/**
 * Instructor/admin routes
 */
router.post('/', authorize('lecturer', 'admin'), createCourse);
router.put('/:id', authorize('lecturer', 'admin'), updateCourse);
router.delete('/:id', authorize('lecturer', 'admin'), deleteCourse);

export default router;