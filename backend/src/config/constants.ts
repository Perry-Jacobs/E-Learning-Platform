/**
 * Application-wide constants
 */
export const constants = {
  roles: {
    STUDENT: 'student',
    LECTURER: 'lecturer',
    ADMIN: 'admin',
  } as const,

  courseStatus: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  } as const,

  quizTypes: {
    MULTIPLE_CHOICE: 'multiple-choice',
    TRUE_FALSE: 'true-false',
    SHORT_ANSWER: 'short-answer',
    ESSAY: 'essay',
  } as const,

  submissionTypes: {
    FILE: 'file',
    TEXT: 'text',
    BOTH: 'both',
  } as const,

  pagination: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  upload: {
    MAX_VIDEO_SIZE: 500 * 1024 * 1024,
    MAX_IMAGE_SIZE: 10 * 1024 * 1024,
    MAX_DOCUMENT_SIZE: 50 * 1024 * 1024,
    MAX_PROFILE_SIZE: 5 * 1024 * 1024,
  },

  fileTypes: {
    VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  },

  quiz: {
    MAX_QUESTIONS: 50,
    MIN_QUESTIONS: 1,
    DEFAULT_PASSING_SCORE: 70,
    MAX_ATTEMPTS: 3,
    MAX_TIME_LIMIT: 180,
  },

  rateLimit: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },

  tokenExpiry: {
    ACCESS_TOKEN: '7d',
    REFRESH_TOKEN: '30d',
    EMAIL_VERIFICATION: '24h',
    PASSWORD_RESET: '1h',
  },

  api: {
    VERSION: 'v1',
    PREFIX: '/api',
  },

  cache: {
    COURSE_LIST: 300,
    COURSE_DETAIL: 600,
    USER_DATA: 300,
  },

  defaultPageSize: 10,
  maxPageSize: 100,
};

/**
 * Helper function to get a constant value
 */
export function getConstant(key: keyof typeof constants): any {
  return constants[key];
}

export type UserRole = typeof constants.roles[keyof typeof constants.roles];
export type CourseStatus = typeof constants.courseStatus[keyof typeof constants.courseStatus];
export type QuizType = typeof constants.quizTypes[keyof typeof constants.quizTypes];

export default constants;