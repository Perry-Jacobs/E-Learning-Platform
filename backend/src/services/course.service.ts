import { sql, SQL } from 'drizzle-orm';
import { db } from '../config/database.config';

/** Course filters for listing courses */
interface CourseFilters {
  category?: string;
  level?: string;
  status?: string;
  instructorId?: string;
}

/** Course data for creation */
interface CourseCreateData {
  title: string;
  description?: string;
  category?: string;
  level?: string;
  price?: number;
  thumbnail_url?: string;
}

/** Course data for update */
interface CourseUpdateData extends Partial<CourseCreateData> {
  status?: string;
}

/** Course service for CRUD operations */
export const CourseService = {
  /**
   * Retrieves all courses with optional filters
   * @param {CourseFilters} filters - Filters for course listing
   * @returns {Promise<Array>} List of courses with instructor names
   */
  getAll: async (filters: CourseFilters) => {
    let query = sql`
      SELECT c.*, u.full_name as instructor_name 
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

  /**
   * Retrieves a single course by ID
   * @param {string} id - Course ID
   * @returns {Promise<Object>} Course with instructor details
   * @throws {Error} If course is not found
   */
  getById: async (id: string) => {
    const result = await db.execute(
      sql`
        SELECT c.*, u.full_name as instructor_name 
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

  /**
   * Creates a new course
   * @param {CourseCreateData} data - Course creation data
   * @param {string} instructorId - ID of the instructor creating the course
   * @returns {Promise<Object>} Created course
   */
  create: async (data: CourseCreateData, instructorId: string) => {
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

  /**
   * Updates an existing course
   * @param {string} id - Course ID to update
   * @param {CourseUpdateData} data - Course update data
   * @param {string} instructorId - ID of the instructor making the update
   * @param {string} [userRole] - Role of the user making the request
   * @returns {Promise<Object>} Updated course
   * @throws {Error} If course not found or user lacks permission
   */
  update: async (id: string, data: CourseUpdateData, instructorId: string, userRole?: string) => {
    const check = await db.execute(
      sql`SELECT instructor_id FROM courses WHERE id = ${id}`
    );

    if (check.rows.length === 0) {
      throw new Error('Course not found');
    }

    // Verify instructor owns the course or user is admin
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

  /**
   * Deletes a course
   * @param {string} id - Course ID to delete
   * @param {string} instructorId - ID of the instructor making the request
   * @param {string} [userRole] - Role of the user making the request
   * @returns {Promise<Object>} Deletion confirmation
   * @throws {Error} If course not found or user lacks permission
   */
  delete: async (id: string, instructorId: string, userRole?: string) => {
    const check = await db.execute(
      sql`SELECT instructor_id FROM courses WHERE id = ${id}`
    );

    if (check.rows.length === 0) {
      throw new Error('Course not found');
    }

    // Verify instructor owns the course or user is admin
    if (check.rows[0].instructor_id !== instructorId && userRole !== 'admin') {
      throw new Error('You are not the instructor of this course');
    }

    await db.execute(sql`DELETE FROM courses WHERE id = ${id}`);
    return { success: true };
  },

  /**
   * Enrolls a student in a course
   * @param {string} courseId - ID of the course to enroll in
   * @param {string} studentId - ID of the student enrolling
   * @returns {Promise<Object>} Enrollment confirmation
   * @throws {Error} If course not found or student already enrolled
   */
  enroll: async (courseId: string, studentId: string) => {
    const courseCheck = await db.execute(
      sql`SELECT id FROM courses WHERE id = ${courseId}`
    );

    if (courseCheck.rows.length === 0) {
      throw new Error('Course not found');
    }

    // Check if already enrolled
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

  /**
   * Retrieves courses the student is enrolled in
   * @param {string} studentId - ID of the student
   * @returns {Promise<Array>} List of enrolled courses with enrollment details
   */
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