/**
 * Database Configuration
 * Re-exports from db/index.ts to keep config centralized
 * This maintains compatibility with existing imports
 */

import { db, pool, type DB } from '../db';  // ✅ Correct path

// ============================================
// Export the database instance
// ============================================
export { db, pool, type DB };

// ============================================
// Test database connection
// ============================================
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// ============================================
// Get database connection status
// ============================================
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  timestamp: string;
}> {
  try {
    await pool.query('SELECT 1');
    return {
      connected: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connected: false,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// Get database version
// ============================================
export async function getDatabaseVersion(): Promise<string | null> {
  try {
    const result = await pool.query('SELECT version()');
    return result.rows[0]?.version || null;
  } catch (error) {
    console.error('Error getting database version:', error);
    return null;
  }
}

// ============================================
// Get database statistics
// ============================================
export async function getDatabaseStats(): Promise<{
  totalUsers?: number;
  totalCourses?: number;
  totalChapters?: number;
  totalQuizzes?: number;
  totalAssignments?: number;
} | null> {
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM chapters) as total_chapters,
        (SELECT COUNT(*) FROM quizzes) as total_quizzes,
        (SELECT COUNT(*) FROM assignments) as total_assignments
    `);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
}

// ============================================
// Export db as default for convenience
// ============================================
export default db;