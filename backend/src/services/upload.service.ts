import { uploadToCloudinary, uploadConfig, deleteFromCloudinary } from '../config/cloudinary.config';

/** Upload service for handling file uploads to Cloudinary */
export const UploadService = {
  /**
   * Uploads an image to Cloudinary with optional folder
   * @param {Express.Multer.File} file - Image file from multer
   * @param {string} [folder] - Optional folder path in Cloudinary
   * @returns {Promise<Object>} Upload result with public_id and secure_url
   */
  uploadImage: async (file: Express.Multer.File, folder?: string) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: folder || 'e-learning/images',
      resource_type: 'image',
      transformation: uploadConfig.image.transformation,
    });
    return result;
  },

  /**
   * Uploads a video to Cloudinary with optional folder
   * @param {Express.Multer.File} file - Video file from multer
   * @param {string} [folder] - Optional folder path in Cloudinary
   * @returns {Promise<Object>} Upload result with public_id and secure_url
   */
  uploadVideo: async (file: Express.Multer.File, folder?: string) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: folder || 'e-learning/videos',
      resource_type: 'video',
      transformation: uploadConfig.video.transformation,
    });
    return result;
  },

  /**
   * Uploads a document to Cloudinary with optional folder
   * @param {Express.Multer.File} file - Document file from multer
   * @param {string} [folder] - Optional folder path in Cloudinary
   * @returns {Promise<Object>} Upload result with public_id and secure_url
   */
  uploadDocument: async (file: Express.Multer.File, folder?: string) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: folder || 'e-learning/documents',
      resource_type: 'raw',
      max_bytes: uploadConfig.document.max_bytes,
    });
    return result;
  },

  /**
   * Uploads a profile picture with automatic cropping
   * @param {Express.Multer.File} file - Image file from multer
   * @param {string} [folder] - Optional folder path in Cloudinary
   * @returns {Promise<Object>} Upload result with public_id and secure_url
   */
  uploadProfilePicture: async (file: Express.Multer.File, folder?: string) => {
    const result = await uploadToCloudinary(file.buffer, {
      folder: folder || 'e-learning/profiles',
      resource_type: 'image',
      transformation: uploadConfig.profile.transformation,
    });
    return result;
  },

  /**
   * Deletes a file from Cloudinary
   * @param {string} publicId - Public ID of the file to delete
   * @returns {Promise<Object>} Deletion result
   */
  deleteFile: async (publicId: string) => {
    return await deleteFromCloudinary(publicId);
  },
};