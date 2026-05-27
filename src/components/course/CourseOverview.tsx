import {
  BookOpen, Calendar, ClipboardList, FileDown, FileText, Target, Trophy,
  Users, Zap, Tag, ChevronDown, ChevronRight, Clock, Video, PlayCircle
} from 'lucide-react';
import { Course, CourseProgress, Section, Lesson } from '@/services/course.service';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

type LessonTab = 'media' | 'video' | 'content' | 'docs' | 'resources' | 'quizzes' | 'assignments' | 'activities';

interface CourseOverviewProps {
  course: Course;
  progress: CourseProgress | null;
  enrolled: boolean;
  onEnroll: () => void;
  enrolling: boolean;
  getSectionProgress: (sectionId: string) => number;
  onLessonSelect?: (section: Section, lesson: Lesson, sectionIdx?: number, lessonIdx?: number, tab?: LessonTab) => void;
}

export const CourseOverview = ({
  course,
  progress,
  enrolled,
  onEnroll,
  enrolling,
  getSectionProgress,
  onLessonSelect,
}: CourseOverviewProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(course.sections.map(s => s._id))
  );
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const toggleMaterial = (materialKey: string) => {
    setExpandedMaterials(prev => {
      const next = new Set(prev);
      if (next.has(materialKey)) next.delete(materialKey);
      else next.add(materialKey);
      return next;
    });
  };

  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalMinutes = course.sections.reduce((acc, s) =>
    acc + s.lessons.reduce((la, l) => la + (l.estimatedMinutes || 0), 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Hero — clean white card, blue top accent */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="h-1 bg-blue-600" />
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl leading-relaxed">
                {course.description}
              </p>
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {course.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course.enrolledCount?.toLocaleString() || 0} enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Updated {new Date(course.updatedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {Math.round(totalMinutes / 60 * 10) / 10} hours
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {!enrolled ? (
                <Button
                  onClick={onEnroll}
                  disabled={enrolling}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll — Free'}
                </Button>
              ) : progress && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-[180px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Progress</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(progress.overallProgress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${progress.overallProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {progress.sections.reduce((acc, s) => acc + s.lessons.filter(l => l.completed).length, 0)} / {totalLessons} lessons
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sections', value: course.sections.length, icon: BookOpen },
          { label: 'Lessons', value: totalLessons, icon: FileText },
          {
            label: 'Quizzes',
            value: course.sections.reduce((acc, s) =>
              acc + s.lessons.reduce((la, l) =>
                la + (l.linkedQuizzes?.length || 0) + ((l.quiz?.length || 0) > 0 ? 1 : 0), 0), 0),
            icon: Trophy
          },
          { label: 'Enrolled', value: course.enrolledCount?.toLocaleString() || 0, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Curriculum */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Course Curriculum</h2>
          <span className="ml-auto text-xs text-gray-400">{course.sections.length} modules · {totalLessons} lessons</span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {course.sections.map((section, idx) => {
            const sectionProgress = getSectionProgress(section._id);
            const isSectionExpanded = expandedSections.has(section._id);

            return (
              <div key={section._id}>
                {/* Section row */}
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{section.title}</p>
                    {section.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{section.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {section.lessons.length} lessons
                      </span>
                      {enrolled && sectionProgress > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {Math.round(sectionProgress)}% done
                        </span>
                      )}
                    </div>
                  </div>
                  {isSectionExpanded
                    ? <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  }
                </button>

                {/* Lessons */}
                {isSectionExpanded && (
                  <div className="bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700">
                    {section.lessons.map((lesson, lessonIdx) => {
                      const hasQuizzes = (lesson.linkedQuizzes && lesson.linkedQuizzes.length > 0) || (lesson.quiz && (lesson.quiz?.length || 0) > 0);
                      const hasAssignments = lesson.linkedAssignments && lesson.linkedAssignments.length > 0;
                      const hasActivities = lesson.linkedActivities && lesson.linkedActivities.length > 0;
                      const hasResources = lesson.resources && lesson.resources.length > 0;
                      const hasMedia = lesson.media && lesson.media.length > 0;
                      const hasMaterialExpanded = expandedMaterials.has(lesson._id);

                      return (
                        <div key={lesson._id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                          {/* Lesson row — clickable to navigate */}
                          <button
                            onClick={() => onLessonSelect
                              ? onLessonSelect(section, lesson, idx, lessonIdx)
                              : toggleMaterial(lesson._id)
                            }
                            className="w-full flex items-center gap-3 px-6 py-3 pl-10 hover:bg-white dark:hover:bg-gray-800 transition-colors text-left group"
                          >
                            <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                              {lessonIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {lesson.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {lesson.estimatedMinutes ? (
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {lesson.estimatedMinutes}m
                                  </span>
                                ) : null}
                                {hasMedia && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <PlayCircle className="h-3 w-3" />
                                    {lesson.media!.length} video{lesson.media!.length > 1 ? 's' : ''}
                                  </span>
                                )}
                                {hasQuizzes && (
                                  <span className="text-xs px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded font-medium">Quiz</span>
                                )}
                                {hasAssignments && (
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded font-medium">Assignment</span>
                                )}
                                {hasActivities && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-medium">Activity</span>
                                )}
                                {hasResources && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-medium">Resources</span>
                                )}
                              </div>
                            </div>
                            {onLessonSelect ? (
                              <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                            ) : (
                              hasMaterialExpanded
                                ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                : <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>

                          {/* Expanded media list — shown only in read-only (no onLessonSelect) */}
                          {!onLessonSelect && hasMaterialExpanded && hasMedia && (
                            <div className="pl-16 pr-6 pb-3 space-y-2">
                              {lesson.media!.map((mediaItem, mIdx) => (
                                <div key={mIdx} className="flex items-center gap-2 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                                  <Video className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                  <span className="truncate">{mediaItem.title}</span>
                                  {mediaItem.description && (
                                    <span className="text-xs text-gray-400 truncate hidden sm:block">— {mediaItem.description}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: ClipboardList, label: 'Assignments', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
            value: course.sections.reduce((acc, s) => acc + s.lessons.reduce((la, l) => la + (l.linkedAssignments?.length || 0), 0), 0),
            sub: 'Total assignments to complete'
          },
          {
            icon: Zap, label: 'Activities', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
            value: course.sections.reduce((acc, s) => acc + s.lessons.reduce((la, l) => la + (l.linkedActivities?.length || 0), 0), 0),
            sub: 'Interactive learning exercises'
          },
          {
            icon: FileDown, label: 'Resources', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
            value: course.sections.reduce((acc, s) => acc + s.lessons.reduce((la, l) => la + (l.resources?.length || 0), 0), 0),
            sub: 'Downloadable materials'
          },
        ].map(({ icon: Icon, label, color, value, sub }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{label}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
