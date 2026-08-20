export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
  meta?: PaginationMeta;
}

export interface ApiError {
  field?: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}

export type UserRole = 'student' | 'lecturer' | 'admin';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  type?: 'access' | 'refresh';
}

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

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface CreateCourseRequest {
  title: string;
  description?: string;
  category?: string;
  level?: string;
  price?: number;
  thumbnail_url?: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  status?: CourseStatus;
}

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

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  points: number;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  answers: Record<string, any>;
  attempted_at?: Date;
}

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

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  created_at?: Date;
  updated_at?: Date;
  author_name?: string;
}

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

export type ContentType = 'video' | 'document' | 'article' | 'quiz' | 'assignment';

export interface Progress {
  id: string;
  user_id: string;
  course_id: string;
  content_id: string;
  status: ProgressStatus;
  percentage: number;
  updated_at?: Date;
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type NotificationType =
  | 'welcome'
  | 'course_enrollment'
  | 'assignment_graded'
  | 'quiz_completed'
  | 'discussion_reply'
  | 'password_reset';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at?: Date;
}

export type FileUploadType = 'image' | 'video' | 'document' | 'profile';

export interface FileUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AppError extends Error {
  status?: number;
  code?: string;
  errors?: ApiError[];
}