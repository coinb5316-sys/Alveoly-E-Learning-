// controllers/examController.js - Fixed subject name handling
import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";
import Course from "../models/Course.js";

// ✅ GET EXAM SETTINGS FOR SUBJECT
export const getExamSettingsForSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const examQuestion = await Question.findOne({
      subjectId,
      type: "exam"
    });
    
    if (!examQuestion) {
      return res.json({ examTime: null, isExamLocked: false });
    }
    
    res.json({
      examTime: examQuestion.examTime,
      isExamLocked: examQuestion.isExamLocked
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ START EXAM
export const startExam = async (req, res) => {
  try {
    const { courseId, subjectId } = req.body;

    if (!courseId || !subjectId) {
      return res.status(400).json({ message: "Course and Subject required" });
    }

    // Get subject name
    const subject = await Subject.findById(subjectId);
    const subjectName = subject ? subject.name : "Unknown Subject";
    
    // Get course name
    const course = await Course.findById(courseId);
    const courseName = course ? course.name : "Unknown Course";

    let attempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "in-progress"
    });

    const questions = await Question.find({
      courseId,
      subjectId,
      type: "exam",
    });

    if (!questions.length) {
      return res.status(404).json({ message: "No exam questions found" });
    }

    const duration = (questions[0].examTime || 30) * 60;

    if (attempt) {
      return res.json({
        attemptId: attempt._id,
        questions,
        duration: attempt.duration || duration,
      });
    }

    const completedAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
      status: "submitted",
      resitAllowed: false
    });

    if (completedAttempt) {
      return res.status(403).json({
        message: "You have already completed this exam. Resit not allowed.",
      });
    }

    const lastAttempt = await ExamAttempt.findOne({
      userId: req.user._id,
      courseId,
      subjectId,
    }).sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    const formattedQuestions = questions.map((q) => ({
      questionId: q._id,
      correct: q.correctAnswer,
      selected: "",
      isCorrect: false,
    }));

    attempt = await ExamAttempt.create({
      userId: req.user._id,
      courseId,
      subjectId,
      userName: req.user.name,
      courseName: courseName,
      subjectName: subjectName, // Now properly set
      questions: formattedQuestions,
      attemptNumber,
      status: "in-progress",
      startedAt: new Date(),
      duration,
      resitAllowed: false,
    });

    res.json({
      attemptId: attempt._id,
      questions,
      duration,
    });

  } catch (err) {
    console.error("Start Exam Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ SAVE PROGRESS
export const saveProgress = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }

    if (attempt.status === "submitted") {
      return res.status(403).json({ message: "Cannot save a submitted exam." });
    }

    const questions = await Question.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });

    attempt.questions.forEach(question => {
      const answerLetter = answers[question.questionId.toString()];
      if (answerLetter !== undefined) {
        question.selected = answerLetter;
        
        const fullQuestion = questions.find(q => q._id.toString() === question.questionId.toString());
        
        if (fullQuestion && answerLetter) {
          const answerIndex = answerLetter.charCodeAt(0) - 65;
          const answerText = fullQuestion.options[answerIndex];
          const correctText = question.correct;
          
          const isCorrect = answerText && correctText && 
            answerText.toLowerCase().trim() === correctText.toLowerCase().trim();
          question.isCorrect = isCorrect;
        }
      }
    });

    await attempt.save();
    res.json({ message: "Progress saved" });

  } catch (err) {
    console.error("Save Progress Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

// ✅ SUBMIT EXAM
export const submitExam = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    console.log("\n========== EXAM SUBMISSION START ==========");
    console.log("Attempt ID:", attemptId);

    if (!attemptId) {
      return res.status(400).json({ message: "Attempt ID required" });
    }

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }

    if (attempt.status === "submitted") {
      return res.status(403).json({ message: "Exam already submitted" });
    }

    const questions = await Question.find({
      _id: { $in: attempt.questions.map(q => q.questionId) }
    });

    let correctCount = 0;

    attempt.questions.forEach(question => {
      const answerLetter = answers[question.questionId.toString()];
      if (answerLetter !== undefined) {
        question.selected = answerLetter;
        
        const fullQuestion = questions.find(q => q._id.toString() === question.questionId.toString());
        
        if (fullQuestion && answerLetter) {
          const answerIndex = answerLetter.charCodeAt(0) - 65;
          const answerText = fullQuestion.options[answerIndex];
          const correctText = question.correct;
          
          const isCorrect = answerText && correctText && 
            answerText.toLowerCase().trim() === correctText.toLowerCase().trim();
          
          question.isCorrect = isCorrect;
          if (isCorrect) correctCount++;
        }
      }
    });

    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.score = correctCount;
    attempt.percentage = (correctCount / attempt.totalQuestions) * 100;
    attempt.result = attempt.percentage >= 70 ? "pass" : "fail";
    
    await attempt.save();

    console.log(`\n✅ Exam submitted! Score: ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%) - ${attempt.result}`);

    // Get the actual subject name from the attempt
    const examTitle = attempt.subjectName || "Exam";
    const resultText = attempt.result === "pass" ? "passed" : "did not pass";
    
    // Send notification to student about exam result
    await createNotification(
      attempt.userId,
      "student",
      attempt.result === "pass" ? "success" : "warning",
      attempt.result === "pass" ? "🎉 Exam Completed!" : "📝 Exam Attempt",
      `You ${resultText} "${examTitle}" with ${Math.round(attempt.percentage)}% (${attempt.score}/${attempt.totalQuestions} points).`,
      "/student/progress",
      { examId: attempt._id, score: attempt.score, percentage: attempt.percentage, passed: attempt.result === "pass" }
    );

    // If student failed, send encouragement
    if (attempt.result === "fail") {
      await createNotification(
        attempt.userId,
        "student",
        "info",
        "💪 Keep Learning!",
        `You scored ${Math.round(attempt.percentage)}% on your exam. Review the material and try again. Need help? Contact your instructor.`,
        `/student/subjects?course=${attempt.courseId}`,
        { examId: attempt._id, percentage: attempt.percentage }
      );
    }

    // Notify admins about exam completion
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await createNotification(
        admin._id,
        "admin",
        "info",
        `Exam ${attempt.result === "pass" ? "Passed" : "Attempted"}`,
        `${attempt.userName} ${resultText} "${examTitle}" with ${Math.round(attempt.percentage)}% (${attempt.score}/${attempt.totalQuestions}).`,
        "/admin/results",
        { examId: attempt._id, userId: attempt.userId, score: attempt.score, percentage: attempt.percentage }
      );
    }

    // Prepare question results for frontend
    const questionResults = attempt.questions.map(q => {
      const fullQuestion = questions.find(qu => qu._id.toString() === q.questionId.toString());
      let answerText = null;
      if (q.selected) {
        const answerIndex = q.selected.charCodeAt(0) - 65;
        if (fullQuestion && answerIndex >= 0 && answerIndex < fullQuestion.options.length) {
          answerText = fullQuestion.options[answerIndex];
        }
      }
      
      return {
        questionId: q.questionId,
        questionText: fullQuestion?.question || "",
        userAnswerLetter: q.selected,
        userAnswerText: answerText,
        correctAnswer: q.correct,
        isCorrect: q.isCorrect,
        rationale: fullQuestion?.rationale || ""
      };
    });

    res.json({
      success: true,
      score: attempt.score,
      percentage: attempt.percentage,
      result: attempt.result,
      totalQuestions: attempt.totalQuestions,
      questionResults
    });

  } catch (error) {
    console.error("Submit Exam Error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// ================= ADMIN ALLOW RESIT =================
export const allowResit = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await ExamAttempt.findById(attemptId).populate("userId", "name email");
    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }
    
    if (attempt.status !== "submitted") {
      return res.status(400).json({ message: "Can only allow resit for submitted exams" });
    }
    
    attempt.resitAllowed = true;
    await attempt.save();
    
    // Notify student that they can retake the exam
    await createNotification(
      attempt.userId,
      "student",
      "info",
      "🔄 Resit Permission Granted",
      `Your request to retake "${attempt.subjectName || 'Exam'}" has been approved. You can now attempt it again.`,
      `/student/exams/${attempt.courseId}/${attempt.subjectId}`,
      { examId: attempt._id, action: "resit_allowed" }
    );
    
    res.json({ 
      success: true, 
      message: "Student can now retake this exam",
      student: attempt.userName,
      exam: attempt.subjectName,
    });
  } catch (err) {
    console.error("Allow resit error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE EXAM ATTEMPT =================
export const deleteExamAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }
    
    const studentName = attempt.userName;
    const examTitle = attempt.subjectName || "Exam";
    
    await ExamAttempt.findByIdAndDelete(attemptId);
    
    // Notify student that their attempt was deleted
    await createNotification(
      attempt.userId,
      "student",
      "warning",
      "📝 Exam Attempt Removed",
      `Your attempt for "${examTitle}" has been removed by an administrator. Contact support if you have questions.`,
      "/student/progress",
      { examId: attempt._id, action: "attempt_deleted" }
    );
    
    res.json({ 
      success: true, 
      message: `Deleted exam attempt for ${studentName}`,
      student: studentName,
      exam: examTitle,
    });
  } catch (err) {
    console.error("Delete exam attempt error:", err);
    res.status(500).json({ message: err.message });
  }
};