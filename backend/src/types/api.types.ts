/**
 * Standard API response wrapper
 * @template T - Type of data payload
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
  meta?: PaginationMeta;
}

/** Represents a validation or business logic error */
export interface ApiError {
  field?: string;
  message: string;
}

/** Pagination metadata for list responses */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** User entity representing a system user */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

/** Available user roles in the system */
export type UserRole = 'student' | 'lecturer' | 'admin';

/** User registration request payload */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

/** User login request payload */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Authentication response containing user and tokens */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** JWT token payload structure */
export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  type?: 'access' | 'refresh';
}

/** Course entity representing a learning course */
export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  price: number | null;
  thumbnail_url: string | null;
  instructor_id: string;
  status: CourseStatus;
  created_at?: Date;
  updated_at?: Date;
  instructor_name?: string;
}

/** Course publication status */
export type CourseStatus = 'draft' | 'published' | 'archived';

/** Course creation request payload */
export interface CreateCourseRequest {
  title: string;
  description?: string;
  category?: string;
  level?: string;
  price?: number;
  thumbnail_url?: string;
}

/** Course update request payload */
export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  status?: CourseStatus;
}

/** Assignment entity */
export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  due_date: Date;
  max_score: number;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

/** Assignment submission entity */
export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  file_url: string | null;
  score: number | null;
  feedback: string | null;
  submitted_at: Date;
  graded_at: Date | null;
}

/** Quiz entity */
export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  time_limit: number | null;
  passing_score: number;
  created_at?: Date;
  updated_at?: Date;
}

/** Quiz question entity */
export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  points: number;
  order_index: number;
}

/** Quiz attempt entity */
export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  answers: Record<string, any>;
  attempted_at?: Date;
}

/** Discussion entity */
export interface Discussion {
  id: string;
  title: string;
  content: string;
  course_id: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
  author_name?: string;
}

/** Discussion reply entity */
export interface DiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  created_at?: Date;
  updated_at?: Date;
  author_name?: string;
}

/** Content entity (video, document, etc.) */
export interface Content {
  id: string;
  title: string;
  type: ContentType;
  url: string;
  duration: number | null;
  course_id: string;
  chapter_id: string | null;
  order_index: number;
  created_at?: Date;
  updated_at?: Date;
}

/** Available content types */
export type ContentType = 'video' | 'document' | 'article' | 'quiz' | 'assignment';

/** Progress tracking entity */
export interface Progress {
  id: string;
  user_id: string;
  course_id: string;
  content_id: string;
  status: ProgressStatus;
  percentage: number;
  updated_at?: Date;
}

/** Progress status options */
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

/** Notification types */
export type NotificationType =
  | 'welcome'
  | 'course_enrollment'
  | 'assignment_graded'
  | 'quiz_completed'
  | 'discussion_reply'
  | 'password_reset';

/** Notification entity */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at?: Date;
}

/** File upload types */
export type FileUploadType = 'image' | 'video' | 'document' | 'profile';

/** File upload result from Cloudinary */
export interface FileUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

/** Pagination query parameters */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Custom application error with optional status code */
export interface AppError extends Error {
  status?: number;
  code?: string;
  errors?: ApiError[];
}