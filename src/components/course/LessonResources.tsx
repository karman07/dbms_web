import { ExternalLink, FileText, Link as LinkIcon } from 'lucide-react';
import { Lesson } from '@/services/course.service';

interface LessonResourcesProps {
  lesson: Lesson;
}

const isFullUrl = (s: string) => s.startsWith('http://') || s.startsWith('https://');

const getDisplayLabel = (url: string) => {
  if (isFullUrl(url)) {
    try {
      const u = new URL(url);
      // Shorten: show hostname + first path segment
      const path = u.pathname !== '/' ? u.pathname.split('/').filter(Boolean)[0] || '' : '';
      return path ? `${u.hostname}/${path}` : u.hostname;
    } catch { return url; }
  }
  return url.split('/').pop() || url;
};

const getHref = (url: string) =>
  isFullUrl(url) ? url : `http://localhost:3000${url}`;

export const LessonResources = ({ lesson }: LessonResourcesProps) => {
  if (!lesson.resources || lesson.resources.length === 0) {
    return (
      <div className="text-center py-12">
        <LinkIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No resources for this lesson</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <LinkIcon className="h-4 w-4 text-blue-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Resources</h3>
        <span className="ml-auto text-xs text-gray-400">{lesson.resources.length} link{lesson.resources.length > 1 ? 's' : ''}</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {lesson.resources.map((resource, idx) => {
          const href = getHref(resource);
          const label = getDisplayLabel(resource);
          const isExternal = isFullUrl(resource);

          return (
            <a
              key={idx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                {isExternal
                  ? <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  : <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{resource}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
