import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  FileText,
  Video,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import Modal from '../components/ui/modal';
import SectionModal from '../components/course/SectionModal';
import LessonForm from '../components/course/LessonForm';
import { courseAPI } from '../utils/api';
import { Course, Section, Lesson } from '../types';

const CoursePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Course creation/edit modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    tags: '',
    isPublished: false,
  });

  // Section modals
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionMode, setSectionMode] = useState<'add' | 'edit'>('add');
  const [selectedSection, setSelectedSection] = useState<{ section: Section; index: number } | null>(null);

  // Lesson modals
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonMode, setLessonMode] = useState<'add' | 'edit'>('add');
  const [selectedLesson, setSelectedLesson] = useState<{
    lesson: Lesson;
    sectionIndex: number;
    lessonIndex: number;
  } | null>(null);
  const [lessonSectionIndex, setLessonSectionIndex] = useState<number>(0);

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.getCourse();
      setCourse(data);
      // Expand all sections by default
      if (data?.sections) {
        setExpandedSections(new Set(data.sections.map((s: Section) => s._id)));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No course exists yet
        setCourse(null);
      } else {
        console.error('Error loading course:', error);
        alert('Failed to load course data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = courseFormData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      const data = await courseAPI.createCourse({
        title: courseFormData.title,
        description: courseFormData.description,
        thumbnail: courseFormData.thumbnail || undefined,
        tags,
        isPublished: courseFormData.isPublished,
      });

      setCourse(data);
      setShowCourseModal(false);
      setCourseFormData({
        title: '',
        description: '',
        thumbnail: '',
        tags: '',
        isPublished: false,
      });
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  const handleUpdateCourse = async (field: string, value: any) => {
    if (!course) return;

    try {
      const updateData: any = {};
      
      if (field === 'isPublished') {
        updateData.isPublished = value;
      } else if (field === 'all') {
        updateData.title = value.title;
        updateData.description = value.description;
        updateData.thumbnail = value.thumbnail;
        updateData.tags = value.tags;
        updateData.isPublished = value.isPublished;
      }

      const data = await courseAPI.updateCourse(updateData);
      setCourse(data);
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const handleEditCourse = () => {
    if (!course) return;
    setCourseFormData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || '',
      tags: course.tags.join(', '),
      isPublished: course.isPublished,
    });
    setShowCourseModal(true);
  };

  const handleAddSection = async (data: { title: string; description?: string; order: number }) => {
    try {
      const updatedCourse = await courseAPI.addSection(data);
      setCourse(updatedCourse);
      // Expand the new section
      if (updatedCourse.sections.length > 0) {
        const newSection = updatedCourse.sections[updatedCourse.sections.length - 1];
        setExpandedSections(new Set([...expandedSections, newSection._id]));
      }
    } catch (error) {
      console.error('Error adding section:', error);
      throw error;
    }
  };

  const handleEditSection = async (data: { title: string; description?: string; order: number }) => {
    if (!selectedSection) return;

    try {
      const updatedCourse = await courseAPI.updateSection(selectedSection.index, data);
      setCourse(updatedCourse);
      setSelectedSection(null);
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  };

  const handleDeleteSection = async (sectionIndex: number) => {
    if (!confirm('Are you sure you want to delete this section and all its lessons?')) return;

    try {
      const updatedCourse = await courseAPI.deleteSection(sectionIndex);
      setCourse(updatedCourse);
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  const handleAddLesson = async (formData: FormData) => {
    try {
      const updatedCourse = await courseAPI.addLesson(lessonSectionIndex, formData);
      setCourse(updatedCourse);
    } catch (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  };

  const handleEditLesson = async (formData: FormData) => {
    if (!selectedLesson) return;

    try {
      const updatedCourse = await courseAPI.updateLesson(
        selectedLesson.sectionIndex,
        selectedLesson.lessonIndex,
        formData
      );
      setCourse(updatedCourse);
      setSelectedLesson(null);
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  };

  const handleDeleteLesson = async (sectionIndex: number, lessonIndex: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const updatedCourse = await courseAPI.deleteLesson(sectionIndex, lessonIndex);
      setCourse(updatedCourse);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading course data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Course Management
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Create and manage your course content
                </p>
              </div>
            </div>
          </div>

          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Course Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first course. You can add sections, lessons, and organize your content effectively.
            </p>
            <Button 
              onClick={() => setShowCourseModal(true)} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>

        <Modal
          isOpen={showCourseModal}
          onClose={() => setShowCourseModal(false)}
          title="Create Course"
          size="lg"
        >
          <form onSubmit={handleCreateCourse} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={courseFormData.title}
                onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                placeholder="Complete Web Development Course"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={courseFormData.description}
                onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                placeholder="Learn full-stack web development from scratch..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL
              </label>
              <Input
                type="url"
                value={courseFormData.thumbnail}
                onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={courseFormData.tags}
                onChange={(e) => setCourseFormData({ ...courseFormData, tags: e.target.value })}
                placeholder="web, javascript, react"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={courseFormData.isPublished}
                  onChange={(e) => setCourseFormData({ ...courseFormData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Publish immediately</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowCourseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Course</Button>
            </div>
          </form>
        </Modal>
        </div>
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
                Course Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage your course content, sections, and lessons
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Course Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-blue-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-gray-900">{course.title}</h2>
                    <Badge className={course.isPublished ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}>
                      {course.isPublished ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Draft
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-gray-700 text-lg mb-4">{course.description}</p>
                  
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1 bg-blue-100 rounded">
                        <Tag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: string, index: number) => (
                          <Badge key={index} className="bg-blue-100 text-blue-700 border-blue-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {course.thumbnail && (
                  <div className="ml-6">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-40 h-32 object-cover rounded-xl border-2 border-blue-200 shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Enrolled Students</p>
                      <p className="text-2xl font-bold text-gray-900">{course.enrolledCount}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-600 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Sections</p>
                      <p className="text-2xl font-bold text-gray-900">{course.sections.length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Lessons</p>
                      <p className="text-2xl font-bold text-gray-900">{course.sections.reduce((acc: number, s: Section) => acc + s.lessons.length, 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleEditCourse} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Button>
                <Button
                  className={course.isPublished ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'bg-green-600 hover:bg-green-700 text-white'}
                  variant={course.isPublished ? 'outline' : 'default'}
                  onClick={() => handleUpdateCourse('isPublished', !course.isPublished)}
                >
                  {course.isPublished ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setSectionMode('add');
                    setSelectedSection(null);
                    setShowSectionModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </div>
          </div>

      {/* Sections List */}
      <div className="space-y-4">
        {course.sections.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No sections yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Add your first section to start organizing your course content into structured lessons.
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              onClick={() => {
                setSectionMode('add');
                setShowSectionModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Section
            </Button>
          </div>
        ) : (
          course.sections.map((section: Section, sectionIndex: number) => (
            <div key={section._id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6 bg-gradient-to-r from-blue-50/30 to-slate-50/30 border-b border-blue-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="mt-1 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 flex-shrink-0"
                    >
                      {expandedSections.has(section._id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {sectionIndex + 1}. {section.title}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      {section.description && (
                        <p className="text-gray-600">{section.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setLessonMode('add');
                        setLessonSectionIndex(sectionIndex);
                        setSelectedLesson(null);
                        setShowLessonModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lesson
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 text-slate-600 hover:bg-slate-50"
                      onClick={() => {
                        setSectionMode('edit');
                        setSelectedSection({ section, index: sectionIndex });
                        setShowSectionModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSection(sectionIndex)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {expandedSections.has(section._id) && (
                <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30">
                  {section.lessons.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-blue-200">
                      <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 mb-4 font-medium">No lessons in this section yet.</p>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                        onClick={() => {
                          setLessonMode('add');
                          setLessonSectionIndex(sectionIndex);
                          setSelectedLesson(null);
                          setShowLessonModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Lesson
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {section.lessons.map((lesson: Lesson, lessonIndex: number) => {
                        const hasMedia = lesson.mediaIds && lesson.mediaIds.length > 0;
                        const hasDocs = lesson.docSubtopicIds && lesson.docSubtopicIds.length > 0;
                        const hasLinkedQuiz = lesson.linkedQuizIds && lesson.linkedQuizIds.length > 0;
                        const hasLinkedAssignment = lesson.linkedAssignmentIds && lesson.linkedAssignmentIds.length > 0;
                        const hasLinkedActivity = lesson.linkedActivityIds && lesson.linkedActivityIds.length > 0;
                        
                        return (
                        <div
                          key={lesson._id}
                          className="flex items-center justify-between p-4 bg-white hover:bg-blue-50/50 rounded-xl transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${hasMedia ? 'bg-purple-100' : hasDocs ? 'bg-blue-100' : 'bg-slate-100'}`}>
                              {hasMedia ? (
                                <Video className="h-5 w-5 text-purple-600" />
                              ) : hasDocs ? (
                                <FileText className="h-5 w-5 text-blue-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-slate-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-gray-900">
                                  {lessonIndex + 1}. {lesson.title}
                                </h4>
                                {lesson.isPublished ? (
                                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Published
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Draft
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                                {lesson.estimatedMinutes && lesson.estimatedMinutes > 0 && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-medium">{lesson.estimatedMinutes} min</span>
                                  </div>
                                )}
                                {hasMedia && (
                                  <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                                    <Video className="h-3 w-3 mr-1" />
                                    {lesson.mediaIds!.length} media
                                  </Badge>
                                )}
                                {hasDocs && (
                                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {lesson.docSubtopicIds!.length} doc{lesson.docSubtopicIds!.length > 1 ? 's' : ''}
                                  </Badge>
                                )}
                                {lesson.quiz && lesson.quiz.length > 0 && (
                                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                    {lesson.quiz.length} quiz questions
                                  </Badge>
                                )}
                                {hasLinkedQuiz && (
                                  <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
                                    {lesson.linkedQuizIds!.length} linked quiz
                                  </Badge>
                                )}
                                {hasLinkedAssignment && (
                                  <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                                    {lesson.linkedAssignmentIds!.length} assignment
                                  </Badge>
                                )}
                                {hasLinkedActivity && (
                                  <Badge className="bg-cyan-100 text-cyan-700 border-0 text-xs">
                                    {lesson.linkedActivityIds!.length} activity
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                setLessonMode('edit');
                                setSelectedLesson({ lesson, sectionIndex, lessonIndex });
                                setShowLessonModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLesson(sectionIndex, lessonIndex)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )})}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <SectionModal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false);
          setSelectedSection(null);
        }}
        onSubmit={sectionMode === 'add' ? handleAddSection : handleEditSection}
        section={selectedSection?.section}
        sectionIndex={selectedSection?.index}
        mode={sectionMode}
      />

      <LessonForm
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setSelectedLesson(null);
        }}
        onSubmit={lessonMode === 'add' ? handleAddLesson : handleEditLesson}
        lesson={selectedLesson?.lesson}
        sectionIndex={lessonMode === 'add' ? lessonSectionIndex : selectedLesson?.sectionIndex || 0}
        lessonIndex={selectedLesson?.lessonIndex}
        mode={lessonMode}
      />

      {/* Edit Course Modal */}
      <Modal
        isOpen={showCourseModal && course !== null}
        onClose={() => setShowCourseModal(false)}
        title="Edit Course"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const tags = courseFormData.tags
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t);
            handleUpdateCourse('all', {
              title: courseFormData.title,
              description: courseFormData.description,
              thumbnail: courseFormData.thumbnail || undefined,
              tags,
              isPublished: courseFormData.isPublished,
            });
            setShowCourseModal(false);
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={courseFormData.title}
              onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={courseFormData.description}
              onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL
            </label>
            <Input
              type="url"
              value={courseFormData.thumbnail}
              onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <Input
              value={courseFormData.tags}
              onChange={(e) => setCourseFormData({ ...courseFormData, tags: e.target.value })}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={courseFormData.isPublished}
                onChange={(e) => setCourseFormData({ ...courseFormData, isPublished: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowCourseModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
          </div>
        </form>
      </Modal>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;