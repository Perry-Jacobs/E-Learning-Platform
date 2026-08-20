/**
 * Config Index
 * Central export point for all configuration files
 */

// ============================================
// Database Configuration
// ============================================
export { 
  db, 
  pool, 
  testDatabaseConnection,
  getDatabaseStatus,
  getDatabaseVersion,
  type DB 
} from './database.config';

// ============================================
// Cloudinary Configuration
// ============================================
export { 
  default as cloudinaryConfig,
  uploadConfig,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from './cloudinary.config';

// ============================================
// JWT Configuration
// ============================================
export { 
  default as jwtConfig,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  type TokenPayload,
  type JWTConfig,
} from './jwt.config';

// ============================================
// Email Configuration
// ============================================
export { 
  default as emailConfig,
  transporter,
  sendEmail,
  testEmailConnection,
  emailTemplates,
} from './email.config';

// ============================================
// CORS Configuration
// ============================================
export { default as corsConfig } from './cors.config';

// ============================================
// Constants
// ============================================
export { 
  default as constants,
  getConstant,
  type UserRole,
  type CourseStatus,
  type QuizType,
} from './constants';

// ============================================
// Logger Configuration
// ============================================
export { default as logger, log, stream } from './logger.config';

// ============================================
// Rate Limit Configuration
// ============================================
export { default as rateLimitConfig } from './rate-limit.config';

// ============================================
// Multer Configuration
// ============================================
export { default as multerConfig, upload } from './multer.config';

// ============================================
// Re-export commonly used items for convenience
// ============================================
export { default as cloudinary } from './cloudinary.config';

// ============================================
// Default export (all configs as one object)
// ============================================
import * as databaseConfig from './database.config';  // ✅ CHANGED
import cloudinaryConfig from './cloudinary.config';
import jwtConfig from './jwt.config';
import emailConfig from './email.config';
import corsConfig from './cors.config';
import constants from './constants';
import logger from './logger.config';
import rateLimitConfig from './rate-limit.config';
import multerConfig from './multer.config';

const config = {
  database: databaseConfig,
  cloudinary: cloudinaryConfig,
  jwt: jwtConfig,
  email: emailConfig,
  cors: corsConfig,
  constants: constants,
  logger: logger,
  rateLimit: rateLimitConfig,
  multer: multerConfig,
};

export default config;