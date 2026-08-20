import { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.config';

interface Progress {
  id: string;
  user_id: string;
  course_id: string;
  content_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percentage: number;
  updated_at?: Date;
}

export const getUserProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (currentUserId !== userId && userRole !== 'admin') {
      res.status(403).json({ success: false, message: 'You can only view your own progress' });
      return;
    }

    const result = await db.execute(
      sql`
        SELECT p.*, c.title as content_title, c.type as content_type
        FROM progress p
        LEFT JOIN contents c ON p.content_id = c.id
        WHERE p.user_id = ${userId}
        ORDER BY p.updated_at DESC
      `
    );

    res.status(200).json({ 
      success: true, 
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress' });
  }
};

export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_id, content_id, status, percentage } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!course_id || !content_id || !status) {
      res.status(400).json({ success: false, message: 'Course ID, content ID, and status are required' });
      return;
    }

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status. Must be not_started, in_progress, or completed' });
      return;
    }

    if (percentage < 0 || percentage > 100) {
      res.status(400).json({ success: false, message: 'Percentage must be between 0 and 100' });
      return;
    }

    const enrollmentCheck = await db.execute(
      sql`
        SELECT id FROM enrollments 
        WHERE student_id = ${user_id} AND course_id = ${course_id}
      `
    );

    if (enrollmentCheck.rows.length === 0) {
      res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
      return;
    }

    const contentCheck = await db.execute(
      sql`
        SELECT id FROM contents 
        WHERE id = ${content_id} AND course_id = ${course_id}
      `
    );

    if (contentCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Content not found in this course' });
      return;
    }

    const result = await db.execute(
      sql`
        INSERT INTO progress (user_id, course_id, content_id, status, percentage, updated_at)
        VALUES (${user_id}, ${course_id}, ${content_id}, ${status}, ${percentage}, NOW())
        ON CONFLICT (user_id, content_id) 
        DO UPDATE SET status = ${status}, percentage = ${percentage}, updated_at = NOW()
        RETURNING *
      `
    );

    const progress = result.rows[0] as unknown as Progress;

    res.status(200).json({ 
      success: true, 
      message: 'Progress updated successfully', 
      data: progress 
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
};

export const getCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId } = req.params;
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (currentUserId !== userId && userRole !== 'admin') {
      res.status(403).json({ success: false, message: 'You can only view your own progress' });
      return;
    }

    const result = await db.execute(
      sql`
        SELECT p.*, c.title as content_title, c.type as content_type
        FROM progress p
        LEFT JOIN contents c ON p.content_id = c.id
        WHERE p.user_id = ${userId} AND p.course_id = ${courseId}
        ORDER BY p.updated_at DESC
      `
    );

    let overallProgress = 0;
    if (result.rows.length > 0) {
      const totalPercentage = result.rows.reduce((sum: number, row: any) => sum + row.percentage, 0);
      overallProgress = Math.round(totalPercentage / result.rows.length);
    }

    res.status(200).json({ 
      success: true, 
      data: {
        progressItems: result.rows,
        overallProgress: overallProgress,
        totalItems: result.rows.length,
        completedItems: result.rows.filter((row: any) => row.status === 'completed').length,
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course progress' });
  }
};

export const getCourseCompletionSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const result = await db.execute(
      sql`
        SELECT 
          c.id as course_id,
          c.title as course_title,
          COUNT(DISTINCT p.content_id) as completed_content,
          (
            SELECT COUNT(*) 
            FROM contents 
            WHERE course_id = c.id
          ) as total_content,
          AVG(p.percentage) as average_percentage
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.student_id = ${userId}
        LEFT JOIN progress p ON p.course_id = c.id AND p.user_id = ${userId} AND p.status = 'completed'
        WHERE e.student_id = ${userId}
        GROUP BY c.id, c.title
        ORDER BY c.title ASC
      `
    );

    const formattedData = result.rows.map((row: any) => ({
      course_id: row.course_id,
      course_title: row.course_title,
      completed_content: parseInt(row.completed_content) || 0,
      total_content: parseInt(row.total_content) || 0,
      progress_percentage: row.total_content > 0 
        ? Math.round((parseInt(row.completed_content) / parseInt(row.total_content)) * 100)
        : 0,
      average_percentage: Math.round(row.average_percentage || 0),
    }));

    res.status(200).json({ 
      success: true, 
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching course completion summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch completion summary' });
  }
};