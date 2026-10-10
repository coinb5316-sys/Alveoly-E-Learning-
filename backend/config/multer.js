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

// Single upload
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

export { upload, uploadMultiple, uploadAny };