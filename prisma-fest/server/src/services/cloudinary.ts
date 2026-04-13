/**
 * Cloudinary image upload service.
 * Handles avatar and cover image uploads with auto-format and responsive sizing.
 */

import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload an image buffer to Cloudinary.
 */
export async function uploadImage(
  fileBuffer: Buffer,
  folder: string = 'prisma-fest',
  options?: { width?: number; height?: number },
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      format: 'webp',
      quality: 'auto',
    };

    if (options?.width) uploadOptions.width = options.width;
    if (options?.height) uploadOptions.height = options.height;
    if (options?.width || options?.height) uploadOptions.crop = 'fill';

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed:', error);
          reject(error);
        } else {
          logger.info(`☁️ Image uploaded: ${result!.public_id}`);
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete an image from Cloudinary.
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`☁️ Image deleted: ${publicId}`);
  } catch (error) {
    logger.error(`Failed to delete image ${publicId}:`, error);
  }
}

export { cloudinary };
