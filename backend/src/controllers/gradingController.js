// controllers/gradingController.js
import LessonAttempt from "../models/LessonAttempt.js";
import LessonQuestion from "../models/LessonQuestion.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// Get pending submissions for lecturer
export const getPendingSubmissions = async (req, res) => {
  try {
    const { subjectId, type, status } = req.query;
    
    // Get lecturer's assigned subjects
    const user = await User.findById(req.user._id);
    const assignedSubjectIds = user.lecturerInfo?.assignedSubjects || [];
    
    const filter = {
      subjectId: { $in: assignedSubjectIds },
      status: "completed"
    };
    
    if (subjectId) filter.subjectId = subjectId;
    
    // Filter by grading status
    if (status === "pending") {
      filter.isGraded = false;
    } else if (status === "graded") {
      filter.isGraded = true;
    }
    
    const submissions = await LessonAttempt.find(filter)
      .populate("userId", "name email")
      .populate("lessonId", "title type")
      .populate("subjectId", "name")
      .sort({ completedAt: -1 });
    
    // Format submissions for grading
    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      studentName: sub.userId?.name || sub.userName,
      studentEmail: sub.userId?.email || sub.userEmail,
      studentId: sub.userId?._id || sub.userId,
      lessonTitle: sub.lessonId?.title || sub.lessonTitle,
      lessonId: sub.lessonId?._id || sub.lessonId,
      subjectName: sub.subjectId?.name,
      score: sub.score || 0,
      totalPoints: sub.totalPoints,
      percentage: sub.percentage || 0,
      isPassed: sub.isPassed || false,
      isGraded: sub.isGraded || false,
      gradingType: sub.gradingType || "automatic",
      submittedAt: sub.completedAt || sub.submittedAt,
      needsReview: sub.needsReview || false,
      attemptNumber: sub.attempts || 1,
    }));
    
    // Calculate stats
    const stats = {
      total: formattedSubmissions.length,
      pendingGrading: formattedSubmissions.filter(s => !s.isGraded).length,
      graded: formattedSubmissions.filter(s => s.isGraded).length,
      needsReview: formattedSubmissions.filter(s => s.needsReview).length,
      averageScore: formattedSubmissions.length > 0 
        ? Math.round(formattedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / formattedSubmissions.length)
        : 0,
      passRate: formattedSubmissions.length > 0
        ? Math.round((formattedSubmissions.filter(s => s.isPassed).length / formattedSubmissions.length) * 100)
        : 0,
    };
    
    res.json({ submissions: formattedSubmissions, stats });
  } catch (err) {
    console.error("Get pending submissions error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get submission details for grading
export const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await LessonAttempt.findById(submissionId)
      .populate("userId", "name email")
      .populate("lessonId", "title description")
      .populate("subjectId", "name");
    
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    // Get all questions with correct answers
    const questionIds = submission.questions.map(q => q.questionId);
    const questions = await LessonQuestion.find({
      _id: { $in: questionIds }
    });
    
    // Format questions with student answers
    const formattedQuestions = submission.questions.map((q, idx) => {
      const fullQuestion = questions.find(qq => qq._id.toString() === q.questionId.toString());
      return {
        id: q.questionId,
        order: idx + 1,
        questionText: q.questionText,
        studentAnswer: q.selectedText,
        studentAnswerLetter: q.selected,
        correctAnswer: q.correct,
        correctAnswerText: q.correctText,
        isCorrect: q.isCorrect,
        points: q.points || 1,
        pointsEarned: q.isCorrect ? (q.points || 1) : 0,
        rationale: q.rationale,
        lecturerFeedback: q.lecturerFeedback || "",
        needsReview: q.needsReview || false,
        options: fullQuestion?.options || [],
      };
    });
    
    const response = {
      _id: submission._id,
      student: {
        id: submission.userId?._id || submission.userId,
        name: submission.userId?.name || submission.userName,
        email: submission.userId?.email || submission.userEmail,
      },
      lesson: {
        id: submission.lessonId?._id || submission.lessonId,
        title: submission.lessonId?.title || submission.lessonTitle,
        description: submission.lessonId?.description,
      },
      subject: {
        id: submission.subjectId?._id || submission.subjectId,
        name: submission.subjectId?.name,
      },
      questions: formattedQuestions,
      score: submission.score || 0,
      totalPoints: submission.totalPoints,
      percentage: submission.percentage || 0,
      isPassed: submission.isPassed || false,
      isGraded: submission.isGraded || false,
      gradingType: submission.gradingType || "automatic",
      lecturerFeedback: submission.lecturerFeedback || "",
      grade: submission.grade || "PENDING",
      submittedAt: submission.completedAt || submission.submittedAt,
      attemptNumber: submission.attempts || 1,
      needsReview: submission.needsReview || false,
    };
    
    res.json(response);
  } catch (err) {
    console.error("Get submission details error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Auto-grade MCQ submissions
export const autoGradeMcq = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await LessonAttempt.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    // Get all questions for this lesson
    const questionIds = submission.questions.map(q => q.questionId);
    const questions = await LessonQuestion.find({
      _id: { $in: questionIds }
    });
    
    let totalScore = 0;
    const gradedQuestions = submission.questions.map(q => {
      const fullQuestion = questions.find(fq => fq._id.toString() === q.questionId.toString());
      const isCorrect = q.selected === fullQuestion?.correctAnswer;
      const pointsEarned = isCorrect ? (q.points || 1) : 0;
      
      if (isCorrect) totalScore += (q.points || 1);
      
      return {
        ...q.toObject(),
        isCorrect,
        pointsEarned,
        autoGraded: true,
      };
    });
    
    const percentage = (totalScore / submission.totalPoints) * 100;
    const isPassed = percentage >= (submission.passMark || 70);
    
    submission.questions = gradedQuestions;
    submission.score = totalScore;
    submission.percentage = percentage;
    submission.isPassed = isPassed;
    submission.isGraded = true;
    submission.gradingType = "automatic";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    
    await submission.save();
    
    // Notify student
    await createNotification(
      submission.userId,
      "student",
      isPassed ? "success" : "info",
      isPassed ? "✅ Quiz Auto-Graded" : "📝 Quiz Results Available",
      `Your "${submission.lessonId?.title || 'Quiz'}" has been auto-graded. Score: ${Math.round(percentage)}% (${totalScore}/${submission.totalPoints})`,
      `/student/results/${submissionId}`,
      { submissionId, score: totalScore, percentage, passed: isPassed }
    );
    
    res.json({
      success: true,
      score: totalScore,
      totalPoints: submission.totalPoints,
      percentage,
      isPassed,
      message: "Quiz auto-graded successfully",
    });
  } catch (err) {
    console.error("Auto-grade error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Manual grade submission
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, grade, questionGrades, overallFeedback } = req.body;
    
    const submission = await LessonAttempt.findById(submissionId)
      .populate("lessonId", "title passMark");
    
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    let totalScore = score;
    
    // Handle individual question grading
    if (questionGrades && Array.isArray(questionGrades)) {
      totalScore = 0;
      questionGrades.forEach(qg => {
        const question = submission.questions.find(q => q.questionId.toString() === qg.questionId);
        if (question) {
          question.pointsEarned = qg.pointsEarned;
          question.lecturerFeedback = qg.feedback;
          question.isCorrect = qg.pointsEarned >= (question.points || 1);
          question.manualGraded = true;
          totalScore += qg.pointsEarned;
        }
      });
    }
    
    const percentage = (totalScore / submission.totalPoints) * 100;
    const passMark = submission.passMark || submission.lessonId?.passMark || 70;
    const isPassed = percentage >= passMark;
    
    submission.score = totalScore;
    submission.percentage = percentage;
    submission.isPassed = isPassed;
    submission.isGraded = true;
    submission.gradingType = "manual";
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    submission.lecturerFeedback = overallFeedback || feedback || "";
    submission.grade = grade || (isPassed ? (percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : "D") : "F");
    
    await submission.save();
    
    // Notify student
    await createNotification(
      submission.userId,
      "student",
      "success",
      "📝 Assignment Graded",
      `Your submission for "${submission.lessonId?.title}" has been graded. Score: ${Math.round(percentage)}% (${totalScore}/${submission.totalPoints})`,
      `/student/results/${submissionId}`,
      { submissionId, score: totalScore, percentage, grade: submission.grade }
    );
    
    res.json({
      success: true,
      score: totalScore,
      totalPoints: submission.totalPoints,
      percentage,
      isPassed,
      grade: submission.grade,
      message: "Submission graded successfully",
    });
  } catch (err) {
    console.error("Manual grade error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update manual grade
export const updateManualGrade = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, grade } = req.body;
    
    const submission = await LessonAttempt.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    const percentage = (score / submission.totalPoints) * 100;
    const isPassed = percentage >= (submission.passMark || 70);
    
    submission.score = score;
    submission.percentage = percentage;
    submission.isPassed = isPassed;
    submission.lecturerFeedback = feedback || submission.lecturerFeedback;
    submission.grade = grade || submission.grade;
    submission.updatedAt = new Date();
    
    await submission.save();
    
    res.json({
      success: true,
      message: "Grade updated successfully",
      submission: {
        score: submission.score,
        percentage: submission.percentage,
        isPassed: submission.isPassed,
        grade: submission.grade,
      },
    });
  } catch (err) {
    console.error("Update grade error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add feedback to individual question
export const addQuestionFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { questionId, feedback, pointsEarned } = req.body;
    
    const submission = await LessonAttempt.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    const question = submission.questions.find(q => q.questionId.toString() === questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    question.lecturerFeedback = feedback;
    if (pointsEarned !== undefined) {
      question.pointsEarned = pointsEarned;
      question.isCorrect = pointsEarned >= (question.points || 1);
      
      // Recalculate total score
      let totalScore = 0;
      submission.questions.forEach(q => {
        totalScore += q.pointsEarned || 0;
      });
      
      const percentage = (totalScore / submission.totalPoints) * 100;
      submission.score = totalScore;
      submission.percentage = percentage;
      submission.isPassed = percentage >= (submission.passMark || 70);
    }
    
    await submission.save();
    
    res.json({
      success: true,
      message: "Feedback added successfully",
      question: {
        id: question.questionId,
        feedback: question.lecturerFeedback,
        pointsEarned: question.pointsEarned,
      },
    });
  } catch (err) {
    console.error("Add question feedback error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Request resubmission from student
export const requestResubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { reason, allowRetake } = req.body;
    
    const submission = await LessonAttempt.findById(submissionId)
      .populate("lessonId", "title");
    
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    submission.needsResubmission = true;
    submission.resubmissionReason = reason;
    submission.resubmissionRequestedAt = new Date();
    
    if (allowRetake) {
      submission.adminAllowedRetake = true;
    }
    
    await submission.save();
    
    await createNotification(
      submission.userId,
      "student",
      "warning",
      "🔄 Resubmission Requested",
      `Your submission for "${submission.lessonId?.title}" needs revision. Reason: ${reason}`,
      `/student/submissions/${submissionId}`,
      { submissionId, reason }
    );
    
    res.json({
      success: true,
      message: "Resubmission requested successfully",
    });
  } catch (err) {
    console.error("Request resubmission error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Bulk grade submissions
export const bulkGradeSubmissions = async (req, res) => {
  try {
    const { submissionIds, autoGrade, passThreshold } = req.body;
    
    const results = [];
    
    for (const submissionId of submissionIds) {
      const submission = await LessonAttempt.findById(submissionId);
      if (!submission) continue;
      
      if (autoGrade) {
        // Auto-grade logic for multiple choice
        const questionIds = submission.questions.map(q => q.questionId);
        const questions = await LessonQuestion.find({
          _id: { $in: questionIds }
        });
        
        let totalScore = 0;
        submission.questions.forEach(q => {
          const fullQuestion = questions.find(fq => fq._id.toString() === q.questionId.toString());
          const isCorrect = q.selected === fullQuestion?.correctAnswer;
          if (isCorrect) {
            totalScore += (q.points || 1);
            q.isCorrect = true;
            q.pointsEarned = q.points || 1;
          } else {
            q.isCorrect = false;
            q.pointsEarned = 0;
          }
        });
        
        const percentage = (totalScore / submission.totalPoints) * 100;
        submission.score = totalScore;
        submission.percentage = percentage;
        submission.isPassed = percentage >= (passThreshold || 70);
        submission.isGraded = true;
        submission.gradingType = "automatic";
        
        results.push({
          submissionId,
          score: totalScore,
          percentage,
          passed: submission.isPassed,
        });
      }
      
      await submission.save();
    }
    
    res.json({
      success: true,
      graded: results.length,
      results,
    });
  } catch (err) {
    console.error("Bulk grade error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get grading statistics
export const getGradingStats = async (req, res) => {
  try {
    // Get lecturer's assigned subjects
    const user = await User.findById(req.user._id);
    const assignedSubjectIds = user.lecturerInfo?.assignedSubjects || [];
    
    const submissions = await LessonAttempt.find({
      subjectId: { $in: assignedSubjectIds },
      status: "completed",
    });
    
    const stats = {
      total: submissions.length,
      pending: submissions.filter(s => !s.isGraded).length,
      graded: submissions.filter(s => s.isGraded).length,
      autoGraded: submissions.filter(s => s.gradingType === "automatic").length,
      manualGraded: submissions.filter(s => s.gradingType === "manual").length,
      needsReview: submissions.filter(s => s.needsReview).length,
      averageScore: submissions.length > 0
        ? Math.round(submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / submissions.length)
        : 0,
      passRate: submissions.length > 0
        ? Math.round((submissions.filter(s => s.isPassed).length / submissions.length) * 100)
        : 0,
      bySubject: {},
    };
    
    // Group by subject
    submissions.forEach(s => {
      const subjectId = s.subjectId?.toString();
      if (subjectId) {
        if (!stats.bySubject[subjectId]) {
          stats.bySubject[subjectId] = { total: 0, pending: 0, graded: 0 };
        }
        stats.bySubject[subjectId].total++;
        if (!s.isGraded) stats.bySubject[subjectId].pending++;
        else stats.bySubject[subjectId].graded++;
      }
    });
    
    res.json(stats);
  } catch (err) {
    console.error("Get grading stats error:", err);
    res.status(500).json({ message: err.message });
  }
};