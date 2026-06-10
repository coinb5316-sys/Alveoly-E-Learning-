// routes/nursingGameRoutes.js - COMPLETE FIXED FILE
import express from 'express';
import { protect, lecturerOnly, adminOnly } from '../middleware/authMiddleware.js';
import * as nursingGameController from '../controllers/nursingGameController.js';
import NursingGame from '../models/NursingGame.js';
import StudentMatch from '../models/StudentMatch.js';
import NursingGameAttempt from '../models/NursingGameAttempt.js';
import User from '../models/User.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ================= LECTURER ROUTES =================
router.get('/my-games', protect, lecturerOnly, nursingGameController.getLecturerGames);
router.post('/games', protect, lecturerOnly, nursingGameController.createGame);
router.put('/games/:id', protect, lecturerOnly, nursingGameController.updateGame);
router.patch('/games/:id/toggle-publish', protect, lecturerOnly, nursingGameController.togglePublish);
router.delete('/games/:id', protect, lecturerOnly, nursingGameController.deleteGame);
router.get('/games/:id/stats', protect, lecturerOnly, nursingGameController.getGameStats);
router.post('/upload-diagram', protect, lecturerOnly, upload.single('diagram'), nursingGameController.uploadDiagram);

// ================= MATCH ROUTES (SPECIFIC FIRST, THEN GENERIC) =================
// GET MATCH BY ID - SPECIFIC route (must come before /matches/:matchId/status)
router.get('/matches/:matchId', protect, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    // First, get the match
    const match = await StudentMatch.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    // Check if user is a participant
    const isParticipant = match.players.some(p => 
      p.studentId.toString() === req.user._id.toString()
    );
    
    if (!isParticipant && req.user.role !== 'admin' && req.user.role !== 'lecturer') {
      return res.status(403).json({ success: false, message: 'You are not a participant in this match' });
    }
    
    // Get game details separately
    const game = await NursingGame.findById(match.gameId)
      .select('title description questions timeLimit passingScore category difficulty allowMatching');
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found for this match' });
    }
    
    // Get player details separately (to avoid population issues)
    const playerIds = match.players.map(p => p.studentId);
    const playerUsers = await User.find({ _id: { $in: playerIds } }).select('name email avatar');
    
    // Combine player data
    const playersWithDetails = match.players.map(player => {
      const userInfo = playerUsers.find(u => u._id.toString() === player.studentId.toString());
      return {
        studentId: player.studentId,
        name: userInfo?.name || player.name || 'Student',
        email: userInfo?.email || player.email || '',
        avatar: userInfo?.avatar || player.avatar,
        score: player.score || 0,
        percentage: player.percentage || 0,
        status: player.status || 'waiting',
        attemptId: player.attemptId || null
      };
    });
    
    const formattedMatch = {
      _id: match._id,
      matchCode: match.matchCode,
      status: match.status,
      createdAt: match.createdAt,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
      winnerId: match.winnerId,
      isTie: match.isTie || false,
      game: {
        _id: game._id,
        title: game.title,
        description: game.description,
        questions: game.questions,
        timeLimit: game.timeLimit,
        passingScore: game.passingScore,
        category: game.category,
        difficulty: game.difficulty,
        allowMatching: game.allowMatching
      },
      players: playersWithDetails
    };
    
    res.json({ success: true, match: formattedMatch });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// MATCH STATUS POLLING - SPECIFIC route
