import { sql, SQL } from 'drizzle-orm';
import { db } from '../config/database.config';

export const CourseService = {
  getAll: async (filters: {
    category?: string;
    level?: string;
    status?: string;
    instructorId?: string;
  }) => {
    let query = sql`
      SELECT c.*, u.name as instructor_name 
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
    `;

    const conditions: SQL[] = [];
    if (filters.category) conditions.push(sql`c.category = ${filters.category}`);
    if (filters.level) conditions.push(sql`c.level = ${filters.level}`);
    if (filters.status) conditions.push(sql`c.status = ${filters.status}`);
    if (filters.instructorId) conditions.push(sql`c.instructor_id = ${filters.instructorId}`);

    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`;
    }

    query = sql`${query} ORDER BY c.created_at DESC`;

    const result = await db.execute(query);
    return result.rows;
  },

  getById: async (id: string) => {
    const result = await db.execute(
      sql`
        SELECT c.*, u.name as instructor_name 
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.id = ${id}
      `
    );

    if (result.rows.length === 0) {
      throw new Error('Course not found');
    }

    return result.rows[0];
  },

  create: async (data: any, instructorId: string) => {
    const { title, description, category, level, price, thumbnail_url } = data;

    const result = await db.execute(
      sql`
        INSERT INTO courses (title, description, category, level, price, thumbnail_url, instructor_id, status)
        VALUES (${title}, ${description}, ${category}, ${level}, ${price}, ${thumbnail_url}, ${instructorId}, 'draft')
        RETURNING *
      `
    );

    return result.rows[0];
  },

  update: async (id: string, data: any, instructorId: string, userRole?: string) => {
    const check = await db.execute(
      sql`SELECT instructor_id FROM courses WHERE id = ${id}`
    );

    if (check.rows.length === 0) {
      throw new Error('Course not found');
    }

    if (check.rows[0].instructor_id !== instructorId && userRole !== 'admin') {
      throw new Error('You are not the instructor of this course');
    }

    const { title, description, category, level, price, thumbnail_url, status } = data;

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

    return result.rows[0];
  },

  delete: async (id: string, instructorId: string, userRole?: string) => {
    const check = await db.execute(
      sql`SELECT instructor_id FROM courses WHERE id = ${id}`
    );

    if (check.rows.length === 0) {
      throw new Error('Course not found');
    }

    if (check.rows[0].instructor_id !== instructorId && userRole !== 'admin') {
      throw new Error('You are not the instructor of this course');
    }

    await db.execute(sql`DELETE FROM courses WHERE id = ${id}`);
    return { success: true };
  },

  enroll: async (courseId: string, studentId: string) => {
    const courseCheck = await db.execute(
      sql`SELECT id FROM courses WHERE id = ${courseId}`
    );

    if (courseCheck.rows.length === 0) {
      throw new Error('Course not found');
    }

    const check = await db.execute(
      sql`SELECT id FROM enrollments WHERE student_id = ${studentId} AND course_id = ${courseId}`
    );

    if (check.rows.length > 0) {
      throw new Error('Already enrolled in this course');
    }

    await db.execute(
      sql`
        INSERT INTO enrollments (student_id, course_id, enrolled_at, status)
        VALUES (${studentId}, ${courseId}, NOW(), 'active')
      `
    );

    return { success: true };
  },

  getMyCourses: async (studentId: string) => {
    const result = await db.execute(
      sql`
        SELECT c.*, e.enrolled_at, e.status as enrollment_status
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = ${studentId}
        ORDER BY e.enrolled_at DESC
      `
    );

    return result.rows;
  },
};