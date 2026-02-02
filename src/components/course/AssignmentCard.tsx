import CourseMarkdownRenderer from '@/components/CourseMarkdownRenderer';

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  content: string;
  createdAt: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
}

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="prose dark:prose-invert max-w-none">
        <CourseMarkdownRenderer content={assignment.content} />
      </div>
    </div>
  );
};
