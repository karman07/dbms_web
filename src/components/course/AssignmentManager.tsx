import { useState, useEffect } from 'react';
import { assignmentAPI } from '@/utils/api';
import { Assignment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Modal from '@/components/ui/modal';
import MarkdownEditor from '@/components/ui/markdown-editor';
import { FileText, Edit, Trash2, Plus, Eye } from 'lucide-react';
import SimpleViewer from './SimpleViewer';

interface AssignmentFormData {
  title: string;
  description: string;
  content: string;
  linkedLessonId: string;
}

interface AssignmentManagerProps {
  lessonOptions?: Array<{ value: string; label: string }>;
  searchQuery?: string;
}

const AssignmentManager = ({ lessonOptions = [], searchQuery = '' }: AssignmentManagerProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    content: '',
    linkedLessonId: '',
  });

  console.log(lessonOptions)
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

  const handleView = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsViewModalOpen(true);
  };

  // const handleLinkLesson = async (assignmentId: string, lessonId: string) => {
  //   try {
  //     await assignmentAPI.linkAssignmentToLesson(assignmentId, lessonId);
  //     await loadAssignments();
  //   } catch (error) {
  //     console.error('Failed to link lesson:', error);
  //   }
  // };

  // const handleUnlinkLesson = async (assignmentId: string) => {
  //   if (!confirm('Are you sure you want to unlink this assignment from the lesson?')) return;
  //   try {
  //     await assignmentAPI.unlinkAssignmentFromLesson(assignmentId);
  //     await loadAssignments();
  //   } catch (error) {
  //     console.error('Failed to unlink lesson:', error);
  //   }
  // };

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
          {assignments
            .filter(a =>
              a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((assignment) => (
              <Card key={assignment._id} className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{assignment.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(assignment)}
                      className="flex-1 min-w-[80px] border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(assignment)}
                      className="flex-1 min-w-[80px] border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(assignment._id)}
                      className="flex-1 min-w-[80px] border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                    {/* {lessonOptions.length > 0 && (
                    <div className="w-full flex flex-col gap-2">
                      <select
                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all duration-200"
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
                          className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                        >
                          <Unlink className="h-3 w-3 mr-1" />
                          Unlink from Lesson
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

      {/* View Modal */}
      {selectedAssignment && (
        <SimpleViewer
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedAssignment(null);
          }}
          title={selectedAssignment.title}
          description={selectedAssignment.description}
          content={selectedAssignment.content || ''}
          type="Assignment"
        />
      )}
    </div>
  );
};

export default AssignmentManager;
