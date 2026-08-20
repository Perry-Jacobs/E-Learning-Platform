import { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.config';

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  time_limit: number | null;
  passing_score: number;
  created_at?: Date;
  updated_at?: Date;
};

type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  answers: Record<string, any>;
  attempted_at?: Date;
};

function asQuiz(row: unknown): Quiz {
  return row as Quiz;
}

function asQuizAttempt(row: unknown): QuizAttempt {
  return row as QuizAttempt;
}

export const getAllQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.query;
    
    let query = sql`SELECT * FROM quizzes`;
    
    if (courseId) {
      query = sql`${query} WHERE course_id = ${courseId}`;
    }
    
    query = sql`${query} ORDER BY created_at DESC`;

    const result = await db.execute(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
};

export const getQuizById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const quizResult = await db.execute(
      sql`SELECT * FROM quizzes WHERE id = ${id}`
    );

    if (quizResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    const questionsResult = await db.execute(
      sql`
        SELECT * FROM quiz_questions 
        WHERE quiz_id = ${id}
        ORDER BY order_index ASC
      `
    );

    const quiz = asQuiz(quizResult.rows[0]);

    res.status(200).json({ 
      success: true, 
      data: {
        ...quiz,
        questions: questionsResult.rows,
      }
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
};

export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, course_id, time_limit, passing_score, questions } = req.body;
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

    if (passing_score < 0 || passing_score > 100) {
      res.status(400).json({ success: false, message: 'Passing score must be between 0 and 100' });
      return;
    }

    const quizResult = await db.execute(
      sql`
        INSERT INTO quizzes (title, description, course_id, time_limit, passing_score)
        VALUES (${title}, ${description}, ${course_id}, ${time_limit}, ${passing_score})
        RETURNING *
      `
    );

    const quiz = asQuiz(quizResult.rows[0]);

    if (questions && Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.execute(
          sql`
            INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, points, order_index)
            VALUES (${quiz.id}, ${q.question_text}, ${JSON.stringify(q.options)}, ${q.correct_answer}, ${q.points || 1}, ${i})
          `
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz' });
  }
};

export const updateQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, time_limit, passing_score, questions } = req.body;
    const instructor_id = req.user?.id;

    if (!instructor_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const checkResult = await db.execute(
      sql`
        SELECT q.*, c.instructor_id 
        FROM quizzes q
        JOIN courses c ON q.course_id = c.id
        WHERE q.id = ${id}
      `
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    if (checkResult.rows[0].instructor_id !== instructor_id) {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    if (passing_score !== undefined && (passing_score < 0 || passing_score > 100)) {
      res.status(400).json({ success: false, message: 'Passing score must be between 0 and 100' });
      return;
    }

    const result = await db.execute(
      sql`
        UPDATE quizzes 
        SET title = ${title}, description = ${description}, 
            time_limit = ${time_limit}, passing_score = ${passing_score}, 
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
    );

    if (questions && Array.isArray(questions)) {
      await db.execute(sql`DELETE FROM quiz_questions WHERE quiz_id = ${id}`);
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.execute(
          sql`
            INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, points, order_index)
            VALUES (${id}, ${q.question_text}, ${JSON.stringify(q.options)}, ${q.correct_answer}, ${q.points || 1}, ${i})
          `
        );
      }
    }

    const quiz = asQuiz(result.rows[0]);

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz,
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz' });
  }
};

export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const instructor_id = req.user?.id;

    if (!instructor_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const checkResult = await db.execute(
      sql`
        SELECT q.id, c.instructor_id 
        FROM quizzes q
        JOIN courses c ON q.course_id = c.id
        WHERE q.id = ${id}
      `
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    if (checkResult.rows[0].instructor_id !== instructor_id) {
      res.status(403).json({ success: false, message: 'You are not the instructor of this course' });
      return;
    }

    await db.execute(sql`DELETE FROM quiz_questions WHERE quiz_id = ${id}`);
    await db.execute(sql`DELETE FROM quiz_attempts WHERE quiz_id = ${id}`);
    await db.execute(sql`DELETE FROM quizzes WHERE id = ${id}`);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz' });
  }
};

export const submitQuizAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quiz_id, answers } = req.body;
    const student_id = req.user?.id;

    if (!student_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const quizCheck = await db.execute(
      sql`SELECT id, passing_score FROM quizzes WHERE id = ${quiz_id}`
    );

    if (quizCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Quiz not found' });
      return;
    }

    const quizRow = quizCheck.rows[0] as { passing_score: number };
    const passingScore = quizRow.passing_score;

    const questionsResult = await db.execute(
      sql`SELECT id, correct_answer, points FROM quiz_questions WHERE quiz_id = ${quiz_id}`
    );

    let totalPoints = 0;
    let earnedPoints = 0;

    questionsResult.rows.forEach((q: any) => {
      totalPoints += q.points || 1;
      const userAnswer = answers[q.id];
      if (userAnswer && userAnswer === q.correct_answer) {
        earnedPoints += q.points || 1;
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= passingScore;

    const existingAttempt = await db.execute(
      sql`
        SELECT id FROM quiz_attempts 
        WHERE quiz_id = ${quiz_id} AND student_id = ${student_id}
      `
    );

    let result;
    if (existingAttempt.rows.length > 0) {
      result = await db.execute(
        sql`
          UPDATE quiz_attempts 
          SET score = ${score}, answers = ${JSON.stringify(answers)}, attempted_at = NOW()
          WHERE quiz_id = ${quiz_id} AND student_id = ${student_id}
          RETURNING *
        `
      );
    } else {
      result = await db.execute(
        sql`
          INSERT INTO quiz_attempts (quiz_id, student_id, score, answers, attempted_at)
          VALUES (${quiz_id}, ${student_id}, ${score}, ${JSON.stringify(answers)}, NOW())
          RETURNING *
        `
      );
    }

    const attempt = asQuizAttempt(result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        ...attempt,
        passed,
        totalPoints,
        earnedPoints,
      },
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz' });
  }
};

export const getQuizResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const student_id = req.user?.id;
    const userRole = req.user?.role;

    if (!student_id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let query = sql`
      SELECT a.*, q.title as quiz_title, q.passing_score
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      WHERE a.quiz_id = ${quizId}
    `;

    if (userRole !== 'admin' && userRole !== 'lecturer') {
      query = sql`${query} AND a.student_id = ${student_id}`;
    }

    query = sql`${query} ORDER BY a.attempted_at DESC`;

    const result = await db.execute(query);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz results' });
  }
};