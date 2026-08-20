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

/**
 * Public content routes (read-only)
 */
router.get('/', getAllContents);
router.get('/:id', getContentById);

/**
 * Protected content routes (require authentication)
 */
router.use(authenticate);
router.post('/', authorize('lecturer', 'admin'), createContent);
router.put('/:id', authorize('lecturer', 'admin'), updateContent);
router.delete('/:id', authorize('lecturer', 'admin'), deleteContent);

export default router;