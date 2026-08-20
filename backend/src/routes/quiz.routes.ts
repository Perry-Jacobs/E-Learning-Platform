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

router.use(authenticate);

router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);
router.get('/:quizId/results', getQuizResults);

router.post('/:id/submit', submitQuizAttempt);

router.post('/', authorize('lecturer', 'admin'), createQuiz);
router.put('/:id', authorize('lecturer', 'admin'), updateQuiz);
router.delete('/:id', authorize('lecturer', 'admin'), deleteQuiz);

export default router;