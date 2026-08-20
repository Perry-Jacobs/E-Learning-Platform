import { Request, Response } from 'express';
import { AuthService, NotificationService } from '../services';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    const { user, tokens } = await AuthService.register({ email, password, name, role });

    // Send welcome email (non-blocking)
    NotificationService.sendWelcomeEmail(email, name).catch((error: Error) => {
      console.error('Failed to send welcome email:', error.message);
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      ...tokens,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Registration error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { user, tokens } = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      ...tokens,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Login error:', err.message);
    res.status(401).json({ success: false, message: err.message });
  }
};

/**
 * Get current user profile
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await AuthService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching user:', err.message);
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: _refreshToken } = req.body;
    // TODO: Implement proper refresh token logic
    res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    const err = error as Error;
    console.error('Token refresh error:', err.message);
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
};

/**
 * Logout user
 */
export const logout = async (_: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    const err = error as Error;
    console.error('Logout error:', err.message);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};