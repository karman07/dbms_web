import { BookOpen, Calendar, ClipboardList, FileDown, FileText, Target, Trophy, Users, Zap, Tag, ChevronDown, ChevronRight, Clock, Video, PlayCircle } from 'lucide-react';
import { Course, CourseProgress } from '@/services/course.service';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CourseOverviewProps {
  course: Course;
  progress: CourseProgress | null;
  enrolled: boolean;
  onEnroll: () => void;
  enrolling: boolean;
  getSectionProgress: (sectionId: string) => number;
}

export const CourseOverview = ({ 
  course, 
  progress, 
  enrolled, 
  onEnroll, 
  enrolling,
  getSectionProgress 
}: CourseOverviewProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());

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

  const toggleMaterial = (materialKey: string) => {
    setExpandedMaterials(prev => {
      const next = new Set(prev);
      if (next.has(materialKey)) {
        next.delete(materialKey);
      } else {
        next.add(materialKey);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-8 lg:p-12 shadow-lg">
        <div>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-white">
                  {course.title}
                </h1>
                {/* {course.isPublished && (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                    Published
                  </span>
                )} */}
              </div>
              <p className="text-white/90 text-lg lg:text-xl mb-6 max-w-3xl">
                {course.description}
              </p>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {course.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-lg flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Enrollment Count Badge */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">
                    {course.enrolledCount?.toLocaleString() || 0} Students Enrolled
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calendar className="h-5 w-5 text-white" />
                  <span className="text-white font-medium text-sm">
                    Updated {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {!enrolled && (
                <Button
                  onClick={onEnroll}
                  disabled={enrolling}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now - It\'s Free!'}
                </Button>
              )}
              
              {enrolled && progress && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Your Progress</span>
                    <span className="text-white font-bold text-xl">{Math.round(progress.overallProgress)}%</span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${progress.overallProgress}%` }}
                    />
                  </div>
                  <p className="text-white/80 text-sm mt-2">
                    {progress.sections.reduce((acc, s) => 
                      acc + s.lessons.filter(l => l.completed).length, 0
                    )} of{' '}
                    {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons completed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-blue-600 dark:bg-blue-600 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sections</p>
              <p className="font-bold text-gray-900 dark:text-white text-2xl">
                {course.sections.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-violet-600 dark:bg-violet-600 flex items-center justify-center">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Lessons</p>
              <p className="font-bold text-gray-900 dark:text-white text-2xl">
                {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-amber-600 dark:bg-amber-600 flex items-center justify-center">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Quizzes</p>
              <p className="font-bold text-gray-900 dark:text-white text-2xl">
                {course.sections.reduce((acc, s) => 
                  acc + s.lessons.reduce((lessonAcc, l) => 
                    lessonAcc + (l.linkedQuizzes?.length || 0) + ((l.quiz?.length || 0) > 0 ? 1 : 0), 0
                  ), 0
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-emerald-600 dark:bg-emerald-600 flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Enrolled</p>
              <p className="font-bold text-gray-900 dark:text-white text-2xl">
                {course.enrolledCount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 dark:bg-indigo-600 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Assignments</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {course.sections.reduce((acc, s) => 
              acc + s.lessons.reduce((lessonAcc, l) => 
                lessonAcc + (l.linkedAssignments?.length || 0), 0
              ), 0
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total assignments to complete</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-pink-600 dark:bg-pink-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Activities</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {course.sections.reduce((acc, s) => 
              acc + s.lessons.reduce((lessonAcc, l) => 
                lessonAcc + (l.linkedActivities?.length || 0), 0
              ), 0
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Interactive learning exercises</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 dark:bg-teal-600 flex items-center justify-center">
              <FileDown className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Resources</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {course.sections.reduce((acc, s) => 
              acc + s.lessons.reduce((lessonAcc, l) => 
                lessonAcc + (l.resources?.length || 0), 0
              ), 0
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Downloadable materials</p>
        </div>
      </div>

      {/* Course Content Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-600 flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          Course Curriculum
        </h2>
        <div className="space-y-4">
          {course.sections.map((section, idx) => {
            const sectionProgress = getSectionProgress(section._id);
            const isSectionExpanded = expandedSections.has(section._id);
            
            return (
              <div
                key={section._id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1 text-left">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center font-bold shadow-md">
                        <span className="text-white">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {section.title}
                          </h3>
                          {isSectionExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        {section.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {section.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-violet-500 dark:border-violet-500 text-violet-700 dark:text-violet-400 rounded-lg font-medium shadow-sm">
                            <FileText className="h-4 w-4" />
                            {section.lessons.length} lessons
                          </span>
                        </div>
                        {enrolled && sectionProgress > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {Math.round(sectionProgress)}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-600 dark:to-blue-500 transition-all duration-300"
                                style={{ width: `${sectionProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Section Lessons (Expandable) */}
                {isSectionExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/30">
                    <div className="p-4 space-y-3">
                      {section.lessons.map((lesson, lessonIdx) => {
                        const isLessonExpanded = expandedLessons.has(lesson._id);
                        const hasQuizzes = (lesson.linkedQuizzes && lesson.linkedQuizzes.length > 0) || (lesson.quiz && (lesson.quiz?.length || 0) > 0);
                        const hasAssignments = lesson.linkedAssignments && lesson.linkedAssignments.length > 0;
                        const hasActivities = lesson.linkedActivities && lesson.linkedActivities.length > 0;
                        const hasResources = lesson.resources && lesson.resources.length > 0;
                        const hasMedia = lesson.media && lesson.media.length > 0;
                        
                        return (
                          <div
                            key={lesson._id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-all"
                          >
                            {/* Lesson Header */}
                            <button
                              onClick={() => toggleLesson(lesson._id)}
                              className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 text-left">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-500 dark:to-violet-600 flex items-center justify-center font-semibold text-white text-sm shadow-sm">
                                    {lessonIdx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {lesson.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      {lesson.estimatedMinutes && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {lesson.estimatedMinutes} min
                                        </span>
                                      )}
                                      {hasQuizzes && (
                                        <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md font-medium">
                                          Quiz
                                        </span>
                                      )}
                                      {hasAssignments && (
                                        <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md font-medium">
                                          Assignment
                                        </span>
                                      )}
                                      {hasActivities && (
                                        <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-md font-medium">
                                          Activity
                                        </span>
                                      )}
                                      {hasResources && (
                                        <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-md font-medium">
                                          Resources
                                        </span>
                                      )}
                                      {hasMedia && (
                                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-md font-medium">
                                          Media
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {isLessonExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>

                            {/* Lesson Materials (Expandable) */}
                            {isLessonExpanded && (
                              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 space-y-3">
                                
                                {/* Quizzes Section */}
                                {hasQuizzes && (
                                  <div className="border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                    <button
                                      onClick={() => toggleMaterial(`${lesson._id}-quizzes`)}
                                      className="w-full p-3 flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          Quizzes ({(lesson.linkedQuizzes?.length || 0) + (lesson.quiz?.length > 0 ? 1 : 0)})
                                        </span>
                                      </div>
                                      {expandedMaterials.has(`${lesson._id}-quizzes`) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                    {expandedMaterials.has(`${lesson._id}-quizzes`) && (
                                      <div className="border-t border-amber-200 dark:border-amber-800 p-3 space-y-2">
                                        {lesson.linkedQuizzes?.map((quiz, qIdx) => (
                                          <div key={qIdx} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                            <div className="flex items-start gap-2">
                                              <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                  {quiz.title}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                  {quiz.questions?.length || 0} questions
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        {lesson.quiz && (lesson.quiz?.length || 0) > 0 && (
                                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                            <div className="flex items-start gap-2">
                                              <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                  Embedded Quiz
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                  {lesson.quiz?.length || 0} questions
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Assignments Section */}
                                {hasAssignments && (
                                  <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                    <button
                                      onClick={() => toggleMaterial(`${lesson._id}-assignments`)}
                                      className="w-full p-3 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-500" />
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          Assignments ({lesson.linkedAssignments?.length || 0})
                                        </span>
                                      </div>
                                      {expandedMaterials.has(`${lesson._id}-assignments`) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                    {expandedMaterials.has(`${lesson._id}-assignments`) && (
                                      <div className="border-t border-indigo-200 dark:border-indigo-800 p-3 space-y-2">
                                        {lesson.linkedAssignments?.map((assignment, aIdx) => (
                                          <div key={aIdx} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                            <div className="flex items-start gap-2">
                                              <ClipboardList className="h-4 w-4 text-indigo-600 dark:text-indigo-500 mt-0.5 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                  {assignment.title}
                                                </p>
                                                {assignment.description && (
                                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {assignment.description}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Activities Section */}
                                {hasActivities && (
                                  <div className="border border-pink-200 dark:border-pink-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                    <button
                                      onClick={() => toggleMaterial(`${lesson._id}-activities`)}
                                      className="w-full p-3 flex items-center justify-between hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-pink-600 dark:text-pink-500" />
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          Activities ({lesson.linkedActivities?.length || 0})
                                        </span>
                                      </div>
                                      {expandedMaterials.has(`${lesson._id}-activities`) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                    {expandedMaterials.has(`${lesson._id}-activities`) && (
                                      <div className="border-t border-pink-200 dark:border-pink-800 p-3 space-y-2">
                                        {lesson.linkedActivities?.map((activity, actIdx) => (
                                          <div key={actIdx} className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                            <div className="flex items-start gap-2">
                                              <Zap className="h-4 w-4 text-pink-600 dark:text-pink-500 mt-0.5 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                  {activity.title}
                                                </p>
                                                {activity.description && (
                                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {activity.description}
                                                  </p>
                                                )}
                                                {activity.duration && (
                                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {activity.duration} minutes
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Resources Section */}
                                {hasResources && (
                                  <div className="border border-teal-200 dark:border-teal-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                    <button
                                      onClick={() => toggleMaterial(`${lesson._id}-resources`)}
                                      className="w-full p-3 flex items-center justify-between hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <FileDown className="h-5 w-5 text-teal-600 dark:text-teal-500" />
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          Resources ({lesson.resources?.length || 0})
                                        </span>
                                      </div>
                                      {expandedMaterials.has(`${lesson._id}-resources`) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                    {expandedMaterials.has(`${lesson._id}-resources`) && (
                                      <div className="border-t border-teal-200 dark:border-teal-800 p-3 space-y-2">
                                        {lesson.resources?.map((resource, rIdx) => (
                                          <div key={rIdx} className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                            <a
                                              href={resource}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-start gap-2 hover:underline"
                                            >
                                              <FileDown className="h-4 w-4 text-teal-600 dark:text-teal-500 mt-0.5 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-teal-700 dark:text-teal-400 text-sm truncate">
                                                  Resource {rIdx + 1}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                                  {resource}
                                                </p>
                                              </div>
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Media Section */}
                                {hasMedia && (
                                  <div className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                    <button
                                      onClick={() => toggleMaterial(`${lesson._id}-media`)}
                                      className="w-full p-3 flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Video className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          Media ({lesson.media?.length || 0})
                                        </span>
                                      </div>
                                      {expandedMaterials.has(`${lesson._id}-media`) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                    {expandedMaterials.has(`${lesson._id}-media`) && (
                                      <div className="border-t border-purple-200 dark:border-purple-800 p-3 space-y-2">
                                        {lesson.media?.map((mediaItem, mIdx) => (
                                          <div key={mIdx} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <div className="flex items-start gap-2">
                                              <PlayCircle className="h-4 w-4 text-purple-600 dark:text-purple-500 mt-0.5 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                  {mediaItem.title}
                                                </p>
                                                {mediaItem.description && (
                                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {mediaItem.description}
                                                  </p>
                                                )}
                                                {mediaItem.url && (
                                                  <a
                                                    href={mediaItem.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-purple-600 dark:text-purple-400 mt-1 hover:underline flex items-center gap-1"
                                                  >
                                                    <PlayCircle className="h-3 w-3" />
                                                    Watch Video
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
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
