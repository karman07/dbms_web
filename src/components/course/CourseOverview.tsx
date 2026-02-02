import { BookOpen, Calendar, ClipboardList, FileDown, FileText, Target, Trophy, Users, Zap, Tag } from 'lucide-react';
import { Course, CourseProgress } from '@/services/course.service';
import { Button } from '@/components/ui/button';

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
                    lessonAcc + (l.linkedQuizzes?.length || 0) + (l.quiz.length > 0 ? 1 : 0), 0
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
            const totalResources = section.lessons.reduce((acc, l) => acc + (l.resources?.length || 0), 0);
            const totalAssignments = section.lessons.reduce((acc, l) => acc + (l.linkedAssignments?.length || 0), 0);
            const totalActivities = section.lessons.reduce((acc, l) => acc + (l.linkedActivities?.length || 0), 0);
            
            return (
              <div
                key={section._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all"
              >
                <div className="p-5 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-600 flex items-center justify-center font-bold">
                        <span className="text-white">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                          {section.title}
                        </h3>
                        {section.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {section.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-violet-500 dark:border-violet-500 text-violet-700 dark:text-violet-400 rounded-lg font-medium">
                            <FileText className="h-4 w-4" />
                            {section.lessons.length} lessons
                          </span>
                          {totalResources > 0 && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-teal-500 dark:border-teal-500 text-teal-700 dark:text-teal-400 rounded-lg font-medium">
                              <FileDown className="h-4 w-4" />
                              {totalResources} resources
                            </span>
                          )}
                          {totalAssignments > 0 && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-indigo-500 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 rounded-lg font-medium">
                              <ClipboardList className="h-4 w-4" />
                              {totalAssignments} assignments
                            </span>
                          )}
                          {totalActivities > 0 && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-pink-500 dark:border-pink-500 text-pink-700 dark:text-pink-400 rounded-lg font-medium">
                              <Zap className="h-4 w-4" />
                              {totalActivities} activities
                            </span>
                          )}
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
                                className="h-full bg-blue-600 dark:bg-blue-600 transition-all duration-300"
                                style={{ width: `${sectionProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
