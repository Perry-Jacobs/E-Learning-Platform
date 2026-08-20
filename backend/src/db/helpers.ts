import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Check if database connection is active
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get database statistics - returns raw data
 */
export async function getDatabaseStats(): Promise<Record<string, any>> {
  try {
    const result = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'lecturer') as total_lecturers,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM courses WHERE is_published = true) as published_courses,
        (SELECT COUNT(*) FROM chapters) as total_chapters,
        (SELECT COUNT(*) FROM quizzes) as total_quizzes,
        (SELECT COUNT(*) FROM assignments) as total_assignments,
        (SELECT COUNT(*) FROM threads) as total_threads,
        (SELECT COUNT(*) FROM replies) as total_replies
    `);
    return result.rows[0] || {};
  } catch (error) {
    const err = error as Error;
    console.error('Error getting database stats:', err.message);
    return {};
  }
}

/**
 * Clear all database tables
 */
export async function clearDatabase(): Promise<void> {
  try {
    await db.execute(sql`
      TRUNCATE TABLE 
        users, 
        courses, 
        chapters, 
        quizzes, 
        assignments, 
        submissions, 
        progress, 
        threads, 
        replies 
      CASCADE;
    `);
    console.log('✅ Database cleared successfully');
  } catch (error) {
    const err = error as Error;
    console.error('Error clearing database:', err.message);
    throw error;
  }
}

/**
 * Get database size
 */
export async function getDatabaseSize(): Promise<string> {
  try {
    const result = await db.execute(sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `);
    const size = result.rows[0]?.size;
    return typeof size === 'string' ? size : '0 MB';
  } catch (error) {
    const err = error as Error;
    console.error('Error getting database size:', err.message);
    return 'Unknown';
  }
}

/**
 * Get table row counts
 */
export async function getTableCounts(): Promise<Record<string, number>> {
  try {
    const tables = [
      'users', 'courses', 'chapters', 'quizzes', 
      'assignments', 'submissions', 'progress', 'threads', 'replies'
    ];
    
    const counts: Record<string, number> = {};
    
    for (const table of tables) {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM ${sql.identifier(table)};
      `);
      const count = result.rows[0]?.count;
      counts[table] = typeof count === 'string' ? parseInt(count, 10) : 0;
    }
    
    return counts;
  } catch (error) {
    const err = error as Error;
    console.error('Error getting table counts:', err.message);
    return {};
  }
}

/**
 * Database stats interface
 */
export interface DatabaseStats {
  total_users: number;
  total_students: number;
  total_lecturers: number;
  total_courses: number;
  published_courses: number;
  total_chapters: number;
  total_quizzes: number;
  total_assignments: number;
  total_threads: number;
  total_replies: number;
}

/**
 * Get database statistics with proper typing - converts string values to numbers
 */
export async function getDatabaseStatsTyped(): Promise<DatabaseStats | null> {
  try {
    const result = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'lecturer') as total_lecturers,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM courses WHERE is_published = true) as published_courses,
        (SELECT COUNT(*) FROM chapters) as total_chapters,
        (SELECT COUNT(*) FROM quizzes) as total_quizzes,
        (SELECT COUNT(*) FROM assignments) as total_assignments,
        (SELECT COUNT(*) FROM threads) as total_threads,
        (SELECT COUNT(*) FROM replies) as total_replies
    `);
    
    const row = result.rows[0];
    if (!row) {
      return null;
    }

    // Convert string values to numbers
    const stats: DatabaseStats = {
      total_users: parseInt(String(row.total_users), 10),
      total_students: parseInt(String(row.total_students), 10),
      total_lecturers: parseInt(String(row.total_lecturers), 10),
      total_courses: parseInt(String(row.total_courses), 10),
      published_courses: parseInt(String(row.published_courses), 10),
      total_chapters: parseInt(String(row.total_chapters), 10),
      total_quizzes: parseInt(String(row.total_quizzes), 10),
      total_assignments: parseInt(String(row.total_assignments), 10),
      total_threads: parseInt(String(row.total_threads), 10),
      total_replies: parseInt(String(row.total_replies), 10),
    };

    return stats;
  } catch (error) {
    const err = error as Error;
    console.error('Error getting database stats:', err.message);
    return null;
  }
}

/**
 * Get database stats with camelCase keys
 */
export async function getDatabaseStatsCamelCase(): Promise<{
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  publishedCourses: number;
  totalChapters: number;
  totalQuizzes: number;
  totalAssignments: number;
  totalThreads: number;
  totalReplies: number;
} | null> {
  try {
    const stats = await getDatabaseStatsTyped();
    if (!stats) {
      return null;
    }

    return {
      totalUsers: stats.total_users,
      totalStudents: stats.total_students,
      totalLecturers: stats.total_lecturers,
      totalCourses: stats.total_courses,
      publishedCourses: stats.published_courses,
      totalChapters: stats.total_chapters,
      totalQuizzes: stats.total_quizzes,
      totalAssignments: stats.total_assignments,
      totalThreads: stats.total_threads,
      totalReplies: stats.total_replies,
    };
  } catch (error) {
    const err = error as Error;
    console.error('Error getting database stats:', err.message);
    return null;
  }
}