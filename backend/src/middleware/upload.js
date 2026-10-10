// server/middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadGallery = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
}).array("galleryImages", 10);