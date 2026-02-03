import { ClipboardList } from 'lucide-react';
import { Lesson } from '@/services/course.service';
import { AssignmentCard } from './AssignmentCard';

interface LessonAssignmentsProps {
  lesson: Lesson;
  selectedIndex?: number;
  onIndexChange?: (index: number) => void;
}

export const LessonAssignments = ({ lesson, selectedIndex = 0 }: LessonAssignmentsProps) => {

  if (!lesson.linkedAssignments || lesson.linkedAssignments.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No assignments available for this lesson</p>
      </div>
    );
  }

  const currentAssignment = lesson.linkedAssignments[selectedIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          Assignment {selectedIndex + 1} of {lesson.linkedAssignments.length}
        </h3>
        {lesson.linkedAssignments.length > 1 && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
            {selectedIndex + 1} / {lesson.linkedAssignments.length}
          </span>
        )}
      </div>
      
      <AssignmentCard assignment={currentAssignment} />
    </div>
  );
};
