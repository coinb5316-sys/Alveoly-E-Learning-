// controllers/lecturerController.js - NEW FILE
import LecturerContent from "../models/LecturerContent.js";
import LecturerAttempt from "../models/LecturerAttempt.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import { createNotification } from "./notificationController.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

// ================= CONTENT MANAGEMENT =================

// Create Content (Lesson, Exam, Practice, Assignment, Resource)
export const createContent = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      courseId,
      subjectId,
      content,
      questions,
      timerMinutes,
      passMark,
      maxAttempts,
      isLocked,
      orderIndex,
    } = req.body;

    // Validation
    if (!title || !type || !courseId || !subjectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if lecturer is assigned to this course/subject
    const lecturer = await User.findById(req.user._id);
    const hasAccess = lecturer.lecturerInfo?.assignedCourses?.includes(courseId) ||
                      lecturer.lecturerInfo?.assignedSubjects?.includes(subjectId);
    
    if (!hasAccess && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not assigned to this course/subject" });
    }

    // Handle file upload if present
    let fileUrl = null;
    let filePublicId = null;
    let attachments = [];

    if (req.files?.file?.[0]) {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "lecturer-content", resource_type: "auto" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.files.file[0].buffer).pipe(stream);
      });
      
      const upload = await uploadPromise;
      fileUrl = upload.secure_url;
      filePublicId = upload.public_id;
    }

    if (req.files?.attachments) {
      for (const file of req.files.attachments) {
        const uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "lecturer-attachments", resource_type: "auto" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        
        const upload = await uploadPromise;
        attachments.push({
          name: file.originalname,
          url: upload.secure_url,
          publicId: upload.public_id,
          type: file.mimetype,
        });
      }
    }

    // Parse questions if provided
    let parsedQuestions = [];
    if (questions && typeof questions === "string") {
      parsedQuestions = JSON.parse(questions);
    } else if (questions && Array.isArray(questions)) {
      parsedQuestions = questions;
    }

    const newContent = await LecturerContent.create({
      title,
      type,
      description: description || "",
      lecturerId: req.user._id,
      courseId,
      subjectId,
      content: content || "",
      fileUrl,
      filePublicId,
      attachments,
      questions: parsedQuestions,
      timerMinutes: timerMinutes || 0,
      passMark: passMark || 70,
      maxAttempts: maxAttempts || 1,
      isLocked: isLocked === "true" || isLocked === true,
      orderIndex: orderIndex || 0,
      isPublished: false,
    });

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      content: newContent,
    });
  } catch (err) {
    console.error("Create content error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get Lecturer's Content
export const getMyContent = async (req, res) => {
  try {
    const { type, courseId, subjectId, isPublished } = req.query;
    
    const filter = { lecturerId: req.user._id };
    if (type) filter.type = type;
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";
    
    const content = await LecturerContent.find(filter)
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ orderIndex: 1, createdAt: -1 });
    
    res.json({
      success: true,
      content,
    });
  } catch (err) {
    console.error("Get content error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update Content
export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const content = await LecturerContent.findOne({
      _id: id,
      lecturerId: req.user._id,
    });
    
    if (!content) {
      return res.status(404).json({ message: "Content not found or unauthorized" });
    }
    
    // Handle questions parsing
    if (updates.questions && typeof updates.questions === "string") {
      updates.questions = JSON.parse(updates.questions);
    }
    
    Object.assign(content, updates);
    await content.save();
    
    res.json({
      success: true,
      message: "Content updated successfully",
      content,
    });
  } catch (err) {
    console.error("Update content error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Publish/Unpublish Content
export const publishContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    
    const content = await LecturerContent.findOne({
      _id: id,
      lecturerId: req.user._id,
    });
    
    if (!content) {
      return res.status(404).json({ message: "Content not found or unauthorized" });
    }
    
    content.isPublished = isPublished;
    if (isPublished && !content.publishedAt) {
      content.publishedAt = new Date();
    }
    await content.save();
    
    // Notify students in this course about new content
    if (isPublished) {
      const students = await User.find({
        courseId: content.courseId,
        role: "student",
      });
      
      for (const student of students) {
        await createNotification(
          student._id,
          "student",
          "info",
          `📚 New ${content.type} available`,
          `${content.title} has been added to your course.`,
          `/student/lecturer-content/${id}`,
          { contentId: id, type: content.type }
        );
      }
    }
    
    res.json({
      success: true,
      message: `Content ${isPublished ? "published" : "unpublished"} successfully`,
      content,
    });
  } catch (err) {
    console.error("Publish content error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete Content
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await LecturerContent.findOne({
      _id: id,
      lecturerId: req.user._id,
    });
    
    if (!content) {
      return res.status(404).json({ message: "Content not found or unauthorized" });
    }
    
    // Delete files from Cloudinary
    if (content.filePublicId) {
      await cloudinary.uploader.destroy(content.filePublicId);
    }
    for (const attachment of content.attachments) {
      if (attachment.publicId) {
        await cloudinary.uploader.destroy(attachment.publicId);
      }
    }
    
    await content.deleteOne();
    
    res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (err) {
    console.error("Delete content error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= STUDENT ATTEMPTS & GRADING =================

// Get Student Attempts for Lecturer's Content
export const getStudentAttempts = async (req, res) => {
  try {
    const { contentId, studentId, status } = req.query;
    
    const filter = { lecturerId: req.user._id };
    if (contentId) filter.contentId = contentId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    
    const attempts = await LecturerAttempt.find(filter)
      .populate("studentId", "name email")
      .populate("contentId", "title type")
      .sort({ createdAt: -1 });
    
    // Calculate stats
    const stats = {
      totalAttempts: attempts.length,
      completedAttempts: attempts.filter(a => a.status === "completed").length,
      averageScore: 0,
      passRate: 0,
    };
    
    const completedAttempts = attempts.filter(a => a.status === "completed");
    if (completedAttempts.length > 0) {
      stats.averageScore = Math.round(
        completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length
      );
      stats.passRate = Math.round(
        (completedAttempts.filter(a => a.isPassed).length / completedAttempts.length) * 100
      );
    }
    
    res.json({
      success: true,
      attempts,
      stats,
    });
  } catch (err) {
    console.error("Get student attempts error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Grade Student Submission (for essays/assignments)
export const gradeSubmission = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { score, feedback, grade } = req.body;
    
    const attempt = await LecturerAttempt.findOne({
      _id: attemptId,
      lecturerId: req.user._id,
    }).populate("contentId", "title type totalPoints");
    
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found or unauthorized" });
    }
    
    const percentage = (score / attempt.totalPoints) * 100;
    const isPassed = percentage >= (attempt.contentId?.passMark || 70);
    
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.isPassed = isPassed;
    attempt.status = "completed";
    attempt.submittedAt = new Date();
    attempt.lecturerFeedback = feedback || "";
    attempt.feedbackGivenAt = new Date();
    attempt.grade = grade || (isPassed ? percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : "D" : "F");
    
    await attempt.save();
    
    // Notify student about grade
    await createNotification(
      attempt.studentId,
      "student",
      "success",
      `📝 ${attempt.contentTitle} - Graded`,
      `Your submission has been graded: ${percentage}%. ${feedback || ""}`,
      `/student/results/${attemptId}`,
      { attemptId, score: attempt.score, percentage: attempt.percentage }
    );
    
    res.json({
      success: true,
      message: "Submission graded successfully",
      attempt,
    });
  } catch (err) {
    console.error("Grade submission error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= ANALYTICS & REPORTS =================

// Get Overall Performance Analytics
export const getPerformanceAnalytics = async (req, res) => {
  try {
    const { courseId, subjectId, dateFrom, dateTo } = req.query;
    
    const filter = { lecturerId: req.user._id };
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (dateFrom && dateTo) {
      filter.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }
    
    // Get all content
    const contentItems = await LecturerContent.find(filter);
    const contentIds = contentItems.map(c => c._id);
    
    // Get all attempts
    const attempts = await LecturerAttempt.find({
      contentId: { $in: contentIds },
      status: "completed",
    });
    
    // Calculate analytics
    const analytics = {
      totalContent: contentItems.length,
      publishedContent: contentItems.filter(c => c.isPublished).length,
      totalAttempts: attempts.length,
      totalStudents: [...new Set(attempts.map(a => a.studentId.toString()))].length,
      averageScore: 0,
      passRate: 0,
      contentPerformance: [],
      studentPerformance: [],
    };
    
    if (attempts.length > 0) {
      analytics.averageScore = Math.round(
        attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
      );
      analytics.passRate = Math.round(
        (attempts.filter(a => a.isPassed).length / attempts.length) * 100
      );
    }
    
    // Content performance breakdown
    for (const content of contentItems) {
      const contentAttempts = attempts.filter(a => a.contentId.toString() === content._id.toString());
      analytics.contentPerformance.push({
        contentId: content._id,
        title: content.title,
        type: content.type,
        attempts: contentAttempts.length,
        averageScore: contentAttempts.length > 0
          ? Math.round(contentAttempts.reduce((sum, a) => sum + a.percentage, 0) / contentAttempts.length)
          : 0,
        passRate: contentAttempts.length > 0
          ? Math.round((contentAttempts.filter(a => a.isPassed).length / contentAttempts.length) * 100)
          : 0,
      });
    }
    
    // Student performance breakdown
    const studentMap = new Map();
    for (const attempt of attempts) {
      if (!studentMap.has(attempt.studentId.toString())) {
        studentMap.set(attempt.studentId.toString(), {
          studentId: attempt.studentId,
          studentName: attempt.studentName,
          studentEmail: attempt.studentEmail,
          attempts: [],
          totalScore: 0,
        });
      }
      const student = studentMap.get(attempt.studentId.toString());
      student.attempts.push(attempt);
      student.totalScore += attempt.percentage;
    }
    
    analytics.studentPerformance = Array.from(studentMap.values()).map(student => ({
      studentId: student.studentId,
      studentName: student.studentName,
      studentEmail: student.studentEmail,
      totalAttempts: student.attempts.length,
      averageScore: Math.round(student.totalScore / student.attempts.length),
      completedContent: student.attempts.length,
    }));
    
    res.json({
      success: true,
      analytics,
    });
  } catch (err) {
    console.error("Get analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get Student Detailed Report
export const getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Verify student exists and is in lecturer's course
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Get all attempts by this student for lecturer's content
    const attempts = await LecturerAttempt.find({
      studentId,
      lecturerId: req.user._id,
    }).populate("contentId", "title type timerMinutes");
    
    const report = {
      studentInfo: {
        id: student._id,
        name: student.name,
        email: student.email,
        courseId: student.courseId,
      },
      summary: {
        totalAttempts: attempts.length,
        completedAttempts: attempts.filter(a => a.status === "completed").length,
        averageScore: 0,
        passedCount: 0,
        totalTimeSpent: 0,
      },
      contentBreakdown: [],
      weakAreas: [],
      strongAreas: [],
    };
    
    const completedAttempts = attempts.filter(a => a.status === "completed");
    
    if (completedAttempts.length > 0) {
      report.summary.averageScore = Math.round(
        completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length
      );
      report.summary.passedCount = completedAttempts.filter(a => a.isPassed).length;
      report.summary.totalTimeSpent = completedAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    }
    
    // Content breakdown
    for (const attempt of completedAttempts) {
      report.contentBreakdown.push({
        contentId: attempt.contentId?._id,
        title: attempt.contentTitle,
        type: attempt.contentType,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        submittedAt: attempt.submittedAt,
        attemptNumber: attempt.attemptNumber,
      });
    }
    
    res.json({
      success: true,
      report,
    });
  } catch (err) {
    console.error("Get student report error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= LECTURER PROFILE MANAGEMENT =================

// Update Lecturer Profile
export const updateLecturerProfile = async (req, res) => {
  try {
    const { department, title, specialization, bio, phoneNumber } = req.body;
    
    const user = await User.findById(req.user._id);
    
    user.lecturerInfo = {
      ...user.lecturerInfo,
      department: department || user.lecturerInfo?.department,
      title: title || user.lecturerInfo?.title,
      specialization: specialization || user.lecturerInfo?.specialization,
      bio: bio || user.lecturerInfo?.bio,
      phoneNumber: phoneNumber || user.lecturerInfo?.phoneNumber,
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      lecturerInfo: user.lecturerInfo,
    });
  } catch (err) {
    console.error("Update lecturer profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get Lecturer Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const content = await LecturerContent.find({ lecturerId: req.user._id });
    const contentIds = content.map(c => c._id);
    
    const attempts = await LecturerAttempt.find({
      contentId: { $in: contentIds },
    });
    
    const completedAttempts = attempts.filter(a => a.status === "completed");
    
    const stats = {
      totalContent: content.length,
      publishedContent: content.filter(c => c.isPublished).length,
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      pendingGrading: 0,
      averageScore: 0,
      totalStudents: [...new Set(attempts.map(a => a.studentId.toString()))].length,
      recentContent: content.slice(0, 5),
      recentAttempts: attempts.slice(0, 10),
    };
    
    if (completedAttempts.length > 0) {
      stats.averageScore = Math.round(
        completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length
      );
    }
    
    // Count pending grading (assignments without feedback)
    stats.pendingGrading = attempts.filter(
      a => a.contentType === "assignment" && !a.lecturerFeedback && a.status === "completed"
    ).length;
    
    res.json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error("Get dashboard stats error:", err);
    res.status(500).json({ message: err.message });
  }
};