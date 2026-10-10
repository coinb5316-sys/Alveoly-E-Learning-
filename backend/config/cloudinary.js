// backend/src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

console.log("🔧 Cloudinary Configuration Check:");
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "✓ Present" : "✗ Missing"
);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "✓ Present" : "✗ Missing"
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "✓ Present" : "✗ Missing"
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

try {
  const config = cloudinary.config();
  if (config.cloud_name && config.api_key && config.api_secret) {
    console.log("✅ Cloudinary configured successfully");
  } else {
    console.warn("⚠️ Cloudinary configuration incomplete");
  }
} catch (error) {
  console.error("❌ Cloudinary configuration error:", error.message);
}

export const uploadToCloudinary = async (buffer, options = {}) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error(
      `uploadToCloudinary expected a Buffer, got ${typeof buffer} (${
        buffer === undefined ? "undefined" : "non-buffer"
      })`
    );
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || "blog",
      public_id: options.public_id || `upload_${Date.now()}`,
      resource_type: "auto",
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => (error ? reject(error) : resolve(result))
    );

    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export default cloudinary;