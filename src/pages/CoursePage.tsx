import { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronLeft,
  Menu,
  X,
  Award,
  StickyNote,
  ClipboardList,
  Zap,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import courseService, {
  Course, Section, Lesson, CourseProgress,
  QuizSubmissionResponse, QuizAnswer,
} from '@/services/course.service';
import { useNotification } from '@/contexts/NotificationContext';
import { BUTTON_STYLES } from '@/constants';
import { EnrollmentDialog } from '@/components/EnrollmentDialog';
import { NotesDrawer } from '@/components/NotesDrawer';
import { CourseOverview } from '@/components/course/CourseOverview';
import { LessonResources } from '@/components/course/LessonResources';
import { LessonQuizzes } from '@/components/course/LessonQuizzes';
import { LessonAssignments } from '@/components/course/LessonAssignments';
import { LessonActivities } from '@/components/course/LessonActivities';
import CourseMarkdownRenderer from '@/components/CourseMarkdownRenderer';

type ViewMode = 'overview' | 'lesson';

interface QuizRecord {
  lessonId: string;
  sectionId: string;
  score: number;
  passed: boolean;
  attempts: number;
  lastAttempt: string;
  answers: QuizAnswer[];
}

// A single resolved step that will show in the sidebar and main panel
interface Step {
  type: string;    // 'media' | 'doc' | 'resource' | 'quiz' | 'assignment' | 'activity'
  id: string;      // specific item id
  label: string;   // display name
}

const STEP_ICONS: Record<string, React.ElementType> = {
  media:      PlayCircle,
  doc:        FileText,
  resource:   LinkIcon,
  quiz:       Trophy,
  assignment: ClipboardList,
  activity:   Zap,
};

const STEP_COLORS: Record<string, string> = {
  media:      'text-purple-500',
  doc:        'text-blue-500',
  resource:   'text-green-500',
  quiz:       'text-indigo-500',
  assignment: 'text-orange-500',
  activity:   'text-cyan-500',
};


const CoursePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [currentLessonIndex, setCurrentLessonIndex] = useState<{ sectionIdx: number; lessonIdx: number } | null>(null);

  // Step navigation within a lesson
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const [quizRecords, setQuizRecords] = useState<Record<string, QuizRecord>>({});

  useEffect(() => { loadCourseData(true); loadQuizRecords(); }, []);

  // Auto-open lesson when navigating from HomePage (location.state has sectionId + lessonId)
  const deepLinkState = location.state as { sectionId?: string; lessonId?: string } | null;
  const deepLinkHandledRef = useRef(false);

  const loadQuizRecords = () => {
    const stored = localStorage.getItem('quizRecords');
    if (stored) { try { setQuizRecords(JSON.parse(stored)); } catch { /**/ } }
  };

  const saveQuizRecord = (lessonId: string, sectionId: string, result: QuizSubmissionResponse, answers: QuizAnswer[]) => {
    const key = `${sectionId}_${lessonId}`;
    const existing = quizRecords[key];
    const newRecord: QuizRecord = {
      lessonId, sectionId, score: result.score, passed: result.passed,
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttempt: new Date().toISOString(), answers,
    };
    const updated = { ...quizRecords, [key]: newRecord };
    setQuizRecords(updated);
    localStorage.setItem('quizRecords', JSON.stringify(updated));
  };

  const loadCourseData = async (isInitial = false) => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourse();
      setCourse(courseData);
      try {
        const progressData = await courseService.getMyProgress();
        setProgress(progressData); setEnrolled(true);
        // On first load, attempt deep-link navigation (requires enrollment)
        if (isInitial) handleDeepLink(courseData);
      } catch {
        setEnrolled(false);
        // Not enrolled — show enrollment dialog if deep-linking
        if (isInitial && deepLinkState?.lessonId) setShowEnrollDialog(true);
      }
    } catch (error: any) {
      notification.error('Failed to load course', error.message || 'Please try again');
    } finally { setLoading(false); }
  };

  // After data loads, auto-open the lesson from deep-link state (e.g. navigated from HomePage)
  const handleDeepLink = useCallback((courseData: Course) => {
    if (!deepLinkState?.sectionId || !deepLinkState?.lessonId) return;
    if (deepLinkHandledRef.current) return;
    deepLinkHandledRef.current = true;

    const secIdx = courseData.sections.findIndex(s => s._id === deepLinkState.sectionId);
    if (secIdx === -1) return;
    const section = courseData.sections[secIdx];
    const lesIdx = section.lessons.findIndex(l => l._id === deepLinkState.lessonId);
    if (lesIdx === -1) return;

    setSelectedSection(section);
    setSelectedLesson(section.lessons[lesIdx]);
    setCurrentLessonIndex({ sectionIdx: secIdx, lessonIdx: lesIdx });
    setCurrentStepIndex(0);
    setViewMode('lesson');
    setExpandedSections(prev => new Set([...prev, section._id]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Clear state so back-navigation doesn't re-trigger
    window.history.replaceState({}, '', '/course');
  }, [deepLinkState]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const result = await courseService.enrollInCourse();
      setProgress(result.progress); setEnrolled(true); setShowEnrollDialog(false);
      notification.success('Enrolled!', 'You have successfully enrolled in the course');
    } catch (error: any) {
      notification.error('Enrollment failed', error.message || 'Please try again');
    } finally { setEnrolling(false); }
  };

  // ── Step resolution ───────────────────────────────────────────────────────

  /**
   * Build an ordered list of steps from a lesson's contentOrder.
   * Falls back to default ordering if no contentOrder is saved.
   */
  const resolveSteps = (lesson: Lesson): Step[] => {
    const saved = lesson.contentOrder;

    // Saved order: each entry = {type, id}
    if (saved && saved.length > 0 && typeof saved[0] === 'object') {
      return (saved as Array<{ type: string; id: string }>)
        .map(entry => {
          const label = resolveLabel(entry.type, entry.id, lesson);
          if (!label) return null; // item no longer exists in the lesson
          return { type: entry.type, id: entry.id, label };
        })
        .filter(Boolean) as Step[];
    }

    // Fallback: build from available content in default order
    const steps: Step[] = [];
    if (lesson.media) {
      for (const m of lesson.media) {
        steps.push({ type: 'media', id: m._id, label: m.title });
      }
    }
    if (lesson.docSubtopics) {
      for (const d of lesson.docSubtopics) {
        steps.push({ type: 'doc', id: d._id, label: d.name });
      }
    }
    if (lesson.resources) {
      for (const r of lesson.resources) {
        steps.push({ type: 'resource', id: r, label: r });
      }
    }
    if (lesson.linkedQuizzes) {
      for (const q of lesson.linkedQuizzes) {
        steps.push({ type: 'quiz', id: q._id, label: q.title });
      }
    }
    if (lesson.linkedAssignments) {
      for (const a of lesson.linkedAssignments) {
        steps.push({ type: 'assignment', id: a._id, label: a.title });
      }
    }
    if (lesson.linkedActivities) {
      for (const a of lesson.linkedActivities) {
        steps.push({ type: 'activity', id: a._id, label: a.title });
      }
    }
    return steps;
  };

  const resolveLabel = (type: string, id: string, lesson: Lesson): string | null => {
    switch (type) {
      case 'media': {
        const m = lesson.media?.find(i => i._id === id || i._id?.toString() === id);
        return m ? m.title : null;
      }
      case 'doc': {
        const d = lesson.docSubtopics?.find(i => i._id === id || i._id?.toString() === id);
        return d ? d.name : null;
      }
      case 'resource': {
        const r = lesson.resources?.find(i => i === id);
        return r ? (r.length > 40 ? r.slice(0, 40) + '…' : r) : null;
      }
      case 'quiz': {
        const q = lesson.linkedQuizzes?.find(i => i._id === id || i._id?.toString() === id);
        return q ? q.title : null;
      }
      case 'assignment': {
        const a = lesson.linkedAssignments?.find(i => i._id === id || i._id?.toString() === id);
        return a ? a.title : null;
      }
      case 'activity': {
        const a = lesson.linkedActivities?.find(i => i._id === id || i._id?.toString() === id);
        return a ? a.title : null;
      }
      default: return null;
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const openLesson = (section: Section, lesson: Lesson, sectionIdx: number, lessonIdx: number, stepIdx = 0) => {
    if (!enrolled) { setShowEnrollDialog(true); return; }
    setSelectedSection(section);
    setSelectedLesson(lesson);
    setCurrentLessonIndex({ sectionIdx, lessonIdx });
    setCurrentStepIndex(stepIdx);
    setViewMode('lesson');
    // Auto-expand the section in the sidebar
    setExpandedSections(prev => new Set([...prev, section._id]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLessonSelect = (section: Section, lesson: Lesson, sectionIdx?: number, lessonIdx?: number) => {
    if (!enrolled) { setShowEnrollDialog(true); return; }
    const secIdx = sectionIdx ?? course?.sections.findIndex(s => s._id === section._id) ?? -1;
    const lesIdx = lessonIdx ?? section.lessons.findIndex(l => l._id === lesson._id) ?? -1;
    openLesson(section, lesson, secIdx, lesIdx, 0);
  };

  const handleNext = () => {
    if (!course || !currentLessonIndex || !selectedLesson) return;
    const steps = resolveSteps(selectedLesson);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Last step → go to next lesson
    const { sectionIdx, lessonIdx } = currentLessonIndex;
    const section = course.sections[sectionIdx];
    if (lessonIdx < section.lessons.length - 1) {
      const next = section.lessons[lessonIdx + 1];
      openLesson(section, next, sectionIdx, lessonIdx + 1, 0);
    } else if (sectionIdx < course.sections.length - 1) {
      const nextSec = course.sections[sectionIdx + 1];
      if (nextSec.lessons.length > 0) openLesson(nextSec, nextSec.lessons[0], sectionIdx + 1, 0, 0);
    }
  };

  const handlePrevious = () => {
    if (!course || !currentLessonIndex || !selectedLesson) return;

    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // First step → go to previous lesson's last step
    const { sectionIdx, lessonIdx } = currentLessonIndex;
    if (lessonIdx > 0) {
      const section = course.sections[sectionIdx];
      const prev = section.lessons[lessonIdx - 1];
      const prevSteps = resolveSteps(prev);
      openLesson(section, prev, sectionIdx, lessonIdx - 1, Math.max(0, prevSteps.length - 1));
    } else if (sectionIdx > 0) {
      const prevSec = course.sections[sectionIdx - 1];
      if (prevSec.lessons.length > 0) {
        const prev = prevSec.lessons[prevSec.lessons.length - 1];
        const prevSteps = resolveSteps(prev);
        openLesson(prevSec, prev, sectionIdx - 1, prevSec.lessons.length - 1, Math.max(0, prevSteps.length - 1));
      }
    }
  };

  const hasNext = () => {
    if (!course || !currentLessonIndex || !enrolled || !selectedLesson) return false;
    const steps = resolveSteps(selectedLesson);
    if (currentStepIndex < steps.length - 1) return true;
    const { sectionIdx, lessonIdx } = currentLessonIndex;
    const section = course.sections[sectionIdx];
    return lessonIdx < section.lessons.length - 1 || sectionIdx < course.sections.length - 1;
  };

  const hasPrevious = () => {
    if (!currentLessonIndex || !enrolled) return false;
    if (currentStepIndex > 0) return true;
    const { sectionIdx, lessonIdx } = currentLessonIndex;
    return lessonIdx > 0 || sectionIdx > 0;
  };

  // ── Quiz submit ───────────────────────────────────────────────────────────

  const handleQuizSubmit = async (answers: Record<number, number>) => {
    if (!selectedSection || !selectedLesson || !enrolled) {
      notification.error('Not enrolled', 'Please enroll in the course first'); return;
    }
    try {
      const answersArray: QuizAnswer[] = Object.entries(answers).map(([qIdx, oIdx]) => ({
        questionIndex: parseInt(qIdx), selectedOptionIndex: oIdx as number,
      }));
      const results = await courseService.submitQuiz(selectedSection._id, selectedLesson._id, answersArray);
      saveQuizRecord(selectedLesson._id, selectedSection._id, results, answersArray);

      const totalQuizzes = ((selectedLesson.quiz?.length || 0) > 0 ? 1 : 0) + (selectedLesson.linkedQuizzes?.length || 0);
      const keyPrefix = `${selectedSection._id}_${selectedLesson._id}`;
      const attempted = Object.keys(quizRecords).filter(k => k.startsWith(keyPrefix)).length;

      if (attempted >= totalQuizzes) {
        try {
          const timeSpent = Math.floor((Date.now() - startTime) / 60000);
          await courseService.updateProgress(selectedSection._id, selectedLesson._id, true, timeSpent);
          await loadCourseData();
          notification.success(results.passed ? 'Quiz Passed!' : 'Quiz Completed', 'Lesson marked as complete');
        } catch { /**/ }
      } else {
        notification.success(results.passed ? 'Quiz Passed!' : 'Quiz Completed',
          `Complete ${totalQuizzes - attempted} more quiz(es) to finish this lesson`);
      }
    } catch (error: any) {
      notification.error('Quiz submission failed', error.message || 'Please try again'); throw error;
    }
  };

  // ── Video completion tracking ─────────────────────────────────────────────

  useEffect(() => {
    if (!videoRef.current || !selectedSection || !selectedLesson || !enrolled) return;
    const handleMessage = async (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange' && data.info === 0) {
          const timeSpent = Math.floor((Date.now() - startTime) / 60000);
          await courseService.updateProgress(selectedSection._id, selectedLesson._id, true, timeSpent);
          await loadCourseData();
          notification.success('Progress saved', 'Lesson completed automatically');
        }
      } catch { /**/ }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedSection, selectedLesson, enrolled, startTime]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const getLessonProgress = (sectionId: string, lessonId: string) => {
    const sp = progress?.sections.find(s => s.sectionId === sectionId);
    return sp?.lessons.find(l => l.lessonId === lessonId) ?? null;
  };

  const getSectionProgress = (sectionId: string) => {
    const sp = progress?.sections.find(s => s.sectionId === sectionId);
    if (!sp) return 0;
    return (sp.lessons.filter(l => l.completed).length / sp.lessons.length) * 100;
  };

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    for (const p of [
      /(?:youtube\.com\/watch\?v=)([\w-]+)/,
      /(?:youtu\.be\/)([\w-]+)/,
      /(?:youtube\.com\/embed\/)([\w-]+)/,
      /(?:youtube\.com\/v\/)([\w-]+)/,
    ]) {
      const m = url.match(p);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}?enablejsapi=1&origin=${window.location.origin}`;
    }
    return '';
  };

  // ── Step content renderer ─────────────────────────────────────────────────

  const renderStep = (step: Step, lesson: Lesson) => {
    switch (step.type) {
      case 'media': {
        const item = lesson.media?.find(m => m._id === step.id || m._id?.toString() === step.id);
        if (!item) return <EmptyState label="Media not found" />;
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              {item.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>}
            </div>
            {item.url && (
              <div className="aspect-video bg-black">
                <iframe
                  ref={videoRef}
                  src={getYouTubeEmbedUrl(item.url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        );
      }

      case 'doc': {
        const item = lesson.docSubtopics?.find(d => d._id === step.id || d._id?.toString() === step.id);
        if (!item) return <EmptyState label="Document not found" />;
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
              {item.filename && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> {item.filename}
                </p>
              )}
            </div>
            <div className="p-6"><CourseMarkdownRenderer content={item.content} /></div>
          </div>
        );
      }

      case 'resource': {
        // If URL is a YouTube link, embed it as a video
        const embedUrl = getYouTubeEmbedUrl(step.id);
        if (embedUrl) {
          const displayLabel = step.label.length > 60 ? step.label.slice(0, 60) + '…' : step.label;
          return (
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">{displayLabel}</h3>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  ref={videoRef}
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
        // Regular resource link
        const lessonWithSingleResource = { ...lesson, resources: [step.id] };
        return <LessonResources lesson={lessonWithSingleResource as Lesson} />;
      }

      case 'quiz': {
        const idx = lesson.linkedQuizzes?.findIndex(q => q._id === step.id || q._id?.toString() === step.id) ?? 0;
        return (
          <LessonQuizzes
            lesson={lesson}
            enrolled={enrolled}
            onSubmitQuiz={handleQuizSubmit}
            sectionId={selectedSection!._id}
            onProgressUpdate={loadCourseData}
            selectedQuizIndex={Math.max(0, idx)}
          />
        );
      }

      case 'assignment': {
        const idx = lesson.linkedAssignments?.findIndex(a => a._id === step.id || a._id?.toString() === step.id) ?? 0;
        return <LessonAssignments lesson={lesson} selectedIndex={Math.max(0, idx)} />;
      }

      case 'activity': {
        const idx = lesson.linkedActivities?.findIndex(a => a._id === step.id || a._id?.toString() === step.id) ?? 0;
        return <LessonActivities lesson={lesson} selectedIndex={Math.max(0, idx)} />;
      }

      default: return null;
    }
  };

  // ── Loading / not-found states ────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold animate-pulse">Initializing Workspace…</p>
      </div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Course not found</p>
        <Button onClick={() => navigate('/dashboard')} className={BUTTON_STYLES.gradient}>Back to Dashboard</Button>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative flex flex-col border-r border-gray-200 dark:border-gray-700`}>

        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{course.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {course.sections.length} modules · {course.sections.reduce((a, s) => a + s.lessons.length, 0)} lessons
            </p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Progress */}
        {enrolled && progress && (
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <Award className="h-3 w-3 text-blue-600" /> Progress
              </span>
              <span className="text-xs font-semibold text-blue-600">{Math.round(progress.overallProgress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress.overallProgress}%` }}
                className="h-full bg-blue-600 rounded-full" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              {progress.sections.reduce((a, s) => a + s.lessons.filter(l => l.completed).length, 0)}&nbsp;/&nbsp;
              {course.sections.reduce((a, s) => a + s.lessons.length, 0)} completed
            </p>
          </div>
        )}

        {/* Sections + Lessons + Steps */}
        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section, secIdx) => {
            const sectionPct = getSectionProgress(section._id);
            const isExpanded = expandedSections.has(section._id);

            return (
              <div key={section._id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                {/* Section toggle */}
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {secIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">{section.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {section.lessons.length} lessons
                      {enrolled && sectionPct === 100 && <span className="text-emerald-500 ml-1">· Done</span>}
                    </p>
                  </div>
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    : <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.18 }} className="overflow-hidden"
                    >
                      {section.lessons.map((lesson, lesIdx) => {
                        const lp = getLessonProgress(section._id, lesson._id);
                        const isCompleted = lp?.completed || false;
                        const isActiveLes = selectedLesson?._id === lesson._id;
                        const steps = resolveSteps(lesson);

                        return (
                          <div key={lesson._id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                            {/* Lesson row */}
                            <button
                              onClick={() => { openLesson(section, lesson, secIdx, lesIdx, 0); setSidebarOpen(false); }}
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 pl-10 border-l-2 transition-colors text-left ${
                                isActiveLes
                                  ? 'border-l-blue-600 bg-blue-50/50 dark:bg-blue-900/15'
                                  : 'border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800/60'
                              }`}
                            >
                              {isCompleted
                                ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                : <Circle className={`h-3.5 w-3.5 flex-shrink-0 ${isActiveLes ? 'text-blue-400' : 'text-gray-300 dark:text-gray-600'}`} />
                              }
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate leading-snug ${isActiveLes ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {lesIdx + 1}. {lesson.title}
                                </p>
                                {(lesson.estimatedMinutes ?? 0) > 0 && (
                                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />{lesson.estimatedMinutes}m
                                  </p>
                                )}
                              </div>
                              <ChevronRight className={`h-3 w-3 flex-shrink-0 ${isActiveLes ? 'text-blue-400' : 'text-gray-300'}`} />
                            </button>

                            {/* Step sub-items — shown only under the active lesson */}
                            <AnimatePresence>
                              {isActiveLes && steps.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-10 mr-3 mb-2 mt-0.5 border-l-2 border-gray-100 dark:border-gray-700 pl-3 space-y-0.5">
                                    {steps.map((step, stepIdx) => {
                                      const Icon = STEP_ICONS[step.type] || FileText;
                                      const colorClass = STEP_COLORS[step.type] || 'text-gray-400';
                                      const isActiveStep = currentStepIndex === stepIdx;

                                      return (
                                        <button
                                          key={`${step.type}:${step.id}`}
                                          onClick={() => {
                                            setCurrentStepIndex(stepIdx);
                                            setSidebarOpen(false);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }}
                                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                                            isActiveStep
                                              ? 'bg-blue-600 text-white shadow-sm'
                                              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'
                                          }`}
                                        >
                                          {/* Step number */}
                                          <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold ${
                                            isActiveStep
                                              ? 'bg-white/20 text-white'
                                              : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                          }`}>
                                            {stepIdx + 1}
                                          </span>
                                          <Icon className={`h-3 w-3 flex-shrink-0 ${isActiveStep ? 'text-white' : colorClass}`} />
                                          <span className={`text-[11px] leading-tight truncate flex-1 ${isActiveStep ? 'font-medium text-white' : ''}`}>
                                            {step.label}
                                          </span>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top header */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <Button variant="ghost" size="sm"
                onClick={() => viewMode === 'overview' ? navigate('/dashboard') : setViewMode('overview')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{viewMode === 'overview' ? 'Dashboard' : 'Overview'}</span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {!enrolled && (
                <Button onClick={handleEnroll} disabled={enrolling} className={BUTTON_STYLES.gradient} size="sm">
                  {enrolling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enrolling…</> : 'Enroll Now'}
                </Button>
              )}
              <Button onClick={() => setNotesOpen(true)} variant="outline" size="sm" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" /><span className="hidden sm:inline">Notes</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Progress bar */}
        {enrolled && progress && viewMode === 'lesson' && (
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 py-3">
            <div className="max-w-5xl mx-auto flex items-center gap-4">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Award className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-gray-500">{Math.round(progress.overallProgress)}%</span>
              </div>
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500 rounded-full" style={{ width: `${progress.overallProgress}%` }} />
              </div>
              {/* Step indicator */}
              {selectedLesson && (() => {
                const steps = resolveSteps(selectedLesson);
                if (steps.length === 0) return null;
                return (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    Step {currentStepIndex + 1}/{steps.length}
                  </span>
                );
              })()}
            </div>
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">

              {/* Overview */}
              {viewMode === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <CourseOverview
                    course={course} progress={progress} enrolled={enrolled}
                    onEnroll={handleEnroll} enrolling={enrolling}
                    getSectionProgress={getSectionProgress} onLessonSelect={handleLessonSelect}
                  />
                </motion.div>
              )}

              {/* Lesson step view */}
              {viewMode === 'lesson' && selectedLesson && selectedSection && (() => {
                const steps = resolveSteps(selectedLesson);
                const step = steps[currentStepIndex];

                return (
                  <motion.div key="lesson" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">

                    {/* Lesson header */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-4">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">{selectedSection.title}</p>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLesson.title}</h1>
                      {steps.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          {steps.map((s, i) => {
                            const Icon = STEP_ICONS[s.type] || FileText;
                            const isActive = i === currentStepIndex;
                            return (
                              <button
                                key={i}
                                onClick={() => { setCurrentStepIndex(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                title={s.label}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                                  isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                <Icon className="h-2.5 w-2.5" />
                                <span>{i + 1}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Step content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedLesson._id}-${currentStepIndex}`}
                        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                      >
                        {step ? renderStep(step, selectedLesson) : (
                          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-12 text-center">
                            <p className="text-gray-400">No content added to this lesson yet.</p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-2">
                      {hasPrevious() ? (
                        <Button onClick={handlePrevious} variant="outline"
                          className="flex items-center gap-2 border-gray-300 dark:border-gray-600">
                          <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>
                      ) : <div />}

                      {hasNext() && (
                        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })()}

            </AnimatePresence>
          </div>
        </main>
      </div>

      <EnrollmentDialog isOpen={showEnrollDialog} onClose={() => setShowEnrollDialog(false)}
        onEnroll={handleEnroll} enrolling={enrolling} courseTitle={course.title} />

      <NotesDrawer isOpen={notesOpen} onClose={() => setNotesOpen(false)}
        screen={selectedLesson?._id || 'course'} />
    </div>
  );
};

// Small helper component
const EmptyState = ({ label }: { label: string }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-12 text-center">
    <p className="text-gray-400 text-sm">{label}</p>
  </div>
);

export default CoursePage;
