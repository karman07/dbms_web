import { Download, FileDown, FileText } from 'lucide-react';
import { Lesson } from '@/services/course.service';

interface LessonResourcesProps {
  lesson: Lesson;
}

export const LessonResources = ({ lesson }: LessonResourcesProps) => {
  if (!lesson.resources || lesson.resources.length === 0) {
    return (
      <div className="text-center py-12">
        <FileDown className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No resources available for this lesson</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <FileDown className="h-5 w-5" />
        Learning Resources
      </h3>
      <div className="grid gap-3">
        {lesson.resources.map((resource, idx) => {
          const fileName = resource.split('/').pop() || `Resource ${idx + 1}`;
          const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
          
          return (
            <a
              key={idx}
              href={`http://localhost:3000${resource}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {fileName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {fileExtension} Document
                </p>
              </div>
              <Download className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
