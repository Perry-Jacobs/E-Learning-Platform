import winston from 'winston';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Log level definitions
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
 * Console log format
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * File log format (JSON)
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
  const err = error as Error;
  console.warn('Could not create logs directory:', err.message);
}

/**
 * Main logger instance
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
 * Add file transports in production
 */
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_LOGGING === 'true') {
  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880,
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

/**
 * Convenience logging functions
 */
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};

/**
 * Stream for Morgan integration
 */
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;