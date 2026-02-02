import { useState, useEffect } from 'react';
import { classActivityAPI } from '@/utils/api';
import { ClassActivity } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Modal from '@/components/ui/modal';
import MarkdownEditor from '@/components/ui/markdown-editor';
import { Activity, Unlink, Edit, Trash2, Plus, Clock } from 'lucide-react';

interface ClassActivityFormData {
  title: string;
  description: string;
  content: string;
  duration: number;
  linkedLessonId: string;
}

interface ClassActivityManagerProps {
  lessonOptions?: Array<{ value: string; label: string }>;
}

const ClassActivityManager = ({ lessonOptions = [] }: ClassActivityManagerProps) => {
  const [activities, setActivities] = useState<ClassActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ClassActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClassActivityFormData>({
    title: '',
    description: '',
    content: '',
    duration: 60,
    linkedLessonId: '',
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const data = await classActivityAPI.getAllClassActivitiesAdmin();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load class activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('duration', formData.duration.toString());
      if (formData.linkedLessonId) {
        formDataToSend.append('linkedLessonId', formData.linkedLessonId);
      }

      if (selectedActivity) {
        await classActivityAPI.updateClassActivity(selectedActivity._id, formDataToSend);
      } else {
        await classActivityAPI.createClassActivity(formDataToSend);
      }
      await loadActivities();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save class activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class activity?')) return;
    try {
      await classActivityAPI.deleteClassActivity(id);
      await loadActivities();
    } catch (error) {
      console.error('Failed to delete class activity:', error);
    }
  };

  const handleEdit = (activity: ClassActivity) => {
    setSelectedActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      content: activity.content || '',
      duration: activity.duration || 60,
      linkedLessonId: activity.linkedLessonId || '',
    });
    setIsModalOpen(true);
  };

  const handleLinkLesson = async (activityId: string, lessonId: string) => {
    try {
      await classActivityAPI.linkActivityToLesson(activityId, lessonId);
      await loadActivities();
    } catch (error) {
      console.error('Failed to link lesson:', error);
    }
  };

  const handleUnlinkLesson = async (activityId: string) => {
    if (!confirm('Are you sure you want to unlink this activity from the lesson?')) return;
    try {
      await classActivityAPI.unlinkActivityFromLesson(activityId);
      await loadActivities();
    } catch (error) {
      console.error('Failed to unlink lesson:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      duration: 60,
      linkedLessonId: '',
    });
    setSelectedActivity(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Class Activity Management</h2>
          <p className="text-gray-500 mt-1">Create and manage interactive class activities</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Activity
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {activities.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg font-medium">No class activities yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first class activity to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity._id} className="p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ring-1 ring-blue-50 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{activity.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                  </div>
                </div>
                
                {activity.duration && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg w-fit">
                    <Clock className="h-4 w-4 text-white" />
                    <span className="text-xs text-white font-medium">
                      {activity.duration} minutes
                    </span>
                  </div>
                )}
                
               
                
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(activity)}
                    className="flex-1 min-w-[80px]"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(activity._id)}
                    className="flex-1 min-w-[80px] text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  {lessonOptions.length > 0 && (
                    <div className="w-full flex flex-col gap-2 bg-gray-50 p-2 rounded-md">
                      <select
                        className="w-full text-sm px-3 py-2 border rounded-md hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handleLinkLesson(activity._id, val);
                          } else if (activity.linkedLessonId) {
                            handleUnlinkLesson(activity._id);
                          }
                        }}
                        value={activity.lessonId || activity.linkedLessonId || ''}
                      >
                        <option value="">🔗 Link to Lesson...</option>
                        {lessonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {activity.linkedLessonId && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUnlinkLesson(activity._id)}
                          className="w-full text-orange-700 bg-orange-50 hover:bg-orange-100"
                        >
                          <Unlink className="h-3 w-3 mr-1" />
                          Unlink from Lesson
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedActivity ? 'Edit Class Activity' : 'Create Class Activity'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
              min="1"
            />
          </div>

          {lessonOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Linked Lesson (Optional)</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.linkedLessonId}
                onChange={(e) => setFormData({ ...formData, linkedLessonId: e.target.value })}
              >
                <option value="">Select Lesson</option>
                {lessonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Write the class activity content in Markdown..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : selectedActivity ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassActivityManager;
