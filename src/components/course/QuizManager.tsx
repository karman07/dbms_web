import { useState, useEffect } from 'react';
import { quizAPI } from '@/utils/api';
import { Quiz } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Brain, Edit, Trash2, Plus, Eye } from 'lucide-react';
import QuizViewer from './QuizViewer';
import Modal from '@/components/ui/modal';
import QuizBuilder from './QuizBuilder';

interface QuizManagerProps {
  lessonOptions?: Array<{ value: string; label: string }>;
}

const QuizManager = ({ lessonOptions = [] }: QuizManagerProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    linkedLessonId: '',
  });
  const [questions, setQuestions] = useState<any[]>([]);
  console.log(lessonOptions);
  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await quizAPI.getAllQuizzesAdmin();
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const quizData = {
        title: formData.title,
        questions,
        linkedLessonId: formData.linkedLessonId || undefined,
      } as any;

      if (selectedQuiz) {
        await quizAPI.updateQuiz(selectedQuiz._id, quizData);
      } else {
        await quizAPI.createQuiz(quizData);
      }
      await loadQuizzes();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await quizAPI.deleteQuiz(id);
      await loadQuizzes();
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setFormData({ title: quiz.title || '', linkedLessonId: quiz.linkedLessonId || '' });
    setQuestions(quiz.questions || []);
    setIsModalOpen(true);
  };

  const handleView = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsViewModalOpen(true);
  };

  // const handleLinkLesson = async (quizId: string, lessonId: string) => {
  //   try {
  //     await quizAPI.linkQuizToLesson(quizId, lessonId);
  //     await loadQuizzes();
  //   } catch (error) {
  //     console.error('Failed to link lesson:', error);
  //   }
  // };

  // const handleUnlinkLesson = async (quizId: string) => {
  //   if (!confirm('Are you sure you want to unlink this quiz from the lesson?')) return;
  //   try {
  //     await quizAPI.unlinkQuizFromLesson(quizId);
  //     await loadQuizzes();
  //   } catch (error) {
  //     console.error('Failed to unlink lesson:', error);
  //   }
  // };

  const resetForm = () => {
    setFormData({ title: '', linkedLessonId: '' });
    setQuestions([]);
    setSelectedQuiz(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quiz Management</h2>
          <p className="text-gray-500 mt-1">Create and manage quizzes for your course</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {quizzes.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg font-medium">No quizzes yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first quiz to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz._id} className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{quiz.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 text-xs font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    {quiz.questions?.length || 0} Questions
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(quiz)}
                    className="flex-1 min-w-[80px] border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(quiz)}
                    className="flex-1 min-w-[80px] border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(quiz._id)}
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
                            handleLinkLesson(quiz._id, val);
                          } else if (quiz.linkedLessonId) {
                            handleUnlinkLesson(quiz._id);
                          }
                        }}
                        value={quiz.lessonId || quiz.linkedLessonId || ''}
                      >
                        <option value="">🔗 Link to Lesson...</option>
                        {lessonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {quiz.linkedLessonId && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUnlinkLesson(quiz._id)}
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedQuiz ? 'Edit Quiz' : 'Create Quiz'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quiz Title</label>
              <Input
                type="text"
                value={(formData as any).title}
                onChange={(e) => setFormData({ ...(formData as any), title: e.target.value })}
                placeholder="e.g., DBMS Fundamentals Quiz"
                required
              />
            </div>
          </div>

          {/* Quiz Questions */}
          <div className="border-t pt-4">
            <QuizBuilder quiz={questions} onChange={setQuestions} />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-blue-200 text-blue-600 hover:bg-blue-50">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || questions.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? 'Saving...' : selectedQuiz ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quiz View Modal */}
      <QuizViewer
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedQuiz(null);
        }}
        quiz={selectedQuiz}
      />
    </div>
  );
};

export default QuizManager;
