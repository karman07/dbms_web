import { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import CourseMarkdownRenderer from '@/components/CourseMarkdownRenderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MarkdownViewerProps {
  title: string;
  content: string;
  preview?: boolean;
}

export const MarkdownViewer = ({ title, content, preview = false }: MarkdownViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (preview) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span>View Content</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {isExpanded && (
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto">
              <button
                onClick={() => setShowFullscreen(true)}
                className="absolute top-2 right-2 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="View fullscreen"
              >
                <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="prose prose-sm dark:prose-invert max-w-none pr-10">
                <CourseMarkdownRenderer content={content} />
              </div>
            </div>
          </div>
        )}

        <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="prose dark:prose-invert max-w-none p-6">
              <CourseMarkdownRenderer content={content} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="prose dark:prose-invert max-w-none">
        <CourseMarkdownRenderer content={content} />
      </div>
    </div>
  );
};
