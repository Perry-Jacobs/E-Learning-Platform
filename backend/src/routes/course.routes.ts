import { Router } from 'express';
import {
  getAllContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers';
import { authenticate, authorize } from '../middleware/auth.middleware'; // ✅ Import

const router = Router();

// Public read routes
router.get('/', getAllContents);
router.get('/:id', getContentById);

// Protected routes
router.use(authenticate); // ✅ All routes below require login
router.post('/', authorize('lecturer', 'admin'), createContent);
router.put('/:id', authorize('lecturer', 'admin'), updateContent);
router.delete('/:id', authorize('lecturer', 'admin'), deleteContent);

export default router;