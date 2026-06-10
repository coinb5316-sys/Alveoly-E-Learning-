import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import NursingGameForm from '../../components/lecturer/NursingGameForm';
import {
  Plus, Search, Filter, Eye, Edit2, Trash2, Copy, 
  Globe, Globe2, TrendingUp, Users, Award, Clock,
  CheckCircle, XCircle, AlertCircle, BarChart3, Download
} from 'lucide-react';

const NursingGames = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedGame, setSelectedGame] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [gameAttempts, setGameAttempts] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, searchTerm, filterStatus]);

  const fetchGames = async () => {
    try {
      const response = await axios.get('/nursing-games/my-games');
      if (response.data.success) {
        setGames(response.data.games);
        setFilteredGames(response.data.games);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const filterGames = () => {
    let filtered = [...games];
    
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterStatus === 'published') {
      filtered = filtered.filter(game => game.isPublished);
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(game => !game.isPublished);
    }
    
    setFilteredGames(filtered);
  };

  const handlePublishToggle = async (gameId, isPublished) => {
    try {
      const response = await axios.patch(`/nursing-games/games/${gameId}/toggle-publish`);
      if (response.data.success) {
        toast.success(response.data.isPublished ? 'Game published!' : 'Game unpublished');
        fetchGames();
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Failed to update game status');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/nursing-games/games/${gameId}`);
      if (response.data.success) {
        toast.success('Game deleted successfully');
        fetchGames();
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  const handleViewStats = async (game) => {
    setSelectedGame(game);
    setShowStats(true);
    
    try {
      const response = await axios.get(`/nursing-games/games/${game._id}/attempts`);
      if (response.data.success) {
        setGameAttempts(response.data.attempts);
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
      toast.error('Failed to load game statistics');
    }
  };

  const handleDuplicate = async (game) => {
    try {
      const duplicateData = {
        ...game,
        title: `${game.title} (Copy)`,
        isPublished: false,
        publishedAt: null
      };
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.__v;
      
      const response = await axios.post('/nursing-games/games', duplicateData);
      if (response.data.success) {
        toast.success('Game duplicated successfully');
        fetchGames();
      }
    } catch (error) {
      console.error('Error duplicating game:', error);
      toast.error('Failed to duplicate game');
    }
  };

  const exportGameData = (game) => {
    const data = {
      game: {
        title: game.title,
        description: game.description,
        category: game.category,
        difficulty: game.difficulty,
        questions: game.questions.length,
        totalPoints: game.points,
        passingScore: game.passingScore
      },
      stats: game.stats,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.title.replace(/\s+/g, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Game data exported');
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      expert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[difficulty] || colors.intermediate;
  };

  const getStatusBadge = (isPublished) => {
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs">
          <Globe className="h-3 w-3" />
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
        <Globe2 className="h-3 w-3" />
        Draft
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading nursing games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nursing Game Challenges
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create engaging clinical challenges with diagrams and track student performance
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGame(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Create New Game
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Games</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{games.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {games.filter(g => g.isPublished).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {games.reduce((sum, g) => sum + (g.stats?.totalAttempts || 0), 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Pass Rate</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(games.reduce((sum, g) => sum + (g.stats?.passRate || 0), 0) / (games.length || 1))}%
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search games by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'published'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'draft'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <div key={game._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Game Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                    {game.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                    {getStatusBadge(game.isPublished)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleViewStats(game)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="View Statistics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => exportGameData(game)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Export Data"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(game)}
                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {game.description}
              </p>
            </div>
            
            {/* Game Stats */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Questions</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{game.questions.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Points</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{game.points}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Time Limit</div>
                  <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(game.timeLimit / 60)}:{(game.timeLimit % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
              
              {/* Performance Stats */}
              {game.stats && game.stats.totalAttempts > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Completion Rate</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {Math.round((game.stats.completedAttempts / game.stats.totalAttempts) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${(game.stats.completedAttempts / game.stats.totalAttempts) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Average Score</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{game.stats.averageScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${game.stats.averageScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="p-4 flex gap-2">
              <button
                onClick={() => handlePublishToggle(game._id, game.isPublished)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  game.isPublished
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                }`}
              >
                {game.isPublished ? (
                  <>
                    <Globe2 className="h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Publish
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setEditingGame(game);
                  setShowCreateModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
              
              <button
                onClick={() => handleDeleteGame(game._id)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Award className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No games found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first nursing game challenge'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingGame ? 'Edit Nursing Game' : 'Create New Nursing Game'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingGame(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <NursingGameForm
                  game={editingGame}
                  onSave={(savedGame) => {
                    setShowCreateModal(false);
                    setEditingGame(null);
                    fetchGames();
                  }}
                  onCancel={() => {
                    setShowCreateModal(false);
                    setEditingGame(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStats && selectedGame && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedGame.title} - Statistics
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Student performance and analytics
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowStats(false);
                    setSelectedGame(null);
                    setGameAttempts([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {gameAttempts.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {gameAttempts.filter(a => a.passed).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Passed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(gameAttempts.reduce((sum, a) => sum + a.percentageScore, 0) / (gameAttempts.length || 1))}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.max(...gameAttempts.map(a => a.percentageScore), 0)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Highest Score</div>
                  </div>
                </div>
                
                {/* Leaderboard */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Leaderboard
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Rank</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Student</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Score</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {gameAttempts.sort((a, b) => b.percentageScore - a.percentageScore).map((attempt, idx) => (
                          <tr key={attempt._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              #{idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {attempt.studentId?.name || 'Unknown Student'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {attempt.studentId?.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-semibold ${
                                attempt.percentageScore >= selectedGame.passingScore
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {attempt.percentageScore}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                              {Math.floor(attempt.timeSpent / 60)}:{String(attempt.timeSpent % 60).padStart(2, '0')}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {attempt.passed ? (
                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <CheckCircle className="h-4 w-4" />
                                  Passed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                  <XCircle className="h-4 w-4" />
                                  Failed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NursingGames;