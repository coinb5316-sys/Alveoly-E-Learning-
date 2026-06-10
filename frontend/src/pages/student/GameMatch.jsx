// pages/student/GameMatch.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import NursingGamePlayer from '../../components/student/NursingGamePlayer';
import { Loader2, Users, Trophy, Clock, Award, Copy, CheckCircle, UserPlus } from 'lucide-react';

const GameMatch = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Get current user ID first - run this synchronously from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      console.log('Setting currentUserId from localStorage:', userId);
      setCurrentUserId(userId);
    }
    setInitialCheckDone(true);
  }, []);

  // Fetch match details only after currentUserId is set
  useEffect(() => {
    if (initialCheckDone && currentUserId) {
      console.log('Fetching match details for user:', currentUserId);
      fetchMatchDetails();
      
      // Set up polling interval
      const interval = setInterval(() => {
        if (match?.status === 'waiting' || match?.status === 'ready') {
          fetchMatchDetails();
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [matchId, initialCheckDone, currentUserId]);

  const fetchMatchDetails = async () => {
    if (!currentUserId) {
      console.log('No currentUserId yet, skipping fetch');
      return;
    }
    
    try {
      console.log('Fetching match:', matchId);
      const response = await axios.get(`/nursing-games/matches/${matchId}`);
      
      if (response.data.success) {
        const matchData = response.data.match;
        console.log('Match data:', matchData);
        console.log('Players:', matchData.players);
        console.log('CurrentUserId:', currentUserId);
        
        setMatch(matchData);
        setGame(matchData.game);
        setPlayers(matchData.players);
        
        // Check if current user is a participant - compare as strings
        const isPlayer = matchData.players.some(p => {
          const playerId = p.studentId?._id || p.studentId;
          return String(playerId) === String(currentUserId);
        });
        
        console.log('Is player?', isPlayer);
        
        if (!isPlayer) {
          console.error('User is not a participant!');
          toast.error('You are not a participant in this match');
          navigate('/student/nursing-games');
          return;
        }
        
        // Check if current user has joined
        const currentPlayer = matchData.players.find(p => {
          const playerId = p.studentId?._id || p.studentId;
          return String(playerId) === String(currentUserId);
        });
        
        const joined = currentPlayer?.status === 'playing';
        console.log('Has joined?', joined, 'Status:', currentPlayer?.status);
        setHasJoined(joined);
        
        // Handle different match statuses
        if (matchData.status === 'in-progress') {
          if (currentPlayer?.attemptId) {
            setAttemptId(currentPlayer.attemptId);
            setIsReady(true);
          }
        } else if (matchData.status === 'ready') {
          // Both players are ready, start countdown
          if (!countdown && !isReady) {
            startMatchCountdown();
          }
        } else if (matchData.status === 'waiting') {
          // Auto-join if not already joined
          if (!joined) {
            console.log('Auto-joining match...');
            await autoJoinMatch();
          }
        } else if (matchData.status === 'completed') {
          navigate(`/student/game-match/${matchId}/results`);
        }
      }
    } catch (error) {
      console.error('Error fetching match:', error);
      toast.error('Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const autoJoinMatch = async () => {
    try {
      console.log('Auto-joining match...');
      const response = await axios.post(`/nursing-games/matches/${matchId}/join`);
      if (response.data.success) {
        console.log('Successfully joined match');
        setHasJoined(true);
        toast.success('You have joined the match! Waiting for opponent...');
        // Refetch to update status
        setTimeout(() => fetchMatchDetails(), 500);
      }
    } catch (error) {
      console.error('Error joining match:', error);
      setHasJoined(false);
    }
  };

 // In GameMatch.jsx - Update the manualJoinMatch function

const manualJoinMatch = async () => {
  try {
    console.log('Manual join attempt for match:', matchId);
    console.log('Current user ID:', currentUserId);
    
    const response = await axios.post(`/nursing-games/matches/${matchId}/join`);
    console.log('Join response:', response.data);
    
    if (response.data.success) {
      toast.success('Joined match! Waiting for opponent...');
      setHasJoined(true);
      
      // If both players are now ready, the match will start automatically
      if (response.data.allReady) {
        console.log('Both players ready, match will start soon');
        toast.info('Both players ready! Starting match...');
      }
      
      // Refetch to update status
      setTimeout(() => fetchMatchDetails(), 1000);
    } else {
      toast.error(response.data.message || 'Failed to join match');
    }
  } catch (error) {
    console.error('Error joining match:', error);
    console.error('Error response:', error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to join match');
  }
};

  const startMatchCountdown = async () => {
    try {
      // Start the match
      await axios.post(`/nursing-games/matches/${matchId}/start`);
    } catch (err) {
      console.error('Error starting match:', err);
    }
    
    let count = 3;
    setCountdown(count);
    const countdownInterval = setInterval(async () => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        
        // Get the updated match to get attemptId
        const response = await axios.get(`/nursing-games/matches/${matchId}`);
        if (response.data.success) {
          const currentPlayer = response.data.match.players.find(p => {
            const playerId = p.studentId?._id || p.studentId;
            return String(playerId) === String(currentUserId);
          });
          if (currentPlayer?.attemptId) {
            setAttemptId(currentPlayer.attemptId);
            setIsReady(true);
          }
        }
        setCountdown(null);
      }
    }, 1000);
  };

  const copyInviteLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading match...</p>
        </div>
      </div>
    );
  }

  if (countdown !== null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-center">
          <div className="text-8xl font-bold text-white mb-4 animate-pulse">
            {countdown}
          </div>
          <p className="text-xl text-white opacity-80">Match starting soon!</p>
          <div className="mt-8 flex justify-center gap-8">
            {players.map((player, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl text-white font-bold">
                    {player.name?.charAt(0) || '?'}
                  </span>
                </div>
                <p className="text-white">{player.name}</p>
                {String(player.studentId?._id || player.studentId) === String(currentUserId) && (
                  <p className="text-xs text-green-300 mt-1">(You)</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isReady && game && attemptId) {
    return (
      <NursingGamePlayer
        gameId={game._id}
        attemptId={attemptId}
        onComplete={(results) => {
          navigate(`/student/game-match/${matchId}/results`, { state: { results } });
        }}
        onExit={() => {
          navigate('/student/nursing-games');
        }}
      />
    );
  }

  // Waiting room UI
  const currentPlayer = players.find(p => {
    const playerId = p.studentId?._id || p.studentId;
    return String(playerId) === String(currentUserId);
  });
  const opponent = players.find(p => {
    const playerId = p.studentId?._id || p.studentId;
    return String(playerId) !== String(currentUserId);
  });
  const allPlayersReady = players.length === 2 && players.every(p => p.status === 'playing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto relative mb-4">
            {!allPlayersReady ? (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-10 w-10 text-blue-500 animate-pulse" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {allPlayersReady ? "Ready to Start!" : "Waiting for Players"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {game?.title || 'Quiz Match'}
          </p>
        </div>
        
        {/* Players Status */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
          {/* Current User */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                hasJoined ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
              }`}>
                {hasJoined ? '✓' : '!'}
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  You {hasJoined && '(Ready)'}
                </p>
                <p className="text-sm text-gray-500">
                  {hasJoined ? 'You have joined the match' : 'You need to join the match'}
                </p>
              </div>
            </div>
            {!hasJoined && (
              <button
                onClick={manualJoinMatch}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Join Match
              </button>
            )}
          </div>
          
          <div className="border-t border-gray-300 dark:border-gray-600 my-3"></div>
          
          {/* Opponent */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                opponent?.status === 'playing' ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                {opponent?.status === 'playing' ? '✓' : '?'}
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  {opponent?.name || 'Opponent'}
                </p>
                <p className="text-sm text-gray-500">
                  {opponent?.status === 'playing' ? 'Ready to play' : 'Waiting to join...'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Invite Link - Show if waiting for opponent */}
        {(!opponent || opponent?.status !== 'playing') && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2 text-center">
              Share this link with your opponent to invite them
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
              />
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
        
        {/* Ready status */}
        {allPlayersReady && (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 text-sm mb-4">
              Both players are ready! Match starting soon...
            </p>
            <div className="animate-pulse flex justify-center">
              <div className="w-16 h-1 bg-green-500 rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Waiting message */}
        {hasJoined && opponent?.status !== 'playing' && (
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Waiting for {opponent?.name || 'opponent'} to join...
            </p>
          </div>
        )}
        
        <button
          onClick={() => navigate('/student/nursing-games')}
          className="mt-6 w-full px-6 py-2 text-red-500 hover:text-red-600 text-sm border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          Cancel Match
        </button>
      </div>
    </div>
  );
};

export default GameMatch;