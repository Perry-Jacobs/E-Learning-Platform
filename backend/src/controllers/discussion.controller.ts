import { Request, Response } from 'express';
import { sql, SQL } from 'drizzle-orm';
import { db } from '../config/database.config';

// Define Discussion interface for type safety
interface Discussion {
  id: string;
  title: string;
  content: string;
  course_id: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
  author_name?: string;
}

interface DiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  created_at?: Date;
  updated_at?: Date;
  author_name?: string;
}

// ============================================
// Get all discussions for a course (with author info)
// ============================================
export const getDiscussionsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const result = await db.execute(
      sql`
        SELECT d.*, u.name as author_name 
        FROM discussions d
        JOIN users u ON d.user_id = u.id
        WHERE d.course_id = ${courseId}
        ORDER BY d.created_at DESC
      `
    );

    res.status(200).json({ 
      success: true, 
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discussions' });
  }
};

// ============================================
// Get a single discussion with its replies
// ============================================
export const getDiscussionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get the discussion with author info
    const discussionResult = await db.execute(
      sql`
        SELECT d.*, u.name as author_name 
        FROM discussions d
        JOIN users u ON d.user_id = u.id
        WHERE d.id = ${id}
      `
    );

    if (discussionResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Discussion not found' });
      return;
    }

    // Get all replies for this discussion with author info
    const repliesResult = await db.execute(
      sql`
        SELECT r.*, u.name as author_name 
        FROM discussion_replies r
        JOIN users u ON r.user_id = u.id
        WHERE r.discussion_id = ${id}
        ORDER BY r.created_at ASC
      `
    );

    const discussion = discussionResult.rows[0] as unknown as Discussion;

    res.status(200).json({
      success: true,
      data: {
        ...discussion,
        replies: repliesResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discussion' });
  }
};

// ============================================
// Create a new discussion (Authenticated users only)
// ============================================
export const createDiscussion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, course_id } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Validate required fields
    if (!title || !content || !course_id) {
      res.status(400).json({ success: false, message: 'Title, content, and course ID are required' });
      return;
    }

    // Check if course exists
    const courseCheck = await db.execute(
      sql`SELECT id FROM courses WHERE id = ${course_id}`
    );

    if (courseCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Course not found' });
      return;
    }

    const result = await db.execute(
      sql`
        INSERT INTO discussions (title, content, course_id, user_id)
        VALUES (${title}, ${content}, ${course_id}, ${user_id})
        RETURNING *
      `
    );

    const discussion = result.rows[0] as unknown as Discussion;

    res.status(201).json({ 
      success: true, 
      message: 'Discussion created successfully', 
      data: discussion 
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ success: false, message: 'Failed to create discussion' });
  }
};

// ============================================
// Update a discussion (Only the author)
// ============================================
export const updateDiscussion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Check if discussion exists and belongs to the user
    const checkResult = await db.execute(
      sql`SELECT user_id FROM discussions WHERE id = ${id}`
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Discussion not found' });
      return;
    }

    if (checkResult.rows[0].user_id !== user_id) {
      res.status(403).json({ success: false, message: 'You can only edit your own discussions' });
      return;
    }

    const result = await db.execute(
      sql`
        UPDATE discussions 
        SET title = ${title}, content = ${content}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    );

    const discussion = result.rows[0] as unknown as Discussion;

    res.status(200).json({ 
      success: true, 
      message: 'Discussion updated successfully', 
      data: discussion 
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({ success: false, message: 'Failed to update discussion' });
  }
};

// ============================================
// Delete a discussion (Only the author)
// ============================================
export const deleteDiscussion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Check if discussion exists and belongs to the user
    const checkResult = await db.execute(
      sql`SELECT user_id FROM discussions WHERE id = ${id}`
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Discussion not found' });
      return;
    }

    if (checkResult.rows[0].user_id !== user_id) {
      res.status(403).json({ success: false, message: 'You can only delete your own discussions' });
      return;
    }

    // Delete all replies first (foreign key constraint)
    await db.execute(sql`DELETE FROM discussion_replies WHERE discussion_id = ${id}`);
    
    // Delete the discussion
    await db.execute(sql`DELETE FROM discussions WHERE id = ${id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Discussion deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ success: false, message: 'Failed to delete discussion' });
  }
};

// ============================================
// Add a reply to a discussion (Authenticated users only)
// ============================================
export const addReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { discussion_id, content } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Validate required fields
    if (!discussion_id || !content) {
      res.status(400).json({ success: false, message: 'Discussion ID and content are required' });
      return;
    }

    // Check if discussion exists
    const discussionCheck = await db.execute(
      sql`SELECT id FROM discussions WHERE id = ${discussion_id}`
    );

    if (discussionCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Discussion not found' });
      return;
    }

    const result = await db.execute(
      sql`
        INSERT INTO discussion_replies (discussion_id, user_id, content)
        VALUES (${discussion_id}, ${user_id}, ${content})
        RETURNING *
      `
    );

    const reply = result.rows[0] as unknown as DiscussionReply;

    res.status(201).json({ 
      success: true, 
      message: 'Reply added successfully', 
      data: reply 
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, message: 'Failed to add reply' });
  }
};

// ============================================
// Delete a reply (Only the author)
// ============================================
export const deleteReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Check if reply exists and belongs to the user
    const checkResult = await db.execute(
      sql`SELECT user_id FROM discussion_replies WHERE id = ${id}`
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Reply not found' });
      return;
    }

    if (checkResult.rows[0].user_id !== user_id) {
      res.status(403).json({ success: false, message: 'You can only delete your own replies' });
      return;
    }

    await db.execute(sql`DELETE FROM discussion_replies WHERE id = ${id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Reply deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ success: false, message: 'Failed to delete reply' });
  }
};