// server/middleware/adminAuth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token" });
  }
};