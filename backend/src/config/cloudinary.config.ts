import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary configuration
export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key,
  api_secret: cloudinaryConfig.api_secret,
  secure: cloudinaryConfig.secure,
});

// Upload configurations for different file types
export const uploadConfig = {
  // Video upload settings
  video: {
    resource_type: 'video' as const,
    folder: 'e-learning/videos',
    allowed_formats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' },
      { bit_rate: '8000k' },
    ],
    max_bytes: 500 * 1024 * 1024, // 500MB
  },
  // Image upload settings
  image: {
    resource_type: 'image' as const,
    folder: 'e-learning/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [
      { width: 1200, height: 630, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    max_bytes: 10 * 1024 * 1024, // 10MB
  },
  // Document upload settings
  document: {
    resource_type: 'raw' as const,
    folder: 'e-learning/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv'],
    max_bytes: 50 * 1024 * 1024, // 50MB
  },
  // Assignment submission upload
  assignment: {
    resource_type: 'raw' as const,
    folder: 'e-learning/assignments',
    allowed_formats: ['pdf', 'doc', 'docx', 'zip', 'rar', '7z'],
    max_bytes: 50 * 1024 * 1024, // 50MB
  },
  // Profile picture upload
  profile: {
    resource_type: 'image' as const,
    folder: 'e-learning/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    max_bytes: 5 * 1024 * 1024, // 5MB
  },
};

// Upload helper functions
export interface UploadOptions {
  folder?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  public_id?: string;
  transformation?: any[];
  max_bytes?: number;
}

export async function uploadToCloudinary(
  file: string | Buffer,
  options: UploadOptions = {}
) {
  try {
    // Convert Buffer to base64 string if needed
    let uploadFile: string = file as string;
    if (Buffer.isBuffer(file)) {
      uploadFile = `data:image/jpeg;base64,${file.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(uploadFile, {
      folder: options.folder || 'e-learning',
      resource_type: options.resource_type || 'auto',
      public_id: options.public_id,
      transformation: options.transformation,
      max_bytes: options.max_bytes,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// Alternative: Upload with explicit file path (string only)
export async function uploadFileToCloudinary(
  filePath: string,
  options: UploadOptions = {}
) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'e-learning',
      resource_type: options.resource_type || 'auto',
      public_id: options.public_id,
      transformation: options.transformation,
      max_bytes: options.max_bytes,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

export async function deleteMultipleFromCloudinary(publicIds: string[]) {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw error;
  }
}

export default cloudinary;