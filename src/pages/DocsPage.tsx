import { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Eye,
  Download,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Edit,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import TopicModal from '../components/docs/TopicModal';
import SubtopicModal from '../components/docs/SubtopicModal';
import SubtopicContentViewer from '../components/docs/SubtopicContentViewer';
import EditSubtopicModal from '../components/docs/EditSubtopicModal';
import { docsAPI } from '../utils/api';
import { DocTopic } from '../types';


const DocsPage = () => {
  const [topics, setTopics] = useState<DocTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Modals
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false);
  const [isContentViewerOpen, setIsContentViewerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<DocTopic | null>(null);
  const [selectedSubtopicIndex, setSelectedSubtopicIndex] = useState(0);
  const [editingSubtopic, setEditingSubtopic] = useState<{ topicId: string; name: string; content: string } | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'topic' | 'subtopic';
    topicId: string;
    subtopicName?: string;
  } | null>(null);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const response = await docsAPI.getAllTopics();
      // API returns array directly
      console.log('API Response:', response);
      setTopics(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (formData: FormData) => {
    try {
      await docsAPI.createTopic(formData);
      await loadTopics();
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await docsAPI.deleteTopic(topicId);
      await loadTopics();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to delete topic. Please try again.');
    }
  };

  const handleAddSubtopic = async (topicId: string, formData: FormData) => {
    try {
      await docsAPI.addSubtopic(topicId, formData);
      await loadTopics();
    } catch (error) {
      console.error('Error adding subtopic:', error);
      throw error;
    }
  };

  const handleDeleteSubtopic = async (topicId: string, subtopicName: string) => {
    try {
      await docsAPI.deleteSubtopic(topicId, subtopicName);
      await loadTopics();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting subtopic:', error);
      alert('Failed to delete subtopic. Please try again.');
    }
  };

  const handleDownloadSubtopic = async (topicId: string, subtopicName: string, filename: string) => {
    try {
      const response = await docsAPI.downloadSubtopic(topicId, subtopicName);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading subtopic:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const toggleTopicExpanded = async (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
      // Load subtopics if not already loaded
      const topic = topics.find(t => t._id === topicId);
      if (topic && (!topic.subtopics || topic.subtopics.length === 0)) {
        try {
          const response = await docsAPI.getTopicSubtopics(topicId);
          // API returns subtopics array or object with subtopics field
          const subtopicsData = response.subtopics || response.data?.subtopics || response || [];
          // Update the topic with subtopics
          setTopics(topics.map(t =>
            t._id === topicId
              ? { ...t, subtopics: Array.isArray(subtopicsData) ? subtopicsData : [] }
              : t
          ));
        } catch (error) {
          console.error('Error loading subtopics:', error);
        }
      }
    }
    setExpandedTopics(newExpanded);
  };

  const openContentViewer = (topic: DocTopic, subtopicIndex: number) => {
    setSelectedTopic(topic);
    setSelectedSubtopicIndex(subtopicIndex);
    setIsContentViewerOpen(true);
  };

  const openAddSubtopicModal = (topic: DocTopic) => {
    setSelectedTopic(topic);
    setIsSubtopicModalOpen(true);
  };

  const openEditModal = async (topicId: string, subtopicName: string) => {
    try {
      const response = await docsAPI.getSubtopicContent(topicId, subtopicName);
      const content = response.content || response.data?.content || response || '';
      setEditingSubtopic({ topicId, name: subtopicName, content });
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error loading content for edit:', error);
      alert('Failed to load content for editing.');
    }
  };

  const handleUpdateSubtopic = async (topicId: string, subtopicName: string, newName?: string, content?: string) => {
    try {
      const formData = new FormData();
      if (newName) formData.append('newName', newName);
      if (content) {
        const blob = new Blob([content], { type: 'text/markdown' });
        formData.append('file', blob, `${newName || subtopicName}.md`);
      }

      await docsAPI.updateSubtopic(topicId, subtopicName, formData);
      await loadTopics();
    } catch (error) {
      console.error('Error updating subtopic:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading documentation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Documentation Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Create, organize and manage your documentation topics and content
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Documentation Topics</h3>
                  <p className="text-sm text-gray-600">{topics.length} topic{topics.length !== 1 ? 's' : ''} available</p>
                </div>
              </div>
              <Button
                onClick={() => setIsTopicModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Topic
              </Button>
            </div>
          </div>
        </div>

        {/* Topics List */}
        {topics.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No documentation topics yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first documentation topic. You can add subtopics and organize your content effectively.
            </p>
            <Button
              onClick={() => setIsTopicModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Topic
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {topics.map((topic) => {
              const isExpanded = expandedTopics.has(topic._id);

              return (
                <div
                  key={topic._id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Topic Header */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-blue-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <button
                          onClick={() => toggleTopicExpanded(topic._id)}
                          className="mt-1 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-xl font-bold text-gray-900">
                              {topic.topic || topic.name || 'Untitled Topic'}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge className="font-black uppercase tracking-widest text-[10px] px-3 py-1">
                                {topic.course || 'dbms'}
                              </Badge>
                              <Badge variant="outline" className="border-blue-100 text-blue-600 font-bold text-[11px] px-3 py-1 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                {topic.subtopics?.length || 0} Units
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Created {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAddSubtopicModal(topic)}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subtopic
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'topic', topicId: topic._id })}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Subtopics List */}
                  {isExpanded && topic.subtopics && topic.subtopics.length > 0 && (
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Subtopics
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {topic.subtopics.map((subtopic, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-br from-white to-blue-50/30 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-gray-900 truncate">{subtopic.name}</h5>
                                  <p className="text-xs text-gray-500 mt-1">{subtopic.filename}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openContentViewer(topic, index)}
                                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(topic._id, subtopic.name)}
                                className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadSubtopic(topic._id, subtopic.name, subtopic.filename)}
                                className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'subtopic',
                                    topicId: topic._id,
                                    subtopicName: subtopic.name,
                                  })
                                }
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && (!topic.subtopics || topic.subtopics.length === 0) && (
                    <div className="p-6 text-center">
                      <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        No subtopics yet. Click "Add Subtopic" to get started.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Topic Modal */}
        <TopicModal
          isOpen={isTopicModalOpen}
          onClose={() => setIsTopicModalOpen(false)}
          onSubmit={handleCreateTopic}
        />

        {/* Add Subtopic Modal */}
        {selectedTopic && (
          <SubtopicModal
            isOpen={isSubtopicModalOpen}
            onClose={() => {
              setIsSubtopicModalOpen(false);
              setSelectedTopic(null);
            }}
            onSubmit={handleAddSubtopic}
            topicId={selectedTopic._id}
            topicName={selectedTopic.topic || selectedTopic.name || 'Documentation'}
          />
        )}

        {/* Content Viewer */}
        {selectedTopic && selectedTopic.subtopics && selectedTopic.subtopics.length > 0 && (
          <SubtopicContentViewer
            isOpen={isContentViewerOpen}
            onClose={() => {
              setIsContentViewerOpen(false);
              setSelectedTopic(null);
              setSelectedSubtopicIndex(0);
            }}
            topicId={selectedTopic._id}
            topicName={selectedTopic.topic || selectedTopic.name || 'Documentation'}
            subtopics={selectedTopic.subtopics}
            initialSubtopicIndex={selectedSubtopicIndex}
          />
        )}

        {/* Edit Subtopic Modal */}
        {editingSubtopic && (
          <EditSubtopicModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingSubtopic(null);
            }}
            onUpdate={handleUpdateSubtopic}
            topicId={editingSubtopic.topicId}
            subtopicName={editingSubtopic.name}
            initialContent={editingSubtopic.content}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                  <p className="text-gray-600 mt-1">
                    {deleteConfirm.type === 'topic'
                      ? 'This will delete the topic and all its subtopics permanently.'
                      : 'This will delete the subtopic permanently.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (deleteConfirm.type === 'topic') {
                      handleDeleteTopic(deleteConfirm.topicId);
                    } else if (deleteConfirm.subtopicName) {
                      handleDeleteSubtopic(deleteConfirm.topicId, deleteConfirm.subtopicName);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsPage;