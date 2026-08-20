import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { generateTokens } from '../config/jwt.config';
import { db } from '../config/database.config';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: Date;
}

// ============================================
// Register
// ============================================
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existing = await db.execute(
      sql`SELECT id FROM users WHERE email = ${email}`
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.execute(
      sql`
        INSERT INTO users (email, password, name, role) 
        VALUES (${email}, ${hashedPassword}, ${name}, ${role || 'student'}) 
        RETURNING id, email, name, role, created_at
      `
    );

    // ✅ FIX: Double cast through unknown
    const user = result.rows[0] as unknown as User;
    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      ...tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// ============================================
// Login
// ============================================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Get user with password
    const result = await db.execute(
      sql`
        SELECT id, email, name, role, password 
        FROM users 
        WHERE email = ${email}
      `
    );

    if (result.rows.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // ✅ FIX: Double cast through unknown
    const user = result.rows[0] as unknown as User & { password: string };

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Remove password from response
    delete (user as any).password;

    const tokens = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// ============================================
// Get Current User
// ============================================
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const result = await db.execute(
      sql`
        SELECT id, email, name, role, created_at 
        FROM users 
        WHERE id = ${req.user.id}
      `
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // ✅ FIX: Double cast through unknown
    const user = result.rows[0] as unknown as User;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user profile' });
  }
};

// ============================================
// Refresh Token
// ============================================
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    // TODO: Verify refresh token and generate new tokens
    res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
};

// ============================================
// Logout
// ============================================
export const logout = async (_: Request, res: Response): Promise<void> => {
  try {
    // TODO: Blacklist token or clear session
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};