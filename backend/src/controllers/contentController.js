// controllers/contentController.js - Fixed version
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
      isPaid, 
      price, 
      quizTimerMinutes, 
      quizPassMark 
    } = req.body;

    console.log("📝 Received upload request:", { title, type, subjectId, courseId });

    // VALIDATION
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // For quiz type, skip Cloudinary entirely - just save to database
    if (type === "quiz") {
      console.log("📝 Creating quiz content (no file upload)");
      
      // If subjectId is provided but courseId isn't, get courseId from subject
      let finalCourseId = courseId;
      let finalSubjectId = subjectId;
      
      if (subjectId && !courseId) {
        const Subject = mongoose.model("Subject");
        const subject = await Subject.findById(subjectId);
        if (subject) {
          finalCourseId = subject.courseId;
          console.log(`📚 Found course ID from subject: ${finalCourseId}`);
        }
      }

      // Save quiz to DB without any file uploads
      const contentData = {
        title,
        type: "quiz",
        courseId: finalCourseId,
        subjectId: finalSubjectId,
        isPaid: isPaid === "true" || isPaid === true,
        price: Number(price) || 0,
        quizTimerMinutes: Number(quizTimerMinutes) || 0,
        quizPassMark: Number(quizPassMark) || 70,
      };

      console.log("💾 Saving quiz to database:", contentData);
      
      const content = await Content.create(contentData);
      io.emit("content:created", content);
      return res.status(201).json(content);
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

    console.log(`📁 Uploading ${type} file: ${mainFile.originalname}`);

    const uploadToCloudinary = (file, fileType, folder = "alveoly-content") =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: fileType === "pdf" ? "raw" : "auto",
            folder,
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
      // Upload main content
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
      // Continue without thumbnail
    }

    // If subjectId is provided but courseId isn't, get courseId from subject
    let finalCourseId = courseId;
    let finalSubjectId = subjectId;
    
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

    // Save to DB
    const contentData = {
      title,
      type,
      courseId: finalCourseId,
      subjectId: finalSubjectId,
      isPaid: isPaid === "true" || isPaid === true,
      price: Number(price) || 0,
      fileUrl: mainUpload?.secure_url,
      publicId: mainUpload?.public_id,
      thumbnailUrl: thumbUpload?.secure_url || "",
      thumbnailPublicId: thumbUpload?.public_id || "",
    };

    console.log("💾 Saving content to database:", contentData);
    
    const content = await Content.create(contentData);

    io.emit("content:created", content);
    res.status(201).json(content);
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
    const { subjectId, courseId } = req.query;

    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (courseId) filter.courseId = courseId;

    const contents = await Content.find(filter)
      .populate("subjectId", "name")
      .populate("courseId", "name")
      .sort({ createdAt: -1 });

    res.json(contents);
  } catch (err) {
    console.error("Fetch contents failed:", err);
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

    // DELETE MAIN FILE (only if not a quiz and has publicId)
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

    // DELETE THUMBNAIL
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
    const { title, isPaid, price, quizTimerMinutes, quizPassMark } = req.body;

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // For quiz type, just update text fields
    if (content.type === "quiz") {
      if (title !== undefined) content.title = title;
      if (isPaid !== undefined) content.isPaid = isPaid === "true" || isPaid === true;
      if (price !== undefined) content.price = Number(price) || 0;
      if (quizTimerMinutes !== undefined) content.quizTimerMinutes = Number(quizTimerMinutes) || 0;
      if (quizPassMark !== undefined) content.quizPassMark = Number(quizPassMark) || 70;

      const updated = await content.save();
      io.emit("content:updated", updated);
      return res.json(updated);
    }

    // For non-quiz types, handle file uploads
    const uploadToCloudinary = (file, type, folder = "alveoly-content") =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: type === "pdf" ? "raw" : "auto",
            folder,
          },
          (err, result) => {
            if (result) resolve(result);
            else reject(err);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const newFile = req.files?.file?.[0] || null;
    const newThumb = req.files?.thumbnail?.[0] || null;

    // UPDATE MAIN FILE
    if (newFile) {
      if (content.publicId) {
        await cloudinary.uploader.destroy(content.publicId, {
          resource_type: content.type === "video" ? "video" : "auto",
        });
      }

      const uploaded = await uploadToCloudinary(newFile, content.type);
      content.fileUrl = uploaded.secure_url;
      content.publicId = uploaded.public_id;
    }

    // UPDATE THUMBNAIL
    if (newThumb) {
      if (content.thumbnailPublicId) {
        await cloudinary.uploader.destroy(content.thumbnailPublicId, {
          resource_type: "image",
        });
      }

      const uploadedThumb = await uploadToCloudinary(
        newThumb,
        "image",
        "alveoly-thumbnails"
      );

      content.thumbnailUrl = uploadedThumb.secure_url;
      content.thumbnailPublicId = uploadedThumb.public_id;
    }

    // TEXT UPDATE
    if (title !== undefined) content.title = title;
    if (isPaid !== undefined) content.isPaid = isPaid === "true" || isPaid === true;
    if (price !== undefined) content.price = Number(price) || 0;

    const updated = await content.save();

    io.emit("content:updated", updated);

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};