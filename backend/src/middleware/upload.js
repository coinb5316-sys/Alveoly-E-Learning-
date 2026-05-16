import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos and large files
  },
});

export default upload;