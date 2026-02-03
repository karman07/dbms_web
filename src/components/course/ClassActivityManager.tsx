import { useState, useEffect } from 'react';
import { classActivityAPI } from '@/utils/api';
import { ClassActivity } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Modal from '@/components/ui/modal';
import MarkdownEditor from '@/components/ui/markdown-editor';
import { Activity,  Edit, Trash2, Plus} from 'lucide-react';

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


  console.log(lessonOptions)
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
          className="bg-blue-600 hover:bg-blue-700 shadow-md"
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
            <Card key={activity._id} className="group p-6 hover:shadow-2xl transition-all duration-300 border border-blue-100 bg-white hover:border-blue-300 shadow-sm hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{activity.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
                
             
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(activity)}
                    className="flex-1 min-w-[80px] border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-medium"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(activity._id)}
                    className="flex-1 min-w-[80px] border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                  {/* {lessonOptions.length > 0 && (
                    <div className="w-full flex flex-col gap-2">
                      <select
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all duration-200 font-medium"
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
                          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 font-medium"
                        >
                          <Unlink className="h-3.5 w-3.5 mr-1.5" />
                          Unlink Lesson
                        </Button>
                      )}
                    </div>
                  )} */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedActivity ? 'Edit Activity' : 'Create Activity'}>
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
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Write your activity content here..."
            />
          </div>
        
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : (selectedActivity ? 'Update Activity' : 'Create Activity')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassActivityManager;
