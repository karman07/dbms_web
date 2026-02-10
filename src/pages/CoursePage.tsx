import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@/components/ui/CircularProgress';
import {
  ChevronLeft, ChevronRight, PlayCircle, BookOpen, Clock, Zap, FileDown, Trophy, Video,
  Menu, X, ClipboardList, Loader2, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
import courseService, {
  Course, Section, Lesson, CourseProgress,
  QuizSubmissionResponse, QuizAnswer, SectionProgress, LessonProgress, QuizResult
} from '@/services/course.service';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { EnrollmentDialog } from '@/components/EnrollmentDialog';
import { NotesDrawer } from '@/components/NotesDrawer';
import { CourseOverview } from '@/components/course/CourseOverview';
import { LessonResources } from '@/components/course/LessonResources';
import { LessonAssignments } from '@/components/course/LessonAssignments';
import { LessonActivities } from '@/components/course/LessonActivities';
import CourseMarkdownRenderer from '@/components/CourseMarkdownRenderer';

type ViewMode = 'overview' | 'lesson';
type LessonTab = 'video' | 'quiz' | 'media' | 'docs' | 'resources' | 'assignments' | 'activities';

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
  const { user } = useAuth();
  const notification = useNotification();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [activeTab, setActiveTab] = useState<LessonTab>('video');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResults, setQuizResults] = useState<QuizSubmissionResponse | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [quizRecords, setQuizRecords] = useState<QuizRecord[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Videos', 'Assessment', 'Reading', 'Other']));

  useEffect(() => {
    loadCourseData();
    loadQuizRecords();
  }, []);

  useEffect(() => {
    setQuizAnswers({});
    setQuizResults(null);
  }, [activeTab, activeItemIndex]);

  const loadQuizRecords = () => {
    try {
      const saved = localStorage.getItem(`quiz_records_${user?._id}`);
      if (saved) {
        setQuizRecords(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load quiz records:', e);
    }
  };

  const saveQuizRecord = (lessonId: string, sectionId: string, result: QuizSubmissionResponse, answers: QuizAnswer[]) => {
    try {
      const records = [...quizRecords];
      const existingIdx = records.findIndex(r => r.lessonId === lessonId && r.sectionId === sectionId);
      const newRecord: QuizRecord = {
        lessonId,
        sectionId,
        score: result.score,
        passed: result.passed,
        attempts: existingIdx >= 0 ? records[existingIdx].attempts + 1 : 1,
        lastAttempt: new Date().toISOString(),
        answers: answers
      };
      if (existingIdx >= 0) records[existingIdx] = newRecord;
      else records.push(newRecord);
      setQuizRecords(records);
      localStorage.setItem(`quiz_records_${user?._id}`, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save quiz record:', e);
    }
  };

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourse() as any;
      const courseData = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
      setCourse(courseData);
      if (courseData) {
        try {
          const prog = await courseService.getMyProgress();
          setProgress(prog);
          setEnrolled(true);
        } catch (e) {
          setEnrolled(false);
        }
      }
    } catch (error) {
      notification.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/course' } });
      return;
    }
    try {
      setEnrolling(true);
      await courseService.enrollInCourse();
      setEnrolled(true);
      setShowEnrollDialog(false);
      notification.success('Successfully enrolled!');
      loadCourseData();
    } catch (error) {
      notification.error('Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const getAvailableTabs = (lesson: Lesson): LessonTab[] => {
    const tabs: LessonTab[] = [];
    if (lesson.videoUrl) tabs.push('video');
    if ((lesson.media?.length || 0) > 0) tabs.push('media');
    if ((lesson.docSubtopics?.length || 0) > 0) tabs.push('docs');
    if ((lesson.resources?.length || 0) > 0) tabs.push('resources');
    if ((lesson.quiz?.length || 0) > 0 || (lesson.linkedQuizzes?.length || 0) > 0) tabs.push('quiz');
    if ((lesson.linkedAssignments?.length || 0) > 0) tabs.push('assignments');
    if ((lesson.linkedActivities?.length || 0) > 0) tabs.push('activities');
    return tabs;
  };

  const getItemCount = (lesson: Lesson, tab: LessonTab): number => {
    switch (tab) {
      case 'video': return lesson.videoUrl ? 1 : 0;
      case 'media': return lesson.media?.length || 0;
      case 'docs': return lesson.docSubtopics?.length || 0;
      case 'resources': return lesson.resources?.length || 0;
      case 'quiz': {
        const hasMainQuiz = (lesson.quiz?.length || 0) > 0;
        const linkedQuizzesCount = lesson.linkedQuizzes?.length || 0;
        return (hasMainQuiz ? 1 : 0) + linkedQuizzesCount;
      }
      case 'assignments': return lesson.linkedAssignments?.length || 0;
      case 'activities': return lesson.linkedActivities?.length || 0;
      default: return 0;
    }
  };

  const goToNextItem = () => {
    if (!selectedLesson) return;
    const tabs = getAvailableTabs(selectedLesson);
    const currentTabIdx = tabs.indexOf(activeTab);
    const maxItems = getItemCount(selectedLesson, activeTab);

    if (activeItemIndex < maxItems - 1) {
      setActiveItemIndex(activeItemIndex + 1);
    } else if (currentTabIdx < tabs.length - 1) {
      setActiveTab(tabs[currentTabIdx + 1]);
      setActiveItemIndex(0);
    } else {
      // Potentially move to next lesson
      notification.success('Lesson section completed!');
    }
  };

  const goToPrevItem = () => {
    if (!selectedLesson) return;
    const tabs = getAvailableTabs(selectedLesson);
    const currentTabIdx = tabs.indexOf(activeTab);

    if (activeItemIndex > 0) {
      setActiveItemIndex(activeItemIndex - 1);
    } else if (currentTabIdx > 0) {
      const prevTab = tabs[currentTabIdx - 1];
      setActiveTab(prevTab);
      setActiveItemIndex(getItemCount(selectedLesson, prevTab) - 1);
    }
  };

  const handleLessonSelect = (section: Section, lesson: Lesson) => {
    if (!enrolled) {
      setShowEnrollDialog(true);
      return;
    }
    setSelectedSection(section);
    setSelectedLesson(lesson);
    setViewMode('lesson');
    setActiveItemIndex(0);

    // Auto-select tab
    const hasQuiz = (lesson.quiz?.length || 0) > 0 || (lesson.linkedQuizzes?.length || 0) > 0;
    const hasDocs = (lesson.docSubtopics?.length || 0) > 0;

    if (lesson.videoUrl) setActiveTab('video');
    else if (hasQuiz) setActiveTab('quiz');
    else if (hasDocs) setActiveTab('docs');
    else if ((lesson.media?.length || 0) > 0) setActiveTab('media');
    else if ((lesson.linkedAssignments?.length || 0) > 0) setActiveTab('assignments');
    else if ((lesson.linkedActivities?.length || 0) > 0) setActiveTab('activities');
    else setActiveTab('resources');

    setExpandedSections(prev => {
      const next = new Set(prev);
      next.add(section._id);
      return next;
    });
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const getLessonProgress = (sectionId: string, lessonId: string) => {
    return progress?.sections
      .find((s: SectionProgress) => s.sectionId === sectionId)
      ?.lessons.find((l: LessonProgress) => l.lessonId === lessonId);
  };

  const getSectionProgress = (sectionId: string) => {
    const section = progress?.sections.find((s: SectionProgress) => s.sectionId === sectionId);
    if (!section || section.lessons.length === 0) return 0;
    const completed = section.lessons.filter((l: LessonProgress) => l.completed).length;
    return (completed / section.lessons.length) * 100;
  };

  const handleQuizSubmit = async () => {
    if (!selectedLesson || !selectedSection) return;
    try {
      setSubmittingQuiz(true);

      // Select the correct quiz based on activeItemIndex
      let quizQuestions: any[] = [];
      const hasMainQuiz = (selectedLesson.quiz?.length || 0) > 0;

      if (hasMainQuiz && activeItemIndex === 0) {
        quizQuestions = selectedLesson.quiz;
      } else {
        const linkedIdx = hasMainQuiz ? activeItemIndex - 1 : activeItemIndex;
        quizQuestions = selectedLesson.linkedQuizzes?.[linkedIdx]?.questions || [];
      }

      if (quizQuestions.length === 0) return;
      const totalQuestions = quizQuestions.length;

      let correctAnswersCount = 0;
      const results: QuizResult[] = quizQuestions.map((question: any, qIdx: number) => {
        const selectedIdx = quizAnswers[qIdx] !== undefined ? quizAnswers[qIdx] : -1;
        const options = question.options || [];
        const selectedOption = options[selectedIdx];

        // Find the index of the correct option
        // 1. Try object-based isCorrect
        let correctOptionIdx = options.findIndex((opt: any) =>
          typeof opt === 'object' && opt !== null && opt.isCorrect
        );

        // 2. Try index-based correctAnswer fallback
        if (correctOptionIdx === -1 && typeof question.correctAnswer === 'number') {
          correctOptionIdx = question.correctAnswer;
        }

        const correctOption = options[correctOptionIdx];

        // Scoring logic
        let isCorrect = false;
        if (typeof selectedOption === 'object' && selectedOption !== null) {
          isCorrect = !!selectedOption.isCorrect;
        } else if (selectedIdx !== -1 && selectedIdx === correctOptionIdx) {
          isCorrect = true;
        }

        if (isCorrect) correctAnswersCount++;

        const getOptionText = (opt: any) => {
          if (!opt) return 'Not Answered';
          return typeof opt === 'string' ? opt : opt.text;
        };

        return {
          questionIndex: qIdx,
          question: question.question,
          yourAnswer: getOptionText(selectedOption),
          correctAnswer: getOptionText(correctOption),
          isCorrect,
          explanation: question.explanation || ''
        };
      });

      const score = Math.round((correctAnswersCount / totalQuestions) * 100);
      const passed = score >= 80;

      const result: QuizSubmissionResponse = {
        score,
        totalQuestions,
        correctAnswers: correctAnswersCount,
        passed,
        results
      };

      setQuizResults(result);

      const submissionAnswers: QuizAnswer[] = results.map(r => ({
        questionIndex: r.questionIndex,
        selectedOptionIndex: quizAnswers[r.questionIndex] || 0
      }));

      saveQuizRecord(selectedLesson._id, selectedSection._id, result, submissionAnswers);

      if (passed) {
        notification.success(`Assessment Passed! Score: ${score}%`);
        await courseService.updateProgress(
          selectedSection._id,
          selectedLesson._id,
          true,
          selectedLesson.estimatedMinutes || 5
        );
        loadCourseData();
      } else {
        notification.error(`Score: ${score}%. You need at least 80% to pass.`);
      }
    } catch (e) {
      console.error('Quiz submission error:', e);
      notification.error('Failed to process quiz results');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleResume = () => {
    if (!course || !enrolled) return;
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (!getLessonProgress(section._id, lesson._id)?.completed) {
          handleLessonSelect(section, lesson);
          return;
        }
      }
    }
    if (course.sections[0]?.lessons[0]) {
      handleLessonSelect(course.sections[0], course.sections[0].lessons[0]);
    }
  };

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?enablejsapi=1&origin=${window.location.origin}` : '';
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;
  if (!course) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><p>Course not found</p></div>;

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed lg:relative z-50 h-screen w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-xl lg:shadow-none"
          >
            <div className="h-full flex flex-col">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-[180px] tracking-tight">{course.title}</h2>
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mt-1">{course.sections?.length || 0} Modules</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X className="h-5 w-5" /></button>
              </div>

              {enrolled && progress && (
                <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <CircularProgress percentage={progress.overallProgress} size={48} strokeWidth={4} />
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mastery Progress</p>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress.overallProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {course.sections?.map((section, idx) => {
                  const sectionProgress = getSectionProgress(section._id);
                  const isSectionExpanded = expandedSections.has(section._id);
                  return (
                    <div key={section._id} className={`rounded-2xl overflow-hidden transition-all duration-300 ${isSectionExpanded ? 'bg-slate-50/80 dark:bg-slate-800/40 ring-1 ring-slate-100 dark:ring-slate-800' : ''}`}>
                      <button
                        onClick={() => toggleSection(section._id)}
                        className="w-full flex items-center justify-between p-4 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${isSectionExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{idx + 1}</div>
                          <div className="flex flex-col">
                            <span className={`text-xs font-bold text-left tracking-tight transition-colors ${isSectionExpanded ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{section.title}</span>
                            {sectionProgress > 0 && <span className="text-[9px] font-black text-slate-400">{Math.round(sectionProgress)}% Complete</span>}
                          </div>
                        </div>
                        {isSectionExpanded ? <ChevronDown className="h-4 w-4 text-blue-600" /> : <ChevronRight className="h-4 w-4 text-slate-300" />}
                      </button>

                      <AnimatePresence>
                        {isSectionExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="pb-3 px-2 space-y-1">
                              {section.lessons?.map((lesson) => {
                                const isActive = selectedLesson?._id === lesson._id;
                                const isCompleted = getLessonProgress(section._id, lesson._id)?.completed;
                                return (
                                  <div key={lesson._id} className="space-y-1">
                                    <button
                                      onClick={() => handleLessonSelect(section, lesson)}
                                      className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all ${isActive ? 'bg-blue-600/10 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-blue-600 scale-150' : isCompleted ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                      <span className={`text-[11px] font-bold text-left leading-tight truncate ${isActive ? 'font-black' : ''}`}>{lesson.title}</span>
                                    </button>

                                    {/* Lesson Sub-items */}
                                    {isActive && (
                                      <div className="ml-8 my-3 space-y-4">
                                        {/* 1. Main Video */}
                                        {lesson.videoUrl && (
                                          <div>
                                            <button
                                              onClick={() => toggleGroup('MainVideo')}
                                              className="w-full flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                              <span>Video Lesson</span>
                                              {expandedGroups.has('MainVideo') ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                                            </button>
                                            {expandedGroups.has('MainVideo') && (
                                              <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                                <button
                                                  onClick={() => { setActiveTab('video'); setActiveItemIndex(0); }}
                                                  className={`w-full flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'video' ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50'}`}
                                                >
                                                  <Video className="h-3.5 w-3.5" /> Watch Video
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* 2. Interactive Media */}
                                        {(lesson.media?.length || 0) > 0 && (
                                          <div>
                                            <button
                                              onClick={() => toggleGroup('Media')}
                                              className="w-full flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                              <span>Interactive Media</span>
                                              {expandedGroups.has('Media') ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                                            </button>
                                            {expandedGroups.has('Media') && (
                                              <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                                {lesson.media?.map((m, mIdx) => (
                                                  <button
                                                    key={m._id}
                                                    onClick={() => { setActiveTab('media'); setActiveItemIndex(mIdx); }}
                                                    className={`w-full flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'media' && activeItemIndex === mIdx ? 'text-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50'}`}
                                                  >
                                                    <PlayCircle className="h-3.5 w-3.5" /> <span className="truncate">{m.title}</span>
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* 3. Study Notes (Docs) */}
                                        {(lesson.docSubtopics?.length || 0) > 0 && (
                                          <div>
                                            <button
                                              onClick={() => toggleGroup('Notes')}
                                              className="w-full flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                              <span>Study Notes</span>
                                              {expandedGroups.has('Notes') ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                                            </button>
                                            {expandedGroups.has('Notes') && (
                                              <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                                {lesson.docSubtopics?.map((doc, dIdx) => (
                                                  <button
                                                    key={doc._id}
                                                    onClick={() => { setActiveTab('docs'); setActiveItemIndex(dIdx); }}
                                                    className={`w-full flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'docs' && activeItemIndex === dIdx ? 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50'}`}
                                                  >
                                                    <BookOpen className="h-3.5 w-3.5" /> <span className="truncate">{doc.name}</span>
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* 4. Quizzes */}
                                        {((lesson.quiz?.length || 0) > 0 || (lesson.linkedQuizzes?.length || 0) > 0) && (
                                          <div>
                                            <button
                                              onClick={() => toggleGroup('Quiz')}
                                              className="w-full flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                              <span>Assessments</span>
                                              {expandedGroups.has('Quiz') ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                                            </button>
                                            {expandedGroups.has('Quiz') && (
                                              <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                                {(lesson.quiz?.length || 0) > 0 && (
                                                  <button
                                                    onClick={() => { setActiveTab('quiz'); setActiveItemIndex(0); }}
                                                    className={`w-full flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'quiz' && activeItemIndex === 0 ? 'text-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50'}`}
                                                  >
                                                    <Trophy className="h-3.5 w-3.5" /> Main Quiz
                                                  </button>
                                                )}
                                                {lesson.linkedQuizzes?.map((lq, lqIdx) => {
                                                  const actualIdx = (lesson.quiz?.length || 0) > 0 ? lqIdx + 1 : lqIdx;
                                                  return (
                                                    <button
                                                      key={lq._id}
                                                      onClick={() => { setActiveTab('quiz'); setActiveItemIndex(actualIdx); }}
                                                      className={`w-full flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'quiz' && activeItemIndex === actualIdx ? 'text-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50'}`}
                                                    >
                                                      <Trophy className="h-3.5 w-3.5" /> <span className="truncate">{lq.title}</span>
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* 5. Projects */}
                                        {(lesson.linkedAssignments?.length || 0) > 0 && (
                                          <div>
                                            <button
                                              onClick={() => toggleGroup('Projects')}
                                              className="w-full flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                              <span>Projects</span>
                                              {expandedGroups.has('Projects') ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                                            </button>
                                            {expandedGroups.has('Projects') && (
                                              <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                                {lesson.linkedAssignments?.map((a, aIdx) => (
                                                  <button
                                                    key={a._id}
                                                    onClick={() => { setActiveTab('assignments'); setActiveItemIndex(aIdx); }}
                                                    className={`w-full flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'assignments' && activeItemIndex === aIdx ? 'text-rose-500 bg-rose-50/50 dark:bg-rose-900/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50'}`}
                                                  >
                                                    <ClipboardList className="h-3.5 w-3.5" /> {a.title || `Project ${aIdx + 1}`}
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* 6. Exercises */}
                                        {(lesson.linkedActivities?.length || 0) > 0 && (
                                          <div>
                                            <button
                                              onClick={() => toggleGroup('Exercises')}
                                              className="w-full flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                              <span>Exercises</span>
                                              {expandedGroups.has('Exercises') ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                                            </button>
                                            {expandedGroups.has('Exercises') && (
                                              <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                                {lesson.linkedActivities?.map((act, actIdx) => (
                                                  <button
                                                    key={act._id}
                                                    onClick={() => { setActiveTab('activities'); setActiveItemIndex(actIdx); }}
                                                    className={`w-full flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'activities' && activeItemIndex === actIdx ? 'text-orange-500 bg-orange-50/50 dark:bg-orange-900/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50'}`}
                                                  >
                                                    <Zap className="h-3.5 w-3.5" /> {act.title || `Exercise ${actIdx + 1}`}
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* 7. Resources */}
                                        {(lesson.resources?.length || 0) > 0 && (
                                          <div>
                                            <button
                                              onClick={() => toggleGroup('Resources')}
                                              className="w-full flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-3 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                              <span>Resources</span>
                                              {expandedGroups.has('Resources') ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                                            </button>
                                            {expandedGroups.has('Resources') && (
                                              <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 pl-2">
                                                <button
                                                  onClick={() => { setActiveTab('resources'); setActiveItemIndex(0); }}
                                                  className={`w-full flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'resources' ? 'text-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50'}`}
                                                >
                                                  <FileDown className="h-3.5 w-3.5" /> Materials
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
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
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Restored Main Header */}
        <header className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 h-20 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{course?.title}</h1>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{selectedSection?.title} • {selectedLesson?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-sm font-black text-blue-600">{progress?.overallProgress || 0}%</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress?.overallProgress || 0}%` }}
                  className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                />
              </div>
            </div>
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
              <Trophy className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Sub-header hidden per user request */}
        {false && viewMode === 'lesson' && selectedLesson && (
          <div className="flex-shrink-0 bg-white dark:bg-slate-900 px-8 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar z-20">
            <div className="flex items-center gap-10 h-16">
              {[
                { id: 'video', label: 'Watch Video', show: !!selectedLesson?.videoUrl, icon: PlayCircle },
                { id: 'quiz', label: 'Assessment', show: (selectedLesson?.quiz?.length || 0) > 0 || (selectedLesson?.linkedQuizzes?.length || 0) > 0, icon: Trophy },
                { id: 'docs', label: 'Study Notes', show: (selectedLesson?.docSubtopics?.length || 0) > 0, icon: BookOpen },
                { id: 'media', label: 'Interactive', show: (selectedLesson?.media?.length || 0) > 0, icon: Video },
                { id: 'assignments', label: 'Projects', show: (selectedLesson?.linkedAssignments?.length || 0) > 0, icon: ClipboardList },
                { id: 'activities', label: 'Exercises', show: (selectedLesson?.linkedActivities?.length || 0) > 0, icon: Zap },
                { id: 'resources', label: 'Materials', show: (selectedLesson?.resources?.length || 0) > 0, icon: FileDown }
              ].filter(t => t.show).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as LessonTab); setActiveItemIndex(0); }}
                  className={`h-full flex items-center gap-2 relative px-2 flex-shrink-0 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-4px_12px_rgba(37,99,235,0.4)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {viewMode === 'overview' ? (
              <CourseOverview course={course} progress={progress} enrolled={enrolled} onEnroll={handleEnroll} enrolling={enrolling} getSectionProgress={getSectionProgress} onResume={handleResume} />
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Lesson Header Card hidden per user request */}
                {false && (
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-[3rem] p-10 lg:p-16 relative overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <button
                          onClick={() => setViewMode('overview')}
                          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 rounded-2xl transition-all active:scale-95 shadow-sm"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back to Map
                        </button>
                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Currently Studying</p>
                      </div>
                      <h1 className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-10 leading-[0.9]">{selectedLesson?.title}</h1>
                      <div className="flex flex-wrap items-center gap-8">
                        <div className="flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-600 dark:text-slate-300 text-sm font-bold uppercase tracking-wider">{selectedLesson?.estimatedMinutes} Minutes</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:white/5 shadow-sm">
                          <Zap className="h-4 w-4 text-amber-500" />
                          <span className="text-slate-600 dark:text-slate-300 text-sm font-bold uppercase tracking-wider">Focus Mode</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-12 space-y-10">
                    {activeTab === 'video' && selectedLesson?.videoUrl && (
                      <div className="space-y-10">
                        <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group relative">
                          <iframe src={getYouTubeEmbedUrl(selectedLesson.videoUrl)} className="w-full h-full" allowFullScreen />
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Button
                            variant="ghost"
                            onClick={goToPrevItem}
                            disabled={activeTab === getAvailableTabs(selectedLesson)[0] && activeItemIndex === 0}
                            className="rounded-xl px-6 font-bold text-slate-400"
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                          </Button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'quiz' && selectedLesson && (
                      <div className="space-y-10">
                        {(() => {
                          const hasMainQuiz = (selectedLesson.quiz?.length || 0) > 0;
                          let quizQuestions: any[] = [];
                          let quizTitle = "Assessment";

                          if (hasMainQuiz && activeItemIndex === 0) {
                            quizQuestions = selectedLesson.quiz;
                            quizTitle = "Main Lesson Quiz";
                          } else {
                            const linkedIdx = hasMainQuiz ? activeItemIndex - 1 : activeItemIndex;
                            const lq = selectedLesson.linkedQuizzes?.[linkedIdx];
                            quizQuestions = lq?.questions || [];
                            quizTitle = lq?.title || "Linked Assessment";
                          }

                          if (!quizResults) {
                            return (
                              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 lg:p-14 shadow-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-12">
                                  <div>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">Subject Assessment</p>
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{quizTitle}</h3>
                                  </div>
                                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Trophy className="h-8 w-8" />
                                  </div>
                                </div>

                                <div className="space-y-8">
                                  {quizQuestions.map((question: any, qIdx: number) => (
                                    <div key={qIdx} className="bg-slate-50 dark:bg-white/5 rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 dark:border-white/5 shadow-inner">
                                      <div className="flex items-start gap-6 mb-8">
                                        <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-500/20">{qIdx + 1}</span>
                                        <h4 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-snug">{question.question}</h4>
                                      </div>
                                      <div className="grid grid-cols-1 gap-4">
                                        {(question.options || []).map((option: any, oIdx: number) => {
                                          const optionText = typeof option === 'string' ? option : (option as { text: string }).text;
                                          const isSelected = quizAnswers[qIdx] === oIdx;
                                          return (
                                            <button
                                              key={oIdx}
                                              onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                              className={`group text-left p-6 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                                ? 'border-blue-600 bg-blue-600/10 text-blue-600 dark:text-white shadow-lg'
                                                : 'border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.02] text-slate-500 dark:text-white/40 hover:border-blue-500 dark:hover:border-white/10 hover:text-blue-600 dark:hover:text-white'
                                                }`}
                                            >
                                              <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-200 dark:border-white/20'}`}>
                                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <span className="font-bold">{optionText}</span>
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-12 flex items-center justify-between">
                                  <Button variant="ghost" onClick={goToPrevItem} className="text-slate-400 font-bold">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                  </Button>
                                  <Button
                                    onClick={() => handleQuizSubmit()}
                                    disabled={Object.keys(quizAnswers).length !== quizQuestions.length || submittingQuiz}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-7 rounded-[2rem] h-auto text-xl shadow-2xl shadow-blue-500/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                                  >
                                    {submittingQuiz ? 'Evaluating...' : 'Verify Assessment'}
                                  </Button>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 lg:p-14 shadow-xl border border-slate-100 dark:border-slate-800">
                                <div className="py-10 space-y-12">
                                  <div className="text-center space-y-8">
                                    <div className="relative inline-flex items-center justify-center p-12 rounded-full bg-white/5 border border-white/5 shadow-2xl">
                                      <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-[40px] animate-pulse" />
                                      <CircularProgress percentage={quizResults.score} size={200} strokeWidth={14} color={quizResults.passed ? "text-emerald-500" : "text-blue-600"} />
                                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-white">{quizResults.score}%</span>
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-1">Grade</span>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-5xl font-black text-white mb-6 tracking-tighter">
                                        {quizResults.passed ? 'Topic Mastered! 🎉' : 'Keep Learning! 💪'}
                                      </h3>
                                      <p className="text-xl text-white/50 font-medium max-w-lg mx-auto leading-relaxed">
                                        {quizResults.passed
                                          ? `Exceptional work! You've achieved a score of ${quizResults.score}% and successfully mastered this lesson.`
                                          : `You reached ${quizResults.score}%. To ensure complete understanding, we recommend reviewing the material once more before your next attempt.`}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-white px-2">Review Summary</h4>
                                    <div className="grid gap-4">
                                      {quizResults.results.map((res, rIdx) => (
                                        <div key={rIdx} className={`p-6 rounded-3xl border ${res.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                          <div className="flex items-start gap-4">
                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${res.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <div className="space-y-2">
                                              <p className="font-bold text-white">{res.question}</p>
                                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                                <span className={res.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                                                  Your answer: {res.yourAnswer}
                                                </span>
                                                {!res.isCorrect && (
                                                  <span className="text-slate-400 italic">
                                                    Correct: {res.correctAnswer}
                                                  </span>
                                                )}
                                              </div>
                                              {res.explanation && (
                                                <p className="text-xs text-white/40 italic mt-2 border-t border-white/5 pt-2">
                                                  {res.explanation}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-center gap-6 pt-4">
                                    <Button
                                      onClick={() => { setQuizResults(null); setQuizAnswers({}); }}
                                      className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 font-black px-10 py-5 rounded-2xl h-auto transition-all"
                                    >
                                      Retake Quiz
                                    </Button>
                                    <Button
                                      onClick={goToNextItem}
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-2xl h-auto shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                                    >
                                      Continue to Next
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}

                    {activeTab === 'docs' && selectedLesson?.docSubtopics && selectedLesson.docSubtopics.length > 0 && (
                      <div className="space-y-8 min-h-0">
                        {(() => {
                          const doc = selectedLesson.docSubtopics[activeItemIndex] || selectedLesson.docSubtopics[0];
                          const totalDocs = selectedLesson.docSubtopics.length;
                          return (
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 lg:p-14 shadow-xl border border-slate-100 dark:border-slate-800">
                              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{doc.name}</h3>
                                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                  Reading {activeItemIndex + 1} of {totalDocs}
                                </div>
                              </div>
                              <div className="prose prose-slate dark:prose-invert max-w-none">
                                <CourseMarkdownRenderer content={doc.content} />
                              </div>
                              <div className="pt-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                <Button
                                  variant="outline"
                                  onClick={goToPrevItem}
                                  className="rounded-xl px-1 offset-border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 font-bold"
                                >
                                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button
                                  onClick={goToNextItem}
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold shadow-lg shadow-blue-500/20"
                                >
                                  {activeItemIndex === totalDocs - 1 ? 'Next Section' : 'Next Reading'} <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {activeTab === 'resources' && selectedLesson && (
                      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-slate-100 dark:border-slate-800 h-full overflow-y-auto">
                        <div className="flex items-center justify-between mb-10">
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Materials & Resources</h2>
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={goToPrevItem} className="rounded-xl font-bold">
                              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                            <Button onClick={goToNextItem} className="bg-blue-600 text-white rounded-xl font-bold">
                              Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <LessonResources lesson={selectedLesson} />
                      </div>
                    )}

                    {activeTab === 'assignments' && selectedLesson?.linkedAssignments && (
                      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-slate-100 dark:border-slate-800 h-full overflow-y-auto">
                        <div className="flex items-center justify-between mb-10">
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Projects</h2>
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={goToPrevItem} className="rounded-xl font-bold">
                              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                            <Button onClick={goToNextItem} className="bg-blue-600 text-white rounded-xl font-bold">
                              Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <LessonAssignments lesson={selectedLesson} selectedIndex={activeItemIndex} onIndexChange={setActiveItemIndex} />
                      </div>
                    )}

                    {activeTab === 'activities' && selectedLesson?.linkedActivities && (
                      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl border border-slate-100 dark:border-slate-800 h-full overflow-y-auto">
                        <div className="flex items-center justify-between mb-10">
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Exercises</h2>
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={goToPrevItem} className="rounded-xl font-bold">
                              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                            <Button onClick={goToNextItem} className="bg-blue-600 text-white rounded-xl font-bold">
                              Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <LessonActivities lesson={selectedLesson} selectedIndex={activeItemIndex} onIndexChange={setActiveItemIndex} />
                      </div>
                    )}

                    {activeTab === 'media' && selectedLesson?.media && selectedLesson.media.length > 0 && (
                      <div className="space-y-10 min-h-0">
                        {(() => {
                          const item = selectedLesson.media[activeItemIndex] || selectedLesson.media[0];
                          const totalMedia = selectedLesson.media.length;
                          return (
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 lg:p-14 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{item.title}</h3>
                                  <p className="text-slate-500 dark:text-slate-400 font-medium">{item.description}</p>
                                </div>
                                <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                  Module {activeItemIndex + 1} of {totalMedia}
                                </div>
                              </div>
                              {item.url && (
                                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
                                  <iframe src={getYouTubeEmbedUrl(item.url)} className="w-full h-full" allowFullScreen />
                                </div>
                              )}
                              <div className="pt-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                <Button
                                  variant="outline"
                                  onClick={goToPrevItem}
                                  className="rounded-xl px-6 font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <Button
                                  onClick={goToNextItem}
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                >
                                  {activeItemIndex < totalMedia - 1 ? 'Next Module' : 'Next Section'} <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <EnrollmentDialog isOpen={showEnrollDialog} onClose={() => setShowEnrollDialog(false)} onEnroll={handleEnroll} enrolling={enrolling} courseTitle={course?.title || ''} />
      <NotesDrawer isOpen={notesOpen} onClose={() => setNotesOpen(false)} screen={selectedSection ? `section-${selectedSection._id}` : 'course-overview'} />
    </div>
  );
};

export default CoursePage;
