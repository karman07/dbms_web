import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle, Clock, Loader2, BookOpen, Search, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import quizService, { Quiz } from "@/services/quiz.service";
import courseService from "@/services/course.service";
import { useNotification } from "@/contexts/NotificationContext";


const QuizzesPage = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lessonMap, setLessonMap] = useState<Record<string, string>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<{score: number, total: number, correct: number} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const quizzesData = await quizService.getAllQuizzes();
      
      // Get unique lesson IDs from quizzes
      const lessonIds = [...new Set(quizzesData.filter(q => q.lessonId).map(q => q.lessonId!))];
      
      // Fetch lesson details for each ID
      const lessonTitleMap: Record<string, string> = {};
      await Promise.all(
        lessonIds.map(async (lessonId) => {
          try {
            const lesson = await courseService.getLessonById(lessonId);
            lessonTitleMap[lessonId] = lesson.title;
          } catch (error) {
            console.error(`Failed to fetch lesson ${lessonId}:`, error);
          }
        })
      );
      
      setLessonMap(lessonTitleMap);
      setQuizzes(quizzesData);
    } catch (error: any) {
      notification.error('Failed to load quizzes', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return quizzes;
    
    const query = searchQuery.toLowerCase();
    return quizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(query) ||
      quiz.description.toLowerCase().includes(query)
    );
  }, [quizzes, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleQuizSubmit = () => {
    if (!selectedQuiz) return;
    
    let correct = 0;
    selectedQuiz.questions.forEach((question, index) => {
      const selectedOption = quizAnswers[index];
      if (selectedOption !== undefined && question.options[selectedOption]?.isCorrect) {
        correct++;
      }
    });
    
    const total = selectedQuiz.questions.length;
    const score = Math.round((correct / total) * 100);
    
    setQuizResults({ score, total, correct });
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
    setQuizResults(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedQuiz(null);
              resetQuiz();
            }}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-600 rounded-lg">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {selectedQuiz.title}
                    </h1>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {selectedQuiz.description}
                  </p>
                  {selectedQuiz.lessonId && lessonMap[selectedQuiz.lessonId] && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                        <BookOpen className="h-4 w-4" />
                        {lessonMap[selectedQuiz.lessonId]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <HelpCircle className="h-4 w-4" />
                  <span>{selectedQuiz.questions.length} questions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Created: {formatDate(selectedQuiz.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {!showResults ? (
                <div className="space-y-6">
                  {selectedQuiz.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-sm flex-shrink-0">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                          {question.question}
                        </h4>
                      </div>

                      <div className="space-y-3 ml-11">
                        {question.options.map((option, oIndex) => (
                          <button
                            key={oIndex}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              quizAnswers[qIndex] === oIndex
                                ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                quizAnswers[qIndex] === oIndex
                                  ? 'border-teal-600 bg-teal-600'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {quizAnswers[qIndex] === oIndex && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-6">
                    <Button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length !== selectedQuiz.questions.length}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Submit Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                    quizResults && quizResults.score >= 70 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <span className={`text-3xl font-bold ${
                      quizResults && quizResults.score >= 70 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {quizResults?.score}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {quizResults && quizResults.score >= 70 ? 'Great Job!' : 'Keep Practicing!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You got {quizResults?.correct} out of {quizResults?.total} questions correct
                  </p>
                  <Button onClick={resetQuiz} className="bg-teal-600 hover:bg-teal-700 text-white">
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-600 rounded-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Found {filteredQuizzes.length} of {quizzes.length} quizzes
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <HelpCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredQuizzes.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Linked to Lessons</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredQuizzes.filter(q => q.lessonId).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredQuizzes.reduce((sum, q) => sum + q.questions.length, 0)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No quizzes found matching your search' : 'No quizzes available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => setSelectedQuiz(quiz)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg group-hover:bg-teal-600 transition-colors">
                      <HelpCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors" />
                    </div>
                    {quiz.lessonId && lessonMap[quiz.lessonId] && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                        {lessonMap[quiz.lessonId]}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {quiz.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <HelpCircle className="h-4 w-4" />
                      <span>{quiz.questions.length} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(quiz.createdAt)}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white">
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;