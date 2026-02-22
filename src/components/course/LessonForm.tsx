import React, { useState, useEffect } from 'react';
import { Video, FileText, Plus, Trash2, Link as LinkIcon, Brain, ClipboardList, Activity, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import Modal from '../ui/modal';
import MediaPicker from './MediaPicker';
import DocSubtopicPicker from './DocSubtopicPicker';
import { Lesson, Quiz, Assignment, ClassActivity } from '../../types';
import { mediaAPI, docsAPI, quizAPI, assignmentAPI, classActivityAPI } from '../../utils/api';

interface LessonFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  lesson?: Lesson;
  sectionIndex: number;
  lessonIndex?: number;
  mode: 'add' | 'edit';
}

interface MediaItem {
  _id: string;
  title: string;
  type: 'video' | 'image' | 'document';
  thumbnailUrl?: string;
}

interface SubtopicItem {
  id: string;
  topicTitle: string;
  subtopicName: string;
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
    priority: 0,
    estimatedMinutes: 0,
    isPublished: false,
  });

  // Media and Doc subtopics
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [subtopicItems, setSubtopicItems] = useState<SubtopicItem[]>([]);

  // Resources (URLs)
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');

  // Linked Items
  const [linkedQuizIds, setLinkedQuizIds] = useState<string[]>([]);
  const [linkedAssignmentIds, setLinkedAssignmentIds] = useState<string[]>([]);
  const [linkedActivityIds, setLinkedActivityIds] = useState<string[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);
  const [availableActivities, setAvailableActivities] = useState<ClassActivity[]>([]);

  // Store all topics for ID lookups
  const [allTopics, setAllTopics] = useState<any[]>([]);

  // Modals
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [showQuizPicker, setShowQuizPicker] = useState(false);
  const [showAssignmentPicker, setShowAssignmentPicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLinkedItems();
    }

    if (lesson && mode === 'edit') {
      setFormData({
        title: lesson.title,
        priority: lesson.priority || 0,
        estimatedMinutes: lesson.estimatedMinutes || 0,
        isPublished: lesson.isPublished,
      });

      // Load arrays from lesson (parse if they're stringified or populated)
      const parseArrayField = (field: any, extractId = false) => {
        if (!field) return [];
        if (Array.isArray(field)) {
          return field.map(item => {
            // If it's a populated object, extract the _id
            if (extractId && typeof item === 'object' && item !== null && item._id) {
              return item._id;
            }
            // If it's a string that looks like JSON, parse it
            if (typeof item === 'string' && (item.startsWith('[') || item.startsWith('"'))) {
              try {
                let parsed = item;
                while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                  parsed = JSON.parse(parsed);
                }
                return Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                return item;
              }
            }
            return item;
          }).flat();
        }
        return field;
      };

      const mediaIds = parseArrayField((lesson as any).mediaIds || (lesson as any).media, true);
      const docSubtopicIds = parseArrayField((lesson as any).docSubtopicIds || (lesson as any).docSubtopics, true);
      const resourceUrls = parseArrayField(lesson.resources);
      const quizIds = parseArrayField((lesson as any).linkedQuizIds || (lesson as any).linkedQuizzes, true);
      const assignmentIds = parseArrayField((lesson as any).linkedAssignmentIds || (lesson as any).linkedAssignments, true);
      const activityIds = parseArrayField((lesson as any).linkedActivityIds || (lesson as any).linkedActivities, true);

      setSelectedMediaIds(mediaIds);
      setSelectedSubtopicIds(docSubtopicIds);
      setResources(resourceUrls);
      setLinkedQuizIds(quizIds);
      setLinkedAssignmentIds(assignmentIds);
      setLinkedActivityIds(activityIds);

      // Load details
      if (mediaIds.length > 0) loadMediaDetails(mediaIds);
      if (docSubtopicIds.length > 0) loadSubtopicDetails(docSubtopicIds);
    } else {
      resetForm();
    }
  }, [lesson, mode, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      priority: 0,
      estimatedMinutes: 0,
      isPublished: false,
    });
    setSelectedMediaIds([]);
    setSelectedSubtopicIds([]);
    setMediaItems([]);
    setSubtopicItems([]);
    setResources([]);
    setLinkedQuizIds([]);
    setLinkedAssignmentIds([]);
    setLinkedActivityIds([]);
    setNewResource('');
  };

  const loadLinkedItems = async () => {
    try {
      const [quizzes, assignments, activities] = await Promise.all([
        quizAPI.getAllQuizzesAdmin(),
        assignmentAPI.getAllAssignmentsAdmin(),
        classActivityAPI.getAllClassActivitiesAdmin(),
      ]);
      setAvailableQuizzes(Array.isArray(quizzes) ? quizzes : []);
      setAvailableAssignments(Array.isArray(assignments) ? assignments : []);
      setAvailableActivities(Array.isArray(activities) ? activities : []);
    } catch (error) {
      console.error('Failed to load linked items:', error);
    }
  };

  const loadMediaDetails = async (mediaIds: string[]) => {
    try {
      const mediaPromises = mediaIds.map((id) => mediaAPI.getMediaById(id));
      const mediaData = await Promise.all(mediaPromises);
      setMediaItems(mediaData);
    } catch (error) {
      console.error('Failed to load media details:', error);
    }
  };

  const loadSubtopicDetails = async (subtopicIds: string[]) => {
    try {
      const items: SubtopicItem[] = [];
      const topics = await docsAPI.getAllTopics();
      setAllTopics(Array.isArray(topics) ? topics : []);

      for (const id of subtopicIds) {
        // Check if id contains colon (topicId:subtopicName format)
        if (id.includes(':')) {
          // Format: topicId:subtopicName (from picker)
          const [topicId, subtopicName] = id.split(':');
          const topic = Array.isArray(topics)
            ? topics.find((t: any) => t._id === topicId)
            : null;
          if (topic) {
            items.push({
              id,
              topicTitle: topic.title,
              subtopicName,
            });
          }
        } else {
          // Format: could be subtopic _id or subtopic name - search all topics
          if (Array.isArray(topics)) {
            for (const topic of topics) {
              if (topic.subtopics && Array.isArray(topic.subtopics)) {
                // Try to find by _id first
                let subtopic = topic.subtopics.find((s: any) => s._id === id);
                // If not found by _id, try by name
                if (!subtopic) {
                  subtopic = topic.subtopics.find((s: any) => s.name === id);
                }
                if (subtopic) {
                  const fullId = `${topic._id}:${subtopic.name}`;
                  items.push({
                    id: fullId,
                    topicTitle: topic.title,
                    subtopicName: subtopic.name,
                  });
                  // Update selectedSubtopicIds to use the full format
                  setSelectedSubtopicIds(prev => {
                    const newIds = prev.filter(prevId => prevId !== id);
                    newIds.push(fullId);
                    return newIds;
                  });
                  break;
                }
              }
            }
          }
        }
      }

      setSubtopicItems(items);
    } catch (error) {
      console.error('Failed to load subtopic details:', error);
    }
  };

  const handleMediaSelect = (mediaIds: string[]) => {
    setSelectedMediaIds(mediaIds);
    loadMediaDetails(mediaIds);
  };

  const handleSubtopicSelect = (subtopicIds: string[]) => {
    setSelectedSubtopicIds(subtopicIds);
    loadSubtopicDetails(subtopicIds);
  };

  const removeMedia = (mediaId: string) => {
    setSelectedMediaIds((prev) => prev.filter((id) => id !== mediaId));
    setMediaItems((prev) => prev.filter((item) => item._id !== mediaId));
  };

  const removeSubtopic = (subtopicId: string) => {
    setSelectedSubtopicIds((prev) => prev.filter((id) => id !== subtopicId));
    setSubtopicItems((prev) => prev.filter((item) => item.id !== subtopicId));
  };

  const addResource = () => {
    if (newResource.trim()) {
      setResources([...resources, newResource.trim()]);
      setNewResource('');
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const toggleLinkedQuiz = (quizId: string) => {
    setLinkedQuizIds((prev) =>
      prev.includes(quizId) ? prev.filter((id) => id !== quizId) : [...prev, quizId]
    );
  };

  const toggleLinkedAssignment = (assignmentId: string) => {
    setLinkedAssignmentIds((prev) =>
      prev.includes(assignmentId) ? prev.filter((id) => id !== assignmentId) : [...prev, assignmentId]
    );
  };

  const toggleLinkedActivity = (activityId: string) => {
    setLinkedActivityIds((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('priority', formData.priority.toString());
      formDataToSend.append('estimatedMinutes', formData.estimatedMinutes.toString());
      formDataToSend.append('isPublished', formData.isPublished.toString());

      if (selectedMediaIds.length > 0) {
        formDataToSend.append('mediaIds', JSON.stringify(selectedMediaIds));
      }

      if (selectedSubtopicIds.length > 0) {
        // Extract subtopic _ids from the topics structure
        const subtopicIds: string[] = [];
        for (const selectedId of selectedSubtopicIds) {
          const [topicId, subtopicName] = selectedId.split(':');
          const topic = allTopics.find((t: any) => t._id === topicId);
          if (topic && topic.subtopics) {
            const subtopic = topic.subtopics.find((s: any) => s.name === subtopicName);
            if (subtopic && subtopic._id) {
              subtopicIds.push(subtopic._id);
            }
          }
        }
        formDataToSend.append('docSubtopicIds', JSON.stringify(subtopicIds));
      }

      if (resources.length > 0) {
        formDataToSend.append('resources', JSON.stringify(resources));
      }

      if (linkedQuizIds.length > 0) {
        formDataToSend.append('linkedQuizIds', JSON.stringify(linkedQuizIds));
      }

      if (linkedAssignmentIds.length > 0) {
        formDataToSend.append('linkedAssignmentIds', JSON.stringify(linkedAssignmentIds));
      }

      if (linkedActivityIds.length > 0) {
        formDataToSend.append('linkedActivityIds', JSON.stringify(linkedActivityIds));
      }

      await onSubmit(formDataToSend);
      onClose();
    } catch (error) {
      console.error('Error submitting lesson:', error);
      alert('Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'edit' ? 'Edit Lesson' : 'Add New Lesson'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lesson Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to SQL"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Units Duration (minutes)
              </label>
              <Input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedMinutes: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Display Priority
              </label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
              />
            </div>
          </div>

          {/* Media Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                <Video className="w-4 h-4 inline mr-2" />
                Media (Videos, Images, Documents)
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowMediaPicker(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Media
              </Button>
            </div>

            {mediaItems.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 text-sm">
                No media selected
              </div>
            ) : (
              <div className="space-y-2">
                {mediaItems.map((media) => (
                  <div
                    key={media._id}
                    className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <div className="w-12 h-9 bg-slate-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                      {media.thumbnailUrl ? (
                        <img
                          src={media.thumbnailUrl}
                          alt={media.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {media.title}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {media.type}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeMedia(media._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documentation Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                <FileText className="w-4 h-4 inline mr-2" />
                Documentation References
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowDocPicker(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Documentation
              </Button>
            </div>

            {subtopicItems.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 text-sm">
                No documentation selected
              </div>
            ) : (
              <div className="space-y-2">
                {subtopicItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {item.subtopicName}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{item.topicTitle}</p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeSubtopic(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resources Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Resources (URLs)
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                type="url"
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder="https://example.com/resource"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
              />
              <Button type="button" size="sm" onClick={addResource}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {resources.length > 0 && (
              <div className="space-y-2">
                {resources.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <LinkIcon className="w-4 h-4 text-slate-400" />
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeResource(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Linked Quizzes */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                <Brain className="w-4 h-4 inline mr-2" />
                Linked Quizzes ({linkedQuizIds.length} selected)
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowQuizPicker(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Link Quiz
              </Button>
            </div>
            {linkedQuizIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedQuizIds.map((id) => {
                  const quiz = availableQuizzes.find((q) => q._id === id);
                  return quiz ? (
                    <Badge key={id} className="bg-indigo-100 text-indigo-700">
                      {quiz.title}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => toggleLinkedQuiz(id)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Linked Assignments */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                <ClipboardList className="w-4 h-4 inline mr-2" />
                Linked Assignments ({linkedAssignmentIds.length} selected)
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAssignmentPicker(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Link Assignment
              </Button>
            </div>
            {linkedAssignmentIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedAssignmentIds.map((id) => {
                  const assignment = availableAssignments.find((a) => a._id === id);
                  return assignment ? (
                    <Badge key={id} className="bg-orange-100 text-orange-700">
                      {assignment.title}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => toggleLinkedAssignment(id)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Linked Activities */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                <Activity className="w-4 h-4 inline mr-2" />
                Linked Class Activities ({linkedActivityIds.length} selected)
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowActivityPicker(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Link Activity
              </Button>
            </div>
            {linkedActivityIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linkedActivityIds.map((id) => {
                  const activity = availableActivities.find((a) => a._id === id);
                  return activity ? (
                    <Badge key={id} className="bg-cyan-100 text-cyan-700">
                      {activity.title}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => toggleLinkedActivity(id)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Published Status */}
          <div className="flex items-center gap-2 border-t pt-4">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) =>
                setFormData({ ...formData, isPublished: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">
              Published
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white pb-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Lesson' : 'Add Lesson'}
            </Button>
          </div>
        </form>
      </Modal>

      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        selectedIds={selectedMediaIds}
        multiple={true}
      />

      <DocSubtopicPicker
        isOpen={showDocPicker}
        onClose={() => setShowDocPicker(false)}
        onSelect={handleSubtopicSelect}
        selectedIds={selectedSubtopicIds}
        multiple={true}
      />

      {/* Quiz, Assignment & Activity Pickers - Simple Selection Modals */}
      <Modal isOpen={showQuizPicker} onClose={() => setShowQuizPicker(false)} title="Select Quizzes" size="lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              onClick={() => toggleLinkedQuiz(quiz._id)}
              className={`p-3 border rounded-lg cursor-pointer ${linkedQuizIds.includes(quiz._id) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}
            >
              <h4 className="font-medium">{quiz.title}</h4>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showAssignmentPicker} onClose={() => setShowAssignmentPicker(false)} title="Select Assignments" size="lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableAssignments.map((assignment) => (
            <div
              key={assignment._id}
              onClick={() => toggleLinkedAssignment(assignment._id)}
              className={`p-3 border rounded-lg cursor-pointer ${linkedAssignmentIds.includes(assignment._id) ? 'border-orange-600 bg-orange-50' : 'border-slate-300'}`}
            >
              <h4 className="font-medium">{assignment.title}</h4>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showActivityPicker} onClose={() => setShowActivityPicker(false)} title="Select Activities" size="lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableActivities.map((activity) => (
            <div
              key={activity._id}
              onClick={() => toggleLinkedActivity(activity._id)}
              className={`p-3 border rounded-lg cursor-pointer ${linkedActivityIds.includes(activity._id) ? 'border-cyan-600 bg-cyan-50' : 'border-slate-300'}`}
            >
              <h4 className="font-medium">{activity.title}</h4>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default LessonForm;
