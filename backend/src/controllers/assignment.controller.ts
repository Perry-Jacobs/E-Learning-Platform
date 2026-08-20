import { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.config';

/**
 * Get all assignments with optional course filter
 */
export const getAllAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.query;
    let query = sql`SELECT * FROM assignments`;

    if (courseId) {
      query = sql`SELECT * FROM assignments WHERE course_id = ${courseId}`;
    }
    
    query = sql`${query} ORDER BY due_date ASC`;

    const result = await db.execute(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching assignments:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
};

/**
 * Get a single assignment by ID with course details
 */
export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const assignmentResult = await db.execute(
      sql`
        SELECT a.*, c.title as course_title 
        FROM assignments a
        LEFT JOIN courses c ON a.course_id = c.id
        WHERE a.id = ${id}
      `
    );

    if (assignmentResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    res.status(200).json({ success: true, data: assignmentResult.rows[0] });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching assignment:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch assignment' });
  }
};

/**
 * Create a new assignment (lecturer/admin only)
 */
export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, course_id, due_date, max_score } = req.body;
    const instructor_id = req.user?.id;

    if (!instructor_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const courseCheck = await db.execute(
      sql`SELECT instructor_id FROM courses WHERE id = ${course_id}`
    );

    if (courseCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    if (courseCheck.rows[0].instructor_id !== instructor_id) {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    const result = await db.execute(
      sql`
        INSERT INTO assignments (title, description, course_id, due_date, max_score, created_by)
        VALUES (${title}, ${description}, ${course_id}, ${due_date}, ${max_score}, ${instructor_id})
        RETURNING *
      `
    );

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error creating assignment:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create assignment' });
  }
};

/**
 * Update an existing assignment (lecturer/admin only)
 */
export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, due_date, max_score } = req.body;
    const instructor_id = req.user?.id;

    const checkResult = await db.execute(
      sql`
        SELECT a.*, c.instructor_id 
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE a.id = ${id}
      `
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    if (checkResult.rows[0].instructor_id !== instructor_id) {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    const result = await db.execute(
      sql`
        UPDATE assignments 
        SET title = ${title}, description = ${description}, 
            due_date = ${due_date}, max_score = ${max_score}, 
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    );

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error updating assignment:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update assignment' });
  }
};

/**
 * Delete an assignment (lecturer/admin only)
 */
export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const instructor_id = req.user?.id;

    const checkResult = await db.execute(
      sql`
        SELECT a.*, c.instructor_id 
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE a.id = ${id}
      `
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    if (checkResult.rows[0].instructor_id !== instructor_id) {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    await db.execute(sql`DELETE FROM assignments WHERE id = ${id}`);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error deleting assignment:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete assignment' });
  }
};

/**
 * Submit an assignment (student only)
 */
export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignment_id, submission_text, file_url } = req.body;
    const student_id = req.user?.id;

    if (!student_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const assignmentCheck = await db.execute(
      sql`SELECT id, due_date FROM assignments WHERE id = ${assignment_id}`
    );

    if (assignmentCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    const existing = await db.execute(
      sql`SELECT id FROM submissions WHERE assignment_id = ${assignment_id} AND student_id = ${student_id}`
    );

    if (existing.rows.length > 0) {
      const result = await db.execute(
        sql`
          UPDATE submissions 
          SET submission_text = ${submission_text}, file_url = ${file_url}, 
              submitted_at = NOW()
          WHERE assignment_id = ${assignment_id} AND student_id = ${student_id}
          RETURNING *
        `
      );

      res.status(200).json({
        success: true,
        message: 'Assignment resubmitted successfully',
        data: result.rows[0],
      });
      return;
    }

    const result = await db.execute(
      sql`
        INSERT INTO submissions (assignment_id, student_id, submission_text, file_url, submitted_at)
        VALUES (${assignment_id}, ${student_id}, ${submission_text}, ${file_url}, NOW())
        RETURNING *
      `
    );

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error submitting assignment:', err.message);
    res.status(500).json({ success: false, message: 'Failed to submit assignment' });
  }
};