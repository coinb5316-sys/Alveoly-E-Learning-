// controllers/contentController.js
import Content from "../models/Content.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import { io } from "../../server.js";
import mongoose from "mongoose";

// ================= UPLOAD CONTENT (ADMIN) =================
export const uploadContent = async (req, res) => {
  try {
    const { 
      title, 
      type, 
      courseId, 
      subjectId, 
      isPaid, 
      price, 
      quizTimerMinutes, 
      quizPassMark 
    } = req.body;

    const user = req.user;

    console.log("📝 Received upload request:", { title, type, subjectId, courseId });

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // For quiz type, skip Cloudinary
    if (type === "quiz") {
      console.log("📝 Creating quiz content (no file upload)");
      
      let finalCourseId = courseId;
      let finalSubjectId = subjectId;
      
      if (subjectId && !courseId) {
        const Subject = mongoose.model("Subject");
        const subject = await Subject.findById(subjectId);
        if (subject) {
          finalCourseId = subject.courseId;
        }
      }

      const contentData = {
        title,
        type: "quiz",
        courseId: finalCourseId,
        subjectId: finalSubjectId,
        lecturerId: user._id,
        lecturerName: user.name || user.email || "Admin",
        isPaid: isPaid === "true" || isPaid === true,
        price: Number(price) || 0,
        quizTimerMinutes: Number(quizTimerMinutes) || 0,
        quizPassMark: Number(quizPassMark) || 70,
      };

      const content = await Content.create(contentData);
      io.emit("content:created", content);
      return res.status(201).json(content);
    }

    // Handle file uploads
    const mainFile = req.files?.file?.[0];
    const thumbFile = req.files?.thumbnail?.[0];

    if (!mainFile) {
      return res.status(400).json({ message: "Main file required" });
    }

    const uploadToCloudinary = (file, fileType, folder = "alveoly-content") =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: fileType === "pdf" ? "raw" : "auto",
            folder,
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    let mainUpload = await uploadToCloudinary(mainFile, type);

    let thumbUpload = null;
    if (thumbFile) {
      thumbUpload = await uploadToCloudinary(thumbFile, "image", "alveoly-thumbnails");
    } else {
      if (type === "video") {
        thumbUpload = {
          secure_url: cloudinary.url(mainUpload.public_id + ".jpg", { 
            resource_type: "video", 
            quality: "auto", 
            fetch_format: "auto" 
          }),
        };
      } else if (type === "image") {
        thumbUpload = { secure_url: mainUpload.secure_url };
      }
    }

    let finalCourseId = courseId;
    let finalSubjectId = subjectId;
    
    if (subjectId && !courseId) {
      const Subject = mongoose.model("Subject");
      const subject = await Subject.findById(subjectId);
      if (subject) finalCourseId = subject.courseId;
    }

    const contentData = {
      title,
      type,
      courseId: finalCourseId,
      subjectId: finalSubjectId,
      lecturerId: user._id,
      lecturerName: user.name || user.email || "Admin",
      isPaid: isPaid === "true" || isPaid === true,
      price: Number(price) || 0,
      fileUrl: mainUpload.secure_url,
      publicId: mainUpload.public_id,
      thumbnailUrl: thumbUpload?.secure_url || "",
    };

    const content = await Content.create(contentData);
    io.emit("content:created", content);
    res.status(201).json(content);
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL CONTENTS (ADMIN) =================
export const getContents = async (req, res) => {
  try {
    const { subjectId, courseId } = req.query;

    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (courseId) filter.courseId = courseId;

    const contents = await Content.find(filter)
      .populate("subjectId", "name")
      .populate("courseId", "name")
      .populate("lecturerId", "name email")
      .sort({ createdAt: -1 });

    res.json(contents);
  } catch (err) {
    console.error("Fetch contents failed:", err);
    res.status(500).json({ message: "Failed to fetch contents" });
  }
};

// ================= GET LECTURER'S OWN CONTENT =================
export const getLecturerContents = async (req, res) => {
  try {
    const user = req.user;
    const { type, search } = req.query;

    const filter = { lecturerId: user._id };
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: "i" };

    const contents = await Content.find(filter)
      .populate("subjectId", "name")
      .populate("courseId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, content: contents });
  } catch (err) {
    console.error("Fetch lecturer contents failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch contents" });
  }
};

// ================= GET SINGLE CONTENT =================
export const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate("subjectId", "name")
      .populate("courseId", "name");

    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    // Check if user is admin or content owner
    if (req.user.role !== "admin" && content.lecturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, content });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= CREATE LECTURER CONTENT =================
export const createLecturerContent = async (req, res) => {
  try {
    const { title, type, courseId, subjectId, isPaid, price } = req.body;
    const user = req.user;

    if (!title) return res.status(400).json({ message: "Title required" });
    if (!courseId) return res.status(400).json({ message: "Course required" });
    if (!subjectId) return res.status(400).json({ message: "Subject required" });

    if (type === "quiz") {
      const content = await Content.create({
        title,
        type: "quiz",
        courseId,
        subjectId,
        lecturerId: user._id,
        lecturerName: user.name || user.email,
        isPaid: isPaid === "true" || isPaid === true,
        price: Number(price) || 0,
        quizTimerMinutes: 0,
        quizPassMark: 70,
      });
      return res.status(201).json({ success: true, content });
    }

    const mainFile = req.file;
    if (!mainFile) return res.status(400).json({ message: "File required" });

    const uploadToCloudinary = (file, fileType) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: fileType === "pdf" ? "raw" : "auto", folder: "alveoly-content" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const mainUpload = await uploadToCloudinary(mainFile, type);

    const content = await Content.create({
      title,
      type,
      courseId,
      subjectId,
      lecturerId: user._id,
      lecturerName: user.name || user.email,
      isPaid: isPaid === "true" || isPaid === true,
      price: Number(price) || 0,
      fileUrl: mainUpload.secure_url,
      publicId: mainUpload.public_id,
    });

    res.status(201).json({ success: true, content });
  } catch (err) {
    console.error("Create lecturer content error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE CONTENT =================
export const updateContent = async (req, res) => {
  try {
    const { title, isPaid, price, quizTimerMinutes, quizPassMark } = req.body;

    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Content not found" });

    // Check ownership
    if (req.user.role !== "admin" && content.lecturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own content" });
    }

    if (title !== undefined) content.title = title;
    if (isPaid !== undefined) content.isPaid = isPaid === "true" || isPaid === true;
    if (price !== undefined) content.price = Number(price) || 0;
    if (quizTimerMinutes !== undefined) content.quizTimerMinutes = Number(quizTimerMinutes);
    if (quizPassMark !== undefined) content.quizPassMark = Number(quizPassMark);

    const updated = await content.save();
    io.emit("content:updated", updated);
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE CONTENT =================
export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Content not found" });

    // Check ownership
    if (req.user.role !== "admin" && content.lecturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own content" });
    }

    if (content.publicId && content.type !== "quiz") {
      try {
        await cloudinary.uploader.destroy(content.publicId, {
          resource_type: content.type === "video" ? "video" : "auto",
        });
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    }

    await content.deleteOne();
    io.emit("content:deleted", content._id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};