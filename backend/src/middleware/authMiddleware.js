// backend/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Use decoded.id or decoded.userId depending on your token structure
    const userId = decoded.id || decoded.userId;
    
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Optional: Check active session only if sessionId exists in token
    if (decoded.sessionId && user.activeSession !== decoded.sessionId) {
      return res.status(401).json({
        message: "You were logged out because your account was used on another device",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    // Don't throw, just return unauthorized
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ADMIN ONLY
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};