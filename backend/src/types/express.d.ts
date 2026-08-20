import { User } from './api.types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}