router.get('/matches/:matchId/status', protect, async (req, res) => {
  try {
    const match = await StudentMatch.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    // Find the player's attemptId
    const player = match.players.find(p => 
      p.studentId.toString() === req.user._id.toString()
    );
    
    res.json({
      success: true,
      status: match.status,
      attemptId: player?.attemptId || null
    });
  } catch (error) {
    console.error('Error polling match status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// In routes/nursingGameRoutes.js - Fix the JOIN MATCH route

// JOIN MATCH - FIXED VERSION
router.post('/matches/:matchId/join', protect, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    console.log(`Join match request for match ${matchId} from user ${req.user._id}`);
    
    const match = await StudentMatch.findById(matchId);
    
    if (!match) {
      console.log('Match not found:', matchId);
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    console.log('Match found:', {
      matchId: match._id,
      status: match.status,
      playersCount: match.players.length,
      players: match.players.map(p => ({ id: p.studentId, status: p.status }))
    });
    
    if (match.status !== 'waiting') {
      console.log('Match status not waiting:', match.status);
      return res.status(400).json({ success: false, message: 'Match already started or completed' });
    }
    
    // Check if user is already a player
    const existingPlayerIndex = match.players.findIndex(p => 
      p.studentId.toString() === req.user._id.toString()
    );
    
    console.log('Existing player index:', existingPlayerIndex);
    
    if (existingPlayerIndex === -1) {
      console.log('User not found in match players');
      return res.status(403).json({ success: false, message: 'You are not invited to this match' });
    }
    
    // Update player status to playing (ready)
    match.players[existingPlayerIndex].status = 'playing';
    await match.save();
    
    console.log('Player joined, new status:', match.players[existingPlayerIndex].status);
    
    // Check if all players are ready
    const allReady = match.players.every(p => p.status === 'playing');
    console.log('All players ready?', allReady, match.players.length);
    
    // If both players are ready, create attempts and mark as ready to start
    if (allReady && match.players.length >= 2) {
      console.log('Both players ready, creating attempts...');
      
      // Create game attempts for each player
      for (const player of match.players) {
        const attempt = await NursingGameAttempt.create({
          gameId: match.gameId,
          studentId: player.studentId,
          attemptNumber: 1,
          startTime: new Date(),
          status: 'in-progress'
        });
        player.attemptId = attempt._id;
        console.log(`Created attempt ${attempt._id} for player ${player.studentId}`);
      }
      
      match.status = 'ready';
      await match.save();
      console.log('Match status updated to ready');
    }
    
    res.json({ 
      success: true, 
      message: 'Joined match successfully',
      matchStatus: match.status,
      allReady: allReady && match.players.length >= 2
    });
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// START MATCH - SPECIFIC route
router.post('/matches/:matchId/start', protect, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const match = await StudentMatch.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    // Verify student is in match
    const isPlayer = match.players.some(p => p.studentId.toString() === req.user._id.toString());
    if (!isPlayer) {
      return res.status(403).json({ success: false, message: 'Not a participant in this match' });
    }
    
    // Check if all players have attemptIds
    const allHaveAttempts = match.players.every(p => p.attemptId);
    if (!allHaveAttempts) {
      return res.status(400).json({ success: false, message: 'Match not ready - waiting for opponent' });
    }
    
    if (match.status !== 'ready') {
      return res.status(400).json({ success: false, message: 'Match not ready to start' });
    }
    
    // Start the match
    match.status = 'in-progress';
    match.startedAt = new Date();
    await match.save();
    
    // Find the player's attemptId
    const player = match.players.find(p => p.studentId.toString() === req.user._id.toString());
    
    res.json({
      success: true,
      message: 'Match started',
      match: {
        _id: match._id,
        status: match.status,
        startedAt: match.startedAt,
        attemptId: player?.attemptId
      }
    });
  } catch (error) {
    console.error('Error starting match:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// SUBMIT MATCH ANSWER - SPECIFIC route
router.post('/matches/:matchId/answer', protect, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { questionIndex, selectedOption, timeSpent } = req.body;
    
    const match = await StudentMatch.findById(matchId).populate('gameId');
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    if (match.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Match not in progress' });
    }
    
    const playerIndex = match.players.findIndex(p => p.studentId.toString() === req.user._id.toString());
    if (playerIndex === -1) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }
    
    const game = match.gameId;
    const question = game.questions[questionIndex];
    
    if (!question) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }
    
    const selectedOptionObj = question.options[selectedOption];
    const isCorrect = selectedOptionObj?.isCorrect || false;
    const pointsEarned = isCorrect ? (question.points || 10) : 0;
    
    // Initialize answers array if needed
    if (!match.players[playerIndex].answers) {
      match.players[playerIndex].answers = [];
    }
    
    // Check if already answered this question
    const alreadyAnswered = match.players[playerIndex].answers.some(a => a.questionIndex === questionIndex);
    if (alreadyAnswered) {
      return res.status(400).json({ success: false, message: 'Question already answered' });
    }
    
    // Add answer
    match.players[playerIndex].answers.push({
      questionIndex,
      selectedOption,
      isCorrect,
      timeSpent: timeSpent || 0,
      pointsEarned
    });
    
    match.players[playerIndex].score += pointsEarned;
    
    // Calculate percentage
    const totalPossiblePoints = game.questions.slice(0, match.questionsPerMatch || game.questions.length)
      .reduce((sum, q) => sum + (q.points || 10), 0);
    match.players[playerIndex].percentage = totalPossiblePoints > 0 
      ? Math.round((match.players[playerIndex].score / totalPossiblePoints) * 100) 
      : 0;
    
    await match.save();
    
    res.json({
      success: true,
      isCorrect,
      pointsEarned,
      correctAnswer: isCorrect ? null : question.options.find(o => o.isCorrect)?.text,
      explanation: question.explanation,
      playerScore: match.players[playerIndex].score,
      playerPercentage: match.players[playerIndex].percentage
    });
  } catch (error) {
    console.error('Error submitting match answer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// COMPLETE MATCH - SPECIFIC route
router.post('/matches/:matchId/complete', protect, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const match = await StudentMatch.findById(matchId).populate('gameId');
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    const playerIndex = match.players.findIndex(p => p.studentId.toString() === req.user._id.toString());
    if (playerIndex === -1) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }
    
    match.players[playerIndex].status = 'completed';
    match.players[playerIndex].completedAt = new Date();
    await match.save();
    
    // Check if all players completed
    const allCompleted = match.players.every(p => p.status === 'completed');
    let isWinner = false;
    let isTie = false;
    
    if (allCompleted) {
      // Determine winner
      let winnerId = null;
      
      const sortedPlayers = [...match.players].sort((a, b) => b.percentage - a.percentage);
      
      if (sortedPlayers[0].percentage === sortedPlayers[1]?.percentage) {
        isTie = true;
      } else {
        winnerId = sortedPlayers[0].studentId;
        isWinner = winnerId.toString() === req.user._id.toString();
      }
      
      match.status = 'completed';
      match.endedAt = new Date();
      match.winnerId = winnerId;
      match.isTie = isTie;
      await match.save();
      
      // Create game attempts for each player (if not already created)
      for (const player of match.players) {
        const existingAttempt = await NursingGameAttempt.findOne({
          gameId: match.gameId._id,
          studentId: player.studentId,
          _id: player.attemptId
        });
        
        if (!existingAttempt && player.answers && player.answers.length > 0) {
          const totalPossiblePoints = match.gameId.questions.slice(0, match.questionsPerMatch || match.gameId.questions.length)
            .reduce((sum, q) => sum + (q.points || 10), 0);
          
          await NursingGameAttempt.create({
            gameId: match.gameId._id,
            studentId: player.studentId,
            answers: player.answers.map(a => ({
              questionId: a.questionIndex,
              selectedOptionIndex: a.selectedOption,
              isCorrect: a.isCorrect,
              pointsEarned: a.pointsEarned || 0,
              timeSpentOnQuestion: a.timeSpent || 0
            })),
            score: player.score,
            percentageScore: player.percentage,
            passed: player.percentage >= (match.gameId.passingScore || 70),
            timeSpent: player.answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
            status: 'completed',
            endTime: new Date()
          });
        }
      }
    }
    
    res.json({
      success: true,
      message: allCompleted ? 'Match completed' : 'Your progress saved',
      matchStatus: match.status,
      isWinner: allCompleted ? isWinner : false,
      isTie: allCompleted ? isTie : false,
      yourPercentage: match.players[playerIndex].percentage
    });
  } catch (error) {
    console.error('Error completing match:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= GENERIC MATCH ROUTES (after specific ones) =================
// Lecturer matching routes
router.post('/matches', protect, lecturerOnly, nursingGameController.manuallyMatchStudents);
router.get('/matches', protect, lecturerOnly, nursingGameController.getLecturerMatches);

// Student matching routes
router.post('/matches/create', protect, nursingGameController.createMatchRequest);
router.post('/matches/join', protect, nursingGameController.joinMatchByCode);
router.post('/matches/auto', protect, nursingGameController.autoMatchStudents);

// ================= STUDENT GAME ROUTES =================
router.get('/games', protect, nursingGameController.getStudentGames);
router.post('/games/:id/start', protect, nursingGameController.startGame);
router.get('/attempts/:attemptId', protect, nursingGameController.getGameAttempt);
router.post('/attempts/:attemptId/answer', protect, nursingGameController.submitAnswer);
router.post('/attempts/:attemptId/complete', protect, nursingGameController.completeGame);
router.get('/my-history', protect, nursingGameController.getMyGameHistory);
router.get('/games/:gameId/leaderboard', protect, nursingGameController.getGameLeaderboard);

// ================= SINGLE GAME ROUTE =================
router.get('/games/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await NursingGame.findById(id)
      .populate('programId', 'name code')
      .populate('courseId', 'name')
      .populate('subjectId', 'name');
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    // Check access based on role
    if (req.user.role === 'student') {
      const user = await User.findById(req.user._id);
      const gameCourseId = game.courseId?._id?.toString() || game.courseId?.toString();
      const userCourseId = user.courseId?.toString();
      
      if (gameCourseId !== userCourseId) {
        return res.status(403).json({ success: false, message: 'You do not have access to this game' });
      }
      if (!game.isPublished) {
        return res.status(403).json({ success: false, message: 'This game is not yet available' });
      }
    } else if (req.user.role === 'lecturer') {
      if (game.lecturerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }
    
    res.json({ success: true, game });
  } catch (error) {
    console.error('Get single game error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= HELPER ROUTES =================
router.get('/students', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const students = await User.find({
      role: 'student',
      courseId: user.courseId,
      _id: { $ne: req.user._id }
    }).select('name email avatar');
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/daily-challenges', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const challenges = await NursingGame.find({
      courseId: user.courseId,
      isPublished: true,
      isActive: true
    }).limit(3);
    
    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/progress', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      level: user.gamingStats?.level || 1,
      xp: user.gamingStats?.totalXp || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/program-students', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    console.log("Current user:", {
      id: currentUser._id,
      name: currentUser.name,
      programId: currentUser.programId
    });
    
    if (!currentUser.programId) {
      console.log("User has no program assigned");
      return res.json({ success: true, students: [], message: "No program assigned" });
    }
    
    const students = await User.find({
      role: "student",
      programId: currentUser.programId,
      _id: { $ne: currentUser._id },
      isActive: true
    }).select("name email _id avatar");
    
    console.log(`Found ${students.length} students in program ${currentUser.programId}`);
    
    res.json({ success: true, students });
  } catch (error) {
    console.error("Error fetching program students:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;