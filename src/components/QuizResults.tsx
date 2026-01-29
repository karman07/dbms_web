import React from 'react';
import { motion } from 'framer-motion';
import { QuizSubmissionResponse } from '@/services/course.service';
import { CheckCircle2, XCircle, TrophyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizResultsProps {
  results: QuizSubmissionResponse;
  onContinue: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ results, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Score Card */}
      <div
        className={`p-8 rounded-2xl text-center ${
          results.passed
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700'
            : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-700'
        }`}
      >
        <div className="flex justify-center mb-4">
          {results.passed ? (
            <TrophyIcon className="h-20 w-20 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-20 w-20 text-red-600 dark:text-red-400" />
          )}
        </div>

        <h2
          className={`text-3xl font-bold mb-2 ${
            results.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}
        >
          {results.passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
        </h2>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          You scored <span className="font-bold text-2xl">{results.score}%</span>
        </p>

        <p className="text-gray-600 dark:text-gray-400">
          {results.correctAnswers} out of {results.totalQuestions} questions correct
        </p>

        {!results.passed && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            You need 60% to pass. Review the material and try again!
          </p>
        )}
      </div>

      {/* Question Results */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detailed Results</h3>

        {results.results.map((result, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-xl border-2 ${
              result.isCorrect
                ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              {result.isCorrect ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  Question {idx + 1}: {result.question}
                </p>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Your answer:</span>{' '}
                    <span
                      className={
                        result.isCorrect
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }
                    >
                      {result.yourAnswer}
                    </span>
                  </p>

                  {!result.isCorrect && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Correct answer:</span>{' '}
                      <span className="text-green-700 dark:text-green-300">
                        {result.correctAnswer}
                      </span>
                    </p>
                  )}

                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Explanation:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{result.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onContinue}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
        >
          {results.passed ? 'Continue to Next Lesson' : 'Review Lesson'}
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizResults;
