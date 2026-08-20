import { Router } from 'express';
import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);
router.post('/:id/submit', submitAssignment);

router.post('/', authorize('lecturer', 'admin'), createAssignment);
router.put('/:id', authorize('lecturer', 'admin'), updateAssignment);
router.delete('/:id', authorize('lecturer', 'admin'), deleteAssignment);

export default router;