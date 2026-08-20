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

router.get('/course/:courseId', getDiscussionsByCourse);
router.get('/:id', getDiscussionById);

router.use(authenticate);

router.post('/', createDiscussion);
router.put('/:id', updateDiscussion);
router.delete('/:id', deleteDiscussion);

router.post('/reply', addReply);
router.delete('/reply/:id', deleteReply);

export default router;