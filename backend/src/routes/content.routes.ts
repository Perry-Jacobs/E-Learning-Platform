import { Router } from 'express';
import {
  getAllContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

router.get('/', getAllContents);
router.get('/:id', getContentById);

router.use(authenticate);
router.post('/', authorize('lecturer', 'admin'), createContent);
router.put('/:id', authorize('lecturer', 'admin'), updateContent);
router.delete('/:id', authorize('lecturer', 'admin'), deleteContent);

export default router;