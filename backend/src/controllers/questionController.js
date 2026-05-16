// controllers/questionController.js - CLEAN FIXED VERSION (no duplicates)
import Question from "../models/Question.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";
import { io } from "../../server.js";

// ================= GET QUESTIONS =================
// ================= GET QUESTIONS =================
export const getQuestions = async (req, res) => {
  try {
    const { courseId, subjectId } = req.query;

    const filter = {};

    if (courseId && courseId !== "undefined" && courseId !== "null") {
      filter.courseId = courseId;
    }

    if (subjectId && subjectId !== "undefined" && subjectId !== "null") {
      filter.subjectId = subjectId;
    }
    
    // For students: show approved questions from BOTH admin AND lecturers
    // For lecturers: only show their own questions or approved ones for their subjects
    if (req.user.role === "student") {
      // Students see approved questions from both sources
      filter.status = "approved";
      // Don't filter by source - show both admin and lecturer approved questions
    } else if (req.user.role === "lecturer") {
      // Lecturers see approved questions for their assigned subjects
      // plus their own questions regardless of status
      filter.$or = [
        { status: "approved" },
        { createdBy: req.user._id }
      ];
    }
    // Admin sees everything (no filter)
    
    const questions = await Question.find(filter);
    res.json(questions);
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= CREATE SINGLE QUESTION (Admin only) =================
export const createQuestion = async (req, res) => {
  try {
    const data = req.body;

    const cleanOptions = data.options.filter(opt => opt && opt.trim() !== "");

    const answerIndex = data.correctAnswer?.charCodeAt(0) - 65;

    const correctAnswerValue = cleanOptions[answerIndex];

    const isLocked = data.type === "exam" ? data.isExamLocked || false : false;

    const question = await Question.create({
      ...data,
      options: cleanOptions,
      correctAnswer: correctAnswerValue,
      isLocked,
      status: "approved",
      source: "admin",
      createdBy: req.user._id,
    });

    io.emit("question:created", question);
    res.status(201).json(question);
  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= CREATE MULTIPLE QUESTIONS (Admin only) =================
export const createMultipleQuestions = async (req, res) => {
  try {
    const questionsData = req.body.questions;

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return res.status(400).json({ message: "No questions provided" });
    }

    const createdQuestions = [];

    for (const data of questionsData) {
      if (!data.courseId || !data.subjectId || !data.question) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!Array.isArray(data.options) || data.options.length < 2) {
        return res.status(400).json({ message: "At least 2 options required" });
      }

      const cleanOptions = data.options.filter(opt => opt && opt.trim() !== "");

      if (cleanOptions.length < 2) {
        return res.status(400).json({ message: "Options cannot be empty" });
      }

      const answerIndex = data.correctAnswer?.charCodeAt(0) - 65;

      if (answerIndex < 0 || answerIndex >= cleanOptions.length) {
        return res.status(400).json({ message: "Invalid correct answer" });
      }

      const correctAnswerValue = cleanOptions[answerIndex];

      const isLocked = data.type === "exam" ? data.isExamLocked || false : false;

      const question = await Question.create({
        ...data,
        options: cleanOptions,
        correctAnswer: correctAnswerValue,
        isLocked,
        status: "approved",
        source: "admin",
        createdBy: req.user._id,
      });

      createdQuestions.push(question);
      io.emit("question:created", question);
    }

    res.status(201).json(createdQuestions);
  } catch (error) {
    console.error("Create Multiple Questions Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE QUESTION =================
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    await Question.deleteOne({ _id: req.params.id });
    io.emit("question:deleted", req.params.id);
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Delete Question Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE QUESTION =================
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    Object.assign(question, req.body);
    const updated = await question.save();

    io.emit("question:updated", updated);
    res.json(updated);
  } catch (error) {
    console.error("Update Question Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= LECTURER SPECIFIC FUNCTIONS =================

// GET LECTURER'S OWN QUESTIONS
export const getMyLecturerQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ 
      createdBy: req.user._id,
      source: "lecturer"
    }).sort({ createdAt: -1 });
    
    res.json(questions);
  } catch (error) {
    console.error("Get my questions error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE MULTIPLE QUESTIONS AS LECTURER (needs approval)
export const createLecturerQuestionsBulk = async (req, res) => {
  try {
    const questionsData = req.body.questions;

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return res.status(400).json({ message: "No questions provided" });
    }

    const createdQuestions = [];

    for (const data of questionsData) {
      if (!data.courseId || !data.subjectId || !data.question) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!Array.isArray(data.options) || data.options.length < 2) {
        return res.status(400).json({ message: "At least 2 options required" });
      }

      const cleanOptions = data.options.filter(opt => opt && opt.trim() !== "");

      if (cleanOptions.length < 2) {
        return res.status(400).json({ message: "Options cannot be empty" });
      }

      const answerIndex = data.correctAnswer?.charCodeAt(0) - 65;

      if (answerIndex < 0 || answerIndex >= cleanOptions.length) {
        return res.status(400).json({ message: "Invalid correct answer" });
      }

      const correctAnswerValue = cleanOptions[answerIndex];

      const question = await Question.create({
        ...data,
        options: cleanOptions,
        correctAnswer: correctAnswerValue,
        status: "pending",
        source: "lecturer",
        createdBy: req.user._id,
        submittedForApprovalAt: new Date(),
      });

      createdQuestions.push(question);
    }

    // Notify admins about new questions pending approval
    try {
      const adminUsers = await User.find({ role: "admin" });
      for (const admin of adminUsers) {
        await createNotification(
          admin._id,
          "admin",
          "info",
          "📝 New Exam Questions Pending Approval",
          `${req.user.name} has submitted ${createdQuestions.length} question(s) for approval.`,
          "/admin/questions?filter=pending",
          { 
            lecturerId: req.user._id, 
            lecturerName: req.user.name,
            questionCount: createdQuestions.length 
          }
        );
      }
    } catch (notifyErr) {
      console.error("Failed to send admin notifications:", notifyErr);
    }

    res.status(201).json({ 
      success: true, 
      message: `${createdQuestions.length} questions submitted for admin approval`,
      questions: createdQuestions 
    });

  } catch (error) {
    console.error("Create Lecturer Questions Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE LECTURER'S OWN QUESTION
export const deleteLecturerQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      source: "lecturer"
    });
    
    if (!question) {
      return res.status(404).json({ message: "Question not found or unauthorized" });
    }

    if (question.status === "approved") {
      return res.status(400).json({ message: "Cannot delete approved questions. Contact admin." });
    }

    await Question.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    console.error("Delete lecturer question error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= ADMIN APPROVAL FUNCTIONS =================

// APPROVE QUESTION (Admin only)
export const approveQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    if (question.status === "approved") {
      return res.status(400).json({ message: "Question already approved" });
    }
    
    question.status = "approved";
    question.approvedBy = req.user._id;
    question.approvedAt = new Date();
    
    await question.save();
    
    if (question.createdBy) {
      await createNotification(
        question.createdBy,
        "lecturer",
        "success",
        "✅ Question Approved",
        `Your question "${question.question.substring(0, 50)}..." has been approved and is now available to students.`,
        "/lecturer/exams",
        { questionId: question._id, status: question.status }
      );
    }
    
    res.json({ 
      success: true, 
      message: "Question approved",
      question 
    });
  } catch (error) {
    console.error("Approve question error:", error);
    res.status(500).json({ message: error.message });
  }
};

// REJECT QUESTION (Admin only)
export const rejectQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    if (question.status === "approved") {
      return res.status(400).json({ message: "Cannot reject an already approved question" });
    }
    
    question.status = "rejected";
    question.rejectionReason = rejectionReason;
    question.approvedBy = req.user._id;
    question.approvedAt = new Date();
    
    await question.save();
    
    if (question.createdBy) {
      await createNotification(
        question.createdBy,
        "lecturer",
        "warning",
        "📝 Question Rejected",
        `Your question "${question.question.substring(0, 50)}..." was rejected. Reason: ${rejectionReason}`,
        "/lecturer/exams",
        { questionId: question._id, status: question.status, rejectionReason }
      );
    }
    
    res.json({ 
      success: true, 
      message: "Question rejected",
      question 
    });
  } catch (error) {
    console.error("Reject question error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET PENDING QUESTIONS (Admin only)
export const getPendingQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ 
      status: "pending",
      source: "lecturer"
    })
      .populate("createdBy", "name email")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ submittedForApprovalAt: 1 });
    
    res.json(questions);
  } catch (error) {
    console.error("Get pending questions error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add this function to your questionController.js

// GET PENDING QUESTIONS WITH STATS (Admin only)
export const getPendingQuestionsWithStats = async (req, res) => {
  try {
    // Get ALL lecturer-submitted questions regardless of status
    const questions = await Question.find({ 
      source: "lecturer"
    })
      .populate("createdBy", "name email")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ submittedForApprovalAt: -1 });
    
    res.json(questions);
  } catch (error) {
    console.error("Get questions with stats error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Also add this for lecturer to update their own questions
export const updateLecturerQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      source: "lecturer"
    });
    
    if (!question) {
      return res.status(404).json({ message: "Question not found or unauthorized" });
    }
    
    // Update question fields
    const updateData = req.body;
    
    // Don't allow changing approved questions without admin
    if (question.status === "approved" && updateData.status !== "pending") {
      return res.status(400).json({ message: "Cannot modify approved questions directly" });
    }
    
    // Process options and correct answer
    if (updateData.options) {
      const cleanOptions = updateData.options.filter(opt => opt && opt.trim() !== "");
      if (cleanOptions.length < 2) {
        return res.status(400).json({ message: "At least 2 options required" });
      }
      updateData.options = cleanOptions;
      
      if (updateData.correctAnswer) {
        const answerIndex = updateData.correctAnswer.charCodeAt(0) - 65;
        if (answerIndex >= 0 && answerIndex < cleanOptions.length) {
          updateData.correctAnswer = cleanOptions[answerIndex];
        }
      }
    }
    
    // Update the question
    Object.assign(question, updateData);
    question.status = "pending"; // Reset to pending for re-approval
    question.submittedForApprovalAt = new Date();
    
    await question.save();
    
    // Notify admins
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        "admin",
        "info",
        "📝 Question Updated and Resubmitted",
        `${req.user.name} has updated a question and resubmitted it for approval.`,
        "/admin/questions?filter=pending",
        { 
          lecturerId: req.user._id, 
          lecturerName: req.user.name,
          questionId: question._id 
        }
      );
    }
    
    res.json({ 
      success: true, 
      message: "Question updated and resubmitted for approval",
      question 
    });
  } catch (error) {
    console.error("Update lecturer question error:", error);
    res.status(500).json({ message: error.message });
  }
};