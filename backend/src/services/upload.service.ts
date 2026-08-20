import { uploadToCloudinary, uploadConfig } from '../config/cloudinary.config';

export const UploadService = {
  uploadImage: async (file: Express.Multer.File, folder?: string) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: folder || 'e-learning/images',
      resource_type: 'image',
      transformation: uploadConfig.image.transformation,
    });
    return result;
  },

  uploadVideo: async (file: Express.Multer.File, folder?: string) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: folder || 'e-learning/videos',
      resource_type: 'video',
      transformation: uploadConfig.video.transformation,
    });
    return result;
  },

  uploadDocument: async (file: Express.Multer.File, folder?: string) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: folder || 'e-learning/documents',
      resource_type: 'raw',
      max_bytes: uploadConfig.document.max_bytes,
    });
    return result;
  },

  uploadProfilePicture: async (file: Express.Multer.File, folder?: string) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: folder || 'e-learning/profiles',
      resource_type: 'image',
      transformation: uploadConfig.profile.transformation,
    });
    return result;
  },

  deleteFile: async (publicId: string) => {
    return await uploadToCloudinary(publicId, { resource_type: 'auto' });
  },
};