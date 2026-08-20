import { Router } from 'express';
import { register, login, getMe, refreshToken, logout } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

/**
 * Public authentication routes
 */
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

/**
 * Protected route to get current user profile
 */
router.get('/me', authenticate, getMe);

export default router;