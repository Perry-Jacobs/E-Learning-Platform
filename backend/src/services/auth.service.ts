import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.config';
import { generateTokens } from '../config/jwt.config';

interface UserData {
  email: string;
  password: string;
  name: string;
  role?: string;
  created_at?: Date;
}

export const AuthService = {
  register: async (userData: UserData) => {
    const { email, password, name, role } = userData;

    const existing = await db.execute(
      sql`SELECT id FROM users WHERE email = ${email}`
    );
    if (existing.rows.length > 0) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.execute(
      sql`
        INSERT INTO users (email, password, name, role) 
        VALUES (${email}, ${hashedPassword}, ${name}, ${role || 'student'}) 
        RETURNING id, email, name, role, created_at
      `
    );

    const user = result.rows[0] as unknown as UserData & { id: string };

    const userWithRole = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'student',
      created_at: user.created_at,
    };

    const tokens = generateTokens(userWithRole);

    return { user: userWithRole, tokens };
  },

  login: async (email: string, password: string) => {
    const result = await db.execute(
      sql`
        SELECT id, email, name, role, password 
        FROM users 
        WHERE email = ${email}
      `
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0] as unknown as UserData & { id: string; password: string };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    delete (user as any).password;

    const userWithRole = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'student',
      created_at: user.created_at,
    };

    const tokens = generateTokens(userWithRole);
    return { user: userWithRole, tokens };
  },

  getUserById: async (id: string) => {
    const result = await db.execute(
      sql`
        SELECT id, email, name, role, created_at 
        FROM users 
        WHERE id = ${id}
      `
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0] as unknown as UserData & { id: string };

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'student',
      created_at: user.created_at,
    };
  },
};