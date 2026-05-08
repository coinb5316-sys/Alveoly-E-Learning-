// controllers/studentLecturerController.js - NEW FILE
import LecturerContent from "../models/LecturerContent.js";
import LecturerAttempt from "../models/LecturerAttempt.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// Get available content for student
export const getAvailableContent = async (req, res) => {
  try {
    const { type, courseId, subjectId } = req.query;
    
    const filter = {
      isPublished: true,
      courseId: req.user.courseId,
    };
    
    if (type) filter.type = type;
    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    
    const content = await LecturerContent.find(filter)
      .populate("lecturerId", "name email lecturerInfo")
      .populate("courseId", "name")
      .populate("subjectId", "name")
      .sort({ orderIndex: 1, createdAt: -1 });
    
    // Get student's attempts to show progress
    const contentIds = content.map(c => c._id);
    const attempts = await LecturerAttempt.find({
      studentId: req.user._id,
      contentId: { $in: contentIds },
    });
    
    const contentWithProgress = content.map(c => {
      const studentAttempts = attempts.filter(a => a.contentId.toString() === c._id.toString());
      const bestAttempt = studentAttempts.sort((a, b) => b.percentage - a.percentage)[0];
      
      return {
        ...c.toObject(),
        studentAttempts: studentAttempts.length,
        bestScore: bestAttempt?.percentage || 0,
        isCompleted: studentAttempts.some(a => a.isPassed),
        lastAttempt: studentAttempts[0] || null,
      };
    });
    
    res.json({
      success: true,
      content: contentWithProgress,
    });
  } catch (err) {
    console.error("Get available content error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get content details
export const getContentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await LecturerContent.findOne({
      _id: id,
      isPublished: true,
    }).populate("lecturerId", "name lecturerInfo");
    
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    // Check if student has access to this course
    if (content.courseId.toString() !== req.user.courseId?.toString()) {
      return res.status(403).json({ message: "You don't have access to this content" });
    }
    
    // Get student's previous attempts
    const attempts = await LecturerAttempt.find({
      contentId: id,
      studentId: req.user._id,
    }).sort({ createdAt: -1 });
    
    const canAttempt = attempts.length < content.maxAttempts ||
                      (attempts.some(a => a.isPassed && a.maxAttempts > attempts.length));
    
    res.json({
      success: true,
      content,
      attempts,
      canAttempt,
      remainingAttempts: Math.max(0, content.maxAttempts - attempts.length),
    });
  } catch (err) {
    console.error("Get content details error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Start an attempt
export const startAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await LecturerContent.findOne({
      _id: id,
      isPublished: true,
    });
    
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    // Check if student has already passed
    const existingPassed = await LecturerAttempt.findOne({
      contentId: id,
      studentId: req.user._id,
      isPassed: true,
    });
    
    if (existingPassed && content.maxAttempts === 1) {
      return res.status(403).json({ message: "You have already passed this content" });
    }
    
    // Check attempt limit
    const existingAttempts = await LecturerAttempt.countDocuments({
      contentId: id,
      studentId: req.user._id,
    });
    
    if (existingAttempts >= content.maxAttempts) {
      return res.status(403).json({ message: "Maximum attempts reached" });
    }
    
    // Check for in-progress attempt
    const inProgress = await LecturerAttempt.findOne({
      contentId: id,
      studentId: req.user._id,
      status: "in-progress",
    });
    
    if (inProgress) {
      return res.json({
        success: true,
        attemptId: inProgress._id,
        attempt: inProgress,
        questions: content.questions,
        timerMinutes: content.timerMinutes,
      });
    }
    
    // Create new attempt
    const attempt = await LecturerAttempt.create({
      studentId: req.user._id,
      contentId: content._id,
      lecturerId: content.lecturerId,
      courseId: content.courseId,
      subjectId: content.subjectId,
      studentName: req.user.name,
      studentEmail: req.user.email,
      contentTitle: content.title,
      contentType: content.type,
      totalPoints: content.questions.reduce((sum, q) => sum + (q.points || 1), 0),
      attemptNumber: existingAttempts + 1,
      status: "in-progress",
    });
    
    res.json({
      success: true,
      attemptId: attempt._id,
      attempt,
      questions: content.questions,
      timerMinutes: content.timerMinutes,
    });
  } catch (err) {
    console.error("Start attempt error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Submit attempt
export const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeSpent } = req.body;
    
    const attempt = await LecturerAttempt.findById(attemptId).populate("contentId");
    
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    if (attempt.status !== "in-progress") {
      return res.status(403).json({ message: "Attempt already submitted" });
    }
    
    const content = attempt.contentId;
    let totalScore = 0;
    const gradedAnswers = [];
    
    // Grade the answers
    for (let i = 0; i < content.questions.length; i++) {
      const question = content.questions[i];
      const userAnswer = answers[i];
      
      let isCorrect = false;
      let pointsEarned = 0;
      
      if (question.type === "essay") {
        // Essay questions need manual grading
        pointsEarned = 0;
        isCorrect = false;
      } else {
        // Multiple choice and true/false
        isCorrect = userAnswer === question.correctAnswer;
        pointsEarned = isCorrect ? (question.points || 1) : 0;
      }
      
      if (pointsEarned > 0) totalScore += pointsEarned;
      
      gradedAnswers.push({
        questionId: i,
        question: question.question,
        selectedAnswer: userAnswer,
        isCorrect,
        pointsEarned,
        feedback: "",
      });
    }
    
    const percentage = (totalScore / attempt.totalPoints) * 100;
    const isPassed = percentage >= (content.passMark || 70);
    
    attempt.answers = gradedAnswers;
    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.isPassed = isPassed;
    attempt.timeSpent = timeSpent || 0;
    attempt.submittedAt = new Date();
    
    if (content.type !== "assignment") {
      attempt.status = "completed";
    } else {
      attempt.status = "completed";
    }
    
    await attempt.save();
    
    // Notify lecturer about submission (for assignments)
    if (content.type === "assignment") {
      await createNotification(
        content.lecturerId,
        "lecturer",
        "info",
        `📝 New Assignment Submission`,
        `${req.user.name} submitted "${content.title}"`,
        `/lecturer/attempts/${attempt._id}`,
        { attemptId: attempt._id, studentId: req.user._id }
      );
    }
    
    // Notify student about completion
    const passedText = isPassed ? "passed" : "did not pass";
    await createNotification(
      req.user._id,
      "student",
      isPassed ? "success" : "info",
      isPassed ? `🎉 ${content.title} Completed!` : `📝 ${content.title} Attempt`,
      `You ${passedText} with ${Math.round(percentage)}% (${totalScore}/${attempt.totalPoints} points).`,
      `/student/results/${attempt._id}`,
      { attemptId: attempt._id, percentage, passed: isPassed }
    );
    
    res.json({
      success: true,
      message: "Attempt submitted successfully",
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (err) {
    console.error("Submit attempt error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get student's attempts
export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await LecturerAttempt.find({
      studentId: req.user._id,
    })
      .populate("contentId", "title type timerMinutes")
      .populate("lecturerId", "name")
      .sort({ submittedAt: -1 });
    
    const stats = {
      totalAttempts: attempts.length,
      completedAttempts: attempts.filter(a => a.status === "completed").length,
      passedAttempts: attempts.filter(a => a.isPassed).length,
      averageScore: 0,
    };
    
    const completed = attempts.filter(a => a.status === "completed");
    if (completed.length > 0) {
      stats.averageScore = Math.round(
        completed.reduce((sum, a) => sum + a.percentage, 0) / completed.length
      );
    }
    
    res.json({
      success: true,
      attempts,
      stats,
    });
  } catch (err) {
    console.error("Get my attempts error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get attempt details
export const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await LecturerAttempt.findOne({
      _id: attemptId,
      studentId: req.user._id,
    })
      .populate("contentId", "title type timerMinutes passMark questions")
      .populate("lecturerId", "name email lecturerInfo");
    
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    res.json({
      success: true,
      attempt,
    });
  } catch (err) {
    console.error("Get attempt details error:", err);
    res.status(500).json({ message: err.message });
  }
};