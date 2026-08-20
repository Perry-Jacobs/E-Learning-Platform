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

/**
 * All assignment routes require authentication
 */
router.use(authenticate);

/**
 * Public assignment routes (accessible to authenticated users)
 */
router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);
router.post('/:id/submit', submitAssignment);

/**
 * Protected assignment routes (lecturer and admin only)
 */
router.post('/', authorize('lecturer', 'admin'), createAssignment);
router.put('/:id', authorize('lecturer', 'admin'), updateAssignment);
router.delete('/:id', authorize('lecturer', 'admin'), deleteAssignment);

export default router;