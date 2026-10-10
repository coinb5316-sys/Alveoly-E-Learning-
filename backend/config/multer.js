// config/multer.js - COMPLETE FIXED
import multer from "multer";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WEBP, SVG)"), false);
  }
};

// Single upload (field: any name set via .single())
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// Array upload for gallery (10 max)
const uploadMultiple = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// Any file type
const uploadAny = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ✅ NEW: Helper to normalize req.files from upload.fields()
// into a shape the controller can use uniformly.
export const extractFiles = (req) => {
  const result = { featuredImage: null, galleryImages: [] };

  if (req.file) {
    result.featuredImage = req.file;
  }

  if (req.files) {
    // upload.fields() → req.files = { featuredImage: [file], galleryImages: [file, ...] }
    if (Array.isArray(req.files)) {
      // upload.array() fallback
      result.galleryImages = req.files;
    } else {
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        result.featuredImage = req.files.featuredImage[0];
      }
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        result.galleryImages = req.files.galleryImages;
      }
    }
  }

  return result;
};

export { upload, uploadMultiple, uploadAny };