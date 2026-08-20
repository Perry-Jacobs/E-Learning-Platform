import { Router } from 'express';
import {
  getDiscussionsByCourse,
  getDiscussionById,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addReply,
  deleteReply,
} from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

/**
 * Public discussion routes (read-only)
 */
router.get('/course/:courseId', getDiscussionsByCourse);
router.get('/:id', getDiscussionById);

/**
 * Protected discussion routes (require authentication)
 */
router.use(authenticate);

/**
 * Discussion CRUD operations
 */
router.post('/', createDiscussion);
router.put('/:id', updateDiscussion);
router.delete('/:id', deleteDiscussion);

/**
 * Reply operations
 */
router.post('/reply', addReply);
router.delete('/reply/:id', deleteReply);

export default router;