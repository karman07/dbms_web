import { useState, useEffect } from 'react';
import { Trophy, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Lesson } from '@/services/course.service';
import { Button } from '@/components/ui/button';
import courseService from '@/services/course.service';
import { useNotification } from '@/contexts/NotificationContext';

interface LessonQuizzesProps {
  lesson: Lesson;
  enrolled: boolean;
  onStartQuiz?: () => void;
  onSubmitQuiz?: (answers: Record<number, number>) => Promise<void>;
  sectionId?: string;
  onProgressUpdate?: () => void;
  selectedQuizIndex?: number;
  onQuizIndexChange?: (index: number) => void;
}

// Separate component for linked quizzes to properly use hooks
const LinkedQuizItem = ({ quiz, sectionId, lessonId, onProgressUpdate, title, totalQuizzes, currentIndex, enrolled, lesson }: {
  quiz: any;
  sectionId?: string;
  lessonId?: string;
  onProgressUpdate?: () => void;
  title: string;
  totalQuizzes: number;
  currentIndex: number;
  enrolled: boolean;
  lesson: Lesson;
}) => {
  const [linkedQuizAnswers, setLinkedQuizAnswers] = useState<Record<number, number>>({});
  const [linkedSubmitting, setLinkedSubmitting] = useState(false);
  const [linkedResults, setLinkedResults] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const notification = useNotification();

  // Reset state when quiz changes
  useEffect(() => {
    setLinkedQuizAnswers({});
    setLinkedResults(null);
  }, [lessonId, currentIndex]);

  console.log('lesson in linked quiz item:', lesson);
  const handleLinkedSubmit = async () => {
    if (!enrolled) {
      notification.error('Not enrolled', 'Please enroll in the course first');
      return;
    }

    try {
      setLinkedSubmitting(true);
      // Calculate results for linked quiz
      let correct = 0;
      quiz.questions.forEach((q: any, idx: number) => {
        const correctOptionIdx = q.options.findIndex((opt: any) => opt.isCorrect);
        if (linkedQuizAnswers[idx] === correctOptionIdx) {
          correct++;
        }
      });
      const total = quiz.questions.length;
      const score = (correct / total) * 100;
      setLinkedResults({ score, total, passed: score >= 70 });

      // Get quiz records from localStorage to check completion
      const stored = localStorage.getItem('quizRecords');
      let quizRecords: Record<string, any> = {};
      if (stored) {
        try {
          quizRecords = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse quiz records:', e);
        }
      }

      // Save this quiz record
      const key = `${sectionId}_${lessonId}_linked_${currentIndex}`;
      quizRecords[key] = {
        lessonId,
        sectionId,
        score,
        passed: score >= 70,
        attempts: (quizRecords[key]?.attempts || 0) + 1,
        lastAttempt: new Date().toISOString(),
      };
      localStorage.setItem('quizRecords', JSON.stringify(quizRecords));

      // Check if all quizzes are attempted
      const attemptedQuizzes = Object.keys(quizRecords).filter(k => k.startsWith(`${sectionId}_${lessonId}`)).length;

      // Only mark progress if all quizzes are attempted
      if (attemptedQuizzes >= totalQuizzes) {
        if (sectionId && lessonId) {
          try {
            const timeSpent = 5;
            await courseService.updateProgress(sectionId, lessonId, true, timeSpent);
            if (onProgressUpdate) {
              onProgressUpdate();
            }
            notification.success('All Quizzes Complete!', 'Lesson marked as complete');
          } catch (error: any) {
            console.error('Failed to update progress:', error);
            notification.warning('Quiz Submitted', 'Quiz completed but progress update failed');
          }
        }
      } else {
        notification.success('Quiz Submitted', `Complete ${totalQuizzes - attemptedQuizzes} more quiz(es) to mark lesson complete`);
      }
    } catch (error) {
      console.error('Failed to submit linked quiz:', error);
      notification.error('Submission failed', 'Could not save progress');
    } finally {
      setLinkedSubmitting(false);
    }
  };

  const resetLinkedQuiz = () => {
    setLinkedQuizAnswers({});
    setLinkedResults(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          {title}
        </h3>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
            {quiz.questions.length} Questions
          </span>
          {totalQuizzes > 1 && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
              {currentIndex + 1} / {totalQuizzes}
            </span>
          )}
        </div>
      </div>

      {!linkedResults ? (
        <div className="space-y-6">
          {quiz.questions.map((question: any, qIdx: number) => (
            <div key={qIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-bold text-sm flex-shrink-0">
                  {qIdx + 1}
                </span>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white flex-1 pt-1">
                  {question.question}
                </h4>
              </div>

              <div className="space-y-2 ml-11">
                {question.options && question.options.length > 0 ? (
                  question.options.map((option: any, oIdx: number) => (
                    <button
                      key={oIdx}
                      onClick={() => setLinkedQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${linkedQuizAnswers[qIdx] === oIdx
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${linkedQuizAnswers[qIdx] === oIdx
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}>
                          {linkedQuizAnswers[qIdx] === oIdx && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-red-500 dark:text-red-400">No options available</p>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleLinkedSubmit}
              disabled={Object.keys(linkedQuizAnswers).length !== quiz.questions.length || linkedSubmitting}
              className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
            >
              {linkedSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${linkedResults.passed
            ? 'bg-green-100 dark:bg-green-900/30'
            : 'bg-red-100 dark:bg-red-900/30'
            }`}>
            {linkedResults.passed ? (
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            )}
          </div>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {linkedResults.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h4>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            You scored {Math.round(linkedResults.score)}% ({Math.round((linkedResults.score / 100) * linkedResults.total)} / {linkedResults.total} correct)
          </p>
          <Button onClick={resetLinkedQuiz} variant="outline">
            Retake Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export const LessonQuizzes = ({ lesson, enrolled, onSubmitQuiz, sectionId, onProgressUpdate, selectedQuizIndex = 0 }: LessonQuizzesProps) => {
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  // Reset state when quiz changes
  useEffect(() => {
    setQuizAnswers({});
    setResults(null);
  }, [lesson._id, selectedQuizIndex]);

  const hasMainQuiz = lesson.quiz && lesson.quiz.length > 0;
  const hasLinkedQuizzes = lesson.linkedQuizzes && lesson.linkedQuizzes.length > 0;
  const allQuizzes = [
    ...(hasMainQuiz ? [{ type: 'main', data: lesson.quiz, title: 'Lesson Quiz' }] : []),
    ...(hasLinkedQuizzes ? lesson.linkedQuizzes!.map(q => ({ type: 'linked', data: q, title: q.title })) : [])
  ];

  if (allQuizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No quizzes available for this lesson</p>
      </div>
    );
  }

  const currentQuiz = allQuizzes[selectedQuizIndex];

  return (
    <div className="space-y-6">
      {/* Current Quiz Content */}
      {currentQuiz.type === 'main' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              {currentQuiz.title}
            </h3>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                {lesson.quiz.length} Questions
              </span>
              {allQuizzes.length > 1 && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                  {selectedQuizIndex + 1} / {allQuizzes.length}
                </span>
              )}
            </div>
          </div>

          {!results ? (
            <div className="space-y-6">
              {lesson.quiz.map((question, qIdx) => (
                <div key={qIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-bold text-sm flex-shrink-0">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white flex-1 pt-1">
                      {question.question}
                    </h4>
                  </div>

                  <div className="space-y-2 ml-11">
                    {question.options && question.options.length > 0 ? (
                      question.options.map((option, oIdx) => {
                        const optionText = typeof option === 'string' ? option : option.text;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${quizAnswers[qIdx] === oIdx
                              ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${quizAnswers[qIdx] === oIdx
                                ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {quizAnswers[qIdx] === oIdx && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{optionText}</span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-sm text-red-500 dark:text-red-400">No options available</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={async () => {
                    if (!onSubmitQuiz) return;
                    try {
                      setSubmitting(true);
                      await onSubmitQuiz(quizAnswers);
                      let correct = 0;
                      lesson.quiz.forEach((q, idx) => {
                        if (quizAnswers[idx] === q.correctAnswer) correct++;
                      });
                      const total = lesson.quiz.length;
                      const score = (correct / total) * 100;
                      setResults({ score, total, passed: score >= 70 });
                    } catch (error) {
                      console.error('Failed to submit quiz:', error);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={Object.keys(quizAnswers).length !== lesson.quiz.length || submitting}
                  className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${results.passed
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                {results.passed ? (
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                )}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {results.passed ? 'Congratulations!' : 'Keep Practicing!'}
              </h4>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                You scored {Math.round(results.score)}% ({Math.round((results.score / 100) * results.total)} / {results.total} correct)
              </p>
              <Button onClick={() => { setQuizAnswers({}); setResults(null); }} variant="outline">
                Retake Quiz
              </Button>
            </div>
          )}
        </div>
      ) : (
        <LinkedQuizItem
          quiz={currentQuiz.data}
          sectionId={sectionId}
          lessonId={lesson._id}
          onProgressUpdate={onProgressUpdate}
          title={currentQuiz.title}
          totalQuizzes={allQuizzes.length}
          currentIndex={selectedQuizIndex}
          enrolled={enrolled}
          lesson={lesson}
        />
      )}
    </div>
  );
};

export default LessonQuizzes;
