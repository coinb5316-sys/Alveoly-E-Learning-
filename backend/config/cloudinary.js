// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Force load environment variables
dotenv.config();

console.log("🔧 Cloudinary Configuration Check:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✓ Present" : "✗ Missing");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✓ Present" : "✗ Missing");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration
try {
  const config = cloudinary.config();
  console.log("✅ Cloudinary configured successfully");
} catch (error) {
  console.error("❌ Cloudinary configuration error:", error.message);
}

export default cloudinary;