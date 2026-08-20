import { Router } from 'express';
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizResults,
} from '../controllers/quiz.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public read routes (any authenticated user can view)
router.use(authenticate);

router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);
router.get('/:quizId/results', getQuizResults);

// Student routes
router.post('/:id/submit', submitQuizAttempt);

// Instructor/Admin only routes
router.post('/', authorize('lecturer', 'admin'), createQuiz);
router.put('/:id', authorize('lecturer', 'admin'), updateQuiz);
router.delete('/:id', authorize('lecturer', 'admin'), deleteQuiz);

export default router;