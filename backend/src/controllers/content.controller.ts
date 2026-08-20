import { Request, Response } from 'express';
import { sql, SQL } from 'drizzle-orm';
import { db } from '../config/database.config';

interface Content {
  id: string;
  title: string;
  type: string;
  url: string;
  duration: number | null;
  course_id: string;
  chapter_id: string | null;
  order_index: number;
  created_at?: Date;
  updated_at?: Date;
}

export const getAllContents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, chapterId } = req.query;
    
    let query = sql`SELECT * FROM contents`;
    const conditions: SQL[] = [];
    
    if (courseId) {
      conditions.push(sql`course_id = ${courseId}`);
    }
    if (chapterId) {
      conditions.push(sql`chapter_id = ${chapterId}`);
    }
    
    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`;
    }
    
    query = sql`${query} ORDER BY order_index ASC`;

    const result = await db.execute(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching contents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contents' });
  }
};

export const getContentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.execute(
      sql`SELECT * FROM contents WHERE id = ${id}`
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
};

export const createContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, type, url, duration, course_id, chapter_id, order_index } = req.body;
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
        INSERT INTO contents (title, type, url, duration, course_id, chapter_id, order_index)
        VALUES (${title}, ${type}, ${url}, ${duration}, ${course_id}, ${chapter_id}, ${order_index})
        RETURNING *
      `
    );

    const content = result.rows[0] as unknown as Content;

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content,
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ success: false, message: 'Failed to create content' });
  }
};

export const updateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, type, url, duration, order_index } = req.body;
    const instructor_id = req.user?.id;

    if (!instructor_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const checkResult = await db.execute(
      sql`
        SELECT c.id, co.instructor_id 
        FROM contents c
        JOIN courses co ON c.course_id = co.id
        WHERE c.id = ${id}
      `
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }

    if (checkResult.rows[0].instructor_id !== instructor_id) {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    const result = await db.execute(
      sql`
        UPDATE contents 
        SET title = ${title}, type = ${type}, url = ${url}, 
            duration = ${duration}, order_index = ${order_index}, 
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    );

    const content = result.rows[0] as unknown as Content;

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: content,
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
};

export const deleteContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const instructor_id = req.user?.id;

    if (!instructor_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const checkResult = await db.execute(
      sql`
        SELECT c.id, co.instructor_id 
        FROM contents c
        JOIN courses co ON c.course_id = co.id
        WHERE c.id = ${id}
      `
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }

    if (checkResult.rows[0].instructor_id !== instructor_id) {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    await db.execute(sql`DELETE FROM contents WHERE id = ${id}`);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
};