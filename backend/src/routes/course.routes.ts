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

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.use(authenticate);

router.get('/me', getMyCourses);
router.post('/:courseId/enroll', enrollCourse);

router.post('/', authorize('lecturer', 'admin'), createCourse);
router.put('/:id', authorize('lecturer', 'admin'), updateCourse);
router.delete('/:id', authorize('lecturer', 'admin'), deleteCourse);

export default router;