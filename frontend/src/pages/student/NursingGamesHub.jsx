// components/student/NursingGamesHub.jsx - COMPLETE PROFESSIONAL VERSION (FIXED)
import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import NursingGamePlayer from '../../components/student/NursingGamePlayer';
import {
  Search, Filter, Award, Clock, TrendingUp, Users,
  Heart, Stethoscope, Activity, Brain, Shield,
  Star, Zap, Target, ChevronRight, Play,
  Trophy, Medal, BarChart3, BookOpen,
  CheckCircle, XCircle, Swords, UsersRound,
  Crown, Sparkles, Calendar, Flame, Gem,
  Medal as MedalIcon, UserPlus, UserCheck
} from 'lucide-react';

const NursingGamesHub = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [studentStats, setStudentStats] = useState(null);
  
  // New state for matching features
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedMatchGame, setSelectedMatchGame] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [matchCode, setMatchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchRequestSent, setMatchRequestSent] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  const categories = [
    { value: 'all', label: 'All', icon: BookOpen },
    { value: 'medication', label: 'Medication', icon: Heart },
    { value: 'assessment', label: 'Assessment', icon: Stethoscope },
    { value: 'emergency', label: 'Emergency', icon: Activity },
    { value: 'procedures', label: 'Procedures', icon: Zap },
    { value: 'diagnosis', label: 'Diagnosis', icon: Brain },
    { value: 'ethics', label: 'Ethics', icon: Shield }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner', color: 'green' },
    { value: 'intermediate', label: 'Intermediate', color: 'blue' },
    { value: 'advanced', label: 'Advanced', color: 'orange' },
    { value: 'expert', label: 'Expert', color: 'red' }
  ];

  // Get current user ID on mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.id);
      }
    } catch (e) {
      console.error('Error getting current user:', e);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    fetchStudentStats();
    fetchStudents();
    fetchDailyChallenges();
    fetchUserProgress();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, searchTerm, selectedCategory, selectedDifficulty]);

  const fetchGames = async () => {
    try {
      const response = await axios.get('/nursing-games/games');
      if (response.data.success) {
        setGames(response.data.games);
        setFilteredGames(response.data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load nursing challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStats = async () => {
    try {
      const response = await axios.get('/nursing-games/my-history');
      console.log('Student stats response:', response.data);
      
      if (response.data.success) {
        setStudentStats(response.data.stats);
      } else if (response.data.stats) {
        setStudentStats(response.data.stats);
      } else {
        setStudentStats({
          totalGamesPlayed: 0,
          totalGamesPassed: 0,
          averageScore: 0,
          badgesEarned: []
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStudentStats({
        totalGamesPlayed: 0,
        totalGamesPassed: 0,
        averageScore: 0,
        badgesEarned: []
      });
    }
  };

  const fetchStudents = async () => {
  try {
    console.log('Fetching students from /users/students...');
    let response = await axios.get('/users/students');
    let studentsList = [];
    
    // Check if we got valid data
    if (Array.isArray(response.data) && response.data.length === 0) {
      console.log('No students from primary endpoint, trying to get current user course...');
      
      // Get current user to find their course
      const userResponse = await axios.get('/users/me');
      const currentCourseId = userResponse.data.courseId?._id || userResponse.data.courseId;
      
      if (currentCourseId) {
        console.log(`Fetching students by course: ${currentCourseId}`);
        const courseResponse = await axios.get(`/users/students/by-course/${currentCourseId}`);
        if (Array.isArray(courseResponse.data)) {
          studentsList = courseResponse.data;
        }
      }
    } else if (Array.isArray(response.data)) {
      studentsList = response.data;
    } else if (response.data.success && Array.isArray(response.data.students)) {
      studentsList = response.data.students;
    } else if (Array.isArray(response.data.students)) {
      studentsList = response.data.students;
    }
    
    // Filter out current user
    if (currentUserId && studentsList.length > 0) {
      studentsList = studentsList.filter(s => {
        const studentId = s._id || s.id;
        return studentId !== currentUserId;
      });
    }
    
    console.log(`Final: ${studentsList.length} students available`);
    setStudents(studentsList);
    
  } catch (error) {
    console.error('Error fetching students:', error);
    setStudents([]);
  }
};

  const fetchDailyChallenges = async () => {
    try {
      const response = await axios.get('/nursing-games/daily-challenges');
      console.log('Daily challenges response:', response.data);
      
      let challengesList = [];
      if (Array.isArray(response.data)) {
        challengesList = response.data;
      } else if (response.data.success && Array.isArray(response.data.challenges)) {
        challengesList = response.data.challenges;
      } else if (Array.isArray(response.data.challenges)) {
        challengesList = response.data.challenges;
      }
      
      setDailyChallenges(challengesList);
    } catch (error) {
      console.error('Error fetching daily challenges:', error);
      setDailyChallenges([]);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get('/users/progress');
      console.log('Progress response:', response.data);
      
      if (response.data.success) {
        setUserLevel(response.data.level || 1);
        setUserXP(response.data.xp || 0);
      } else if (response.data.level !== undefined) {
        setUserLevel(response.data.level);
        setUserXP(response.data.xp || 0);
      } else {
        setUserLevel(1);
        setUserXP(0);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      setUserLevel(1);
      setUserXP(0);
    }
  };

  const filterGames = () => {
    let filtered = [...games];
    
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.tags && game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(game => game.difficulty === selectedDifficulty);
    }
    
    setFilteredGames(filtered);
  };

  const handleStartGame = async (game) => {
    if (game.studentData.attemptsLeft === 0) {
      toast.warning(`You've used all ${game.attemptsAllowed} attempts for this challenge`);
      return;
    }
    
    if (game.studentData.inProgress) {
      setActiveAttempt({
        gameId: game._id,
        attemptId: game.studentData.inProgressAttemptId
      });
      setSelectedGame(game);
      return;
    }
    
    try {
      const response = await axios.post(`/nursing-games/games/${game._id}/start`);
      if (response.data.success) {
        setActiveAttempt({
          gameId: game._id,
          attemptId: response.data.attempt.id
        });
        setSelectedGame(game);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error(error.response?.data?.message || 'Failed to start challenge');
    }
  };

  const handleChallengeStudent = async () => {
    if (!selectedMatchGame || !selectedOpponent) {
      toast.error('Please select a game and opponent');
      return;
    }

    try {
      const response = await axios.post('/nursing-games/matches/create', {
        gameId: selectedMatchGame._id,
        opponentId: selectedOpponent._id
      });

      if (response.data.success) {
        toast.success(`Challenge sent to ${selectedOpponent.name}!`);
        setMatchRequestSent(true);
        setTimeout(() => {
          setShowMatchModal(false);
          setSelectedMatchGame(null);
          setSelectedOpponent(null);
          setMatchRequestSent(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error(error.response?.data?.message || 'Failed to send challenge');
    }
  };

  const handleJoinMatch = async () => {
    if (!matchCode) {
      toast.error('Please enter a match code');
      return;
    }

    try {
      const response = await axios.post('/nursing-games/matches/join', { matchCode });
      if (response.data.success) {
        toast.success('Joined match successfully!');
        setActiveAttempt({
          gameId: response.data.match.game._id,
          attemptId: response.data.match.attemptId
        });
        setSelectedGame(response.data.match.game);
        setMatchCode('');
      }
    } catch (error) {
      console.error('Error joining match:', error);
      toast.error(error.response?.data?.message || 'Failed to join match');
    }
  };

  const handleQuickMatch = async (game) => {
    try {
      const response = await axios.post('/nursing-games/matches/auto', {
        gameId: game._id
      });

      if (response.data.success) {
        setIsSearching(true);
        toast.info('Searching for opponent...');
        
        const interval = setInterval(async () => {
          const statusRes = await axios.get(`/nursing-games/matches/${response.data.matchId}/status`);
          if (statusRes.data.status === 'ready') {
            clearInterval(interval);
            setIsSearching(false);
            setActiveAttempt({
              gameId: game._id,
              attemptId: statusRes.data.attemptId
            });
            setSelectedGame(game);
            toast.success('Opponent found! Starting match...');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error starting quick match:', error);
      toast.error('Failed to start quick match');
      setIsSearching(false);
    }
  };

  const handleViewLeaderboard = async (game) => {
    try {
      const response = await axios.get(`/nursing-games/games/${game._id}/leaderboard`);
      if (response.data.success) {
        setLeaderboard({
          game,
          entries: response.data.leaderboard,
          userRank: response.data.userRank,
          userBestScore: response.data.userBestScore
        });
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      expert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return badges[difficulty] || badges.intermediate;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLevelProgress = () => {
    const xpForNextLevel = userLevel * 100;
    const progress = (userXP / xpForNextLevel) * 100;
    return Math.min(progress, 100);
  };

  if (activeAttempt && selectedGame) {
    return (
      <NursingGamePlayer
        gameId={activeAttempt.gameId}
        attemptId={activeAttempt.attemptId}
        onComplete={(results) => {
          setActiveAttempt(null);
          setSelectedGame(null);
          fetchGames();
          fetchStudentStats();
          fetchUserProgress();
        }}
        onExit={() => {
          setActiveAttempt(null);
          setSelectedGame(null);
        }}
      />
    );
  }

  if (leaderboard) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setLeaderboard(null)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Challenges
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {leaderboard.game.title} - Leaderboard
          </h1>
        </div>
        
        {leaderboard.userRank && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Your Rank</p>
                <p className="text-3xl font-bold">#{leaderboard.userRank}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Best Score</p>
                <p className="text-3xl font-bold">{leaderboard.userBestScore}%</p>
              </div>
              <Trophy className="h-12 w-12 opacity-50" />
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Best Score</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fastest Time</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.entries.map((entry, idx) => (
                  <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        {idx === 1 && <MedalIcon className="h-5 w-5 text-gray-400" />}
                        {idx === 2 && <MedalIcon className="h-5 w-5 text-orange-400" />}
                        <span className="font-medium text-gray-900 dark:text-white">#{entry.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {entry.studentId?.name || 'Student'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${getScoreColor(entry.bestPercentage)}`}>
                        {entry.bestPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {entry.fastestTime ? `${Math.floor(entry.fastestTime / 60)}:${String(entry.fastestTime % 60).padStart(2, '0')}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        {entry.badgesEarned.map((badge, i) => (
                          <span key={i} className="inline-block" title={badge}>
                            <Award className="h-5 w-5 text-yellow-500" />
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading nursing challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Level Progress */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Nursing Game Challenges</h1>
            <p className="text-blue-100 mt-1">
              Test your clinical knowledge and compete with peers
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="font-bold">Level {userLevel}</span>
            </div>
            <div className="text-sm text-blue-100">{userXP} / {userLevel * 100} XP</div>
          </div>
        </div>
        <div className="w-full bg-blue-400/30 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full transition-all"
            style={{ width: `${getLevelProgress()}%` }}
          />
        </div>
      </div>

      {/* Daily Challenges Section */}
      {dailyChallenges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Daily Challenges</h2>
            <span className="text-xs text-gray-500">Refresh in 12h</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {dailyChallenges.map((challenge, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{challenge.title}</p>
                  <p className="text-xs text-gray-500">+{challenge.xpReward} XP</p>
                </div>
                {challenge.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <button 
                    onClick={() => handleStartGame(challenge.game)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600"
                  >
                    Start
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {studentStats && studentStats.totalGamesPlayed > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Games Played</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{studentStats.totalGamesPlayed}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{studentStats.totalGamesPassed}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(studentStats.averageScore)}`}>
                  {studentStats.averageScore}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Badges Earned</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {studentStats.badgesEarned?.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search challenges by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
          
          <div className="flex gap-2">
            {difficulties.map(diff => (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedDifficulty === diff.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGames.map((game) => (
          <div key={game._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBadge(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(game.timeLimit / 60)} min
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {game.points} pts
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {game.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {game.description}
                  </p>
                </div>
                {game.badgeReward && (
                  <div className="ml-3 flex-shrink-0">
                    <div className="relative">
                      <Award className="h-8 w-8 text-yellow-500" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Progress if attempted */}
              {game.studentData.hasAttempted && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Your Best Score</span>
                    <span className={`font-semibold ${getScoreColor(game.studentData.bestScore)}`}>
                      {game.studentData.bestScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${game.studentData.bestScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Attempts: {game.studentData.attemptsCount}/{game.attemptsAllowed}</span>
                    {game.studentData.bestScore >= game.passingScore && (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Passed
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleStartGame(game)}
                  disabled={game.studentData.attemptsLeft === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    game.studentData.attemptsLeft === 0
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {game.studentData.inProgress ? (
                    <>
                      <Play className="h-4 w-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play Solo
                    </>
                  )}
                </button>
                
                {game.allowMatching && (
                  <button
                    onClick={() => handleQuickMatch(game)}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                    title="Quick Match"
                  >
                    <Swords className="h-4 w-4" />
                    <span className="hidden sm:inline">Quick Match</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setSelectedMatchGame(game);
                    setShowMatchModal(true);
                  }}
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
                  title="Challenge Friend"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Challenge</span>
                </button>
                
                <button
                  onClick={() => handleViewLeaderboard(game)}
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Leaderboard"
                >
                  <Trophy className="h-4 w-4" />
                </button>
              </div>
              
              {game.studentData.attemptsLeft === 0 && (
                <p className="mt-3 text-xs text-center text-red-600 dark:text-red-400">
                  You've reached the maximum number of attempts for this challenge
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Award className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No challenges found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
              ? 'Try adjusting your filters'
              : 'Check back later for new nursing challenges'}
          </p>
        </div>
      )}

      {/* Challenge Modal */}
      {showMatchModal && selectedMatchGame && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Challenge a Friend
                </h2>
                <button
                  onClick={() => {
                    setShowMatchModal(false);
                    setSelectedMatchGame(null);
                    setSelectedOpponent(null);
                    setMatchRequestSent(false);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                {!matchRequestSent ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Game: {selectedMatchGame.title}
                      </label>
                      <p className="text-xs text-gray-500">{selectedMatchGame.description}</p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Opponent
                      </label>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {students.map((student) => (
                          <button
                            key={student._id}
                            onClick={() => setSelectedOpponent(student)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedOpponent?._id === student._id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {student.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium">{student.name || 'Student'}</p>
                                <p className="text-xs text-gray-500">{student.email || ''}</p>
                              </div>
                              {selectedOpponent?._id === student._id && (
                                <UserCheck className="h-5 w-5 text-blue-500 ml-auto" />
                              )}
                            </div>
                          </button>
                        ))}
                        {students.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No other students found in your course</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleChallengeStudent}
                      disabled={!selectedOpponent || students.length === 0}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Challenge
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Challenge Sent!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your challenge has been sent to {selectedOpponent?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Match Searching Modal */}
      {isSearching && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
              <div className="w-20 h-20 mx-auto relative mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <UsersRound className="h-8 w-8 text-blue-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Finding Opponent
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Searching for a player of similar skill level...
              </p>
              <button
                onClick={() => setIsSearching(false)}
                className="mt-4 px-4 py-2 text-red-500 hover:text-red-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NursingGamesHub;