// config/multer.js
import multer from "multer";

// Use memory storage - files are stored in memory as Buffer
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

// Multiple images upload for gallery
const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: imageFilter
}).array("galleryImages", 10);

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
  uploadAny
};