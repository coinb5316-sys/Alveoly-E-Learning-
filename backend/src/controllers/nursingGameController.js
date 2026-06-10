// controllers/nursingGameController.js - COMPLETE REWRITE with program/course/subject support
import NursingGame from '../models/NursingGame.js';
import NursingGameAttempt from '../models/NursingGameAttempt.js';
import NursingGameLeaderboard from '../models/NursingGameLeaderboard.js';
import StudentMatch from '../models/StudentMatch.js';
import User from '../models/User.js';
import Program from '../models/Program.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import { createNotification } from './notificationController.js';
import { io } from '../../server.js';

// ================= LECTURER: GET GAMES BY PROGRAM/COURSE/SUBJECT =================
export const getLecturerGames = async (req, res) => {
  try {
    const { programId, courseId, subjectId, gameType } = req.query;
    
    const filter = { lecturerId: req.user._id };
    
    if (programId && programId !== 'undefined' && programId !== 'null') {
      filter.programId = programId;
    }
    if (courseId && courseId !== 'undefined' && courseId !== 'null') {
      filter.courseId = courseId;
    }
    if (subjectId && subjectId !== 'undefined' && subjectId !== 'null') {
      filter.subjectId = subjectId;
    }
    if (gameType && gameType !== 'undefined') {
      filter.gameType = gameType;
    }
    
    const games = await NursingGame.find(filter)
      .populate('programId', 'name code')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .sort({ createdAt: -1 });
    
    // Add stats for each game
    const gamesWithStats = await Promise.all(games.map(async (game) => {
      const attempts = await NursingGameAttempt.find({ gameId: game._id });
      const completedAttempts = attempts.filter(a => a.status === 'completed');
      
      const stats = {
        totalAttempts: attempts.length,
        completedAttempts: completedAttempts.length,
        averageScore: completedAttempts.length > 0
          ? Math.round(completedAttempts.reduce((sum, a) => sum + a.percentageScore, 0) / completedAttempts.length)
          : 0,
        passRate: completedAttempts.length > 0
          ? Math.round((completedAttempts.filter(a => a.passed).length / completedAttempts.length) * 100)
          : 0
      };
      
      return {
        ...game.toObject(),
        stats
      };
    }));
    
    res.json({
      success: true,
      games: gamesWithStats,
      total: gamesWithStats.length
    });
  } catch (error) {
    console.error('Get lecturer games error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DIAGRAM UPLOAD =================
export const uploadDiagram = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Assuming you're using Cloudinary or similar
    // If using Cloudinary, you would upload here
    // For now, return a temporary URL or implement your upload logic
    
    // Example with Cloudinary (you need to set up cloudinary config)
    // const result = await cloudinary.uploader.upload(req.file.path, {
    //   folder: 'nursing-game-diagrams',
    //   resource_type: 'image'
    // });
    
    // Temporary response - replace with actual upload logic
    const tempUrl = `/uploads/temp/${Date.now()}_${req.file.originalname}`;
    
    res.json({
      success: true,
      url: tempUrl,
      message: 'Diagram uploaded successfully'
    });
  } catch (error) {
    console.error('Upload diagram error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LECTURER: CREATE GAME WITH PROGRAM/COURSE/SUBJECT =================
export const createGame = async (req, res) => {
  try {
    const {
      title, description, programId, courseId, subjectId,
      category, difficulty, timeLimit, points, questions,
      passingScore, attemptsAllowed, badgeReward, tags,
      gameType, allowMatching
    } = req.body;
    
    // Validation
    if (!title || !description || !programId || !courseId || !subjectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, description, program, course, subject' 
      });
    }
    
    // Verify lecturer has access to this subject
    const lecturer = await User.findById(req.user._id);
    const hasAccess = lecturer.lecturerInfo?.assignedSubjects?.includes(subjectId);
    
    if (!hasAccess && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this subject' 
      });
    }
    
    // Verify program and course
    const program = await Program.findById(programId);
    const course = await Course.findById(courseId);
    const subject = await Subject.findById(subjectId);
    
    if (!program || !course || !subject) {
      return res.status(400).json({ success: false, message: 'Invalid program, course, or subject' });
    }
    
    // Verify course belongs to program and subject belongs to course
    if (course.programId.toString() !== programId) {
      return res.status(400).json({ success: false, message: 'Course does not belong to the selected program' });
    }
    if (subject.courseId.toString() !== courseId) {
      return res.status(400).json({ success: false, message: 'Subject does not belong to the selected course' });
    }
    
    const game = await NursingGame.create({
      title,
      description,
      programId,
      courseId,
      subjectId,
      lecturerId: req.user._id,
      category,
      difficulty: difficulty || 'intermediate',
      timeLimit: timeLimit || 300,
      points: points || 100,
      questions: questions || [],
      passingScore: passingScore || 70,
      attemptsAllowed: attemptsAllowed || 3,
      badgeReward: badgeReward || null,
      tags: tags || [],
      gameType: gameType || 'solo',
      allowMatching: allowMatching || false,
      createdBy: req.user._id,
      isPublished: false
    });
    
    const populatedGame = await NursingGame.findById(game._id)
      .populate('programId', 'name code')
      .populate('courseId', 'name')
      .populate('subjectId', 'name');
    
    // Emit via Socket.io for real-time updates
    io.emit('game:created', populatedGame);
    
    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      game: populatedGame
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LECTURER: UPDATE GAME =================
export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const game = await NursingGame.findOne({
      _id: id,
      lecturerId: req.user._id
    });
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found or unauthorized' });
    }
    
    Object.assign(game, updates);
    await game.save();
    
    const populatedGame = await NursingGame.findById(game._id)
      .populate('programId', 'name code')
      .populate('courseId', 'name')
      .populate('subjectId', 'name');
    
    io.emit('game:updated', populatedGame);
    
    res.json({
      success: true,
      message: 'Game updated successfully',
      game: populatedGame
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LECTURER: TOGGLE PUBLISH =================
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await NursingGame.findOne({
      _id: id,
      lecturerId: req.user._id
    });
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found or unauthorized' });
    }
    
    game.isPublished = !game.isPublished;
    if (game.isPublished) {
      game.publishedAt = new Date();
    }
    await game.save();
    
    // Notify students in this subject about the new game
    if (game.isPublished) {
      const students = await User.find({
        role: 'student',
        courseId: game.courseId
      });
      
      for (const student of students) {
        await createNotification(
          student._id,
          'student',
          'info',
          `🎮 New Game Available: ${game.title}`,
          `A new nursing challenge "${game.title}" has been added to your ${game.subjectId?.name || 'subject'}.`,
          `/student/nursing-games/${game._id}`,
          { gameId: game._id, action: 'new_game' }
        );
      }
    }
    
    io.emit('game:published', { gameId: game._id, isPublished: game.isPublished });
    
    res.json({
      success: true,
      message: game.isPublished ? 'Game published successfully' : 'Game unpublished',
      isPublished: game.isPublished
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LECTURER: DELETE GAME =================
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await NursingGame.findOne({
      _id: id,
      lecturerId: req.user._id
    });
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found or unauthorized' });
    }
    
    // Delete all related attempts and leaderboard entries
    await NursingGameAttempt.deleteMany({ gameId: id });
    await NursingGameLeaderboard.deleteMany({ gameId: id });
    await StudentMatch.deleteMany({ gameId: id });
    await game.deleteOne();
    
    io.emit('game:deleted', id);
    
    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LECTURER: GET GAME STATS =================
export const getGameStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await NursingGame.findById(id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }
    
    // Verify lecturer access
    if (game.lecturerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const attempts = await NursingGameAttempt.find({ gameId: id })
      .populate('studentId', 'name email')
      .sort({ percentageScore: -1 });
    
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    
    const stats = {
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      averageScore: completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum, a) => sum + a.percentageScore, 0) / completedAttempts.length)
        : 0,
      passRate: completedAttempts.length > 0
        ? Math.round((completedAttempts.filter(a => a.passed).length / completedAttempts.length) * 100)
        : 0,
      highestScore: completedAttempts.length > 0
        ? Math.max(...completedAttempts.map(a => a.percentageScore))
        : 0,
      uniqueStudents: new Set(attempts.map(a => a.studentId?._id?.toString())).size,
      recentAttempts: attempts.slice(0, 10),
      leaderboard: completedAttempts.slice(0, 20).map((a, idx) => ({
        rank: idx + 1,
        studentName: a.studentId?.name || a.studentName,
        studentEmail: a.studentId?.email || a.studentEmail,
        score: a.percentageScore,
        timeSpent: a.timeSpent,
        passed: a.passed
      }))
    };
    
    res.json({
      success: true,
      stats,
      game: {
        title: game.title,
        difficulty: game.difficulty,
        category: game.category,
        questionsCount: game.questions.length,
        passingScore: game.passingScore
      }
    });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LECTURER: MATCH STUDENTS MANUALLY =================
export const manuallyMatchStudents = async (req, res) => {
  try {
    const { gameId, studentIds, matchSettings } = req.body;
    
    const game = await NursingGame.findOne({
      _id: gameId,
      lecturerId: req.user._id
    });
    
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found or unauthorized' });
    }
    
    // Get student details
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    }).select('name email avatar');
    
    if (students.length < 2) {
      return res.status(400).json({ success: false, message: 'Need at least 2 students to create a match' });
    }
    
    // Create match
    const match = await StudentMatch.create({
      gameId: game._id,
      programId: game.programId,
      courseId: game.courseId,
      subjectId: game.subjectId,
      players: students.map(s => ({
        studentId: s._id,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        status: 'waiting'
      })),
      createdBy: 'lecturer',
      lecturerId: req.user._id,
      status: 'waiting',
      matchCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      timeLimitPerQuestion: matchSettings?.timeLimitPerQuestion || 30,
      questionsPerMatch: matchSettings?.questionsPerMatch || game.questions.length
    });
    
    // Notify students
    for (const student of students) {
      await createNotification(
        student._id,
        'student',
        'info',
        `🎮 You've been matched for a quiz duel!`,
        `${req.user.name} has matched you with others for "${game.title}". Join using code: ${match.matchCode}`,
        `/student/game-match/${match._id}`,
        { matchId: match._id, matchCode: match.matchCode, gameId: game._id }
      );
    }
    
    res.json({
      success: true,
      message: `Match created with ${students.length} students`,
      match: {
        _id: match._id,
        matchCode: match.matchCode,
        players: match.players
      }
    });
  } catch (error) {
    console.error('Manually match students error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LECTURER: GET ALL MATCHES =================
export const getLecturerMatches = async (req, res) => {
  try {
    const { gameId, status } = req.query;
    
    const filter = { lecturerId: req.user._id };
    if (gameId) filter.gameId = gameId;
    if (status) filter.status = status;
    
    const matches = await StudentMatch.find(filter)
      .populate('gameId', 'title category difficulty')
      .populate('players.studentId', 'name email avatar')
      .populate('winnerId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Get lecturer matches error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: GET AVAILABLE GAMES =================
export const getStudentGames = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.courseId) {
      return res.json({ success: true, games: [] });
    }
    
    // Get games for student's course and subject
    const games = await NursingGame.find({
      courseId: user.courseId,
      isPublished: true,
      isActive: true
    })
      .populate('programId', 'name code')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .sort({ createdAt: -1 });
    
    // Add student-specific data to each game
    const gamesWithStudentData = await Promise.all(games.map(async (game) => {
      const attempts = await NursingGameAttempt.find({
        gameId: game._id,
        studentId: req.user._id
      });
      
      const completedAttempts = attempts.filter(a => a.status === 'completed');
      const bestAttempt = completedAttempts.sort((a, b) => b.percentageScore - a.percentageScore)[0];
      const inProgressAttempt = attempts.find(a => a.status === 'in-progress');
      
      return {
        ...game.toObject(),
        studentData: {
          hasAttempted: attempts.length > 0,
          attemptsCount: attempts.length,
          attemptsLeft: Math.max(0, game.attemptsAllowed - attempts.length),
          bestScore: bestAttempt?.percentageScore || 0,
          bestScoreDetails: bestAttempt ? {
            score: bestAttempt.score,
            percentage: bestAttempt.percentageScore,
            passed: bestAttempt.passed,
            completedAt: bestAttempt.updatedAt
          } : null,
          inProgress: !!inProgressAttempt,
          inProgressAttemptId: inProgressAttempt?._id
        }
      };
    }));
    
    res.json({
      success: true,
      games: gamesWithStudentData
    });
  } catch (error) {
    console.error('Get student games error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: START GAME (Solo) =================
export const startGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await NursingGame.findById(id);
    if (!game || !game.isPublished) {
      return res.status(404).json({ success: false, message: 'Game not available' });
    }
    
    // Check existing attempts
    const existingAttempts = await NursingGameAttempt.countDocuments({
      gameId: id,
      studentId: req.user._id
    });
    
    if (existingAttempts >= game.attemptsAllowed) {
      return res.status(400).json({ 
        success: false, 
        message: `You have reached the maximum of ${game.attemptsAllowed} attempts for this game` 
      });
    }
    
    // Check for in-progress attempt
    const inProgressAttempt = await NursingGameAttempt.findOne({
      gameId: id,
      studentId: req.user._id,
      status: 'in-progress'
    });
    
    if (inProgressAttempt) {
      return res.json({
        success: true,
        attempt: {
          id: inProgressAttempt._id,
          isExisting: true
        }
      });
    }
    
    // Create new attempt
    const attempt = await NursingGameAttempt.create({
      gameId: game._id,
      studentId: req.user._id,
      attemptNumber: existingAttempts + 1,
      startTime: new Date(),
      status: 'in-progress'
    });
    
    res.json({
      success: true,
      attempt: {
        id: attempt._id,
        isExisting: false
      }
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: CREATE MATCH REQUEST =================
// In nursingGameController.js - Fix createMatchRequest

export const createMatchRequest = async (req, res) => {
  try {
    const { gameId, opponentId } = req.body;
    
    console.log('Creating match request:', { gameId, opponentId, userId: req.user._id });
    
    const game = await NursingGame.findById(gameId);
    if (!game || !game.isPublished || !game.allowMatching) {
      return res.status(404).json({ success: false, message: 'Game does not support matching' });
    }
    
    const user = await User.findById(req.user._id);
    const opponent = await User.findById(opponentId);
    
    if (!opponent || opponent.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Opponent not found' });
    }
    
    // Check if opponent is in same program
    if (opponent.programId?.toString() !== user.programId?.toString()) {
      return res.status(400).json({ success: false, message: 'Opponent must be in the same program' });
    }
    
    // Create match with BOTH players having status 'waiting'
    const match = await StudentMatch.create({
      gameId: game._id,
      programId: game.programId,
      courseId: game.courseId,
      subjectId: game.subjectId,
      players: [
        {
          studentId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          status: 'waiting'  // Sender starts as waiting
        },
        {
          studentId: opponent._id,
          name: opponent.name,
          email: opponent.email,
          avatar: opponent.avatar,
          status: 'waiting'  // Opponent starts as waiting
        }
      ],
      createdBy: 'student',
      status: 'waiting',
      matchCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });
    
    console.log('Match created:', match._id, 'Players:', match.players.length);
    
    // Notify opponent
    await createNotification(
      opponent._id,
      'student',
      'info',
      `🎮 Quiz Challenge from ${user.name}!`,
      `${user.name} has challenged you to a ${game.title} quiz duel. Click to join!`,
      `/student/game-match/${match._id}`,
      { matchId: match._id, matchCode: match.matchCode, gameId: game._id }
    );
    
    res.json({
      success: true,
      message: 'Match request sent',
      match: {
        _id: match._id,
        matchCode: match.matchCode,
        opponent: {
          _id: opponent._id,
          name: opponent.name,
          email: opponent.email,
          avatar: opponent.avatar
        }
      }
    });
  } catch (error) {
    console.error('Create match request error:', error);
    res.status(500).json({ message: error.message });
  }
};
// ================= STUDENT: JOIN MATCH BY CODE =================
export const joinMatchByCode = async (req, res) => {
  try {
    const { matchCode } = req.body;
    
    const match = await StudentMatch.findOne({ matchCode })
      .populate('gameId', 'title category difficulty questions passingScore timeLimitPerQuestion')
      .populate('players.studentId', 'name email avatar');
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    if (match.status !== 'waiting') {
      return res.status(400).json({ success: false, message: 'Match already started or completed' });
    }
    
    // Check if student is already in match
    const isInMatch = match.players.some(p => p.studentId._id.toString() === req.user._id.toString());
    
    if (!isInMatch) {
      return res.status(403).json({ success: false, message: 'You are not invited to this match' });
    }
    
    // Update player status to ready
    const playerIndex = match.players.findIndex(p => p.studentId._id.toString() === req.user._id.toString());
    if (playerIndex !== -1) {
      match.players[playerIndex].status = 'playing';
      await match.save();
    }
    
    res.json({
      success: true,
      match: {
        _id: match._id,
        matchCode: match.matchCode,
        game: match.gameId,
        players: match.players,
        status: match.status
      }
    });
  } catch (error) {
    console.error('Join match error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: START MATCH =================
export const startMatch = async (req, res) => {
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
    
    // Check if all players are ready
    const allReady = match.players.every(p => p.status === 'playing');
    if (!allReady) {
      return res.status(400).json({ success: false, message: 'Waiting for other players to join' });
    }
    
    if (match.status !== 'waiting') {
      return res.status(400).json({ success: false, message: 'Match already started' });
    }
    
    // Start the match
    match.status = 'in-progress';
    match.startedAt = new Date();
    await match.save();
    
    // Emit to all players via Socket.io
    io.to(`match_${matchId}`).emit('match:started', {
      matchId: match._id,
      startTime: match.startedAt
    });
    
    res.json({
      success: true,
      message: 'Match started',
      match: {
        _id: match._id,
        status: match.status,
        startedAt: match.startedAt
      }
    });
  } catch (error) {
    console.error('Start match error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= SYSTEM: AUTO-MATCH STUDENTS =================
export const autoMatchStudents = async (req, res) => {
  try {
    const { gameId, subjectId, courseId } = req.body;
    
    // Find students in the same course/subject who are online/looking for match
    const students = await User.find({
      role: 'student',
      courseId: courseId,
      isActive: true,
      'lookingForMatch.gameId': gameId // You'd need to add a lookingForMatch field
    }).limit(2);
    
    if (students.length < 2) {
      return res.json({ 
        success: false, 
        message: 'Not enough students available for auto-matching',
        waitingCount: students.length
      });
    }
    
    const game = await NursingGame.findById(gameId);
    
    const match = await StudentMatch.create({
      gameId: game._id,
      programId: game.programId,
      courseId: game.courseId,
      subjectId: game.subjectId,
      players: students.map(s => ({
        studentId: s._id,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        status: 'playing'
      })),
      createdBy: 'system',
      status: 'waiting',
      matchCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });
    
    // Notify students
    for (const student of students) {
      await createNotification(
        student._id,
        'student',
        'success',
        `🎮 Auto-matched for quiz duel!`,
        `You have been matched with another student for "${game.title}". Join using code: ${match.matchCode}`,
        `/student/game-match/${match._id}`,
        { matchId: match._id, matchCode: match.matchCode }
      );
    }
    
    res.json({
      success: true,
      message: 'Students auto-matched successfully',
      match: {
        _id: match._id,
        matchCode: match.matchCode,
        players: match.players
      }
    });
  } catch (error) {
    console.error('Auto match students error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: SUBMIT MATCH ANSWER =================
export const submitMatchAnswer = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { questionIndex, selectedOption, timeSpent } = req.body;
    
    const match = await StudentMatch.findById(matchId).populate('gameId');
    if (!match || match.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Match not in progress' });
    }
    
    const playerIndex = match.players.findIndex(p => p.studentId.toString() === req.user._id.toString());
    if (playerIndex === -1) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }
    
    const game = match.gameId;
    const question = game.questions[questionIndex];
    const isCorrect = question.options[selectedOption]?.isCorrect || false;
    const pointsEarned = isCorrect ? question.points : 0;
    
    // Update player answer
    if (!match.players[playerIndex].answers) {
      match.players[playerIndex].answers = [];
    }
    
    match.players[playerIndex].answers.push({
      questionIndex,
      selectedOption,
      isCorrect,
      timeSpent: timeSpent || 0
    });
    
    match.players[playerIndex].score += pointsEarned;
    
    // Calculate percentage
    const totalPossiblePoints = game.questions.slice(0, match.questionsPerMatch || game.questions.length)
      .reduce((sum, q) => sum + q.points, 0);
    match.players[playerIndex].percentage = Math.round((match.players[playerIndex].score / totalPossiblePoints) * 100);
    
    await match.save();
    
    // Emit to all players
    io.to(`match_${matchId}`).emit('match:answer', {
      playerId: req.user._id,
      questionIndex,
      isCorrect,
      pointsEarned,
      playerScore: match.players[playerIndex].score
    });
    
    res.json({
      success: true,
      isCorrect,
      pointsEarned,
      correctAnswer: isCorrect ? null : question.options.find(o => o.isCorrect)?.text,
      explanation: question.explanation
    });
  } catch (error) {
    console.error('Submit match answer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: COMPLETE MATCH =================
export const completeMatch = async (req, res) => {
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
    
    if (allCompleted) {
      // Determine winner
      let winnerId = null;
      let isTie = false;
      
      const sortedPlayers = [...match.players].sort((a, b) => b.percentage - a.percentage);
      
      if (sortedPlayers[0].percentage === sortedPlayers[1]?.percentage) {
        isTie = true;
      } else {
        winnerId = sortedPlayers[0].studentId;
      }
      
      match.status = 'completed';
      match.endedAt = new Date();
      match.winnerId = winnerId;
      match.isTie = isTie;
      await match.save();
      
      // Create game attempts for each player
      for (const player of match.players) {
        const totalPossiblePoints = match.gameId.questions.slice(0, match.questionsPerMatch || match.gameId.questions.length)
          .reduce((sum, q) => sum + q.points, 0);
        
        await NursingGameAttempt.create({
          gameId: match.gameId._id,
          studentId: player.studentId,
          answers: player.answers.map(a => ({
            questionId: a.questionIndex,
            selectedOptionIndex: a.selectedOption,
            isCorrect: a.isCorrect,
            pointsEarned: a.isCorrect ? match.gameId.questions[a.questionIndex]?.points || 0 : 0,
            timeSpentOnQuestion: a.timeSpent
          })),
          score: player.score,
          percentageScore: player.percentage,
          passed: player.percentage >= match.gameId.passingScore,
          timeSpent: player.answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
          status: 'completed',
          endTime: new Date()
        });
      }
      
      // Notify all players of results
      for (const player of match.players) {
        const resultMsg = isTie ? "It's a tie!" : 
          (player.studentId.toString() === winnerId?.toString() ? "🎉 You won the match!" : "Better luck next time!");
        
        await createNotification(
          player.studentId,
          'student',
          isTie ? 'info' : (player.studentId.toString() === winnerId?.toString() ? 'success' : 'warning'),
          `🏆 Match Completed: ${match.gameId.title}`,
          `${resultMsg} Your score: ${player.percentage}%`,
          `/student/game-match/${match._id}/results`,
          { matchId: match._id, score: player.percentage, isWinner: player.studentId.toString() === winnerId?.toString() }
        );
      }
      
      io.to(`match_${matchId}`).emit('match:completed', {
        winnerId,
        isTie,
        players: match.players.map(p => ({
          studentId: p.studentId,
          name: p.name,
          score: p.score,
          percentage: p.percentage
        }))
      });
    }
    
    res.json({
      success: true,
      message: allCompleted ? 'Match completed' : 'Your progress saved',
      matchStatus: match.status
    });
  } catch (error) {
    console.error('Complete match error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: GET GAME ATTEMPT =================
export const getGameAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await NursingGameAttempt.findById(attemptId)
      .populate('gameId', 'title description questions timeLimit passingScore category difficulty');
    
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.json({
      success: true,
      attempt
    });
  } catch (error) {
    console.error('Get game attempt error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: SUBMIT ANSWER =================
export const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionIndex, selectedOptionIndex, timeSpentOnQuestion } = req.body;
    
    const attempt = await NursingGameAttempt.findById(attemptId).populate('gameId');
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    if (attempt.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Game already completed' });
    }
    
    const game = attempt.gameId;
    const question = game.questions[questionIndex];
    const isCorrect = question.options[selectedOptionIndex]?.isCorrect || false;
    const pointsEarned = isCorrect ? question.points : 0;
    
    // Check if answer already exists
    const existingAnswer = attempt.answers.find(a => a.questionId === questionIndex);
    if (existingAnswer) {
      return res.status(400).json({ success: false, message: 'Answer already submitted for this question' });
    }
    
    attempt.answers.push({
      questionId: questionIndex,
      selectedOptionIndex,
      isCorrect,
      pointsEarned,
      timeSpentOnQuestion: timeSpentOnQuestion || 0
    });
    
    attempt.score += pointsEarned;
    attempt.timeSpent += timeSpentOnQuestion || 0;
    
    await attempt.save();
    
    res.json({
      success: true,
      isCorrect,
      pointsEarned,
      explanation: question.explanation,
      nursingConcept: question.nursingConcept,
      clinicalTip: question.clinicalTip,
      correctAnswer: isCorrect ? null : question.options.find(o => o.isCorrect)?.text
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: COMPLETE GAME =================
export const completeGame = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await NursingGameAttempt.findById(attemptId).populate('gameId');
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    if (attempt.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Game already completed' });
    }
    
    const game = attempt.gameId;
    const totalPossiblePoints = game.questions.reduce((sum, q) => sum + q.points, 0);
    const percentageScore = totalPossiblePoints > 0 ? Math.round((attempt.score / totalPossiblePoints) * 100) : 0;
    const passed = percentageScore >= game.passingScore;
    
    attempt.percentageScore = percentageScore;
    attempt.passed = passed;
    attempt.status = 'completed';
    attempt.endTime = new Date();
    
    await attempt.save();
    
    // Update leaderboard
    let leaderboard = await NursingGameLeaderboard.findOne({
      gameId: game._id,
      studentId: req.user._id
    });
    
    if (!leaderboard) {
      leaderboard = new NursingGameLeaderboard({
        gameId: game._id,
        studentId: req.user._id
      });
    }
    
    leaderboard.attemptsCount += 1;
    
    if (percentageScore > leaderboard.bestPercentage) {
      leaderboard.bestPercentage = percentageScore;
      leaderboard.bestScore = attempt.score;
    }
    
    if (attempt.timeSpent < (leaderboard.fastestTime || Infinity)) {
      leaderboard.fastestTime = attempt.timeSpent;
    }
    
    // Award badge if passed and badge reward exists
    let earnedBadge = null;
    if (passed && game.badgeReward && !leaderboard.badgesEarned.includes(game.badgeReward)) {
      leaderboard.badgesEarned.push(game.badgeReward);
      earnedBadge = game.badgeReward;
    }
    
    await leaderboard.save();
    
    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalQuizzesTaken += 1;
    if (user.averageScore === 0) {
      user.averageScore = percentageScore;
    } else {
      user.averageScore = Math.round((user.averageScore + percentageScore) / 2);
    }
    await user.save();
    
    // Create notification for completion
    if (passed) {
      await createNotification(
        req.user._id,
        'student',
        'success',
        `🎉 Game Completed: ${game.title}`,
        `You passed with ${percentageScore}%! ${earnedBadge ? `You earned the "${earnedBadge}" badge!` : ''}`,
        `/student/game-results/${attempt._id}`,
        { gameId: game._id, score: percentageScore, passed: true }
      );
    }
    
    res.json({
      success: true,
      passed,
      score: attempt.score,
      percentageScore,
      passingScore: game.passingScore,
      earnedBadge,
      totalPossiblePoints,
      timeSpent: attempt.timeSpent
    });
  } catch (error) {
    console.error('Complete game error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= STUDENT: GET MY GAME HISTORY =================
export const getMyGameHistory = async (req, res) => {
  try {
    const attempts = await NursingGameAttempt.find({
      studentId: req.user._id,
      status: 'completed'
    })
      .populate('gameId', 'title category difficulty passingScore')
      .sort({ createdAt: -1 });
    
    const stats = {
      totalGamesPlayed: attempts.length,
      totalGamesPassed: attempts.filter(a => a.passed).length,
      averageScore: attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentageScore, 0) / attempts.length)
        : 0,
      badgesEarned: []
    };
    
    // Get badges from leaderboard entries
    const leaderboardEntries = await NursingGameLeaderboard.find({
      studentId: req.user._id
    });
    
    for (const entry of leaderboardEntries) {
      stats.badgesEarned.push(...entry.badgesEarned);
    }
    stats.badgesEarned = [...new Set(stats.badgesEarned)];
    
    res.json({
      success: true,
      attempts,
      stats
    });
  } catch (error) {
    console.error('Get my game history error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET LEADERBOARD =================
export const getGameLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const leaderboard = await NursingGameLeaderboard.find({ gameId })
      .populate('studentId', 'name email avatar')
      .sort({ bestPercentage: -1, fastestTime: 1 })
      .limit(50);
    
    // Add rank
    const leaderboardWithRank = leaderboard.map((entry, idx) => ({
      ...entry.toObject(),
      rank: idx + 1
    }));
    
    // Get user's rank
    const userEntry = leaderboardWithRank.find(e => e.studentId?._id.toString() === req.user._id.toString());
    const userRank = userEntry?.rank || null;
    const userBestScore = userEntry?.bestPercentage || null;
    
    res.json({
      success: true,
      leaderboard: leaderboardWithRank,
      userRank,
      userBestScore
    });
  } catch (error) {
    console.error('Get game leaderboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add to controllers/nursingGameController.js

// Get all students in same course
export const getStudentsInCourse = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const students = await User.find({
      role: 'student',
      courseId: user.courseId,
      _id: { $ne: req.user._id }
    }).select('name email avatar gamingStats');
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get daily challenges
export const getDailyChallenges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let challenges = await DailyChallenge.findOne({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      courseId: user.courseId
    }).populate('gameId');
    
    if (!challenges) {
      // Create new daily challenges
      const games = await NursingGame.find({
        courseId: user.courseId,
        isPublished: true
      }).limit(3);
      
      challenges = await DailyChallenge.create({
        date: today,
        gameId: games[0]?._id,
        title: "Quick Diagnosis",
        xpReward: 100,
        status: 'active'
      });
    }
    
    res.json({ success: true, challenges: [challenges] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user progress
export const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      level: user.gamingStats?.level || 1,
      xp: user.gamingStats?.totalXp || 0,
      nextLevelXp: ((user.gamingStats?.level || 1) * 100),
      rank: user.gamingStats?.rank || 'Bronze'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};