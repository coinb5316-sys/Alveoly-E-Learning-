// controllers/trialController.js - Updated with notifications
import TrialAttempt from "../models/TrialAttempt.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// ================= SUBMIT TRIAL =================
export const submitTrial = async (req, res) => {
  try {
    const { subjectId, courseId, answers, duration } = req.body;

    if (!subjectId || !courseId) {
      return res.status(400).json({
        message: "Missing subject or course",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        message: "Answers are required",
      });
    }

    // Get questions
    const questions = await Question.find({
      subjectId,
      courseId,
      type: "trial",
    });

    if (!questions.length) {
      return res.status(404).json({
        message: "No trial questions found",
      });
    }

    let score = 0;
    const detailedResults = [];

    // Calculate score
    questions.forEach((question) => {
      const studentAnswerText = answers[question._id.toString()];
      
      const isCorrect = studentAnswerText && question.correctAnswer && 
        studentAnswerText.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      
      if (isCorrect) {
        score++;
      }

      let studentAnswerLetter = null;
      if (studentAnswerText && question.options) {
        const optionIndex = question.options.findIndex(
          opt => opt.toLowerCase().trim() === studentAnswerText.toLowerCase().trim()
        );
        if (optionIndex !== -1) {
          studentAnswerLetter = String.fromCharCode(65 + optionIndex);
        }
      }

      detailedResults.push({
        questionId: question._id,
        questionText: question.question,
        userAnswer: studentAnswerLetter,
        userAnswerText: studentAnswerText,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
      });
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

    let performanceLevel = "poor";
    if (percentage >= 80) performanceLevel = "excellent";
    else if (percentage >= 60) performanceLevel = "good";
    else if (percentage >= 40) performanceLevel = "average";

    const attempt = await TrialAttempt.create({
      userId: req.user._id,
      subjectId,
      courseId,
      answers: JSON.stringify(answers),
      score,
      percentage,
      totalQuestions,
      duration: duration || 0,
      performance: performanceLevel,
      detailedResults,
    });

    // Send notification to student about trial completion
    const performanceMessage = performanceLevel === "excellent" ? "Excellent work!" :
                               performanceLevel === "good" ? "Good job!" :
                               performanceLevel === "average" ? "Good effort!" :
                               "Keep practicing!";

    await createNotification(
      req.user._id,
      "student",
      percentage >= 70 ? "success" : "info",
      percentage >= 70 ? "🎉 Practice Session Complete!" : "📝 Practice Session",
      `${performanceMessage} You scored ${percentage}% (${score}/${totalQuestions}) on your practice session.`,
      "/student/progress",
      { trialId: attempt._id, score, percentage, performance: performanceLevel }
    );

    // If performance is poor, send encouragement notification
    if (percentage < 50) {
      await createNotification(
        req.user._id,
        "student",
        "info",
        "💪 Keep Learning!",
        `Keep practicing! Review the material and try again. You've got this!`,
        `/student/subjects?course=${courseId}`,
        { trialId: attempt._id, score, percentage }
      );
    }

    // Notify admins about student progress (for low scores)
    if (percentage < 60) {
      const adminUsers = await User.find({ role: "admin" });
      for (const admin of adminUsers) {
        await createNotification(
          admin._id,
          "admin",
          "info",
          "Student Needs Support",
          `${req.user.name} scored ${percentage}% on a practice session for ${attempt.subjectId?.name || "subject"}.`,
          "/admin/performance",
          { userId: req.user._id, trialId: attempt._id, percentage }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Trial submitted successfully",
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        performance: attempt.performance,
        totalQuestions: attempt.totalQuestions,
        duration: attempt.duration,
        createdAt: attempt.createdAt
      }
    });

  } catch (error) {
    console.error("Trial Submit Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// ================= GET PROGRESS =================
export const getTrialProgress = async (req, res) => {
  try {
    const attempts = await TrialAttempt.find({
      userId: req.user._id,
    })
      .populate("subjectId", "name")
      .populate("courseId", "name")
      .sort({ createdAt: -1 });

    const totalTime = attempts.reduce((acc, a) => acc + (a.duration || 0), 0);
    
    const averageScore = attempts.length
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
      : 0;

    const bestScore = attempts.length
      ? Math.max(...attempts.map((a) => a.percentage))
      : 0;

    const subjectWise = {};
    attempts.forEach(attempt => {
      const subjectName = attempt.subjectId?.name || "Unknown Subject";
      if (!subjectWise[subjectName]) {
        subjectWise[subjectName] = {
          totalScore: 0,
          count: 0,
          bestScore: 0
        };
      }
      subjectWise[subjectName].totalScore += attempt.percentage;
      subjectWise[subjectName].count++;
      subjectWise[subjectName].bestScore = Math.max(subjectWise[subjectName].bestScore, attempt.percentage);
    });

    Object.keys(subjectWise).forEach(subject => {
      subjectWise[subject].averageScore = Math.round(subjectWise[subject].totalScore / subjectWise[subject].count);
    });

    res.json({
      success: true,
      attempts,
      stats: {
        totalAttempts: attempts.length,
        averageScore,
        bestScore,
        totalTime,
        subjectWise
      },
    });

  } catch (error) {
    console.error("❌ Progress Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress: " + error.message,
    });
  }
};

// ================= GET SINGLE TRIAL DETAILS =================
export const getTrialDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await TrialAttempt.findById(attemptId)
      .populate("subjectId", "name")
      .populate("courseId", "name");
    
    if (!attempt) {
      return res.status(404).json({ message: "Trial attempt not found" });
    }
    
    if (attempt.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to view this attempt" });
    }
    
    res.json({
      success: true,
      attempt
    });
  } catch (error) {
    console.error("❌ Get Trial Details Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ================= GET PERFORMANCE PREDICTION =================
export const getPerformancePrediction = async (req, res) => {
  try {
    const attempts = await TrialAttempt.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 }).limit(10);

    if (attempts.length === 0) {
      return res.json({
        success: true,
        prediction: 70,
        trend: "stable",
        message: "Complete more practice sessions to get accurate predictions."
      });
    }

    const recentScores = attempts.map(a => a.percentage);
    const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    
    let trend = "stable";
    if (recentScores.length >= 3) {
      const recent = recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const older = recentScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
      if (recent > older + 5) trend = "improving";
      else if (recent < older - 5) trend = "declining";
    }

    let predictedScore = Math.min(100, Math.max(0, averageScore + (trend === "improving" ? 5 : trend === "declining" ? -5 : 0)));

    res.json({
      success: true,
      prediction: Math.round(predictedScore),
      trend,
      averageScore: Math.round(averageScore),
      totalAttempts: attempts.length,
      message: trend === "improving" ? "Great progress! Keep it up!" :
               trend === "declining" ? "Focus on weak areas to improve." :
               "Keep practicing to see improvement!"
    });
  } catch (error) {
    console.error("Performance prediction error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ================= DELETE TRIAL ATTEMPT =================
export const deleteTrialAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await TrialAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Trial attempt not found" });
    }
    
    // Only admins can delete trial attempts
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const studentName = attempt.userId?.name || "Student";
    const subjectName = attempt.subjectId?.name || "Subject";
    
    await TrialAttempt.findByIdAndDelete(attemptId);
    
    // Notify student that their attempt was deleted
    await createNotification(
      attempt.userId,
      "student",
      "warning",
      "📝 Practice Session Removed",
      `Your practice session for "${subjectName}" has been removed by an administrator.`,
      "/student/progress",
      { attemptId, action: "attempt_deleted" }
    );
    
    res.json({ 
      success: true, 
      message: `Deleted trial attempt for ${studentName}`,
      student: studentName,
      subject: subjectName,
    });
  } catch (err) {
    console.error("Delete trial attempt error:", err);
    res.status(500).json({ message: err.message });
  }
};