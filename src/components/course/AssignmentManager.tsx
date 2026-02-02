import { useState, useEffect } from 'react';
import { assignmentAPI } from '@/utils/api';
import { Assignment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Modal from '@/components/ui/modal';
import MarkdownEditor from '@/components/ui/markdown-editor';
import { FileText, Unlink, Edit, Trash2, Plus} from 'lucide-react';

interface AssignmentFormData {
  title: string;
  description: string;
  content: string;
  linkedLessonId: string;
}

interface AssignmentManagerProps {
  lessonOptions?: Array<{ value: string; label: string }>;
}

const AssignmentManager = ({ lessonOptions = [] }: AssignmentManagerProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    content: '',
    linkedLessonId: '',
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await assignmentAPI.getAllAssignmentsAdmin();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
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
      if (formData.linkedLessonId) {
        formDataToSend.append('linkedLessonId', formData.linkedLessonId);
      }

      if (selectedAssignment) {
        await assignmentAPI.updateAssignment(selectedAssignment._id, formDataToSend);
      } else {
        await assignmentAPI.createAssignment(formDataToSend);
      }
      await loadAssignments();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save assignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await assignmentAPI.deleteAssignment(id);
      await loadAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      content: assignment.content || '',
      linkedLessonId: assignment.linkedLessonId || '',
    });
    setIsModalOpen(true);
  };

  const handleLinkLesson = async (assignmentId: string, lessonId: string) => {
    try {
      await assignmentAPI.linkAssignmentToLesson(assignmentId, lessonId);
      await loadAssignments();
    } catch (error) {
      console.error('Failed to link lesson:', error);
    }
  };

  const handleUnlinkLesson = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to unlink this assignment from the lesson?')) return;
    try {
      await assignmentAPI.unlinkAssignmentFromLesson(assignmentId);
      await loadAssignments();
    } catch (error) {
      console.error('Failed to unlink lesson:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      linkedLessonId: '',
    });
    setSelectedAssignment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Assignment Management</h2>
          <p className="text-gray-500 mt-1">Create and manage course assignments</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {assignments.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg font-medium">No assignments yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first assignment to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment._id} className="p-5 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(assignment)}
                    className="flex-1 min-w-[80px]"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(assignment._id)}
                    className="flex-1 min-w-[80px] text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  {lessonOptions.length > 0 && (
                    <div className="w-full flex flex-col gap-2">
                      <select
                        className="w-full text-sm px-3 py-2 border rounded-md hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handleLinkLesson(assignment._id, val);
                          } else if (assignment.linkedLessonId) {
                            handleUnlinkLesson(assignment._id);
                          }
                        }}
                        value={assignment.lessonId || assignment.linkedLessonId || ''}
                      >
                        <option value="">🔗 Link to Lesson...</option>
                        {lessonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {assignment.linkedLessonId && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUnlinkLesson(assignment._id)}
                          className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAssignment ? 'Edit Assignment' : 'Create Assignment'}>
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
              placeholder="Write the assignment content in Markdown..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : selectedAssignment ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssignmentManager;
