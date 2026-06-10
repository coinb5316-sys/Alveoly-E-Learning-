import express from 'express';
import mongoose from 'mongoose';
import NursingGame from '../models/NursingGame.js';
import NursingGameAttempt from '../models/NursingGameAttempt.js';
import NursingGameLeaderboard from '../models/NursingGameLeaderboard.js';
import { protect, lecturerOnly, adminOrLecturer } from '../middleware/authMiddleware.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

const router = express.Router();

// ================= LECTURER ROUTES =================

// Create a new nursing game
router.post('/games', protect, lecturerOnly, async (req, res) => {
  try {
    const gameData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const game = new NursingGame(gameData);
    await game.save();
    
    res.status(201).json({
      success: true,
      message: 'Nursing game created successfully',
      game
    });
  } catch (error) {
    console.error('Error creating nursing game:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a nursing game
router.put('/games/:gameId', protect, lecturerOnly, async (req, res) => {
  try {
    const game = await NursingGame.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    if (game.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this game' });
    }
    
    Object.assign(game, req.body);
    await game.save();
    
    res.json({
      success: true,
      message: 'Game updated successfully',
      game
    });
  } catch (error) {
    console.error('Error updating nursing game:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload diagram image
router.post('/upload-diagram', protect, lecturerOnly, async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    
    const uploadResult = await uploadToCloudinary(image, 'nursing-games/diagrams');
    
    res.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    console.error('Error uploading diagram:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get lecturer's games
router.get('/my-games', protect, lecturerOnly, async (req, res) => {
  try {
    const games = await NursingGame.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    // Get attempt statistics for each game
    const gamesWithStats = await Promise.all(games.map(async (game) => {
      const attempts = await NursingGameAttempt.find({ gameId: game._id });
      const completedAttempts = attempts.filter(a => a.status === 'completed');
      const averageScore = completedAttempts.length > 0 
        ? completedAttempts.reduce((sum, a) => sum + a.percentageScore, 0) / completedAttempts.length
        : 0;
      
      return {
        ...game.toObject(),
        stats: {
          totalAttempts: attempts.length,
          completedAttempts: completedAttempts.length,
          averageScore: Math.round(averageScore),
          passRate: completedAttempts.length > 0 
            ? Math.round((completedAttempts.filter(a => a.passed).length / completedAttempts.length) * 100)
            : 0
        }
      };
    }));
    
    res.json({
      success: true,
      games: gamesWithStats
    });
  } catch (error) {
    console.error('Error fetching lecturer games:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get game attempts for grading
router.get('/games/:gameId/attempts', protect, lecturerOnly, async (req, res) => {
  try {
    const game = await NursingGame.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    if (game.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const attempts = await NursingGameAttempt.find({ gameId: game._id, status: 'completed' })
      .populate('studentId', 'name email profilePicture')
      .sort({ percentageScore: -1, timeSpent: 1 });
    
    res.json({
      success: true,
      game,
      attempts
    });
  } catch (error) {
    console.error('Error fetching game attempts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Publish/unpublish game
router.patch('/games/:gameId/toggle-publish', protect, lecturerOnly, async (req, res) => {
  try {
    const game = await NursingGame.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    if (game.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    game.isPublished = !game.isPublished;
    game.publishedAt = game.isPublished ? new Date() : null;
    await game.save();
    
    res.json({
      success: true,
      message: game.isPublished ? 'Game published successfully' : 'Game unpublished',
      isPublished: game.isPublished
    });
  } catch (error) {
    console.error('Error toggling publish:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete game
router.delete('/games/:gameId', protect, lecturerOnly, async (req, res) => {
  try {
    const game = await NursingGame.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    if (game.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Delete all associated attempts and leaderboard entries
    await NursingGameAttempt.deleteMany({ gameId: game._id });
    await NursingGameLeaderboard.deleteMany({ gameId: game._id });
    await game.deleteOne();
    
    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= STUDENT ROUTES =================

// Get all published games
router.get('/games', protect, async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    let query = { isPublished: true, isActive: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const games = await NursingGame.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    
    // Get student's attempts for each game
    const gamesWithStudentData = await Promise.all(games.map(async (game) => {
      const attempts = await NursingGameAttempt.find({
        gameId: game._id,
        studentId: req.user._id
      }).sort({ createdAt: -1 });
      
      const bestAttempt = attempts.find(a => a.status === 'completed' && a.passed);
      const inProgressAttempt = attempts.find(a => a.status === 'in-progress');
      const attemptsCount = attempts.length;
      
      return {
        ...game.toObject(),
        studentData: {
          hasAttempted: attemptsCount > 0,
          bestScore: bestAttempt ? bestAttempt.percentageScore : 0,
          bestScoreDetails: bestAttempt,
          inProgress: !!inProgressAttempt,
          inProgressAttemptId: inProgressAttempt?._id,
          attemptsLeft: Math.max(0, game.attemptsAllowed - attemptsCount),
          attemptsCount
        }
      };
    }));
    
    res.json({
      success: true,
      games: gamesWithStudentData
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single game details
router.get('/games/:gameId', protect, async (req, res) => {
  try {
    const game = await NursingGame.findById(req.params.gameId)
      .populate('createdBy', 'name email');
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    if (!game.isPublished && game.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Game not available' });
    }
    
    // Get student's attempts
    const attempts = await NursingGameAttempt.find({
      gameId: game._id,
      studentId: req.user._id
    }).sort({ createdAt: -1 });
    
    const bestAttempt = attempts.find(a => a.status === 'completed');
    const inProgressAttempt = attempts.find(a => a.status === 'in-progress');
    
    // Get leaderboard
    const leaderboard = await NursingGameLeaderboard.find({ gameId: game._id })
      .populate('studentId', 'name email profilePicture')
      .sort({ bestPercentage: -1, fastestTime: 1 })
      .limit(20);
    
    res.json({
      success: true,
      game,
      studentStats: {
        attemptsCount: attempts.length,
        bestScore: bestAttempt ? bestAttempt.percentageScore : 0,
        bestAttempt: bestAttempt,
        inProgressAttempt: inProgressAttempt,
        attemptsLeft: Math.max(0, game.attemptsAllowed - attempts.length)
      },
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start a game attempt
router.post('/games/:gameId/start', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const game = await NursingGame.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    if (!game.isPublished) {
      return res.status(403).json({ success: false, message: 'Game not available' });
    }
    
    // Check attempts limit
    const existingAttempts = await NursingGameAttempt.countDocuments({
      gameId: game._id,
      studentId: req.user._id,
      status: 'completed'
    });
    
    if (existingAttempts >= game.attemptsAllowed) {
      return res.status(400).json({ 
        success: false, 
        message: `You have reached the maximum of ${game.attemptsAllowed} attempts for this game` 
      });
    }
    
    // Check for in-progress attempt
    const inProgressAttempt = await NursingGameAttempt.findOne({
      gameId: game._id,
      studentId: req.user._id,
      status: 'in-progress'
    });
    
    if (inProgressAttempt) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an in-progress attempt. Please continue or abandon it.',
        attemptId: inProgressAttempt._id
      });
    }
    
    const attemptNumber = existingAttempts + 1;
    
    const attempt = new NursingGameAttempt({
      gameId: game._id,
      studentId: req.user._id,
      attemptNumber,
      startTime: new Date()
    });
    
    await attempt.save({ session });
    await session.commitTransaction();
    
    res.json({
      success: true,
      message: 'Game started successfully',
      attempt: {
        id: attempt._id,
        startTime: attempt.startTime,
        attemptNumber: attempt.attemptNumber,
        timeLimit: game.timeLimit
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error starting game:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});

// Submit answer for a question
router.post('/attempts/:attemptId/answer', protect, async (req, res) => {
  try {
    const { questionIndex, selectedOptionIndex, timeSpentOnQuestion } = req.body;
    
    const attempt = await NursingGameAttempt.findById(req.params.attemptId)
      .populate('gameId');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (attempt.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'This attempt is already completed' });
    }
    
    const game = attempt.gameId;
    const question = game.questions[questionIndex];
    
    if (!question) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const isCorrect = question.options[selectedOptionIndex]?.isCorrect || false;
    const pointsEarned = isCorrect ? question.points : 0;
    
    // Check if answer already exists
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionIndex);
    
    if (existingAnswerIndex !== -1) {
      // Update existing answer
      attempt.answers[existingAnswerIndex] = {
        questionId: questionIndex,
        selectedOptionIndex,
        isCorrect,
        pointsEarned,
        timeSpentOnQuestion
      };
    } else {
      // Add new answer
      attempt.answers.push({
        questionId: questionIndex,
        selectedOptionIndex,
        isCorrect,
        pointsEarned,
        timeSpentOnQuestion
      });
    }
    
    // Update total score
    attempt.score = attempt.answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const totalPossiblePoints = game.questions.reduce((sum, q) => sum + q.points, 0);
    attempt.percentageScore = totalPossiblePoints > 0 
      ? Math.round((attempt.score / totalPossiblePoints) * 100) 
      : 0;
    
    await attempt.save();
    
    res.json({
      success: true,
      isCorrect,
      correctAnswer: isCorrect ? null : question.options.find(o => o.isCorrect)?.text,
      explanation: question.explanation,
      clinicalTip: question.clinicalTip,
      pointsEarned,
      totalScore: attempt.score,
      percentageScore: attempt.percentageScore
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete game attempt
router.post('/attempts/:attemptId/complete', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const attempt = await NursingGameAttempt.findById(req.params.attemptId)
      .populate('gameId');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (attempt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Attempt already completed' });
    }
    
    const game = attempt.gameId;
    const totalPossiblePoints = game.questions.reduce((sum, q) => sum + q.points, 0);
    attempt.percentageScore = totalPossiblePoints > 0 
      ? Math.round((attempt.score / totalPossiblePoints) * 100) 
      : 0;
    
    attempt.passed = attempt.percentageScore >= game.passingScore;
    attempt.endTime = new Date();
    attempt.timeSpent = Math.round((attempt.endTime - attempt.startTime) / 1000);
    attempt.status = 'completed';
    
    // Award badge if applicable
    if (game.badgeReward && attempt.passed) {
      attempt.earnedBadge = game.badgeReward;
    }
    
    await attempt.save({ session });
    
    // Update or create leaderboard entry
    let leaderboardEntry = await NursingGameLeaderboard.findOne({
      gameId: game._id,
      studentId: req.user._id
    });
    
    if (!leaderboardEntry) {
      leaderboardEntry = new NursingGameLeaderboard({
        gameId: game._id,
        studentId: req.user._id,
        badgesEarned: []
      });
    }
    
    leaderboardEntry.attemptsCount += 1;
    
    if (attempt.percentageScore > leaderboardEntry.bestPercentage) {
      leaderboardEntry.bestPercentage = attempt.percentageScore;
      leaderboardEntry.bestScore = attempt.score;
    }
    
    if (attempt.timeSpent && (!leaderboardEntry.fastestTime || attempt.timeSpent < leaderboardEntry.fastestTime)) {
      leaderboardEntry.fastestTime = attempt.timeSpent;
    }
    
    if (attempt.earnedBadge && !leaderboardEntry.badgesEarned.includes(attempt.earnedBadge)) {
      leaderboardEntry.badgesEarned.push(attempt.earnedBadge);
    }
    
    await leaderboardEntry.save({ session });
    
    // Update ranks
    const allEntries = await NursingGameLeaderboard.find({ gameId: game._id })
      .sort({ bestPercentage: -1, fastestTime: 1 });
    
    for (let i = 0; i < allEntries.length; i++) {
      allEntries[i].rank = i + 1;
      await allEntries[i].save({ session });
    }
    
    await session.commitTransaction();
    
    res.json({
      success: true,
      message: attempt.passed ? 'Congratulations! You passed the game!' : 'Game completed',
      passed: attempt.passed,
      score: attempt.score,
      percentageScore: attempt.percentageScore,
      passingScore: game.passingScore,
      earnedBadge: attempt.earnedBadge,
      totalPossiblePoints,
      timeSpent: attempt.timeSpent
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error completing game:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});

// Get leaderboard for a game
router.get('/games/:gameId/leaderboard', protect, async (req, res) => {
  try {
    const game = await NursingGame.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    const leaderboard = await NursingGameLeaderboard.find({ gameId: game._id })
      .populate('studentId', 'name email profilePicture')
      .sort({ bestPercentage: -1, fastestTime: 1 })
      .limit(50);
    
    // Get current user's rank
    const userEntry = leaderboard.find(
      entry => entry.studentId._id.toString() === req.user._id.toString()
    );
    
    res.json({
      success: true,
      leaderboard,
      userRank: userEntry?.rank || null,
      userBestScore: userEntry?.bestPercentage || 0
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student's game history
router.get('/my-history', protect, async (req, res) => {
  try {
    const attempts = await NursingGameAttempt.find({ 
      studentId: req.user._id,
      status: 'completed'
    })
      .populate('gameId', 'title category difficulty points badgeReward')
      .sort({ endTime: -1 })
      .limit(20);
    
    const stats = {
      totalGamesPlayed: attempts.length,
      totalGamesPassed: attempts.filter(a => a.passed).length,
      averageScore: attempts.length > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentageScore, 0) / attempts.length)
        : 0,
      badgesEarned: [...new Set(attempts.filter(a => a.earnedBadge).map(a => a.earnedBadge))]
    };
    
    res.json({
      success: true,
      attempts,
      stats
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;