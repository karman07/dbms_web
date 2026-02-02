import { Lesson } from '@/services/course.service';
import CourseMarkdownRenderer from '@/components/CourseMarkdownRenderer';

interface LessonContentProps {
  lesson: Lesson;
}

export const LessonContent = ({ lesson }: LessonContentProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {lesson.title}
      </h2>
      <CourseMarkdownRenderer content={lesson.content} />
    </div>
  );
};
