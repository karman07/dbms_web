import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  PlayCircle,
  Trophy,
  Loader2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  FileText,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import courseService, { Course, Section, Lesson, CourseProgress, QuizSubmissionResponse, QuizAnswer } from '@/services/course.service';
import { useNotification } from '@/contexts/NotificationContext';
import { GRADIENTS, BUTTON_STYLES } from '@/constants';
import CourseMarkdownRenderer from '@/components/CourseMarkdownRenderer';
import QuizComponent from '@/components/QuizComponent';

type ViewMode = 'overview' | 'lesson' | 'quiz' | 'results';

const CoursePage = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [startTime] = useState(Date.now());

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizResults, setQuizResults] = useState<QuizSubmissionResponse | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [showQuizInSidebar, setShowQuizInSidebar] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, []);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourse();
      setCourse(courseData);

      try {
        const progressData = await courseService.getMyProgress();
        setProgress(progressData);
        setEnrolled(true);
      } catch (error) {
        setEnrolled(false);
      }
    } catch (error: any) {
      notification.error('Failed to load course', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const result = await courseService.enrollInCourse();
      setProgress(result.progress);
      setEnrolled(true);
      notification.success('Enrolled!', 'You have successfully enrolled in the course');
    } catch (error: any) {
      notification.error('Enrollment failed', error.message || 'Please try again');
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonSelect = (section: Section, lesson: Lesson) => {
    setSelectedSection(section);
    setSelectedLesson(lesson);
    setViewMode('lesson');
    setQuizResults(null);
    setShowQuizInSidebar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuiz = () => {
    if (selectedLesson && selectedLesson.quiz.length > 0) {
      setShowQuizInSidebar(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuizSubmit = async (answers: QuizAnswer[]) => {
    if (!selectedSection || !selectedLesson) return;

    try {
      setSubmittingQuiz(true);
      const results = await courseService.submitQuiz(
        selectedSection._id,
        selectedLesson._id,
        answers
      );
      setQuizResults(results);

      if (results.passed) {
        await loadCourseData();
      }

      notification.success(
        results.passed ? 'Quiz Passed!' : 'Quiz Completed',
        results.passed
          ? `Great job! You scored ${results.score}%`
          : `You scored ${results.score}%. Try again!`
      );
    } catch (error: any) {
      notification.error('Quiz submission failed', error.message || 'Please try again');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedSection || !selectedLesson || !enrolled) return;

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 60000);
      await courseService.updateProgress(
        selectedSection._id,
        selectedLesson._id,
        true,
        timeSpent
      );
      await loadCourseData();
      notification.success('Progress saved', 'Lesson marked as complete');
    } catch (error: any) {
      notification.error('Failed to update progress', error.message || 'Please try again');
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getLessonProgress = (sectionId: string, lessonId: string) => {
    if (!progress) return null;
    const sectionProgress = progress.sections.find((s) => s.sectionId === sectionId);
    if (!sectionProgress) return null;
    return sectionProgress.lessons.find((l) => l.lessonId === lessonId);
  };

  const getSectionProgress = (sectionId: string) => {
    if (!progress) return 0;
    const sectionProgress = progress.sections.find((s) => s.sectionId === sectionId);
    if (!sectionProgress) return 0;
    const completed = sectionProgress.lessons.filter(l => l.completed).length;
    return (completed / sectionProgress.lessons.length) * 100;
  };

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Course not found</p>
          <Button onClick={() => navigate('/dashboard')} className={BUTTON_STYLES.gradient}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <aside className={`fixed top-0 left-0 h-screen w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:relative flex flex-col`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Content</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {course.sections.length} sections • {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        {enrolled && progress && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Progress</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(progress.overallProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress.overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Quiz in Sidebar */}
        {showQuizInSidebar && selectedLesson && selectedLesson.quiz.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Quiz Active
              </h3>
              <button
                onClick={() => setShowQuizInSidebar(false)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              {selectedLesson.quiz.length} questions • Scroll down to answer
            </p>
          </div>
        )}

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {course.sections.map((section, idx) => {
              const sectionProgress = getSectionProgress(section._id);
              
              return (
              <div key={section._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${enrolled ? GRADIENTS.gradientPrimary : 'bg-gray-400'} flex items-center justify-center text-white font-bold text-sm`}>
                      {enrolled ? idx + 1 : <Lock className="h-4 w-4" />}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {section.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {section.lessons.length} lessons
                      </p>
                      {enrolled && sectionProgress > 0 && (
                        <div className="mt-1.5">
                          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                              style={{ width: `${sectionProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {expandedSections.has(section._id) ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.has(section._id) && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        {section.lessons.map((lesson, lessonIdx) => {
                          const lessonProgress = getLessonProgress(section._id, lesson._id);
                          const isCompleted = lessonProgress?.completed || false;
                          const isActive = selectedLesson?._id === lesson._id;

                          return (
                            <button
                              key={lesson._id}
                              onClick={() => {
                                handleLessonSelect(section, lesson);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' : ''
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 text-left min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {lessonIdx + 1}. {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {lesson.estimatedMinutes}m
                                  </span>
                                  {lesson.videoUrl && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                      <PlayCircle className="h-3 w-3" />
                                      Video
                                    </span>
                                  )}
                                  {lesson.quiz.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                                      <Trophy className="h-3 w-3" />
                                      Quiz
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewMode === 'overview' ? navigate('/dashboard') : setViewMode('overview')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{viewMode === 'overview' ? 'Dashboard' : 'Overview'}</span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {!enrolled && (
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className={BUTTON_STYLES.gradient}
                  size="sm"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Progress Bar on Top */}
        {enrolled && progress && (
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 py-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{Math.round(progress.overallProgress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress.overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <h1 className={`text-4xl font-bold mb-4 ${GRADIENTS.gradientText}`}>
                  {course.title}
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                  {course.description}
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${GRADIENTS.gradientPrimary} flex items-center justify-center`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sections</p>
                      <p className="font-bold text-gray-900 dark:text-white text-xl">
                        {course.sections.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${GRADIENTS.gradientAccent} flex items-center justify-center`}>
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Lessons</p>
                      <p className="font-bold text-gray-900 dark:text-white text-xl">
                        {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enrolled</p>
                      <p className="font-bold text-gray-900 dark:text-white text-xl">
                        {course.enrolledCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'lesson' && selectedLesson && selectedSection && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {selectedLesson.videoUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="aspect-video">
                    <iframe
                      ref={videoRef}
                      src={getYouTubeEmbedUrl(selectedLesson.videoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedLesson.title}
                  </h2>
                  {enrolled && (
                    <Button onClick={handleMarkComplete} className={BUTTON_STYLES.gradient}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </div>

                <CourseMarkdownRenderer content={selectedLesson.content} />

                {selectedLesson.quiz.length > 0 && !showQuizInSidebar && (
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={handleStartQuiz} className={BUTTON_STYLES.gradient}>
                      <Trophy className="h-5 w-5 mr-2" />
                      Take Quiz ({selectedLesson.quiz.length} questions)
                    </Button>
                  </div>
                )}

                {showQuizInSidebar && selectedLesson.quiz.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <QuizComponent
                      quiz={selectedLesson.quiz}
                      onSubmit={handleQuizSubmit}
                      submitting={submittingQuiz}
                      results={quizResults}
                      onRetry={() => setQuizResults(null)}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursePage;
