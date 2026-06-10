// pages/student/GameMatch.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import NursingGamePlayer from '../../components/student/NursingGamePlayer';
import { Loader2, Users, Trophy, Clock, Award } from 'lucide-react';

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

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/nursing-games/matches/${matchId}`);
      
      if (response.data.success) {
        const matchData = response.data.match;
        setMatch(matchData);
        setGame(matchData.game);
        setPlayers(matchData.players);
        
        // Check if user is already in this match
        const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
        const isPlayer = matchData.players.some(p => p.studentId === currentUserId);
        
        if (!isPlayer) {
          toast.error('You are not a participant in this match');
          navigate('/student/nursing-games');
          return;
        }
        
        // If match is already in progress or completed
        if (matchData.status === 'in-progress') {
          // Find the user's attempt
          const userPlayer = matchData.players.find(p => p.studentId === currentUserId);
          if (userPlayer?.attemptId) {
            setAttemptId(userPlayer.attemptId);
            setGame(matchData.game);
            setIsReady(true);
          }
        } else if (matchData.status === 'waiting') {
          // User needs to join/ready up
          await joinMatch();
        } else if (matchData.status === 'completed') {
          // Show results
          navigate(`/student/game-match/${matchId}/results`);
        }
      }
    } catch (error) {
      console.error('Error fetching match:', error);
      toast.error('Failed to load match details');
      navigate('/student/nursing-games');
    } finally {
      setLoading(false);
    }
  };

  const joinMatch = async () => {
    try {
      const response = await axios.post(`/nursing-games/matches/${matchId}/join`);
      if (response.data.success) {
        toast.success('Joined match! Waiting for opponent...');
        // Poll for match start
        pollMatchStatus();
      }
    } catch (error) {
      console.error('Error joining match:', error);
      toast.error('Failed to join match');
    }
  };

  const pollMatchStatus = () => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/nursing-games/matches/${matchId}/status`);
        if (response.data.status === 'in-progress') {
          clearInterval(interval);
          // Start countdown
          let count = 3;
          setCountdown(count);
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
              clearInterval(countdownInterval);
              setAttemptId(response.data.attemptId);
              setIsReady(true);
              setCountdown(null);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error polling match status:', error);
      }
    }, 2000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="h-10 w-10 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Waiting for Opponent
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {game?.title || 'Quiz Match'}
        </p>
        
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">You</p>
                <p className="text-sm text-gray-500">Ready</p>
              </div>
            </div>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          
          <div className="border-t border-gray-300 dark:border-gray-600 my-3"></div>
          
          <div className="flex justify-between items-center opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                ?
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700 dark:text-gray-300">Opponent</p>
                <p className="text-sm text-gray-500">Waiting...</p>
              </div>
            </div>
            <Clock className="h-6 w-6 text-gray-400 animate-pulse" />
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          Share this link with your opponent to invite them
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
          }}
          className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
        >
          Copy invite link
        </button>
        
        <button
          onClick={() => navigate('/student/nursing-games')}
          className="mt-6 px-6 py-2 text-red-500 hover:text-red-600 text-sm"
        >
          Cancel Match
        </button>
      </div>
    </div>
  );
};

export default GameMatch;