import cloudinary from '../config/cloudinary.js';

/**
 * Upload an image to Cloudinary
 * @param {string} imageData - Base64 encoded image data or file path
 * @param {string} folder - Folder name in Cloudinary (default: 'nursing-games')
 * @returns {Promise<object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (imageData, folder = 'nursing-games') => {
  try {
    // Check if imageData is base64 or file path
    let uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp']
    };
    
    // If imageData is a base64 string (starts with data:image)
    if (imageData && imageData.startsWith('data:image')) {
      uploadOptions = {
        ...uploadOptions,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      };
    }
    
    const result = await cloudinary.uploader.upload(imageData, uploadOptions);
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<object>} - Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} images - Array of base64 encoded images or file paths
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Array<object>>} - Array of upload results
 */
export const uploadMultipleToCloudinary = async (images, folder = 'nursing-games') => {
  try {
    const uploadPromises = images.map(image => uploadToCloudinary(image, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error(`Failed to upload multiple images: ${error.message}`);
  }
};

/**
 * Get optimized URL for an existing Cloudinary image
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Transformation options
 * @returns {string} - Optimized URL
 */
export const getOptimizedUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    width: 800,
    crop: 'limit'
  };
  
  const finalTransformations = { ...defaultTransformations, ...transformations };
  
  return cloudinary.url(publicId, {
    transformation: [finalTransformations]
  });
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
  getOptimizedUrl
};