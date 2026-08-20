import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.config';
import { generateTokens } from '../config/jwt.config';

/** User data structure for registration */
interface UserData {
  email: string;
  password: string;
  name: string;
  role?: string;
  created_at?: Date;
}

/**
 * Maps a database user row to the API user format
 * @param {any} row - Database row containing user data
 * @returns {Object} Formatted user object
 */
function toApiUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    role: row.role || 'student',
    created_at: row.created_at,
  };
}

/** Authentication service for user management */
export const AuthService = {
  /**
   * Registers a new user in the system
   * @param {UserData} userData - User registration data
   * @returns {Promise<Object>} Registered user and authentication tokens
   * @throws {Error} If email already exists or validation fails
   */
  register: async (userData: UserData) => {
    const { email, password, name, role } = userData;

    if (!email || !password || !name) {
      throw new Error('Name, email and password are required');
    }

    const existing = await db.execute(
      sql`SELECT id FROM users WHERE email = ${email}`
    );
    if (existing.rows.length > 0) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Restrict self-registration to student or lecturer roles only
    const safeRole = role === 'lecturer' ? 'lecturer' : 'student';

    const result = await db.execute(
      sql`
        INSERT INTO users (full_name, email, password, role)
        VALUES (${name}, ${email}, ${hashedPassword}, ${safeRole})
        RETURNING id, email, full_name, role, created_at
      `
    );

    const user = toApiUser(result.rows[0]);
    const tokens = generateTokens(user);

    return { user, tokens };
  },

  /**
   * Authenticates a user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authenticated user and tokens
   * @throws {Error} If credentials are invalid
   */
  login: async (email: string, password: string) => {
    const result = await db.execute(
      sql`
        SELECT id, email, full_name, role, password
        FROM users
        WHERE email = ${email}
      `
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const row = result.rows[0] as any;

    const isMatch = await bcrypt.compare(password, row.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const user = toApiUser(row);
    const tokens = generateTokens(user);
    return { user, tokens };
  },

  /**
   * Retrieves a user by their ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   * @throws {Error} If user is not found
   */
  getUserById: async (id: string) => {
    const result = await db.execute(
      sql`
        SELECT id, email, full_name, role, created_at
        FROM users
        WHERE id = ${id}
      `
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return toApiUser(result.rows[0]);
  },
};