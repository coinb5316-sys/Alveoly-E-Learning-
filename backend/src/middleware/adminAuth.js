// backend/src/middleware/adminAuth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try `id` first, fall back to `_id` in case your token uses a different key
    const userId = decoded.id || decoded._id || decoded.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    req.user = user;
    return next();          // ← the ONLY next() call, always on success
  } catch (err) {
    console.error("adminAuth error:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};