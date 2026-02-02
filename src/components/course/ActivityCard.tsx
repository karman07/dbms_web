import CourseMarkdownRenderer from '@/components/CourseMarkdownRenderer';

interface Activity {
  _id: string;
  title: string;
  description?: string;
  content: string;
  duration?: number;
  createdAt: string;
}

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="prose dark:prose-invert max-w-none">
        <CourseMarkdownRenderer content={activity.content} />
      </div>
    </div>
  );
};
