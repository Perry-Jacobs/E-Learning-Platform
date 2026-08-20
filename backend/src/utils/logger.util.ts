import winston from 'winston';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Log level definitions in order of priority
 * Higher number = more verbose logging
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Color mapping for console output
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

/**
 * Console log format with timestamps and colors
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * JSON file format for structured logging
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

/**
 * Ensure logs directory exists
 */
const logsDir = path.join(process.cwd(), 'logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  console.error('Could not create logs directory:', error);
}

/**
 * Main logger instance configured for console output
 * File output is added in production environment
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  levels,
  format: consoleFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  exitOnError: false,
});

/**
 * Add file transports in production or when logging is explicitly enabled
 */
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_LOGGING === 'true') {
  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Convenience logging functions with typed parameters
 */
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};

/**
 * Stream for Morgan HTTP request logging integration
 */
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;