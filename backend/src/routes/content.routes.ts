import { Router } from 'express';
import {
  getAllContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from '../controllers';

const router = Router();
router.get('/', getAllContents);
router.get('/:id', getContentById);
router.post('/', createContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;