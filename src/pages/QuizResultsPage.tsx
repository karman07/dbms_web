import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizSubmissionResponse } from '@/services/course.service';
import { BUTTON_STYLES } from '@/constants';

interface QuizResultsLocationState {
  results: QuizSubmissionResponse;
  onRetry: () => void;
  onContinue: () => void;
}

const QuizResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as QuizResultsLocationState;

  useEffect(() => {
    if (!state || !state.results) {
      navigate(-1);
    }
  }, [state, navigate]);

  if (!state || !state.results) {
    return null;
  }

  const { results, onRetry, onContinue } = state;
  const correctPercentage = (results.correctAnswers / results.totalQuestions) * 100;
  const incorrectPercentage = 100 - correctPercentage;

  // SVG Pie Chart calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const correctArc = (correctPercentage / 100) * circumference;
  const incorrectArc = (incorrectPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Results Header */}
          <div
            className={`rounded-2xl p-8 text-center ${
              results.passed
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800'
                : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800'
            }`}
          >
            <div className="flex justify-center mb-4">
              {results.passed ? (
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
              )}
            </div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                results.passed
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-orange-900 dark:text-orange-100'
              }`}
            >
              {results.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            <p
              className={`text-lg ${
                results.passed
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}
            >
              {results.passed
                ? 'You have successfully passed the quiz!'
                : 'You need to score higher to pass this quiz.'}
            </p>
          </div>

          {/* Score Card with Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Your Score
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
              {/* Pie Chart */}
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                    className="dark:stroke-gray-700"
                  />
                  {/* Incorrect arc (red) */}
                  {incorrectPercentage > 0 && (
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="20"
                      strokeDasharray={`${incorrectArc} ${circumference}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Correct arc (green) */}
                  {correctPercentage > 0 && (
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="20"
                      strokeDasharray={`${correctArc} ${circumference}`}
                      strokeDashoffset={-incorrectArc}
                      strokeLinecap="round"
                    />
                  )}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {results.score}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {results.correctAnswers}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Incorrect Answers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {results.totalQuestions - results.correctAnswers}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {results.totalQuestions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Question Review
            </h2>
            <div className="space-y-4">
              {results.results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.isCorrect
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        {index + 1}. {result.question}
                      </p>
                      {!result.isCorrect && (
                        <>
                          <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                            Your answer: {result.yourAnswer}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                            Correct answer: {result.correctAnswer}
                          </p>
                        </>
                      )}
                      {result.isCorrect && (
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                          Your answer: {result.yourAnswer} ✓
                        </p>
                      )}
                      {result.explanation && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="font-medium">Explanation:</span> {result.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!results.passed && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Retry Quiz
              </Button>
            )}
            <Button
              onClick={onContinue}
              size="lg"
              className={BUTTON_STYLES.gradient + ' flex items-center gap-2'}
            >
              Back to Lesson
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
