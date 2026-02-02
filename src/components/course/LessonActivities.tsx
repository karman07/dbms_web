import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lesson } from '@/services/course.service';
import { ActivityCard } from './ActivityCard';

interface LessonActivitiesProps {
  lesson: Lesson;
}

export const LessonActivities = ({ lesson }: LessonActivitiesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!lesson.linkedActivities || lesson.linkedActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No activities available for this lesson</p>
      </div>
    );
  }

  const currentActivity = lesson.linkedActivities[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Activity {currentIndex + 1} of {lesson.linkedActivities.length}
        </h3>
        {lesson.linkedActivities.length > 1 && (
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentIndex(Math.min((lesson.linkedActivities?.length || 1) - 1, currentIndex + 1))}
              disabled={currentIndex === lesson.linkedActivities.length - 1}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      <ActivityCard activity={currentActivity} />
    </div>
  );
};
