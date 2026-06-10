import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import {
  Clock, Award, Zap, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, Flag, Volume2, Heart,
  Brain, Stethoscope, Activity, Timer, BarChart3
} from 'lucide-react';

const NursingGamePlayer = ({ gameId, attemptId, onComplete, onExit }) => {
  const [game, setGame] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answersSubmitted, setAnswersSubmitted] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    fetchGameDetails();
  }, [gameId, attemptId]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !gameCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, gameCompleted]);

  const fetchGameDetails = async () => {
    try {
      const [gameRes, attemptRes] = await Promise.all([
        axios.get(`/nursing-games/games/${gameId}`),
        axios.get(`/nursing-games/attempts/${attemptId}`)
      ]);
      
      setGame(gameRes.data.game);
      setAttempt(attemptRes.data.attempt);
      setTimeRemaining(gameRes.data.game.timeLimit - (attemptRes.data.attempt.timeSpent || 0));
      
      // Load existing answers
      if (attemptRes.data.attempt.answers) {
        const existingAnswers = {};
        const submittedStatus = {};
        attemptRes.data.attempt.answers.forEach(ans => {
          existingAnswers[ans.questionId] = ans.selectedOptionIndex;
          submittedStatus[ans.questionId] = true;
        });
        setSelectedAnswers(existingAnswers);
        setAnswersSubmitted(submittedStatus);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game:', error);
      toast.error('Failed to load game');
      onExit();
    }
  };

  const handleTimeUp = async () => {
    toast.warning("Time's up! Submitting your answers...");
    await handleSubmitGame();
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (answersSubmitted[questionIndex]) {
      toast.info('You have already answered this question');
      return;
    }
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitAnswer = async (questionIndex) => {
    if (selectedAnswers[questionIndex] === undefined) {
      toast.warning('Please select an answer first');
      return;
    }
    
    if (answersSubmitted[questionIndex]) {
      return;
    }
    
    setSubmitting(true);
    
    const timeSpentOnQuestion = questionTimes[questionIndex] || 0;
    
    try {
      const response = await axios.post(`/nursing-games/attempts/${attemptId}/answer`, {
        questionIndex,
        selectedOptionIndex: selectedAnswers[questionIndex],
        timeSpentOnQuestion
      });
      
      if (response.data.success) {
        setAnswersSubmitted(prev => ({ ...prev, [questionIndex]: true }));
        
        // Show feedback
        if (response.data.isCorrect) {
          toast.success(`✓ Correct! +${response.data.pointsEarned} points`);
        } else {
          toast.info(`✗ Incorrect. ${response.data.explanation}`);
        }
        
        // Store explanation visibility
        setShowExplanation(prev => ({ ...prev, [questionIndex]: true }));
        
        // Auto-advance after short delay
        if (currentQuestionIndex < game.questions.length - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitGame = async () => {
    if (gameCompleted) return;
    
    // Submit any unanswered questions
    for (let i = 0; i < game.questions.length; i++) {
      if (!answersSubmitted[i] && selectedAnswers[i] !== undefined) {
        await axios.post(`/nursing-games/attempts/${attemptId}/answer`, {
          questionIndex: i,
          selectedOptionIndex: selectedAnswers[i],
          timeSpentOnQuestion: questionTimes[i] || 0
        });
      }
    }
    
    setSubmitting(true);
    
    try {
      const response = await axios.post(`/nursing-games/attempts/${attemptId}/complete`);
      
      if (response.data.success) {
        setResults({
          passed: response.data.passed,
          score: response.data.score,
          percentageScore: response.data.percentageScore,
          passingScore: response.data.passingScore,
          earnedBadge: response.data.earnedBadge,
          totalPossiblePoints: response.data.totalPossiblePoints,
          timeSpent: response.data.timeSpent
        });
        setGameCompleted(true);
        
        if (response.data.passed) {
          toast.success(`🎉 Congratulations! You passed with ${response.data.percentageScore}%!`);
          if (response.data.earnedBadge) {
            toast.success(`🏆 You earned the "${response.data.earnedBadge}" badge!`);
          }
        } else {
          toast.warning(`You scored ${response.data.percentageScore}%. Need ${response.data.passingScore}% to pass.`);
        }
        
        if (onComplete) onComplete(response.data);
      }
    } catch (error) {
      console.error('Error completing game:', error);
      toast.error('Failed to submit game');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'text-green-600 bg-green-100',
      intermediate: 'text-blue-600 bg-blue-100',
      advanced: 'text-orange-600 bg-orange-100',
      expert: 'text-red-600 bg-red-100'
    };
    return colors[difficulty] || colors.intermediate;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      medication: <Heart className="h-5 w-5" />,
      assessment: <Stethoscope className="h-5 w-5" />,
      emergency: <Activity className="h-5 w-5" />,
      procedures: <Zap className="h-5 w-5" />,
      diagnosis: <Brain className="h-5 w-5" />
    };
    return icons[category] || <Award className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (gameCompleted && results) {
    const passed = results.passed;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-2xl shadow-xl overflow-hidden ${
            passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-600'
          }`}>
            <div className="p-8 text-center text-white">
              {passed ? (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Challenge Completed!</h2>
                  <p className="text-xl opacity-90">You passed the nursing challenge!</p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                    <XCircle className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Challenge Completed</h2>
                  <p className="text-xl opacity-90">Keep practicing to improve your score!</p>
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
                  <div className="text-sm text-gray-500">
                    {results.score} / {results.totalPossiblePoints} points
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Spent</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(results.timeSpent / 60)}:{String(results.timeSpent % 60).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-500">minutes:seconds</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Passing Score</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {results.passingScore}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {passed ? '✓ Passed' : '✗ Try Again'}
                  </div>
                </div>
              </div>
              
              {results.earnedBadge && (
                <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Badge Earned: {results.earnedBadge}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This badge has been added to your collection!
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={onExit}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Exit to Games Hub
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = game.questions[currentQuestionIndex];
  const isAnswered = answersSubmitted[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / game.questions.length) * 100;
  const answeredCount = Object.keys(answersSubmitted).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={onExit}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">{game.title}</h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    {getCategoryIcon(game.category)}
                    {game.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">Progress:</div>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredCount / game.questions.length) * 100}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {answeredCount}/{game.questions.length}
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                timeRemaining < 60 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <Timer className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Question {currentQuestionIndex + 1} of {game.questions.length}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {currentQuestion.points} points
                </span>
              </div>
              {isAnswered && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Answered</span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {currentQuestion.questionText}
            </h3>
            
            {/* Diagram */}
            {currentQuestion.diagramUrl && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <img 
                  src={currentQuestion.diagramUrl} 
                  alt={currentQuestion.diagramCaption || 'Clinical diagram'}
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
                {currentQuestion.diagramCaption && (
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
                    {currentQuestion.diagramCaption}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Options */}
          <div className="p-6 space-y-3">
            {currentQuestion.options.map((option, optIndex) => {
              const isSelected = selectedAnswer === optIndex;
              const isCorrect = isAnswered && option.isCorrect;
              const isWrong = isAnswered && isSelected && !option.isCorrect;
              
              let optionClass = "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600";
              if (isAnswered && isCorrect) {
                optionClass = "border-green-500 bg-green-50 dark:bg-green-900/20";
              } else if (isAnswered && isWrong) {
                optionClass = "border-red-500 bg-red-50 dark:bg-red-900/20";
              } else if (isSelected && !isAnswered) {
                optionClass = "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
              }
              
              return (
                <button
                  key={optIndex}
                  onClick={() => !isAnswered && handleAnswerSelect(currentQuestionIndex, optIndex)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                    !isAnswered && 'hover:shadow-md'
                  } ${optionClass}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      isSelected && !isAnswered ? 'bg-blue-500 text-white' :
                      isCorrect ? 'bg-green-500 text-white' :
                      isWrong ? 'bg-red-500 text-white' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + optIndex)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200">{option.text}</p>
                      {isAnswered && option.explanation && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {option.explanation}
                        </p>
                      )}
                    </div>
                    {isAnswered && isCorrect && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {isAnswered && isWrong && (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Explanation (after answering) */}
          {isAnswered && showExplanation[currentQuestionIndex] && (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Explanation</h4>
                  <p className="text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
                  {currentQuestion.nursingConcept && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      <strong>Nursing Concept:</strong> {currentQuestion.nursingConcept}
                    </p>
                  )}
                  {currentQuestion.clinicalTip && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      <strong>💡 Clinical Tip:</strong> {currentQuestion.clinicalTip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {!isAnswered ? (
              <button
                onClick={() => handleSubmitAnswer(currentQuestionIndex)}
                disabled={selectedAnswer === undefined || submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
                {!submitting && <ChevronRight className="h-4 w-4" />}
              </button>
            ) : currentQuestionIndex < game.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center gap-2"
              >
                Next Question
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitGame}
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
              >
                <Flag className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Challenge'}
              </button>
            )}
          </div>
        </div>
        
        {/* Question Navigation */}
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          {game.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                currentQuestionIndex === idx
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : answersSubmitted[idx]
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : selectedAnswers[idx] !== undefined
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NursingGamePlayer;