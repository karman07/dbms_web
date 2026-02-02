import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import Modal from '../ui/modal';
import { docsAPI } from '../../utils/api';

interface SubtopicContentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  subtopics: Array<{ name: string; filename: string }>;
  initialSubtopicIndex?: number;
}

const SubtopicContentViewer: React.FC<SubtopicContentViewerProps> = ({
  isOpen,
  onClose,
  topicId,
  topicName,
  subtopics,
  initialSubtopicIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSubtopicIndex);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const currentSubtopic = subtopics[currentIndex];

  useEffect(() => {
    if (isOpen && currentSubtopic) {
      loadContent();
    }
  }, [isOpen, currentIndex, currentSubtopic]);

  const loadContent = async () => {
    if (!currentSubtopic) return;

    setLoading(true);
    try {
      const response = await docsAPI.getSubtopicContent(topicId, currentSubtopic.name);
      // API returns the subtopic object directly with content field
      const subtopicContent = response.content || response.data?.content || '';
      console.log('Subtopic response:', response);
      setContent(subtopicContent);
    } catch (error) {
      console.error('Error loading content:', error);
      setContent('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentSubtopic) return;

    try {
      const response = await docsAPI.downloadSubtopic(topicId, currentSubtopic.name);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', currentSubtopic.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < subtopics.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Simple markdown to HTML converter
  const renderMarkdown = (markdown: string) => {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-800 mt-5 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-6">$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-6">$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gim, '<li class="ml-6">$2</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2">$1</blockquote>');

    // Line breaks
    html = html.replace(/\n\n/g, '<br /><br />');
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={topicName} size="xl">
      <div className="flex flex-col h-[600px]">
        {/* Header with navigation */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{currentSubtopic?.name}</p>
              <p className="text-gray-500">
                {currentIndex + 1} of {subtopics.length}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex === subtopics.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading content...</div>
            </div>
          ) : (
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubtopicContentViewer;
