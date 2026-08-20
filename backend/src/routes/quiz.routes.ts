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
import { authenticate, authorize } from '../middleware';

const router = Router();

/**
 * All quiz routes require authentication
 */
router.use(authenticate);

/**
 * Quiz retrieval routes
 */
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);
router.get('/:quizId/results', getQuizResults);

/**
 * Quiz attempt routes
 */
router.post('/:id/submit', submitQuizAttempt);

/**
 * Quiz management routes (lecturer and admin only)
 */
router.post('/', authorize('lecturer', 'admin'), createQuiz);
router.put('/:id', authorize('lecturer', 'admin'), updateQuiz);
router.delete('/:id', authorize('lecturer', 'admin'), deleteQuiz);

export default router;