// routes/nursingGameRoutes.js - COMPLETE FILE
import express from 'express';
import { protect, lecturerOnly, adminOnly } from '../middleware/authMiddleware.js';
import * as nursingGameController from '../controllers/nursingGameController.js';
import NursingGame from '../models/NursingGame.js';
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

// Lecturer matching routes
router.post('/matches', protect, lecturerOnly, nursingGameController.manuallyMatchStudents);
router.get('/matches', protect, lecturerOnly, nursingGameController.getLecturerMatches);

// ================= PUBLIC/ACCESSIBLE ROUTES =================
// GET SINGLE GAME BY ID - Both lecturers and students can access (with restrictions)
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
      // Student can only access games from their course that are published
      const gameCourseId = game.courseId?._id?.toString() || game.courseId?.toString();
      const userCourseId = user.courseId?.toString();
      
      if (gameCourseId !== userCourseId) {
        return res.status(403).json({ success: false, message: 'You do not have access to this game' });
      }
      if (!game.isPublished) {
        return res.status(403).json({ success: false, message: 'This game is not yet available' });
      }
    } else if (req.user.role === 'lecturer') {
      // Lecturer can only access their own games unless admin
      if (game.lecturerId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }
    
    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Get single game error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to routes/nursingGameRoutes.js

// Get all students (for challenging)
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

// Get daily challenges
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

// Get user progress (level and XP)
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

// Match status polling
router.get('/matches/:matchId/status', protect, async (req, res) => {
  try {
    const match = await StudentMatch.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    res.json({
      success: true,
      status: match.status,
      attemptId: match.players.find(p => p.studentId.toString() === req.user._id.toString())?.attemptId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to routes/nursingGameRoutes.js - STUDENTS FETCHING OTHER STUDENTS
router.get('/program-students', protect, async (req, res) => {
  try {
    // Get current user with their program
    const currentUser = await User.findById(req.user._id);
    
    console.log("Current user:", {
      id: currentUser._id,
      name: currentUser.name,
      programId: currentUser.programId
    });
    
    // If user has no program, return empty
    if (!currentUser.programId) {
      console.log("User has no program assigned");
      return res.json({ success: true, students: [], message: "No program assigned" });
    }
    
    // Find all students in the same program, excluding current user
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

// GET MATCH BY ID - Simplified version
router.get('/matches/:matchId', protect, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    // First, just get the match without complex population
    const match = await StudentMatch.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    // Check if user is a participant
    const isParticipant = match.players.some(p => 
      p.studentId.toString() === req.user._id.toString()
    );
    
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not a participant in this match' });
    }
    
    // Get game details separately
    const game = await NursingGame.findById(match.gameId)
      .select('title description questions timeLimit passingScore category difficulty allowMatching');
    
    // Get player details separately (to avoid population issues)
    const playerIds = match.players.map(p => p.studentId);
    const playerUsers = await User.find({ _id: { $in: playerIds } }).select('name email avatar');
    
    // Combine player data
    const playersWithDetails = match.players.map(player => {
      const userInfo = playerUsers.find(u => u._id.toString() === player.studentId.toString());
      return {
        studentId: player.studentId,
        name: userInfo?.name || player.name,
        email: userInfo?.email || player.email,
        avatar: userInfo?.avatar || player.avatar,
        score: player.score || 0,
        percentage: player.percentage || 0,
        status: player.status,
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
      isTie: match.isTie,
      game: game,
      players: playersWithDetails
    };
    
    res.json({ success: true, match: formattedMatch });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// JOIN MATCH - Simplified version
router.post('/matches/:matchId/join', protect, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const match = await StudentMatch.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    if (match.status !== 'waiting') {
      return res.status(400).json({ success: false, message: 'Match already started or completed' });
    }
    
    // Check if user is already a player
    const existingPlayer = match.players.find(p => 
      p.studentId.toString() === req.user._id.toString()
    );
    
    if (!existingPlayer) {
      return res.status(403).json({ success: false, message: 'You are not invited to this match' });
    }
    
    // Update player status to ready (playing)
    const playerIndex = match.players.findIndex(p => 
      p.studentId.toString() === req.user._id.toString()
    );
    
    if (playerIndex !== -1) {
      match.players[playerIndex].status = 'playing';
      await match.save();
    }
    
    // Check if all players are ready
    const allReady = match.players.every(p => p.status === 'playing');
    
    if (allReady && match.players.length >= 2) {
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
      }
      
      match.status = 'ready';
      await match.save();
    }
    
    res.json({ success: true, message: 'Joined match successfully' });
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Match status polling - Simplified
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

// ================= STUDENT ROUTES =================
router.get('/games', protect, nursingGameController.getStudentGames);
router.post('/games/:id/start', protect, nursingGameController.startGame);
router.get('/attempts/:attemptId', protect, nursingGameController.getGameAttempt);
router.post('/attempts/:attemptId/answer', protect, nursingGameController.submitAnswer);
router.post('/attempts/:attemptId/complete', protect, nursingGameController.completeGame);
router.get('/my-history', protect, nursingGameController.getMyGameHistory);
router.get('/games/:gameId/leaderboard', protect, nursingGameController.getGameLeaderboard);

// Student matching routes
router.post('/matches/create', protect, nursingGameController.createMatchRequest);
router.post('/matches/join', protect, nursingGameController.joinMatchByCode);
router.post('/matches/:matchId/start', protect, nursingGameController.startMatch);
router.post('/matches/:matchId/answer', protect, nursingGameController.submitMatchAnswer);
router.post('/matches/:matchId/complete', protect, nursingGameController.completeMatch);

// Auto-match (system)
router.post('/matches/auto', protect, nursingGameController.autoMatchStudents);

export default router;