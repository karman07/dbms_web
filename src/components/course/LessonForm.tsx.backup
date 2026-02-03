import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Video, Link as LinkIcon, Paperclip, Activity, Brain, BookOpen, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import Modal from '../ui/modal';
import MarkdownEditor from '../ui/markdown-editor';
import { Lesson, Assignment, ClassActivity, Quiz, DocTopic, DocSubtopic } from '../../types';
import { assignmentAPI, classActivityAPI, quizAPI, docsAPI } from '../../utils/api';

interface LessonFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  lesson?: Lesson;
  sectionIndex: number;
  lessonIndex?: number;
  mode: 'add' | 'edit';
}

const LessonForm: React.FC<LessonFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lesson,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order: 0,
    videoUrl: '',
    videoDescription: '',
    estimatedMinutes: 0,
    isPublished: false,
    docSubtopicId: '', // New field for doc subtopic selection
  });

  const [resources, setResources] = useState<string[]>([]);
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [resourcesModified, setResourcesModified] = useState(false); // Track if resources were changed
  
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [videoSource, setVideoSource] = useState<'url' | 'upload'>('url');
  const [contentSource, setContentSource] = useState<'manual' | 'doc'>('manual'); // New: content source selector

  // Doc subtopics
  const [docTopics, setDocTopics] = useState<DocTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [availableSubtopics, setAvailableSubtopics] = useState<DocSubtopic[]>([]);
  const [selectedSubtopicContent, setSelectedSubtopicContent] = useState('');
  const [showContentPreview, setShowContentPreview] = useState(false);

  // Preview modals
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [showAssignmentPreview, setShowAssignmentPreview] = useState(false);
  const [showActivityPreview, setShowActivityPreview] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);

  // Render markdown to HTML for preview
  const renderMarkdown = (markdown: string) => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
      // Inline code
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      // Blockquotes
      .replace(/^> (.*)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-gray-700 bg-blue-50">$1</blockquote>')
      // Unordered lists
      .replace(/^- (.*)$/gim, '<li class="ml-6 list-disc">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*)$/gim, '<li class="ml-6 list-decimal">$1</li>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="my-6 border-gray-300" />')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');

    return '<p class="mb-4">' + html + '</p>';
  };

  // Assignments, Activities, and Quizzes
  const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);
  const [availableActivities, setAvailableActivities] = useState<ClassActivity[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadAssignmentsAndActivities();
      loadDocTopics();
    }
    
    if (lesson && mode === 'edit') {
      setFormData({
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
        videoUrl: lesson.videoUrl || '',
        videoDescription: lesson.videoDescription || '',
        estimatedMinutes: lesson.estimatedMinutes || 0,
        isPublished: lesson.isPublished,
        docSubtopicId: lesson.docSubtopicId || '',
      });
      setResources(lesson.resources || []);
      if (lesson.videoUrl) {
        setVideoSource('url');
      }
      
      // Set content source based on whether doc subtopic is used
      if (lesson.docSubtopicId) {
        setContentSource('doc');
        // If lesson has a doc reference, try to load the topic to populate subtopics
        if (lesson.doc?.topicId) {
          setSelectedTopicId(lesson.doc.topicId);
        }
      } else {
        setContentSource('manual');
      }
      
      // Load linked items from lesson object (backend now provides these as arrays)
      if (lesson._id) {
        // Use the arrays directly from the lesson object if available
        setSelectedAssignments(lesson.linkedAssignmentIds || []);
        setSelectedActivities(lesson.linkedActivityIds || []);
        setSelectedQuizzes(lesson.linkedQuizIds || []);
      }
    } else {
      // Reset form for add mode
      setFormData({
        title: '',
        content: '',
        order: 0,
        videoUrl: '',
        videoDescription: '',
        estimatedMinutes: 0,
        isPublished: false,
        docSubtopicId: '',
      });
      setResources([]);
      setContentFile(null);
      setVideoFile(null);
      setResourceFiles([]);
      setResourcesModified(false);
      setSelectedAssignments([]);
      setSelectedActivities([]);
      setSelectedQuizzes([]);
      setContentSource('manual');
      setSelectedTopicId('');
      setAvailableSubtopics([]);
    }
  }, [lesson, mode, isOpen]);

  const loadAssignmentsAndActivities = async () => {
    try {
      const [assignments, activities, quizzes] = await Promise.all([
        assignmentAPI.getAllAssignmentsAdmin(),
        classActivityAPI.getAllClassActivitiesAdmin(),
        quizAPI.getAllQuizzesAdmin(),
      ]);
      setAvailableAssignments(assignments);
      setAvailableActivities(activities);
      setAvailableQuizzes(quizzes);
    } catch (error) {
      console.error('Failed to load assignments, activities, and quizzes:', error);
    }
  };

  const loadDocTopics = async () => {
    try {
      const topics = await docsAPI.getAllTopics();
      setDocTopics(Array.isArray(topics) ? topics : []);
    } catch (error) {
      console.error('Failed to load doc topics:', error);
      setDocTopics([]);
    }
  };

  const handleTopicChange = (topicId: string) => {
    setSelectedTopicId(topicId);
    setFormData({ ...formData, docSubtopicId: '', content: '' });
    setSelectedSubtopicContent('');
    
    if (topicId) {
      const topic = docTopics.find(t => t._id === topicId);
      setAvailableSubtopics(topic?.subtopics || []);
    } else {
      setAvailableSubtopics([]);
    }
  };

  const handleSubtopicChange = async (subtopicName: string) => {
    setFormData({ ...formData, docSubtopicId: subtopicName });
    
    if (subtopicName && selectedTopicId) {
      try {
        const response = await docsAPI.getSubtopicContent(selectedTopicId, subtopicName);
        const content = response.content || '';
        setSelectedSubtopicContent(content);
        setFormData({ ...formData, docSubtopicId: subtopicName, content });
      } catch (error) {
        console.error('Failed to load subtopic content:', error);
        setSelectedSubtopicContent('');
      }
    } else {
      setSelectedSubtopicContent('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('estimatedMinutes', formData.estimatedMinutes.toString());
      formDataToSend.append('isPublished', formData.isPublished.toString());

      // Content handling based on source
      if (contentSource === 'doc') {
        // When using doc subtopic, send only the subtopic ID
        // Backend will fetch/keep the content from the doc subtopic
        if (formData.docSubtopicId) {
          formDataToSend.append('docSubtopicId', formData.docSubtopicId);
        }
      } else {
        // Manual content - send the content directly
        if (formData.content) {
          formDataToSend.append('content', formData.content);
        } else if (contentFile) {
          formDataToSend.append('content', contentFile);
        }
      }

      // Video
      if (videoSource === 'upload' && videoFile) {
        formDataToSend.append('video', videoFile);
      } else if (videoSource === 'url' && formData.videoUrl) {
        formDataToSend.append('videoUrl', formData.videoUrl);
      }

      if (formData.videoDescription) {
        formDataToSend.append('videoDescription', formData.videoDescription);
      }

      // Resources - only send if they were modified or new files were added
      if (resourceFiles.length > 0) {
        resourceFiles.forEach((file) => {
          formDataToSend.append('resources', file);
        });
      } else if (resourcesModified && resources.length > 0) {
        formDataToSend.append('resources', JSON.stringify(resources));
      } else if (mode === 'add' && resources.length > 0) {
        // In add mode, always send resources if they exist
        formDataToSend.append('resources', JSON.stringify(resources));
      }

      // Note: Quiz is now managed separately through quiz management page
      // Linking happens after lesson is saved

      await onSubmit(formDataToSend);
      
      // After successful lesson creation/update, handle assignment, activity, and quiz linking
      // Note: We need the lessonId to link items. In edit mode we have it, in add mode we need to get it from the response
      // For now, we'll handle this after the lesson is created
      if (lesson?._id) {
        await handleLinkingUpdates(lesson._id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting lesson:', error);
      alert('Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkingUpdates = async (lessonId: string) => {
    try {
      // Get currently linked items by checking lessonId field in each resource
      const [currentAssignments, currentActivities, currentQuizzes] = await Promise.all([
        assignmentAPI.getAllAssignmentsAdmin(),
        classActivityAPI.getAllClassActivitiesAdmin(),
        quizAPI.getAllQuizzesAdmin(),
      ]);
      
      // Backend now uses 'lessonId' field, but we also check 'linkedLessonId' for backward compatibility
      const currentlyLinkedAssignments = currentAssignments
        .filter((a: Assignment) => a.lessonId === lessonId || a.linkedLessonId === lessonId)
        .map((a: Assignment) => a._id);
      const currentlyLinkedActivities = currentActivities
        .filter((a: ClassActivity) => a.lessonId === lessonId || a.linkedLessonId === lessonId)
        .map((a: ClassActivity) => a._id);
      const currentlyLinkedQuizzes = currentQuizzes
        .filter((q: Quiz) => q.lessonId === lessonId || q.linkedLessonId === lessonId)
        .map((q: Quiz) => q._id);
      
      // Determine what to link and unlink
      const assignmentsToLink = selectedAssignments.filter((id: string) => !currentlyLinkedAssignments.includes(id));
      const assignmentsToUnlink = currentlyLinkedAssignments.filter((id: string) => !selectedAssignments.includes(id));
      const activitiesToLink = selectedActivities.filter((id: string) => !currentlyLinkedActivities.includes(id));
      const activitiesToUnlink = currentlyLinkedActivities.filter((id: string) => !selectedActivities.includes(id));
      const quizzesToLink = selectedQuizzes.filter((id: string) => !currentlyLinkedQuizzes.includes(id));
      const quizzesToUnlink = currentlyLinkedQuizzes.filter((id: string) => !selectedQuizzes.includes(id));
      
      // Execute linking/unlinking operations
      // Backend now handles bidirectional sync automatically
      await Promise.all([
        ...assignmentsToLink.map((id: string) => assignmentAPI.linkAssignmentToLesson(id, lessonId)),
        ...assignmentsToUnlink.map((id: string) => assignmentAPI.unlinkAssignmentFromLesson(id)),
        ...activitiesToLink.map((id: string) => classActivityAPI.linkActivityToLesson(id, lessonId)),
        ...activitiesToUnlink.map((id: string) => classActivityAPI.unlinkActivityFromLesson(id)),
        ...quizzesToLink.map((id: string) => quizAPI.linkQuizToLesson(id, lessonId)),
        ...quizzesToUnlink.map((id: string) => quizAPI.unlinkQuizFromLesson(id)),
      ]);
    } catch (error) {
      console.error('Error updating links:', error);
    }
  };

  const addResourceUrl = () => {
    if (newResourceUrl.trim()) {
      setResources([...resources, newResourceUrl.trim()]);
      setNewResourceUrl('');
      setResourcesModified(true);
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
    setResourcesModified(true);
  };

  const removeResourceFile = (index: number) => {
    setResourceFiles(resourceFiles.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Add Lesson' : 'Edit Lesson'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Variables and Data Types"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <Input
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time (minutes)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                placeholder="30"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Publish this lesson</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Content</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={contentSource === 'manual'}
                  onChange={() => {
                    setContentSource('manual');
                    setFormData({ ...formData, docSubtopicId: '' });
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Write Content Manually</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={contentSource === 'doc'}
                  onChange={() => {
                    setContentSource('doc');
                    setFormData({ ...formData, content: '' });
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Link to Documentation
                </span>
              </label>
            </div>

            {contentSource === 'manual' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Content <span className="text-red-500">*</span>
                </label>
                <MarkdownEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your lesson content here. Use the toolbar to format your text..."
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Topic <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={contentSource === 'doc'}
                  >
                    <option value="">Select a documentation topic...</option>
                    {docTopics.map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {topic.topic || topic.name} ({topic.course || 'dbms'})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTopicId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Subtopic <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.docSubtopicId}
                      onChange={(e) => handleSubtopicChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={contentSource === 'doc'}
                    >
                      <option value="">Select a subtopic...</option>
                      {availableSubtopics.map((subtopic, index) => (
                        <option key={index} value={subtopic.name}>
                          {subtopic.name} ({subtopic.filename})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedSubtopicContent && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-blue-900">Content Preview</h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowContentPreview(true)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        View Full Content
                      </Button>
                    </div>
                    <div className="bg-white rounded p-3 max-h-40 overflow-y-auto text-sm text-gray-700 border border-blue-100">
                      {selectedSubtopicContent.substring(0, 300)}
                      {selectedSubtopicContent.length > 300 && '...'}
                    </div>
                  </div>
                )}

                {!selectedTopicId && (
                  <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Select a documentation topic to see available subtopics. Create topics in the Documentation Management page.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Video */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Video (Optional)</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={videoSource === 'url'}
                  onChange={() => setVideoSource('url')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Video URL (YouTube, etc.)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={videoSource === 'upload'}
                  onChange={() => setVideoSource('upload')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Upload Video File</span>
              </label>
            </div>

            {videoSource === 'url' ? (
              <Input
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                type="url"
              />
            ) : (
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <Video className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {videoFile ? videoFile.name : 'Click to upload video (.mp4, .webm)'}
                    </span>
                  </div>
                </label>
                {videoFile && (
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove video file
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Description
              </label>
              <Textarea
                value={formData.videoDescription}
                onChange={(e) => setFormData({ ...formData, videoDescription: e.target.value })}
                placeholder="Brief description of the video content..."
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Resources (Optional)</h3>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                placeholder="https://example.com/resource.pdf"
                type="url"
              />
              <Button type="button" onClick={addResourceUrl} variant="outline">
                <LinkIcon className="h-4 w-4 mr-2" />
                Add URL
              </Button>
            </div>

            {resources.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Resource URLs:</p>
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700 truncate">{resource}</span>
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.zip,.doc,.docx"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setResourceFiles([...resourceFiles, ...files]);
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Upload resource files (.pdf, .zip, .doc)
                  </span>
                </div>
              </label>
            </div>

            {resourceFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                {resourceFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeResourceFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignments, Activities & Quizzes Linking */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Link Assignments, Activities & Quizzes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Assignments */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">Assignments</label>
              </div>
              <select
                multiple
                value={selectedAssignments}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedAssignments(options);
                }}
                className="w-full min-h-[200px] px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                size={8}
              >
                {availableAssignments.length === 0 ? (
                  <option disabled>No assignments available</option>
                ) : (
                  availableAssignments.map((assignment) => (
                    <option 
                      key={assignment._id} 
                      value={assignment._id}
                      className="py-2"
                    >
                      {assignment.title}
                      {assignment.linkedLessonId && assignment.linkedLessonId !== lesson?._id ? ' (Linked to another lesson)' : ''}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple • {selectedAssignments.length} selected
              </p>
              {selectedAssignments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedAssignments.map(assignmentId => {
                    const assignment = availableAssignments.find(a => a._id === assignmentId);
                    if (!assignment) return null;
                    return (
                      <Button
                        key={assignmentId}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewItem(assignment);
                          setShowAssignmentPreview(true);
                        }}
                        className="text-xs"
                      >
                        👁️ Preview: {assignment.title}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">Class Activities</label>
              </div>
              <select
                multiple
                value={selectedActivities}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedActivities(options);
                }}
                className="w-full min-h-[200px] px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                size={8}
              >
                {availableActivities.length === 0 ? (
                  <option disabled>No activities available</option>
                ) : (
                  availableActivities.map((activity) => (
                    <option 
                      key={activity._id} 
                      value={activity._id}
                      className="py-2"
                    >
                      {activity.title}
                      {activity.duration ? ` (${activity.duration} min)` : ''}
                      {activity.linkedLessonId && activity.linkedLessonId !== lesson?._id ? ' - Linked to another lesson' : ''}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple • {selectedActivities.length} selected
              </p>
              {selectedActivities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedActivities.map(activityId => {
                    const activity = availableActivities.find(a => a._id === activityId);
                    if (!activity) return null;
                    return (
                      <Button
                        key={activityId}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewItem(activity);
                          setShowActivityPreview(true);
                        }}
                        className="text-xs"
                      >
                        👁️ Preview: {activity.title}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quizzes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">Quizzes</label>
              </div>
              <select
                multiple
                value={selectedQuizzes}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedQuizzes(options);
                }}
                className="w-full min-h-[200px] px-3 py-2 border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                size={8}
              >
                {availableQuizzes.length === 0 ? (
                  <option disabled>No quizzes available</option>
                ) : (
                  availableQuizzes.map((quiz) => (
                    <option 
                      key={quiz._id} 
                      value={quiz._id}
                      className="py-2"
                    >
                      {quiz.title}
                      {quiz.questions?.length ? ` (${quiz.questions.length} questions)` : ''}
                      {quiz.linkedLessonId && quiz.linkedLessonId !== lesson?._id ? ' - Linked to another lesson' : ''}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500">
                Hold Ctrl/Cmd to select multiple • {selectedQuizzes.length} selected
              </p>
              {selectedQuizzes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedQuizzes.map(quizId => {
                    const quiz = availableQuizzes.find(q => q._id === quizId);
                    if (!quiz) return null;
                    return (
                      <Button
                        key={quizId}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewItem(quiz);
                          setShowQuizPreview(true);
                        }}
                        className="text-xs"
                      >
                        👁️ Preview: {quiz.title}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 bg-blue-50 border border-blue-200 rounded p-2">
            💡 Tip: Create and manage quizzes from the Quiz page, then link them to lessons here
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'add' ? 'Add Lesson' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Content Preview Modal */}
      {showContentPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowContentPreview(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Content Preview
              </h3>
              <button
                onClick={() => setShowContentPreview(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div 
                className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-red-600"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedSubtopicContent) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quiz Preview Modal */}
      {showQuizPreview && previewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowQuizPreview(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Quiz Preview
              </h3>
              <button
                onClick={() => setShowQuizPreview(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{previewItem.title}</h4>
                {previewItem.description && (
                  <p className="text-gray-600 mt-2">{previewItem.description}</p>
                )}
              </div>
              <div className="flex gap-4 flex-wrap">
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  {previewItem.questions?.length || 0} Questions
                </Badge>
                {previewItem.passingScore && (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    Passing Score: {previewItem.passingScore}%
                  </Badge>
                )}
                {previewItem.timeLimit && (
                  <Badge className="bg-orange-100 text-orange-700 border-0">
                    Time Limit: {previewItem.timeLimit} min
                  </Badge>
                )}
              </div>
              {previewItem.questions && previewItem.questions.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h5 className="font-semibold text-lg text-gray-900">Questions:</h5>
                  {previewItem.questions.map((q: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-900 mb-2">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-1 ml-4">
                        {q.options?.map((opt: any, optIdx: number) => (
                          <div 
                            key={optIdx} 
                            className={`p-2 rounded ${opt.isCorrect ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'}`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt.text}
                            {opt.isCorrect && <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Preview Modal */}
      {showAssignmentPreview && previewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAssignmentPreview(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Paperclip className="h-6 w-6" />
                Assignment Preview
              </h3>
              <button
                onClick={() => setShowAssignmentPreview(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{previewItem.title}</h4>
                {previewItem.description && (
                  <p className="text-gray-600 mt-2">{previewItem.description}</p>
                )}
              </div>
              {previewItem.dueDate && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5" />
                  <span>Due: {new Date(previewItem.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {previewItem.content && (
                <div className="mt-6">
                  <h5 className="font-semibold text-lg text-gray-900 mb-3">Content:</h5>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {previewItem.content}
                  </div>
                </div>
              )}
              {previewItem.file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700">Attached File: {previewItem.file}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Class Activity Preview Modal */}
      {showActivityPreview && previewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowActivityPreview(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Class Activity Preview
              </h3>
              <button
                onClick={() => setShowActivityPreview(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{previewItem.title}</h4>
                {previewItem.description && (
                  <p className="text-gray-600 mt-2">{previewItem.description}</p>
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                {previewItem.duration && (
                  <Badge className="bg-blue-100 text-blue-700 border-0">
                    Duration: {previewItem.duration} min
                  </Badge>
                )}
                {previewItem.activityType && (
                  <Badge className="bg-purple-100 text-purple-700 border-0">
                    Type: {previewItem.activityType}
                  </Badge>
                )}
              </div>
              {previewItem.content && (
                <div className="mt-6">
                  <h5 className="font-semibold text-lg text-gray-900 mb-3">Activity Instructions:</h5>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {previewItem.content}
                  </div>
                </div>
              )}
              {previewItem.file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700">Attached File: {previewItem.file}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LessonForm;
