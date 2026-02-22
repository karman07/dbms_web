import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
      const subtopicContent = response.content || response.data?.content || '';
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

  const renderMarkdown = (markdown: string) => {
    let html = markdown;

    // Simple markdown conversion
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 mt-10 mb-6">$1</h1>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm leading-relaxed">$1</code>');
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={topicName} size="xl">
      <div className="flex flex-col h-[70vh]">
        {/* Simple Header */}
        <div className="flex items-center justify-between pb-6 border-b mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {currentSubtopic?.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] font-bold">
                  Unit {currentIndex + 1} of {subtopics.length}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg p-1 bg-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-xs font-bold text-slate-600">
                {currentIndex + 1} / {subtopics.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                disabled={currentIndex === subtopics.length - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-400 text-sm font-medium">Loading...</p>
            </div>
          ) : (
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubtopicContentViewer;
