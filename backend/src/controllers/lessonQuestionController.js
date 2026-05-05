// controllers/lessonQuestionController.js - Updated with notifications
import LessonQuestion from "../models/LessonQuestion.js";
import LessonAttempt from "../models/LessonAttempt.js";
import Content from "../models/Content.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

// ================= CREATE/UPDATE LESSON QUESTIONS =================
export const saveLessonQuestions = async (req, res) => {
  try {
    const { lessonId, questions, timerMinutes } = req.body;
    
    if (!lessonId) {
      return res.status(400).json({ message: "Lesson ID is required" });
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }
    
    const lesson = await Content.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    await LessonQuestion.deleteMany({ lessonId });
    
    const questionsToSave = questions.map((q, idx) => ({
      lessonId,
      subjectId: lesson.subjectId,
      courseId: lesson.courseId,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      rationale: q.rationale || "",
      points: q.points || 1,
      order: idx,
      timerMinutes: timerMinutes || 0,
    }));
    
    const savedQuestions = await LessonQuestion.insertMany(questionsToSave);
    
    res.json({
      success: true,
      message: `${savedQuestions.length} questions saved for lesson`,
      questions: savedQuestions,
      timerMinutes: timerMinutes || 0,
    });
  } catch (err) {
    console.error("Save lesson questions error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET LESSON QUESTIONS =================
export const getLessonQuestions = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const questions = await LessonQuestion.find({ lessonId }).sort({ order: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= START LESSON QUIZ =================
export const startLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Content.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    const questions = await LessonQuestion.find({ lessonId }).sort({ order: 1 });
    
    if (!questions.length) {
      return res.status(404).json({ message: "No questions found for this lesson" });
    }
    
    const timerMinutes = questions[0]?.timerMinutes || 0;
    
    // Check if student has already completed this quiz
    const existingCompleted = await LessonAttempt.findOne({
      userId: req.user._id,
      lessonId,
      status: "completed",
    }).sort({ completedAt: -1 });
    
    if (existingCompleted) {
      const adminAllowedRetake = existingCompleted.adminAllowedRetake;
      
      if (!adminAllowedRetake) {
        return res.status(403).json({
          message: "You have already completed this quiz. Contact admin for retake permission.",
          canRetake: false,
          previousScore: existingCompleted.percentage,
        });
      }
    }
    
    // Check for in-progress attempt
    let attempt = await LessonAttempt.findOne({
      userId: req.user._id,
      lessonId,
      status: "in-progress",
    });
    
    if (attempt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      const remainingSeconds = Math.max(0, (timerMinutes * 60) - elapsedSeconds);
      
      return res.json({
        attemptId: attempt._id,
        questions,
        timerMinutes,
        remainingSeconds,
        attempt: {
          score: attempt.score,
          percentage: attempt.percentage,
          totalQuestions: attempt.questions.length,
        },
      });
    }
    
    let previousAttemptId = null;
    if (existingCompleted && existingCompleted.adminAllowedRetake) {
      previousAttemptId = existingCompleted._id;
    }
    
    const formattedQuestions = questions.map((q) => ({
      questionId: q._id,
      questionText: q.question,
      selected: "",
      selectedText: "",
      correct: q.correctAnswer,
      correctText: q.options[q.correctAnswer.charCodeAt(0) - 65],
      isCorrect: false,
      points: q.points,
      rationale: q.rationale,
    }));
    
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    
    attempt = await LessonAttempt.create({
      userId: req.user._id,
      lessonId,
      subjectId: lesson.subjectId,
      courseId: lesson.courseId,
      userName: req.user.name,
      userEmail: req.user.email,
      questions: formattedQuestions,
      totalPoints,
      attempts: existingCompleted ? existingCompleted.attempts + 1 : 1,
      status: "in-progress",
      startedAt: new Date(),
      replacesAttemptId: previousAttemptId,
    });
    
    res.json({
      attemptId: attempt._id,
      questions,
      timerMinutes,
      remainingSeconds: timerMinutes * 60,
      attempt: {
        score: attempt.score,
        percentage: attempt.percentage,
        totalQuestions: questions.length,
      },
    });
  } catch (err) {
    console.error("Start lesson quiz error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= SUBMIT LESSON QUIZ =================
export const submitLessonQuiz = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    
    const attempt = await LessonAttempt.findById(attemptId).populate("lessonId", "title");
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    if (attempt.status !== "in-progress") {
      return res.status(403).json({ message: "Quiz already submitted" });
    }
    
    const questions = await LessonQuestion.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });
    
    let totalScore = 0;
    
    attempt.questions.forEach(question => {
      const userAnswerLetter = answers[question.questionId.toString()];
      const fullQuestion = questions.find(q => q._id.toString() === question.questionId.toString());
      
      if (fullQuestion && userAnswerLetter) {
        const answerIndex = userAnswerLetter.charCodeAt(0) - 65;
        const answerText = fullQuestion.options[answerIndex];
        const isCorrect = userAnswerLetter === fullQuestion.correctAnswer;
        
        question.selected = userAnswerLetter;
        question.selectedText = answerText;
        question.isCorrect = isCorrect;
        
        if (isCorrect) {
          totalScore += (question.points || 1);
        }
      }
    });
    
    const percentage = (totalScore / attempt.totalPoints) * 100;
    const isPassed = percentage >= (attempt.passMark || 70);
    
    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.status = "completed";
    attempt.completedAt = new Date();
    attempt.lessonCompleted = isPassed;
    
    await attempt.save();
    
    if (attempt.replacesAttemptId) {
      await LessonAttempt.findByIdAndDelete(attempt.replacesAttemptId);
    }
    
    // Send notification to student about quiz result
    const passedText = isPassed ? "passed" : "did not pass";
    await createNotification(
      attempt.userId,
      "student",
      isPassed ? "success" : "warning",
      isPassed ? "🎉 Quiz Completed!" : "📝 Quiz Attempt",
      `You ${passedText} "${attempt.lessonId?.title || 'Quiz'}" with ${Math.round(percentage)}% (${totalScore}/${attempt.totalPoints} points).`,
      "/student/progress",
      { quizId: attempt.lessonId, score: totalScore, percentage, passed: isPassed }
    );
    
    // If student failed multiple times, send encouragement notification
    if (!isPassed && attempt.attempts >= 2) {
      await createNotification(
        attempt.userId,
        "student",
        "info",
        "💪 Keep Practicing!",
        `You've attempted this quiz ${attempt.attempts} time${attempt.attempts !== 1 ? 's' : ''}. Review the material and try again!`,
        `/student/lessons/${attempt.lessonId}`,
        { quizId: attempt.lessonId, attempts: attempt.attempts }
      );
    }
    
    const questionResults = attempt.questions.map(q => {
      const fullQuestion = questions.find(fq => fq._id.toString() === q.questionId.toString());
      return {
        questionId: q.questionId,
        questionText: q.questionText,
        userAnswerLetter: q.selected,
        userAnswerText: q.selectedText,
        correctAnswer: q.correct,
        correctAnswerText: fullQuestion?.options[q.correct.charCodeAt(0) - 65],
        isCorrect: q.isCorrect,
        rationale: q.rationale,
      };
    });
    
    res.json({
      success: true,
      score: totalScore,
      totalPoints: attempt.totalPoints,
      percentage: percentage,
      passed: isPassed,
      message: isPassed ? "Congratulations! You passed the quiz!" : "You did not pass.",
      questionResults,
    });
  } catch (err) {
    console.error("Submit lesson quiz error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= ADMIN ALLOW RETAKE =================
export const allowRetake = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await LessonAttempt.findById(attemptId).populate("userId", "name email");
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    if (attempt.status !== "completed") {
      return res.status(400).json({ message: "Can only allow retake for completed quizzes" });
    }
    
    attempt.adminAllowedRetake = true;
    await attempt.save();
    
    // Notify student that they can retake the quiz
    await createNotification(
      attempt.userId,
      "student",
      "info",
      "🔄 Retake Permission Granted",
      `Your request to retake "${attempt.lessonId?.title || 'Quiz'}" has been approved. You can now attempt it again.`,
      `/student/lessons/${attempt.lessonId}/quiz`,
      { quizId: attempt.lessonId, action: "retake_allowed" }
    );
    
    res.json({ 
      success: true, 
      message: "Student can now retake this quiz",
      student: attempt.userName,
      lesson: attempt.lessonId,
    });
  } catch (err) {
    console.error("Allow retake error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET STUDENT PROGRESS =================
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const attempts = await LessonAttempt.find({ 
      userId: studentId, 
      status: "completed" 
    })
      .populate("lessonId", "title type")
      .populate("subjectId", "name")
      .sort({ completedAt: -1 });
    
    const uniqueLessons = [...new Set(attempts.map(a => a.lessonId?._id?.toString()))];
    const completedLessons = attempts.filter(a => a.lessonCompleted).length;
    
    const averageScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
      : 0;
    
    res.json({
      attempts,
      stats: {
        completedLessons,
        totalLessons: uniqueLessons.length,
        averageScore: Math.round(averageScore),
        totalAttempts: attempts.length,
      },
    });
  } catch (err) {
    console.error("Get student progress error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET SUBJECT PERFORMANCE (ADMIN) =================
export const getSubjectPerformance = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const attempts = await LessonAttempt.find({ 
      subjectId: subjectId,
      status: "completed" 
    })
      .populate("userId", "name email")
      .populate("lessonId", "title")
      .sort({ completedAt: -1 });
    
    const processedAttempts = attempts.map(attempt => {
      const attemptObj = attempt.toObject({ virtuals: true });
      const percentage = attemptObj.percentage || 0;
      const passMark = attemptObj.passMark || 70;
      attemptObj.isPassed = percentage >= passMark;
      return attemptObj;
    });
    
    let totalScore = 0;
    let passedCount = 0;
    const completedLessonsSet = new Set();
    
    processedAttempts.forEach(attempt => {
      totalScore += attempt.percentage || 0;
      if (attempt.isPassed) passedCount++;
      if (attempt.lessonCompleted) {
        completedLessonsSet.add(attempt.lessonId?._id?.toString());
      }
    });
    
    const stats = {
      totalAttempts: processedAttempts.length,
      averageScore: processedAttempts.length > 0 ? Math.round(totalScore / processedAttempts.length) : 0,
      passRate: processedAttempts.length > 0 ? Math.round((passedCount / processedAttempts.length) * 100) : 0,
      completedLessons: completedLessonsSet.size,
    };
    
    res.json({ attempts: processedAttempts, stats });
  } catch (err) {
    console.error("Get subject performance error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET LESSON PERFORMANCE =================
export const getLessonPerformance = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const attempts = await LessonAttempt.find({ 
      lessonId, 
      status: "completed" 
    })
      .populate("userId", "name email")
      .sort({ percentage: -1 });
    
    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0,
      passRate: attempts.length > 0
        ? Math.round((attempts.filter(a => a.isPassed).length / attempts.length) * 100)
        : 0,
      bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0,
      worstScore: attempts.length > 0 ? Math.min(...attempts.map(a => a.percentage)) : 0,
    };
    
    res.json({ attempts, stats });
  } catch (err) {
    console.error("Get lesson performance error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE ATTEMPT (ADMIN) =================
export const deleteAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await LessonAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    
    const studentName = attempt.userName;
    const lessonTitle = attempt.lessonId?.title || "Unknown lesson";
    
    await LessonAttempt.findByIdAndDelete(attemptId);
    
    res.json({ 
      success: true, 
      message: `Deleted attempt for ${studentName}`,
      student: studentName,
      lesson: lessonTitle,
    });
  } catch (err) {
    console.error("Delete attempt error:", err);
    res.status(500).json({ message: err.message });
  }
};