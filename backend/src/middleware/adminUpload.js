// backend/src/middleware/adminUpload.js
import multer from "multer";

const storage = multer.memoryStorage();

const LIMITS = {
  fileSize: 100 * 1024 * 1024, // 100MB
  files: 20,
};

// Single-file upload (avatar, category image, podcast image, etc.)
export const adminUpload = multer({ storage, limits: LIMITS });

// Multi-file upload (gallery, media library)
export const adminUploadGallery = multer({ storage, limits: LIMITS });

// Convenience array uploader
export const adminUploadArray = (field, max = 20) =>
  adminUpload.array(field, max);

// Convenience fields uploader
export const adminUploadFields = (fields) => adminUpload.fields(fields);

export default adminUpload;