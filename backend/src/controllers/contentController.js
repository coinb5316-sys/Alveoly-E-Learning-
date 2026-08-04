// controllers/contentController.js
import Content from "../models/Content.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import { io } from "../../server.js";
import mongoose from "mongoose";

// ================= UPLOAD CONTENT =================
export const uploadContent = async (req, res) => {
  try {
    const { 
      title, 
      type, 
      courseId, 
      subjectId, 
      topicId,  // IMPORTANT: Added topicId
      isPaid, 
      price, 
      quizTimerMinutes, 
      quizPassMark 
    } = req.body;

    console.log("📝 Received upload request:", { 
      title, 
      type, 
      subjectId, 
      topicId,  // Log topicId
      courseId 
    });

    // VALIDATION
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Helper to extract ID from object or string
    const extractId = (value) => {
      if (!value) return null;
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value._id) return value._id;
      return value;
    };

    // For quiz type, skip Cloudinary entirely - just save to database
    if (type === "quiz") {
      console.log("📝 Creating quiz content (no file upload)");
      
      let finalCourseId = courseId;
      let finalSubjectId = subjectId;
      let finalTopicId = topicId;  // Keep topicId
      
      // If subjectId is provided but courseId isn't, get courseId from subject
      if (subjectId && !courseId) {
        const Subject = mongoose.model("Subject");
        const subject = await Subject.findById(subjectId);
        if (subject) {
          finalCourseId = subject.courseId;
          console.log(`📚 Found course ID from subject: ${finalCourseId}`);
        }
      }

      // Extract IDs
      const extractedSubjectId = extractId(finalSubjectId);
      const extractedCourseId = extractId(finalCourseId);
      const extractedTopicId = extractId(finalTopicId);

      // Save quiz to DB without any file uploads
      const contentData = {
        title,
        type: "quiz",
        courseId: extractedCourseId,
        subjectId: extractedSubjectId,
        topicId: extractedTopicId,  // IMPORTANT: Save topicId
        isPaid: isPaid === "true" || isPaid === true,
        price: Number(price) || 0,
        quizTimerMinutes: Number(quizTimerMinutes) || 0,
        quizPassMark: Number(quizPassMark) || 70,
        lecturerId: req.user?._id || null,
        lecturerName: req.user?.name || "Admin",
      };

      console.log("💾 Saving quiz to database:", contentData);
      
      const content = await Content.create(contentData);
      
      // Populate the response
      const populatedContent = await Content.findById(content._id)
        .populate("subjectId", "name")
        .populate("courseId", "name");

      io.emit("content:created", populatedContent);
      return res.status(201).json(populatedContent);
    }

    // For non-quiz types, check if Cloudinary is configured
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Cloudinary credentials missing");
      return res.status(500).json({ 
        message: "Cloudinary is not configured. Please check environment variables.",
        details: "Missing API credentials"
      });
    }

    // Handle file upload for video/image/pdf
    const mainFile = req.files?.file?.[0];
    const thumbFile = req.files?.thumbnail?.[0];

    if (!mainFile) {
      return res.status(400).json({ message: "Main file required for video, image, or pdf content" });
    }

    // ================= FILE SIZE VALIDATION =================
    const maxFileSize = 100 * 1024 * 1024;
    if (mainFile.size > maxFileSize) {
      const fileSizeMB = (mainFile.size / (1024 * 1024)).toFixed(2);
      return res.status(400).json({ 
        message: `File too large! Maximum size is 100MB. Your file is ${fileSizeMB}MB.`
      });
    }

    console.log(`📁 Uploading ${type} file: ${mainFile.originalname} (${(mainFile.size / (1024 * 1024)).toFixed(2)}MB)`);

    const uploadToCloudinary = (file, fileType, folder = "alveoly-content") =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: fileType === "pdf" ? "raw" : "auto",
            folder,
            timeout: 120000,
          },
          (err, result) => {
            if (err) {
              console.error("Cloudinary upload error:", err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    let mainUpload = null;
    let thumbUpload = null;

    try {
      mainUpload = await uploadToCloudinary(mainFile, type);
      console.log("✅ Main file uploaded:", mainUpload.secure_url);
    } catch (uploadError) {
      console.error("Failed to upload main file:", uploadError);
      return res.status(500).json({ 
        message: "Failed to upload file to Cloudinary",
        error: uploadError.message 
      });
    }

    // Generate or upload thumbnail
    try {
      if (thumbFile) {
        if (thumbFile.size > 5 * 1024 * 1024) {
          console.warn(`⚠️ Thumbnail large: ${(thumbFile.size / (1024 * 1024)).toFixed(2)}MB`);
        }
        thumbUpload = await uploadToCloudinary(thumbFile, "image", "alveoly-thumbnails");
        console.log("✅ Thumbnail uploaded:", thumbUpload.secure_url);
      } else {
        if (type === "video") {
          thumbUpload = {
            secure_url: cloudinary.url(mainUpload.public_id + ".jpg", { 
              resource_type: "video", 
              quality: "auto", 
              fetch_format: "auto" 
            }),
            public_id: mainUpload.public_id + "-thumb",
          };
        } else if (type === "pdf") {
          thumbUpload = {
            secure_url: cloudinary.url(mainUpload.public_id + ".jpg", { 
              resource_type: "image", 
              page: 1, 
              quality: "auto", 
              fetch_format: "auto" 
            }),
            public_id: mainUpload.public_id + "-thumb",
          };
        } else if (type === "image") {
          thumbUpload = {
            secure_url: mainUpload.secure_url,
            public_id: mainUpload.public_id + "-thumb",
          };
        }
      }
    } catch (thumbError) {
      console.warn("Thumbnail generation warning:", thumbError.message);
    }

    // Get course from subject if not provided
    let finalCourseId = courseId;
    let finalSubjectId = subjectId;
    let finalTopicId = topicId;
    
    if (subjectId && !courseId) {
      try {
        const Subject = mongoose.model("Subject");
        const subject = await Subject.findById(subjectId);
        if (subject) {
          finalCourseId = subject.courseId;
        }
      } catch (err) {
        console.warn("Could not find subject:", err.message);
      }
    }

    // Extract IDs
    const extractedSubjectId = extractId(finalSubjectId);
    const extractedCourseId = extractId(finalCourseId);
    const extractedTopicId = extractId(finalTopicId);

    // Save to DB
    const contentData = {
      title,
      type,
      courseId: extractedCourseId,
      subjectId: extractedSubjectId,
      topicId: extractedTopicId,  // IMPORTANT: Save topicId
      isPaid: isPaid === "true" || isPaid === true,
      price: Number(price) || 0,
      fileUrl: mainUpload?.secure_url,
      publicId: mainUpload?.public_id,
      thumbnailUrl: thumbUpload?.secure_url || "",
      thumbnailPublicId: thumbUpload?.public_id || "",
      lecturerId: req.user?._id || null,
      lecturerName: req.user?.name || "Admin",
    };

    console.log("💾 Saving content to database:", contentData);
    
    const content = await Content.create(contentData);

    // Populate the response
    const populatedContent = await Content.findById(content._id)
      .populate("subjectId", "name")
      .populate("courseId", "name");

    io.emit("content:created", populatedContent);
    res.status(201).json(populatedContent);
  } catch (err) {
    console.error("🔥 Upload failed:", err);
    res.status(500).json({ 
      message: err.message || "Upload failed",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
};

// ================= GET CONTENTS =================
export const getContents = async (req, res) => {
  try {
    const { subjectId, courseId, lecturerId, topicId } = req.query;

    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (courseId) filter.courseId = courseId;
    if (lecturerId) filter.lecturerId = lecturerId;
    if (topicId) filter.topicId = topicId;  // Add topicId filter

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

// ================= GET LECTURER'S OWN CONTENTS =================
export const getLecturerContents = async (req, res) => {
  try {
    if (req.user.role !== "lecturer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Lecturer only." });
    }
    
    const contents = await Content.find({ lecturerId: req.user._id })
      .populate("subjectId", "name")
      .populate("courseId", "name")
      .sort({ createdAt: -1 });
    
    res.json(contents);
  } catch (err) {
    console.error("Error fetching lecturer contents:", err);
    res.status(500).json({ message: "Failed to fetch contents" });
  }
};

// ================= DELETE CONTENT =================
export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (req.user.role !== "admin" && content.lecturerId?.toString() !== req.user._id?.toString()) {
      return res.status(403).json({ message: "You can only delete your own content" });
    }

    if (content.publicId && content.type !== "quiz") {
      try {
        await cloudinary.uploader.destroy(content.publicId, {
          resource_type: content.type === "video" ? "video" : "auto",
        });
        console.log("✅ Deleted main file:", content.publicId);
      } catch (err) {
        console.error("Failed to delete main file:", err);
      }
    }

    if (content.thumbnailPublicId) {
      try {
        await cloudinary.uploader.destroy(content.thumbnailPublicId, {
          resource_type: "image",
        });
        console.log("✅ Deleted thumbnail:", content.thumbnailPublicId);
      } catch (err) {
        console.error("Failed to delete thumbnail:", err);
      }
    }

    await content.deleteOne();
    console.log("✅ Content deleted from database");

    io.emit("content:deleted", content._id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// ================= UPDATE CONTENT =================
export const updateContent = async (req, res) => {
  try {
    const { title, isPaid, price, quizTimerMinutes, quizPassMark, topicId } = req.body;

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (req.user.role !== "admin" && content.lecturerId?.toString() !== req.user._id?.toString()) {
      return res.status(403).json({ message: "You can only edit your own content" });
    }

    // For quiz type, just update text fields
    if (content.type === "quiz") {
      if (title !== undefined) content.title = title;
      if (isPaid !== undefined) content.isPaid = isPaid === "true" || isPaid === true;
      if (price !== undefined) content.price = Number(price) || 0;
      if (quizTimerMinutes !== undefined) content.quizTimerMinutes = Number(quizTimerMinutes) || 0;
      if (quizPassMark !== undefined) content.quizPassMark = Number(quizPassMark) || 70;
      if (topicId !== undefined) content.topicId = topicId || null;  // Update topicId

      const updated = await content.save();
      const populatedContent = await Content.findById(updated._id)
        .populate("subjectId", "name")
        .populate("courseId", "name");
      
      io.emit("content:updated", populatedContent);
      return res.json(populatedContent);
    }

    // Helper function for Cloudinary upload
    const uploadToCloudinary = (file, fileType, folder = "alveoly-content") =>
      new Promise((resolve, reject) => {
        const resourceType = fileType === "pdf" ? "raw" : "auto";
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder,
            timeout: 120000,
          },
          (err, result) => {
            if (err) {
              console.error("Cloudinary upload error:", err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
      
    const newFile = req.files?.file?.[0] || null;
    const newThumb = req.files?.thumbnail?.[0] || null;

    // UPDATE MAIN FILE
    if (newFile) {
      if (newFile.size > 100 * 1024 * 1024) {
        return res.status(400).json({ 
          message: `File too large! Maximum size is 100MB.` 
        });
      }
      
      if (content.publicId) {
        try {
          await cloudinary.uploader.destroy(content.publicId, {
            resource_type: content.type === "video" ? "video" : "auto",
          });
        } catch (err) {
          console.error("Failed to delete old file:", err);
        }
      }

      const uploaded = await uploadToCloudinary(newFile, content.type);
      content.fileUrl = uploaded.secure_url;
      content.publicId = uploaded.public_id;
    }

    // UPDATE THUMBNAIL
    if (newThumb) {
      if (newThumb.size > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          message: `Thumbnail too large! Maximum size is 5MB.` 
        });
      }
      
      if (content.thumbnailPublicId) {
        try {
          await cloudinary.uploader.destroy(content.thumbnailPublicId, {
            resource_type: "image",
          });
        } catch (err) {
          console.error("Failed to delete old thumbnail:", err);
        }
      }

      const uploadedThumb = await uploadToCloudinary(newThumb, "image", "alveoly-thumbnails");
      content.thumbnailUrl = uploadedThumb.secure_url;
      content.thumbnailPublicId = uploadedThumb.public_id;
    }

    // TEXT UPDATE
    if (title !== undefined) content.title = title;
    if (isPaid !== undefined) content.isPaid = isPaid === "true" || isPaid === true;
    if (price !== undefined) content.price = Number(price) || 0;
    if (topicId !== undefined) content.topicId = topicId || null;  // Update topicId

    const updated = await content.save();
    const populatedContent = await Content.findById(updated._id)
      .populate("subjectId", "name")
      .populate("courseId", "name");

    io.emit("content:updated", populatedContent);

    res.json(populatedContent);
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET CONTENT BY ID =================
export const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate("subjectId", "name")
      .populate("courseId", "name")
      .populate("lecturerId", "name email");
    
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    if (req.user.role !== "admin" && content.lecturerId?._id?.toString() !== req.user._id?.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(content);
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ message: err.message });
  }
};