import { Request, Response } from 'express';
import { AuthService, NotificationService } from '../services';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    const { user, tokens } = await AuthService.register({ email, password, name, role });

    NotificationService.sendWelcomeEmail(email, name).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      ...tokens,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

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
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, message: error.message });
  }
};

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
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(404).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: _refreshToken } = req.body;
    res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
};

export const logout = async (_: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};