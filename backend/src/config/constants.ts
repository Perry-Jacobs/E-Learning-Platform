// Application constants
export const constants = {
  // User roles
  roles: {
    STUDENT: 'student',
    LECTURER: 'lecturer',
    ADMIN: 'admin',
  } as const,

  // Course status
  courseStatus: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  } as const,

  // Quiz types
  quizTypes: {
    MULTIPLE_CHOICE: 'multiple-choice',
    TRUE_FALSE: 'true-false',
    SHORT_ANSWER: 'short-answer',
    ESSAY: 'essay',
  } as const,

  // Submission types
  submissionTypes: {
    FILE: 'file',
    TEXT: 'text',
    BOTH: 'both',
  } as const,

  // Pagination defaults
  pagination: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // File upload limits (in bytes)
  upload: {
    MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_DOCUMENT_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_PROFILE_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // File types
  fileTypes: {
    VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  },

  // Quiz settings
  quiz: {
    MAX_QUESTIONS: 50,
    MIN_QUESTIONS: 1,
    DEFAULT_PASSING_SCORE: 70,
    MAX_ATTEMPTS: 3,
    MAX_TIME_LIMIT: 180, // 3 hours in minutes
  },

  // Rate limiting
  rateLimit: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  // Token expiry times
  tokenExpiry: {
    ACCESS_TOKEN: '7d',
    REFRESH_TOKEN: '30d',
    EMAIL_VERIFICATION: '24h',
    PASSWORD_RESET: '1h',
  },

  // API configuration
  api: {
    VERSION: 'v1',
    PREFIX: '/api',
  },

  // Cache TTL (in seconds)
  cache: {
    COURSE_LIST: 300, // 5 minutes
    COURSE_DETAIL: 600, // 10 minutes
    USER_DATA: 300, // 5 minutes
  },

  // Default pagination
  defaultPageSize: 10,
  maxPageSize: 100,
};

// Helper to get constants
export function getConstant(key: keyof typeof constants): any {
  return constants[key];
}

// Type for roles
export type UserRole = typeof constants.roles[keyof typeof constants.roles];
export type CourseStatus = typeof constants.courseStatus[keyof typeof constants.courseStatus];
export type QuizType = typeof constants.quizTypes[keyof typeof constants.quizTypes];

export default constants;