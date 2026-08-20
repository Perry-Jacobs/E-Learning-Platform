import { Router } from 'express';
import {
  getUserProgress,
  updateProgress,
  getCourseProgress,
  getCourseCompletionSummary,
} from '../controllers';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All progress routes require authentication
router.use(authenticate);

router.get('/user/:userId', getUserProgress);
router.get('/course/:userId/:courseId', getCourseProgress);
router.post('/', updateProgress);
router.get('/summary', getCourseCompletionSummary);

export default router;