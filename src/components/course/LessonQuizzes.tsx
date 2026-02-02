import { useState } from 'react';
import { Trophy, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Lesson } from '@/services/course.service';
import { Button } from '@/components/ui/button';
import courseService from '@/services/course.service';
import { useNotification } from '@/contexts/NotificationContext';

interface LessonQuizzesProps {
  lesson: Lesson;
  enrolled: boolean;
  onStartQuiz: () => void;
  onSubmitQuiz?: (answers: Record<number, number>) => Promise<void>;
  sectionId?: string;
  onProgressUpdate?: () => void;
}

// Separate component for linked quizzes to properly use hooks
const LinkedQuizItem = ({ quiz, sectionId, lessonId, onProgressUpdate }: { quiz: any; sectionId?: string; lessonId?: string; onProgressUpdate?: () => void }) => {
  const [linkedQuizAnswers, setLinkedQuizAnswers] = useState<Record<number, number>>({});
  const [linkedSubmitting, setLinkedSubmitting] = useState(false);
  const [linkedResults, setLinkedResults] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const notification = useNotification();

  const handleLinkedSubmit = async () => {
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

      // Call progress API regardless of pass/fail
      if (sectionId && lessonId) {
        const timeSpent = 5; // Default time spent for linked quizzes
        await courseService.updateProgress(sectionId, lessonId, true, timeSpent);
        if (onProgressUpdate) {
          onProgressUpdate();
        }
        notification.success('Progress Updated', 'Quiz submitted and progress saved');
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
          {quiz.title}
        </h3>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
          {quiz.questions.length} Questions
        </span>
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
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        linkedQuizAnswers[qIdx] === oIdx
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          linkedQuizAnswers[qIdx] === oIdx
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
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            linkedResults.passed 
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

export const LessonQuizzes = ({ lesson, enrolled, onSubmitQuiz, sectionId, onProgressUpdate }: LessonQuizzesProps) => {
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  const hasMainQuiz = lesson.quiz && lesson.quiz.length > 0;
  const hasLinkedQuizzes = lesson.linkedQuizzes && lesson.linkedQuizzes.length > 0;

  if (!hasMainQuiz && !hasLinkedQuizzes) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No quizzes available for this lesson</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!onSubmitQuiz || !hasMainQuiz) return;
    
    try {
      setSubmitting(true);
      await onSubmitQuiz(quizAnswers);
      // Calculate results
      let correct = 0;
      lesson.quiz.forEach((q, idx) => {
        if (quizAnswers[idx] === q.correctAnswer) {
          correct++;
        }
      });
      const total = lesson.quiz.length;
      const score = (correct / total) * 100;
      setResults({ score, total, passed: score >= 70 });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Main Lesson Quiz */}
      {enrolled && hasMainQuiz && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Lesson Quiz
            </h3>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
              {lesson.quiz.length} Questions
            </span>
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
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              quizAnswers[qIdx] === oIdx
                                ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                quizAnswers[qIdx] === oIdx
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
                  onClick={handleSubmit}
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
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                results.passed 
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
              <Button onClick={resetQuiz} variant="outline">
                Retake Quiz
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Linked Quizzes */}
      {hasLinkedQuizzes && (
        <div className="space-y-6">
          {lesson.linkedQuizzes!.map((quiz) => (
            <LinkedQuizItem 
              key={quiz._id} 
              quiz={quiz} 
              sectionId={sectionId}
              lessonId={lesson._id}
              onProgressUpdate={onProgressUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonQuizzes;
