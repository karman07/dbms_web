import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quiz, QuizAnswer, QuizSubmissionResponse } from '@/services/course.service';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface QuizComponentProps {
  quiz: Quiz[];
  onSubmit: (answers: QuizAnswer[]) => Promise<void>;
  submitting: boolean;
  results?: QuizSubmissionResponse | null;
  onRetry: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quiz, onSubmit, submitting, results, onRetry }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (results) {
      setAnswers({});
    }
  }, [results]);

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    const quizAnswers: QuizAnswer[] = Object.entries(answers).map(([qIdx, oIdx]) => ({
      questionIndex: parseInt(qIdx),
      selectedOptionIndex: oIdx,
    }));
    await onSubmit(quizAnswers);
  };

  const allAnswered = quiz.length > 0 && Object.keys(answers).length === quiz.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Test Your Knowledge
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Answer all {quiz.length} questions to complete this lesson
        </p>
      </div>

      {quiz.map((question, qIdx) => (
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: qIdx * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0">
              {qIdx + 1}
            </span>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
              {question.question}
            </h4>
          </div>

          <div className="space-y-3 ml-11">
            {question.options.map((option, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleOptionSelect(qIdx, oIdx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[qIdx] === oIdx
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[qIdx] === oIdx
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {answers[qIdx] === oIdx && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="font-medium">{typeof option === 'string' ? option : option.text || ''}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      ))}

      {results ? (
        <div className="space-y-4">
          <div className={`p-6 rounded-xl border-2 ${
            results.passed 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {results.passed ? (
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              )}
              <div>
                <h3 className={`text-2xl font-bold ${
                  results.passed ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'
                }`}>
                  {results.passed ? 'Quiz Passed!' : 'Keep Trying!'}
                </h3>
                <p className={`text-sm ${
                  results.passed ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                }`}>
                  Score: {results.score}% ({results.correctAnswers}/{results.totalQuestions} correct)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={onRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry Quiz
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Quiz'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
