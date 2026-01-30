import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Quiz, QuizAnswer } from '@/services/course.service';
import { BUTTON_STYLES } from '@/constants';

interface QuizPageLocationState {
  quiz: Quiz[];
  sectionId: string;
  lessonId: string;
  lessonTitle: string;
  onSubmit: (answers: QuizAnswer[]) => Promise<void>;
}

interface QuestionState {
  answered: boolean;
  selectedOption: number | null;
  markedForReview: boolean;
}

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as QuizPageLocationState;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!state || !state.quiz) {
      navigate(-1);
    }
  }, [state, navigate]);

  if (!state || !state.quiz) {
    return null;
  }

  const { quiz, lessonTitle, onSubmit } = state;

  const handleSelectOption = (optionIndex: number) => {
    setQuestionStates({
      ...questionStates,
      [currentQuestion]: {
        answered: true,
        selectedOption: optionIndex,
        markedForReview: questionStates[currentQuestion]?.markedForReview || false,
      },
    });
  };

  const handleToggleReview = () => {
    const current = questionStates[currentQuestion] || {
      answered: false,
      selectedOption: null,
      markedForReview: false,
    };
    setQuestionStates({
      ...questionStates,
      [currentQuestion]: {
        ...current,
        markedForReview: !current.markedForReview,
      },
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = async () => {
    const answers: QuizAnswer[] = [];
    for (let i = 0; i < quiz.length; i++) {
      const state = questionStates[i];
      if (state?.answered && state.selectedOption !== null) {
        answers.push({
          questionIndex: i,
          selectedOptionIndex: state.selectedOption,
        });
      }
    }

    setSubmitting(true);
    await onSubmit(answers);
    setSubmitting(false);
  };

  const getAnsweredCount = () => {
    return Object.values(questionStates).filter((s) => s.answered).length;
  };

  const getReviewCount = () => {
    return Object.values(questionStates).filter((s) => s.markedForReview).length;
  };

  const currentQuestionState = questionStates[currentQuestion] || {
    answered: false,
    selectedOption: null,
    markedForReview: false,
  };

  const question = quiz[currentQuestion];
  const answeredCount = getAnsweredCount();
  const reviewCount = getReviewCount();
  const progress = (answeredCount / quiz.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Lesson
              </Button>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lessonTitle} - Quiz
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Question {currentQuestion + 1} of {quiz.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {answeredCount}/{quiz.length} Answered
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {reviewCount} Marked for Review
                </p>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {currentQuestion + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {question.question}
                      </h2>
                    </div>
                  </div>
                  <Button
                    variant={currentQuestionState.markedForReview ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleToggleReview}
                    className="flex items-center gap-2 flex-shrink-0 ml-2"
                  >
                    <Flag className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {currentQuestionState.markedForReview ? 'Marked' : 'Mark for Review'}
                    </span>
                  </Button>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        currentQuestionState.selectedOption === index
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            currentQuestionState.selectedOption === index
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {currentQuestionState.selectedOption === index && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {typeof option === 'string' ? option : option}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {currentQuestion === quiz.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className={BUTTON_STYLES.gradient}
                    >
                      {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Question Navigator
              </h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {quiz.map((_, index) => {
                  const state = questionStates[index];
                  const isAnswered = state?.answered;
                  const isMarked = state?.markedForReview;
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={index}
                      onClick={() => handleJumpToQuestion(index)}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all relative
                        ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                        ${
                          isAnswered
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-500'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                        }
                        ${!isCurrent && 'hover:scale-105'}
                      `}
                    >
                      {index + 1}
                      {isMarked && (
                        <Flag className="h-3 w-3 absolute -top-1 -right-1 text-orange-500 fill-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Answered</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"></div>
                  <span className="text-gray-600 dark:text-gray-400">Not Answered</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Flag className="h-4 w-4 text-orange-500 fill-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400">Marked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
