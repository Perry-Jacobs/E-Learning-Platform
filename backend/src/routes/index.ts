import { Router } from 'express';
import authRoutes from './auth.routes';
import assignmentRoutes from './assignment.routes';
import contentRoutes from './content.routes';
import courseRoutes from './course.routes';
import quizRoutes from './quiz.routes';
import discussionRoutes from './discussion.routes';
import progressRoutes from './progress.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/contents', contentRoutes);
router.use('/courses', courseRoutes);
router.use('/quizzes', quizRoutes);
router.use('/discussions', discussionRoutes);
router.use('/progress', progressRoutes);

export default router;