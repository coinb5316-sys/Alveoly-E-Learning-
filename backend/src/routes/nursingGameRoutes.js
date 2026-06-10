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