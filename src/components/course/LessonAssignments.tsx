import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lesson } from '@/services/course.service';
import { AssignmentCard } from './AssignmentCard';

interface LessonAssignmentsProps {
  lesson: Lesson;
}

export const LessonAssignments = ({ lesson }: LessonAssignmentsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!lesson.linkedAssignments || lesson.linkedAssignments.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No assignments available for this lesson</p>
      </div>
    );
  }

  const currentAssignment = lesson.linkedAssignments[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          Assignment {currentIndex + 1} of {lesson.linkedAssignments.length}
        </h3>
        {lesson.linkedAssignments.length > 1 && (
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
              onClick={() => setCurrentIndex(Math.min((lesson.linkedAssignments?.length || 1) - 1, currentIndex + 1))}
              disabled={currentIndex === lesson.linkedAssignments.length - 1}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      <AssignmentCard assignment={currentAssignment} />
    </div>
  );
};
