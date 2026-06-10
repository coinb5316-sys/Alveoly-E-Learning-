// routes/nursingGameRoutes.js
import express from 'express';
import { protect, lecturerOnly, adminOnly } from '../middleware/authMiddleware.js';
import * as nursingGameController from '../controllers/nursingGameController.js';
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