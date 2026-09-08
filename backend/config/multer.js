// config/multer.js - COMPLETE FIXED
import multer from "multer";

// Memory storage - files stored as Buffer in memory
const storage = multer.memoryStorage();

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WEBP, SVG)"), false);
  }
};

// Single image upload for featured images
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: imageFilter
});

// Multiple images upload for gallery - handles array of files with field name "galleryImages"
const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  },
  fileFilter: imageFilter
}).array("galleryImages", 10);

// Fields upload - handles both featuredImage and galleryImages together
const uploadFields = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]);

// Any file upload (for future use)
const uploadAny = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

export {
  upload,
  uploadMultiple,
  uploadAny,
  uploadFields
};