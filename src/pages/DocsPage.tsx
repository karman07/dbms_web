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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentation Management</h1>
          <p className="text-gray-500 mt-1">
            Manage documentation topics and subtopics
          </p>
        </div>
        <Button onClick={() => setIsTopicModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Topic
        </Button>
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first documentation topic</p>
          <Button onClick={() => setIsTopicModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create First Topic
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => {
            const isExpanded = expandedTopics.has(topic._id);
            
            return (
              <div
                key={topic._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow border-l-4 border-blue-500"
              >
                {/* Topic Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTopicExpanded(topic._id)}
                        className="mt-1 text-indigo-500 hover:text-indigo-700 flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {topic.topic || topic.name || 'Untitled Topic'}
                          </h3>
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{topic.course || 'dbms'}</Badge>
                          <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                            {topic.subtopics?.length || 0} subtopic{(topic.subtopics?.length || 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Created {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddSubtopicModal(topic)}
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subtopic
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm({ type: 'topic', topicId: topic._id })}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Subtopics List */}
                {isExpanded && topic.subtopics && topic.subtopics.length > 0 && (
                  <div className="border-t border-gray-200 bg-slate-50">
                    <div className="p-5">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Subtopics:</h4>
                      <div className="space-y-2">
                        {topic.subtopics.map((subtopic, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 transition-colors hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-indigo-50 rounded-lg">
                                <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">{subtopic.name}</p>
                                <p className="text-xs text-gray-500">{subtopic.filename}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openContentViewer(topic, index)}
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(topic._id, subtopic.name)}
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadSubtopic(topic._id, subtopic.name, subtopic.filename)}
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              >
                                <Download className="h-4 w-4" />
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
                                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isExpanded && (!topic.subtopics || topic.subtopics.length === 0) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-500 text-center">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {deleteConfirm.type === 'topic'
                    ? 'This will delete the topic and all its subtopics permanently.'
                    : 'This will delete the subtopic permanently.'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="border-gray-200 text-gray-700 hover:bg-gray-50">
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
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsPage;