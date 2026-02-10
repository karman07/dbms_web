import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileDown,
  FileText,
  Target,
  Trophy,
  Users,
  Zap,
  ChevronDown,
  ChevronRight,
  Clock,
  Video,
  PlayCircle,
  ArrowRight,
  CheckCircle,
  ZapIcon
} from 'lucide-react';
import { Course, CourseProgress } from '@/services/course.service';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CircularProgress from '@/components/ui/CircularProgress';

interface CourseOverviewProps {
  course: Course;
  progress: CourseProgress | null;
  enrolled: boolean;
  onEnroll: () => void;
  enrolling: boolean;
  getSectionProgress: (sectionId: string) => number;
  onResume: () => void;
}

export const CourseOverview = ({
  course,
  progress,
  enrolled,
  onEnroll,
  enrolling,
  getSectionProgress,
  onResume
}: CourseOverviewProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };


  return (
    <div className="space-y-8">
      {/* Hero Section - Professional & Premium */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 p-8 lg:p-14">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                <Target className="h-4 w-4" />
                <span>Professional Course</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                {course.title}
              </h1>

              <p className="text-slate-400 text-lg lg:text-xl mb-8 max-w-2xl leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-semibold text-sm">
                    {course.enrolledCount?.toLocaleString() || 0} Students
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-300 font-medium text-sm">
                    Last sync: {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {!enrolled ? (
                <Button
                  onClick={onEnroll}
                  disabled={enrolling}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-7 text-lg rounded-2xl shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.02]"
                  size="lg"
                >
                  {enrolling ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enrolling...</span>
                    </div>
                  ) : (
                    "Start Learning Now"
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6 p-1 rounded-3xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-md max-w-fit pr-8">
                  <div className="flex-shrink-0 p-4">
                    {/* Pie Chart / Circular Progress */}
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-slate-700"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 * (1 - (progress?.overallProgress || 0) / 100)}
                          strokeLinecap="round"
                          className="text-blue-500 transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{Math.round(progress?.overallProgress || 0)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold text-lg mb-1">Your Mastery Progress</h3>
                    <p className="text-slate-400 text-sm">
                      {progress?.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.completed).length, 0)} of{' '}
                      {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} modules completed
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Visual - Dynamic Insight */}
            <div className="hidden lg:block w-80 h-96 relative group">
              <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative h-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <ZapIcon className="h-6 w-6" />
                    </div>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                      Up Next
                    </span>
                  </div>

                  <h4 className="text-white font-black text-xl leading-tight mb-4">
                    Ready to deep dive into the next chapter?
                  </h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    Pick up where you left off. The next module is optimized for your current mastery level.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Target className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs font-bold truncate">Continue Module</p>
                        <p className="text-slate-500 text-[10px] truncate">{course.sections[0]?.title || 'Fundamentals'}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-600" />
                    </div>
                  </div>
                  <button
                    onClick={onResume}
                    className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-xl shadow-white/5 active:scale-95"
                  >
                    Resume Journey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Simplified & Modern */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { icon: BookOpen, label: "Sections", val: course.sections.length, color: "blue" },
          { icon: FileText, label: "Total Lessons", val: course.sections.reduce((acc, s) => acc + s.lessons.length, 0), color: "violet" },
          {
            icon: Trophy, label: "Total Quizzes", val: course.sections.reduce((acc, s) =>
              acc + s.lessons.reduce((lessonAcc, l) =>
                lessonAcc + (l.linkedQuizzes?.length || 0) + ((l.quiz?.length || 0) > 0 ? 1 : 0), 0
              ), 0
            ), color: "amber"
          },
          { icon: Users, label: "Learners", val: course.enrolledCount || 0, color: "emerald" }
        ].map((stat, idx) => (
          <div key={idx} className="group bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 lg:p-6 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-6 w-6 lg:h-7 lg:w-7" />
            </div>
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-auto">
              {typeof stat.val === 'number' ? stat.val.toLocaleString() : stat.val}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary Resource Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: ClipboardList, label: "Assignments", sub: "Total assignments", color: "indigo", count: course.sections.reduce((acc, s) => acc + s.lessons.reduce((la, l) => la + (l.linkedAssignments?.length || 0), 0), 0) },
          { icon: Zap, label: "Activities", sub: "Interactive drills", color: "pink", count: course.sections.reduce((acc, s) => acc + s.lessons.reduce((la, l) => la + (l.linkedActivities?.length || 0), 0), 0) },
          { icon: FileDown, label: "Resources", sub: "Downloadables", color: "teal", count: course.sections.reduce((acc, s) => acc + s.lessons.reduce((la, l) => la + (l.resources?.length || 0), 0), 0) }
        ].map((res, i) => (
          <div key={i} className="flex items-center gap-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className={`w-14 h-14 rounded-2xl bg-${res.color}-600 flex items-center justify-center text-white shadow-lg shadow-${res.color}-600/20`}>
              <res.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{res.count}</p>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{res.label}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{res.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course Curriculum - Refined & Modern */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Target className="h-6 w-6 text-white" />
              </span>
              Curriculum Map
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Systematic path from fundamentals to mastery</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {course.sections?.length || 0} Modules
              </span>
            </div>
            <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {course.sections?.reduce((acc, s) => acc + s.lessons.reduce((la, l) => la + (l.estimatedMinutes || 0), 0), 0)} Min
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {course.sections?.map((section, idx) => {
            const sectionProgress = getSectionProgress(section._id);
            const isSectionExpanded = expandedSections.has(section._id);

            return (
              <div
                key={section._id}
                className={`group border rounded-[2rem] overflow-hidden transition-all duration-300 ${isSectionExpanded
                  ? 'border-blue-400/50 dark:border-blue-500/30 ring-4 ring-blue-500/5 dark:ring-blue-500/5 bg-slate-50/50 dark:bg-slate-800/10'
                  : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50'
                  }`}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full text-left p-6 lg:p-8"
                >
                  <div className="flex items-start gap-6">
                    {/* Index Circle */}
                    <div className="flex-shrink-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 ${isSectionExpanded
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30 rotate-12 scale-110'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}>
                        {idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className={`text-xl lg:text-2xl font-black mb-1 transition-colors ${isSectionExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white text-opacity-90'
                            }`}>
                            {section.title}
                          </h3>
                          {section.description && (
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-1">
                              {section.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-5">
                          {enrolled && (
                            <div className="flex items-center gap-3">
                              {sectionProgress > 0 && (
                                <CircularProgress
                                  percentage={sectionProgress}
                                  size={44}
                                  strokeWidth={4}
                                  color={sectionProgress === 100 ? "text-emerald-500" : "text-blue-600"}
                                />
                              )}
                              {sectionProgress === 100 && (
                                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Mastered</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className={`p-2 rounded-xl transition-colors ${isSectionExpanded ? 'bg-blue-600/10 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            {isSectionExpanded ? <ChevronDown className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Section Content */}
                {isSectionExpanded && (
                  <div className="px-6 lg:px-8 pb-8 pt-2">
                    <div className="grid gap-4">
                      {section.lessons.map((lesson, lessonIdx) => {
                        const isLessonExpanded = expandedLessons.has(lesson._id);
                        return (
                          <div
                            key={lesson._id}
                            className={`rounded-2xl border transition-all duration-300 ${isLessonExpanded
                              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-md'
                              : 'bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                              }`}
                          >
                            <button
                              onClick={() => toggleLesson(lesson._id)}
                              className="w-full text-left p-4 lg:p-5 flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-5 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${isLessonExpanded ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                  }`}>
                                  {lessonIdx + 1}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{lesson.title}</h4>
                                  <div className="flex flex-wrap items-center gap-3 mt-1.5 opacity-60">
                                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-tighter">
                                      <Clock className="h-3 w-3" />
                                      {lesson.estimatedMinutes}m
                                    </span>
                                    {lesson.videoUrl && (
                                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-tighter text-blue-500">
                                        <PlayCircle className="h-3 w-3" />
                                        Video
                                      </span>
                                    )}
                                    {(lesson.linkedQuizzes?.length || 0) + ((lesson.quiz?.length || 0) > 0 ? 1 : 0) > 0 && (
                                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-tighter text-amber-500">
                                        <Trophy className="h-3 w-3" />
                                        Quiz
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className={`transition-transform duration-300 ${isLessonExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                              </div>
                            </button>

                            {/* Lesson Deep Dive */}
                            {isLessonExpanded && (
                              <div className="p-4 lg:p-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  {[
                                    { icon: Trophy, label: "Quizzes", count: (lesson.linkedQuizzes?.length || 0) + ((lesson.quiz?.length || 0) > 0 ? 1 : 0), color: "amber", id: "quizzes" },
                                    { icon: ClipboardList, label: "Assignments", count: lesson.linkedAssignments?.length || 0, color: "indigo", id: "assignments" },
                                    { icon: Zap, label: "Activities", count: lesson.linkedActivities?.length || 0, color: "pink", id: "activities" },
                                    { icon: FileDown, label: "Resources", count: lesson.resources?.length || 0, color: "teal", id: "resources" }
                                  ].filter(m => m.count > 0).map((mat) => (
                                    <div key={mat.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                      <div className={`w-10 h-10 rounded-xl bg-${mat.color}-50 dark:bg-${mat.color}-900/20 flex items-center justify-center text-${mat.color}-600 dark:text-${mat.color}-400 mb-3`}>
                                        <mat.icon className="h-5 w-5" />
                                      </div>
                                      <p className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">{mat.count}</p>
                                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-sans">{mat.label}</p>
                                    </div>
                                  ))}
                                  {(lesson.media?.length || 0) > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                                        <Video className="h-5 w-5" />
                                      </div>
                                      <p className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">{lesson.media?.length || 0}</p>
                                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-sans">Media Docs</p>
                                    </div>
                                  )}
                                </div>
                                <div className="pt-2">
                                  <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl py-6 hover:translate-y-[-2px] hover:shadow-lg transition-all active:scale-95">
                                    Continue to Module {lessonIdx + 1}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
