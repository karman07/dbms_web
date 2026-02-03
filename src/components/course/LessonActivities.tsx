import { Zap } from 'lucide-react';
import { Lesson } from '@/services/course.service';
import { ActivityCard } from './ActivityCard';

interface LessonActivitiesProps {
  lesson: Lesson;
  selectedIndex?: number;
  onIndexChange?: (index: number) => void;
}

export const LessonActivities = ({ lesson, selectedIndex = 0 }: LessonActivitiesProps) => {

  if (!lesson.linkedActivities || lesson.linkedActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No activities available for this lesson</p>
      </div>
    );
  }

  const currentActivity = lesson.linkedActivities[selectedIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Activity {selectedIndex + 1} of {lesson.linkedActivities.length}
        </h3>
        {lesson.linkedActivities.length > 1 && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
            {selectedIndex + 1} / {lesson.linkedActivities.length}
          </span>
        )}
      </div>
      
      <ActivityCard activity={currentActivity} />
    </div>
  );
};
