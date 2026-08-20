import { User } from './api.types';

/**
 * Extends Express Request interface to include authenticated user and file uploads
 */
declare global {
  namespace Express {
    interface Request {
      /** Authenticated user object set by authentication middleware */
      user?: User;
      /** Single file upload from multer */
      file?: Express.Multer.File;
      /** Multiple file uploads from multer */
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}