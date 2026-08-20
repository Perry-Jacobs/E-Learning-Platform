import multer from 'multer';
import path from 'path';
import { constants } from './constants';

// Configure storage (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = {
    image: constants.fileTypes.IMAGE,
    video: constants.fileTypes.VIDEO,
    document: constants.fileTypes.DOCUMENT,
    archive: constants.fileTypes.ARCHIVE,
  };

  const allAllowed = [
    ...allowedTypes.image,
    ...allowedTypes.video,
    ...allowedTypes.document,
    ...allowedTypes.archive,
  ];

  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Multer configuration for different use cases
export const multerConfig = {
  // General upload (any file type)
  general: multer({
    storage,
    fileFilter,
    limits: {
      fileSize: constants.upload.MAX_DOCUMENT_SIZE,
    },
  }),

  // Image upload only
  image: multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (constants.fileTypes.IMAGE.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
    limits: {
      fileSize: constants.upload.MAX_IMAGE_SIZE,
    },
  }),

  // Video upload only
  video: multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (constants.fileTypes.VIDEO.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed'));
      }
    },
    limits: {
      fileSize: constants.upload.MAX_VIDEO_SIZE,
    },
  }),

  // Document upload only
  document: multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (constants.fileTypes.DOCUMENT.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only document files are allowed'));
      }
    },
    limits: {
      fileSize: constants.upload.MAX_DOCUMENT_SIZE,
    },
  }),

  // Profile picture upload
  profile: multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (constants.fileTypes.IMAGE.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for profile pictures'));
      }
    },
    limits: {
      fileSize: constants.upload.MAX_PROFILE_SIZE,
    },
  }),
};

// Create multer instances for different use cases
export const upload = {
  single: (fieldName: string) => multerConfig.general.single(fieldName),
  array: (fieldName: string, maxCount: number) => 
    multerConfig.general.array(fieldName, maxCount),
  fields: (fields: { name: string; maxCount: number }[]) => 
    multerConfig.general.fields(fields),
  none: () => multerConfig.general.none(),
  // Specific upload types
  image: {
    single: (fieldName: string) => multerConfig.image.single(fieldName),
    array: (fieldName: string, maxCount: number) => 
      multerConfig.image.array(fieldName, maxCount),
  },
  video: {
    single: (fieldName: string) => multerConfig.video.single(fieldName),
  },
  document: {
    single: (fieldName: string) => multerConfig.document.single(fieldName),
  },
  profile: {
    single: (fieldName: string) => multerConfig.profile.single(fieldName),
  },
};

export default multerConfig;