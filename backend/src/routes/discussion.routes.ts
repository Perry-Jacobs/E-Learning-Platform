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
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public read routes
router.get('/course/:courseId', getDiscussionsByCourse);
router.get('/:id', getDiscussionById);

// Protected routes (require authentication)
router.use(authenticate);

// Discussion CRUD
router.post('/', createDiscussion);
router.put('/:id', updateDiscussion);
router.delete('/:id', deleteDiscussion);

// Reply routes
router.post('/reply', addReply);
router.delete('/reply/:id', deleteReply);

export default router;