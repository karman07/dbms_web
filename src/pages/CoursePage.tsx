import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
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
  Lock,
  ChevronLeft,
  Award,
  StickyNote,
  FileDown,
  ClipboardList,
  Zap,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import courseService, { Course, Section, Lesson, CourseProgress, QuizSubmissionResponse, QuizAnswer } from '@/services/course.service';
import { useNotification } from '@/contexts/NotificationContext';
import { BUTTON_STYLES } from '@/constants';
import { EnrollmentDialog } from '@/components/EnrollmentDialog';
import { NotesDrawer } from '@/components/NotesDrawer';
import { CourseOverview } from '@/components/course/CourseOverview';
import { LessonContent } from '@/components/course/LessonContent';
import { LessonResources } from '@/components/course/LessonResources';
import { LessonQuizzes } from '@/components/course/LessonQuizzes';
import { LessonAssignments } from '@/components/course/LessonAssignments';
import { LessonActivities } from '@/components/course/LessonActivities';
import CourseMarkdownRenderer from '@/components/CourseMarkdownRenderer';

type ViewMode = 'overview' | 'lesson' | 'quiz' | 'results';
type LessonTab = 'media' | 'video' | 'content' | 'docs' | 'resources' | 'quizzes' | 'assignments' | 'activities';

interface QuizRecord {
  lessonId: string;
  sectionId: string;
  score: number;
  passed: boolean;
  attempts: number;
  lastAttempt: string;
  answers: QuizAnswer[];
}

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
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<{ sectionIdx: number, lessonIdx: number } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResults, setQuizResults] = useState<QuizSubmissionResponse | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LessonTab>('content');
  const [selectedDocIndex, _] = useState<number>(0);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<number>(0);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<number>(0);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number>(0);

  // Quiz records in local storage
  const [quizRecords, setQuizRecords] = useState<Record<string, QuizRecord>>({});

  useEffect(() => {
    loadCourseData();
    loadQuizRecords();
  }, []);

  const loadQuizRecords = () => {
    const stored = localStorage.getItem('quizRecords');
    if (stored) {
      try {
        setQuizRecords(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse quiz records:', error);
      }
    }
  };

  const saveQuizRecord = (lessonId: string, sectionId: string, result: QuizSubmissionResponse, answers: QuizAnswer[]) => {
    const key = `${sectionId}_${lessonId}`;
    const existing = quizRecords[key];

    const newRecord: QuizRecord = {
      lessonId,
      sectionId,
      score: result.score,
      passed: result.passed,
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttempt: new Date().toISOString(),
      answers,
    };

    const updated = { ...quizRecords, [key]: newRecord };
    setQuizRecords(updated);
    localStorage.setItem('quizRecords', JSON.stringify(updated));
  };

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
      setShowEnrollDialog(false);
      notification.success('Enrolled!', 'You have successfully enrolled in the course');
    } catch (error: any) {
      notification.error('Enrollment failed', error.message || 'Please try again');
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonSelect = (section: Section, lesson: Lesson, sectionIdx?: number, lessonIdx?: number, openQuiz = false) => {
    if (!enrolled) {
      setShowEnrollDialog(true);
      return;
    }

    setSelectedSection(section);
    setSelectedLesson(lesson);
    setViewMode('lesson');
    // Set default tab - media if exists, then video, otherwise content
    const defaultTab = lesson.media && lesson.media.length > 0 ? 'media' : lesson.videoUrl ? 'video' : 'content';
    setActiveTab(defaultTab);
    // Reset media index to show first item
    setSelectedMediaIndex(0);

    if (!openQuiz) {
      setShowQuizDialog(false);
      setQuizResults(null);
    } else {
      // Opening quiz - reset quiz state
      setShowQuizDialog(true);
      setQuizAnswers({});
      setQuizResults(null);
    }

    if (sectionIdx === undefined || lessonIdx === undefined) {
      const secIdx = course?.sections.findIndex(s => s._id === section._id) ?? -1;
      const lesIdx = section.lessons.findIndex(l => l._id === lesson._id) ?? -1;
      setCurrentLessonIndex({ sectionIdx: secIdx, lessonIdx: lesIdx });
    } else {
      setCurrentLessonIndex({ sectionIdx, lessonIdx });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get available tabs for the current lesson
  const getAvailableTabs = (lesson: Lesson): LessonTab[] => {
    const tabs: LessonTab[] = [];
    if (lesson.media && lesson.media.length > 0) tabs.push('media');
    if (lesson.videoUrl) tabs.push('video');
    if (lesson.docSubtopics && lesson.docSubtopics.length > 0) tabs.push('docs');
    if (lesson.resources && lesson.resources.length > 0) tabs.push('resources');
    if ((lesson.quiz && lesson.quiz.length > 0) || (lesson.linkedQuizzes && lesson.linkedQuizzes.length > 0)) tabs.push('quizzes');
    if (lesson.linkedAssignments && lesson.linkedAssignments.length > 0) tabs.push('assignments');
    if (lesson.linkedActivities && lesson.linkedActivities.length > 0) tabs.push('activities');
    // Only add content if there are no other tabs
    if (tabs.length === 0) tabs.push('content');
    return tabs;
  };

  // Get next tab in current lesson
  const getNextTab = (): LessonTab | null => {
    if (!selectedLesson) return null;
    const availableTabs = getAvailableTabs(selectedLesson);
    const currentIndex = availableTabs.indexOf(activeTab);

    // Check if we're on media tab and there are more media items
    if (activeTab === 'media' && selectedLesson.media && selectedMediaIndex < selectedLesson.media.length - 1) {
      return null;
    }

    // Check if we're on quizzes tab and there are more quizzes
    const totalQuizzes = ((selectedLesson.quiz?.length || 0) > 0 ? 1 : 0) + (selectedLesson.linkedQuizzes?.length || 0);
    if (activeTab === 'quizzes' && selectedQuizIndex < totalQuizzes - 1) {
      return null;
    }

    // Check if we're on assignments tab and there are more assignments
    if (activeTab === 'assignments' && selectedLesson.linkedAssignments && selectedAssignmentIndex < selectedLesson.linkedAssignments.length - 1) {
      return null;
    }

    // Check if we're on activities tab and there are more activities
    if (activeTab === 'activities' && selectedLesson.linkedActivities && selectedActivityIndex < selectedLesson.linkedActivities.length - 1) {
      return null;
    }

    if (currentIndex < availableTabs.length - 1) {
      return availableTabs[currentIndex + 1];
    }
    return null;
  };

  // Get previous tab in current lesson
  const getPreviousTab = (): LessonTab | null => {
    if (!selectedLesson) return null;
    const availableTabs = getAvailableTabs(selectedLesson);
    const currentIndex = availableTabs.indexOf(activeTab);

    // Check if we're on media tab and there are previous media items
    if (activeTab === 'media' && selectedMediaIndex > 0) {
      return null;
    }

    // Check if we're on quizzes tab and there are previous quizzes
    if (activeTab === 'quizzes' && selectedQuizIndex > 0) {
      return null;
    }

    // Check if we're on assignments tab and there are previous assignments
    if (activeTab === 'assignments' && selectedAssignmentIndex > 0) {
      return null;
    }

    // Check if we're on activities tab and there are previous activities
    if (activeTab === 'activities' && selectedActivityIndex > 0) {
      return null;
    }

    if (currentIndex > 0) {
      return availableTabs[currentIndex - 1];
    }
    return null;
  };

  const handleNextLesson = () => {
    if (!course || !currentLessonIndex) return;

    // If on media tab, navigate to next media item first
    if (activeTab === 'media' && selectedLesson?.media && selectedMediaIndex < selectedLesson.media.length - 1) {
      setSelectedMediaIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If on quizzes tab, navigate to next quiz first
    const totalQuizzes = ((selectedLesson?.quiz?.length || 0) > 0 ? 1 : 0) + (selectedLesson?.linkedQuizzes?.length || 0);
    if (activeTab === 'quizzes' && selectedQuizIndex < totalQuizzes - 1) {
      setSelectedQuizIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If on assignments tab, navigate to next assignment first
    if (activeTab === 'assignments' && selectedLesson?.linkedAssignments && selectedAssignmentIndex < selectedLesson.linkedAssignments.length - 1) {
      setSelectedAssignmentIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If on activities tab, navigate to next activity first
    if (activeTab === 'activities' && selectedLesson?.linkedActivities && selectedActivityIndex < selectedLesson.linkedActivities.length - 1) {
      setSelectedActivityIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Try to navigate to next tab within current lesson
    const nextTab = getNextTab();
    if (nextTab) {
      setActiveTab(nextTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If no next tab, navigate to next lesson
    const { sectionIdx, lessonIdx } = currentLessonIndex;
    const currentSection = course.sections[sectionIdx];

    if (lessonIdx < currentSection.lessons.length - 1) {
      const nextLesson = currentSection.lessons[lessonIdx + 1];
      handleLessonSelect(currentSection, nextLesson, sectionIdx, lessonIdx + 1);
    } else if (sectionIdx < course.sections.length - 1) {
      const nextSection = course.sections[sectionIdx + 1];
      if (nextSection.lessons.length > 0) {
        handleLessonSelect(nextSection, nextSection.lessons[0], sectionIdx + 1, 0);
      }
    }
  };

  const handlePreviousLesson = () => {
    if (!course || !currentLessonIndex) return;

    // If on media tab, navigate to previous media item first
    if (activeTab === 'media' && selectedMediaIndex > 0) {
      setSelectedMediaIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If on quizzes tab, navigate to previous quiz first
    if (activeTab === 'quizzes' && selectedQuizIndex > 0) {
      setSelectedQuizIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If on assignments tab, navigate to previous assignment first
    if (activeTab === 'assignments' && selectedAssignmentIndex > 0) {
      setSelectedAssignmentIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If on activities tab, navigate to previous activity first
    if (activeTab === 'activities' && selectedActivityIndex > 0) {
      setSelectedActivityIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Try to navigate to previous tab within current lesson
    const prevTab = getPreviousTab();
    if (prevTab) {
      setActiveTab(prevTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If no previous tab, navigate to previous lesson
    const { sectionIdx, lessonIdx } = currentLessonIndex;

    if (lessonIdx > 0) {
      const currentSection = course.sections[sectionIdx];
      const prevLesson = currentSection.lessons[lessonIdx - 1];
      handleLessonSelect(currentSection, prevLesson, sectionIdx, lessonIdx - 1);
    } else if (sectionIdx > 0) {
      const prevSection = course.sections[sectionIdx - 1];
      if (prevSection.lessons.length > 0) {
        const lastLessonIdx = prevSection.lessons.length - 1;
        handleLessonSelect(prevSection, prevSection.lessons[lastLessonIdx], sectionIdx - 1, lastLessonIdx);
      }
    }
  };

  const hasNextLesson = () => {
    if (!course || !currentLessonIndex || !enrolled) return false;

    // Check if there's a next media item
    if (activeTab === 'media' && selectedLesson?.media && selectedMediaIndex < selectedLesson.media.length - 1) {
      return true;
    }

    // Check if there's a next quiz
    const totalQuizzes = ((selectedLesson?.quiz?.length || 0) > 0 ? 1 : 0) + (selectedLesson?.linkedQuizzes?.length || 0);
    if (activeTab === 'quizzes' && selectedQuizIndex < totalQuizzes - 1) {
      return true;
    }

    // Check if there's a next assignment
    if (activeTab === 'assignments' && selectedLesson?.linkedAssignments && selectedAssignmentIndex < selectedLesson.linkedAssignments.length - 1) {
      return true;
    }

    // Check if there's a next activity
    if (activeTab === 'activities' && selectedLesson?.linkedActivities && selectedActivityIndex < selectedLesson.linkedActivities.length - 1) {
      return true;
    }

    // Check if there's a next tab in current lesson
    if (getNextTab()) return true;

    // Check if there's a next lesson
    const { sectionIdx, lessonIdx } = currentLessonIndex;
    const currentSection = course.sections[sectionIdx];
    return lessonIdx < currentSection.lessons.length - 1 || sectionIdx < course.sections.length - 1;
  };

  const hasPreviousLesson = () => {
    if (!currentLessonIndex || !enrolled) return false;

    // Check if there's a previous media item
    if (activeTab === 'media' && selectedMediaIndex > 0) {
      return true;
    }

    // Check if there's a previous quiz
    if (activeTab === 'quizzes' && selectedQuizIndex > 0) {
      return true;
    }

    // Check if there's a previous assignment
    if (activeTab === 'assignments' && selectedAssignmentIndex > 0) {
      return true;
    }

    // Check if there's a previous activity
    if (activeTab === 'activities' && selectedActivityIndex > 0) {
      return true;
    }

    // Check if there's a previous tab in current lesson
    if (getPreviousTab()) return true;

    // Check if there's a previous lesson
    const { sectionIdx, lessonIdx } = currentLessonIndex;
    return lessonIdx > 0 || sectionIdx > 0;
  };

  const handleStartQuiz = () => {
    if (selectedLesson && selectedLesson.quiz && selectedLesson.quiz.length > 0) {
      setShowQuizDialog(true);
      setQuizAnswers({});
      setQuizResults(null);
    }
  };

  const handleQuizSubmit = async (answers?: Record<number, number>) => {
    if (!selectedSection || !selectedLesson || !enrolled) {
      notification.error('Not enrolled', 'Please enroll in the course first');
      return;
    }

    try {
      setSubmittingQuiz(true);
      const answersToSubmit = answers || quizAnswers;
      const answersArray: QuizAnswer[] = Object.entries(answersToSubmit).map(([qIdx, oIdx]) => ({
        questionIndex: parseInt(qIdx),
        selectedOptionIndex: oIdx,
      }));

      const results = await courseService.submitQuiz(
        selectedSection._id,
        selectedLesson._id,
        answersArray
      );

      setQuizResults(results);
      saveQuizRecord(selectedLesson._id, selectedSection._id, results, answersArray);

      // Check if all quizzes are attempted
      const totalQuizzes = ((selectedLesson.quiz?.length || 0) > 0 ? 1 : 0) + (selectedLesson.linkedQuizzes?.length || 0);
      const attemptedQuizzes = Object.keys(quizRecords).filter(key => key.startsWith(`${selectedSection._id}_${selectedLesson._id}`)).length + 1;

      // Only mark progress if all quizzes are attempted
      if (attemptedQuizzes >= totalQuizzes) {
        try {
          const timeSpent = Math.floor((Date.now() - startTime) / 60000);
          await courseService.updateProgress(
            selectedSection._id,
            selectedLesson._id,
            true,
            timeSpent
          );
          await loadCourseData();

          if (results.passed) {
            notification.success('Quiz Passed!', 'All quizzes completed - Lesson marked as complete');
          } else {
            notification.info('Quiz Completed', 'All quizzes completed - Lesson marked as complete');
          }
        } catch (progressError: any) {
          console.error('Failed to update progress:', progressError);
          if (results.passed) {
            notification.success('Quiz Passed!', 'Progress update pending');
          } else {
            notification.info('Quiz Completed', 'Progress update pending');
          }
        }
      } else {
        if (results.passed) {
          notification.success('Quiz Passed!', `Complete ${totalQuizzes - attemptedQuizzes} more quiz(es) to mark lesson complete`);
        } else {
          notification.info('Quiz Completed', `Complete ${totalQuizzes - attemptedQuizzes} more quiz(es) to mark lesson complete`);
        }
      }
    } catch (error: any) {
      notification.error('Quiz submission failed', error.message || 'Please try again');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Auto track video completion
  useEffect(() => {
    if (!videoRef.current || !selectedSection || !selectedLesson || !enrolled) return;

    const handleMessage = async (event: MessageEvent) => {
      // Listen for YouTube player events
      if (event.data && typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);

          // YouTube sends state changes - 0 means video ended
          if (data.event === 'onStateChange' && data.info === 0) {
            // Video completed - auto mark as complete
            const timeSpent = Math.floor((Date.now() - startTime) / 60000);
            await courseService.updateProgress(
              selectedSection._id,
              selectedLesson._id,
              true,
              timeSpent
            );
            await loadCourseData();
            notification.success('Progress saved', 'Lesson completed automatically');
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [selectedSection, selectedLesson, enrolled, startTime]);

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
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([\w-]+)/,
      /(?:youtu\.be\/)([\w-]+)/,
      /(?:youtube\.com\/embed\/)([\w-]+)/,
      /(?:youtube\.com\/v\/)([\w-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&origin=${window.location.origin}`;
      }
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-slate-500 font-bold animate-pulse">Initializing Workspace...</p>
        </div>
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
      <aside className={`fixed top-0 left-0 h-screen w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative flex flex-col border-r border-gray-200 dark:border-gray-700`}>
        {/* Drawer Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">{course.title}</h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1 italic">
                {course.sections.length} modules • {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} Units
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        {enrolled && progress && (
          <div className="flex-shrink-0 px-5 py-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-blue-50/50 via-slate-50/50 to-white dark:from-blue-900/10 dark:via-gray-800/10 dark:to-gray-900/10">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-black text-slate-700 dark:text-gray-200 uppercase tracking-widest">Mastery Progress</span>
              </div>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 tabular-nums">{Math.round(progress.overallProgress)}%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-white/50 dark:border-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.overallProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_0_12px_rgba(37,99,235,0.4)] rounded-full"
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 mt-3 flex items-center gap-1.5 uppercase letter-spacing-wide">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              {progress.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.completed).length, 0)} / {' '}
              {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} units mastered
            </p>
          </div>
        )}

        {/* Sections List */}
        <div className="flex-shrink-0 px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Course Content
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            {course.sections.map((section, idx) => {
              const sectionProgress = getSectionProgress(section._id);
              const isExpanded = expandedSections.has(section._id);

              return (
                <div key={section._id} className={`border rounded-xl overflow-hidden transition-all ${isExpanded
                  ? 'border-blue-300 dark:border-blue-700 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                  }`}>
                  <button
                    onClick={() => toggleSection(section._id)}
                    className={`w-full flex items-center justify-between p-4 transition-all duration-300 ${isExpanded
                      ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20'
                      : 'bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl shadow-sm flex items-center justify-center font-black text-xs transition-all duration-500 ${enrolled
                        ? isExpanded
                          ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/40'
                          : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400'
                        : 'bg-slate-200 dark:bg-gray-800 text-slate-400'
                        }`}>
                        {enrolled ? idx + 1 : <Lock className="h-3.5 w-3.5" />}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className={`font-black text-sm truncate tracking-tight transition-colors ${isExpanded
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-800 dark:text-gray-200'
                          }`}>
                          {section.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide">
                            {section.lessons.length} Units
                          </p>
                          {enrolled && sectionProgress === 100 && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">
                              <CheckCircle className="h-2.5 w-2.5" />
                              Mastered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                          {section.lessons.map((lesson, lessonIdx) => {
                            const lessonProgress = getLessonProgress(section._id, lesson._id);
                            const isCompleted = lessonProgress?.completed || false;
                            const isActive = selectedLesson?._id === lesson._id;
                            const hasResources = lesson.resources && lesson.resources.length > 0;
                            const hasAssignments = lesson.linkedAssignments && lesson.linkedAssignments.length > 0;
                            const hasActivities = lesson.linkedActivities && lesson.linkedActivities.length > 0;
                            const hasLinkedQuizzes = lesson.linkedQuizzes && lesson.linkedQuizzes.length > 0;
                            const hasMedia = lesson.media && lesson.media.length > 0;

                            return (
                              <div key={lesson._id}>
                                <button
                                  onClick={() => {
                                    handleLessonSelect(section, lesson, idx, lessonIdx);
                                    setSidebarOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-4 p-4 pl-6 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-all border-l-4 ${isActive
                                    ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-600'
                                    : 'border-transparent'
                                    }`}
                                >
                                  {isCompleted ? (
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                      <CheckCircle className="h-2.5 w-2.5 text-white" />
                                    </div>
                                  ) : (
                                    <Circle className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-300 dark:text-gray-600'}`} />
                                  )}
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {lessonIdx + 1}. {lesson.title}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {lesson.estimatedMinutes}m
                                      </span>
                                      {lesson.videoUrl && (
                                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                          <PlayCircle className="h-3 w-3" />
                                        </span>
                                      )}
                                      {hasResources && (
                                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                          <FileDown className="h-3 w-3" />
                                          {lesson.resources?.length || 0}
                                        </span>
                                      )}
                                      {hasAssignments && (
                                        <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                          <ClipboardList className="h-3 w-3" />
                                          {lesson.linkedAssignments?.length || 0}
                                        </span>
                                      )}
                                      {hasActivities && (
                                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                          <Zap className="h-3 w-3" />
                                          {lesson.linkedActivities?.length || 0}
                                        </span>
                                      )}
                                      {hasLinkedQuizzes && (
                                        <span className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
                                          <Trophy className="h-3 w-3" />
                                          {lesson.linkedQuizzes?.length || 0}
                                        </span>
                                      )}
                                      {hasMedia && (
                                        <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                                          <PlayCircle className="h-3 w-3" />
                                          {lesson.media?.length || 0}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </div>
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
              <Button
                onClick={() => setNotesOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <StickyNote className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Progress Bar on Top */}
        {enrolled && progress && viewMode === 'lesson' && (
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 py-3">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Course Progress</span>
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(progress.overallProgress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 rounded-full"
                  style={{ width: `${progress.overallProgress}%` }}
                />
              </div>
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
                >
                  <CourseOverview
                    course={course}
                    progress={progress}
                    enrolled={enrolled}
                    onEnroll={handleEnroll}
                    enrolling={enrolling}
                    getSectionProgress={getSectionProgress}
                  />
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
                  {/* Component-based Content Rendering based on activeTab */}
                  {activeTab === 'video' && selectedLesson.videoUrl && (
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

                  {activeTab === 'content' && <LessonContent lesson={selectedLesson} />}

                  {/* Docs Tab */}
                  {activeTab === 'docs' && selectedLesson.docSubtopics && selectedLesson.docSubtopics.length > 0 && selectedLesson.docSubtopics[selectedDocIndex] && (
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLesson.docSubtopics[selectedDocIndex].name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {selectedLesson.docSubtopics[selectedDocIndex].filename}
                          </p>
                        </div>
                        <div className="p-6">
                          <CourseMarkdownRenderer content={selectedLesson.docSubtopics[selectedDocIndex].content} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'resources' && <LessonResources lesson={selectedLesson} />}

                  {activeTab === 'quizzes' && (
                    <LessonQuizzes
                      lesson={selectedLesson}
                      enrolled={enrolled}
                      onStartQuiz={handleStartQuiz}
                      onSubmitQuiz={handleQuizSubmit}
                      sectionId={selectedSection._id}
                      onProgressUpdate={loadCourseData}
                      selectedQuizIndex={selectedQuizIndex}
                      onQuizIndexChange={setSelectedQuizIndex}
                    />
                  )}

                  {activeTab === 'assignments' && <LessonAssignments lesson={selectedLesson} selectedIndex={selectedAssignmentIndex} onIndexChange={setSelectedAssignmentIndex} />}

                  {activeTab === 'activities' && <LessonActivities lesson={selectedLesson} selectedIndex={selectedActivityIndex} onIndexChange={setSelectedActivityIndex} />}

                  {/* Media Tab */}
                  {activeTab === 'media' && selectedLesson.media && selectedLesson.media.length > 0 && (
                    <div className="space-y-6">
                      {/* Selected Media Content */}
                      {selectedLesson.media[selectedMediaIndex] && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {selectedLesson.media[selectedMediaIndex].title}
                                </h3>
                                {selectedLesson.media[selectedMediaIndex].description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedLesson.media[selectedMediaIndex].description}
                                  </p>
                                )}
                              </div>
                              {selectedLesson.media.length > 1 && (
                                <span className="flex-shrink-0 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                  {selectedMediaIndex + 1} / {selectedLesson.media.length}
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedLesson.media[selectedMediaIndex].url && (
                            <div className="aspect-video bg-black">
                              <iframe
                                src={getYouTubeEmbedUrl(selectedLesson.media[selectedMediaIndex].url)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-6">
                    {hasPreviousLesson() ? (
                      <Button
                        onClick={handlePreviousLesson}
                        variant="outline"
                        className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    {hasNextLesson() && (
                      <Button
                        onClick={handleNextLesson}
                        className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="flex-1">
                {selectedLesson?.title} - Quiz
              </DialogTitle>
              <button
                onClick={() => setShowQuizDialog(false)}
                className="flex-shrink-0 rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          {selectedLesson && selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              {!quizResults ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      Test Your Knowledge
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedLesson.quiz.length} questions
                    </p>
                  </div>

                  {selectedLesson.quiz.map((question, qIdx) => (
                    <div key={qIdx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500 text-white font-bold text-sm flex-shrink-0">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                          {question.question}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {question.options && question.options.length > 0 ? question.options.map((option, oIdx) => {
                          const optionText = typeof option === 'string' ? option : (option as { text: string }).text;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${quizAnswers[qIdx] === oIdx
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${quizAnswers[qIdx] === oIdx
                                  ? 'border-blue-500 bg-blue-500'
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
                        }) : (
                          <p className="text-sm text-red-500">No options available for this question</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-3 pt-3">
                    <Button
                      onClick={() => setShowQuizDialog(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleQuizSubmit()}
                      disabled={Object.keys(quizAnswers).length !== selectedLesson.quiz.length || submittingQuiz}
                      className={BUTTON_STYLES.gradient}
                    >
                      {submittingQuiz ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Quiz'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-5 rounded-lg border-2 ${quizResults.passed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                    }`}>
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Pie Chart */}
                      <div className="flex-shrink-0">
                        <div className="relative w-28 h-28">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              className="text-gray-200 dark:text-gray-700"
                              stroke="currentColor"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={quizResults.passed ? '#22c55e' : '#f97316'}
                              strokeWidth="10"
                              strokeDasharray={`${(quizResults.score / 100) * 251.2} 251.2`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-bold ${quizResults.passed ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                              }`}>
                              {quizResults.score}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Results Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                          {quizResults.passed ? (
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          )}
                          <h3 className={`text-xl font-bold ${quizResults.passed ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'
                            }`}>
                            {quizResults.passed ? 'Quiz Passed! 🎉' : 'Keep Trying! 💪'}
                          </h3>
                        </div>
                        <p className={`text-sm mb-2 ${quizResults.passed ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
                          }`}>
                          {quizResults.correctAnswers}/{quizResults.totalQuestions} correct
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quizResults.passed ? 'Great work!' : 'Review and try again.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        setQuizResults(null);
                        setQuizAnswers({});
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Trophy className="h-4 w-4" />
                      Retry
                    </Button>
                    <Button
                      onClick={() => setShowQuizDialog(false)}
                      className={BUTTON_STYLES.gradient}
                    >
                      Continue Learning
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EnrollmentDialog
        isOpen={showEnrollDialog}
        onClose={() => setShowEnrollDialog(false)}
        onEnroll={handleEnroll}
        enrolling={enrolling}
        courseTitle={course.title}
      />

      <NotesDrawer
        isOpen={notesOpen}
        onClose={() => setNotesOpen(false)}
        screen={selectedLesson?._id || 'course'}
      />
    </div>
  );
};

export default CoursePage;
