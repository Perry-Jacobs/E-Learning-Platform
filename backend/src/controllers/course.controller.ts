import { Request, Response } from 'express';
import { sql, SQL } from 'drizzle-orm';
import { db } from '../config/database.config';

// Define Course interface for type safety
interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  price: number | null;
  thumbnail_url: string | null;
  instructor_id: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
  instructor_name?: string;
}

// ============================================
// Get all courses (with optional filters)
// ============================================
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, level, status, instructorId } = req.query;
    
    // Build the base query
    let query = sql`
      SELECT c.*, u.name as instructor_name 
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
    `;
    
    // Build WHERE conditions dynamically
    const conditions: SQL[] = [];
    
    if (category) {
      conditions.push(sql`c.category = ${category}`);
    }
    if (level) {
      conditions.push(sql`c.level = ${level}`);
    }
    if (status) {
      conditions.push(sql`c.status = ${status}`);
    }
    if (instructorId) {
      conditions.push(sql`c.instructor_id = ${instructorId}`);
    }
    
    // Apply WHERE clause if there are conditions
    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`;
    }
    
    // Add ordering
    query = sql`${query} ORDER BY c.created_at DESC`;

    const result = await db.execute(query);
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};

// ============================================
// Get single course by ID
// ============================================
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.execute(
      sql`
        SELECT c.*, u.name as instructor_name 
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.id = ${id}
      `
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    const course = result.rows[0] as unknown as Course;

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch course' });
  }
};

// ============================================
// Create course (Instructor only)
// ============================================
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, level, price, thumbnail_url } = req.body;
    const instructor_id = req.user?.id;

    if (!instructor_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const result = await db.execute(
      sql`
        INSERT INTO courses (title, description, category, level, price, thumbnail_url, instructor_id, status)
        VALUES (${title}, ${description}, ${category}, ${level}, ${price}, ${thumbnail_url}, ${instructor_id}, 'draft')
        RETURNING *
      `
    );

    const course = result.rows[0] as unknown as Course;

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Failed to create course' });
  }
};

// ============================================
// Update course (Instructor or Admin only)
// ============================================
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, category, level, price, thumbnail_url, status } = req.body;
    const instructor_id = req.user?.id;
    const user_role = req.user?.role;

    if (!instructor_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Check if course exists and belongs to instructor (or user is admin)
    const checkResult = await db.execute(
      sql`SELECT instructor_id FROM courses WHERE id = ${id}`
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (checkResult.rows[0].instructor_id !== instructor_id && user_role !== 'admin') {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    const result = await db.execute(
      sql`
        UPDATE courses
        SET title = ${title}, description = ${description}, category = ${category}, 
            level = ${level}, price = ${price}, thumbnail_url = ${thumbnail_url}, 
            status = ${status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    );

    const course = result.rows[0] as unknown as Course;

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
};

// ============================================
// Delete course (Instructor or Admin only)
// ============================================
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const instructor_id = req.user?.id;
    const user_role = req.user?.role;

    if (!instructor_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const checkResult = await db.execute(
      sql`SELECT instructor_id FROM courses WHERE id = ${id}`
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (checkResult.rows[0].instructor_id !== instructor_id && user_role !== 'admin') {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    await db.execute(sql`DELETE FROM courses WHERE id = ${id}`);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
};

// ============================================
// Enroll in a course (Student only)
// ============================================
export const enrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const student_id = req.user?.id;

    if (!student_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Check if course exists
    const courseCheck = await db.execute(
      sql`SELECT id FROM courses WHERE id = ${courseId}`
    );

    if (courseCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    // Check if already enrolled
    const check = await db.execute(
      sql`SELECT id FROM enrollments WHERE student_id = ${student_id} AND course_id = ${courseId}`
    );

    if (check.rows.length > 0) {
      res.status(409).json({ success: false, message: 'Already enrolled in this course' });
      return;
    }

    await db.execute(
      sql`
        INSERT INTO enrollments (student_id, course_id, enrolled_at, status)
        VALUES (${student_id}, ${courseId}, NOW(), 'active')
      `
    );

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll in course' });
  }
};

// ============================================
// Get my enrolled courses (Student only)
// ============================================
export const getMyCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const student_id = req.user?.id;

    if (!student_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const result = await db.execute(
      sql`
        SELECT c.*, e.enrolled_at, e.status as enrollment_status
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = ${student_id}
        ORDER BY e.enrolled_at DESC
      `
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses' });
  }
};