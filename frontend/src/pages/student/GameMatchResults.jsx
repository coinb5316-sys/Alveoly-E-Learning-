// pages/student/GameMatchResults.jsx
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Award, Medal, CheckCircle, XCircle } from 'lucide-react';

const GameMatchResults = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p>No results found</p>
          <button
            onClick={() => navigate('/student/nursing-games')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className={`rounded-2xl shadow-xl overflow-hidden ${
          results.passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-600'
        }`}>
          <div className="p-8 text-center text-white">
            {results.passed ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                  <Trophy className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Match Completed!</h2>
                <p className="text-xl opacity-90">You won the match!</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                  <Medal className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Match Completed</h2>
                <p className="text-xl opacity-90">Good effort! Keep practicing.</p>
              </>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Score</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.percentageScore}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Spent</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(results.timeSpent / 60)}:{String(results.timeSpent % 60).padStart(2, '0')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Result</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.passed ? 'Winner!' : 'Runner Up'}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/student/nursing-games')}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Games
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMatchResults;