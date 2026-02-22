import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  FileText,
  Video,
  ChevronDown,
  Layout,
  Layers,
  BarChart3,
  Rocket,
  BadgeCheck,
  Presentation,
  Eye,
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

  // Preview modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewLesson, setViewLesson] = useState<Lesson | null>(null);

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
      const data = { ...courseFormData, tags };
      const newCourse = await courseAPI.createCourse(data);
      setCourse(newCourse);
      setShowCourseModal(false);
    } catch (error) {
      console.error('Error creating course:', error);
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

  const handleSaveCourseDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = courseFormData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);
      const data = { ...courseFormData, tags };
      const updatedCourse = await courseAPI.updateCourse(data);
      setCourse(updatedCourse);
      setShowCourseModal(false);
    } catch (error) {
      console.error('Error updating course details:', error);
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

  const handleAddSection = async (data: { title: string, description?: string, priority: number }) => {
    try {
      const updatedCourse = await courseAPI.addSection(data);
      setCourse(updatedCourse);
      setShowSectionModal(false);
      // Expand the new section
      const lastSection = updatedCourse.sections[updatedCourse.sections.length - 1];
      if (lastSection) {
        setExpandedSections(new Set([...Array.from(expandedSections), lastSection._id]));
      }
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleUpdateSection = async (data: { title: string, description?: string, priority: number }) => {
    if (selectedSection === null) return;
    try {
      const updatedCourse = await courseAPI.updateSection(selectedSection.index, data);
      setCourse(updatedCourse);
      setShowSectionModal(false);
      setSelectedSection(null);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleDeleteSection = async (sectionIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this module and all its contents?')) return;
    try {
      const updatedCourse = await courseAPI.deleteSection(sectionIndex);
      setCourse(updatedCourse);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleSaveLesson = async (formData: FormData) => {
    try {
      let updatedCourse;
      if (lessonMode === 'add') {
        updatedCourse = await courseAPI.addLesson(lessonSectionIndex, formData);
      } else if (selectedLesson) {
        updatedCourse = await courseAPI.updateLesson(
          selectedLesson.sectionIndex,
          selectedLesson.lessonIndex,
          formData
        );
      }
      if (updatedCourse) {
        setCourse(updatedCourse);
      }
      setShowLessonModal(false);
      setSelectedLesson(null);
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleDeleteLesson = async (sectionIndex: number, lessonIndex: number) => {
    if (!window.confirm('Delete this unit?')) return;
    try {
      const updatedCourse = await courseAPI.deleteLesson(sectionIndex, lessonIndex);
      setCourse(updatedCourse);
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleUpdateLessonPriority = async (sectionIndex: number, lessonIndex: number, priority: number) => {
    try {
      const updatedCourse = await courseAPI.updateLessonPriority(sectionIndex, lessonIndex, priority);
      setCourse(updatedCourse);
    } catch (error) {
      console.error('Error updating lesson priority:', error);
    }
  };

  const handleMoveLesson = async (sectionIndex: number, lessonIndex: number, direction: 'up' | 'down') => {
    try {
      const section = course?.sections[sectionIndex];
      if (!section) return;
      const lesson = section.lessons[lessonIndex];
      const currentPriority = lesson.priority || 0;
      const newPriority = direction === 'up' ? currentPriority + 1 : Math.max(0, currentPriority - 1);

      handleUpdateLessonPriority(sectionIndex, lessonIndex, newPriority);
    } catch (error) {
      console.error('Error updating priority via arrows:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Initializing Hub...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full glass dark:glass-dark rounded-[3rem] p-12 text-center space-y-8 border-2 border-white shadow-2xl">
          <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
            <Presentation className="w-12 h-12 text-blue-600" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Your Curriculum</h2>
            <p className="text-slate-500 font-medium">No course detected. Start your teaching journey by defining your first master class.</p>
          </div>
          <Button
            onClick={() => setShowCourseModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 text-lg font-black shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6 stroke-[3px]" /> Initialize Course
          </Button>

          <Modal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title="Initialize New Course">
            <form onSubmit={handleCreateCourse} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Curriculum Title</label>
                  <Input
                    required
                    value={courseFormData.title}
                    onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                    placeholder="e.g. Master Class in DBMS"
                    className="rounded-2xl border-slate-100 bg-slate-50 px-6 py-4 h-auto focus:ring-blue-500 text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Description Overview</label>
                  <Textarea
                    required
                    rows={4}
                    value={courseFormData.description}
                    onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                    placeholder="Provide a compelling summary of the course content..."
                    className="rounded-2xl border-slate-100 bg-slate-50 px-6 py-4 h-auto focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Hero Image URL</label>
                    <Input
                      type="url"
                      value={courseFormData.thumbnail}
                      onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
                      placeholder="https://..."
                      className="rounded-2xl border-slate-100 bg-slate-50 px-5 py-3 h-auto"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Search Keywords</label>
                    <Input
                      value={courseFormData.tags}
                      onChange={(e) => setCourseFormData({ ...courseFormData, tags: e.target.value })}
                      placeholder="dbms, sql, advanced"
                      className="rounded-2xl border-slate-100 bg-slate-50 px-5 py-3 h-auto"
                    />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Rocket className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">Launch Production Ready</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={courseFormData.isPublished}
                    onChange={(e) => setCourseFormData({ ...courseFormData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                <Button type="button" variant="outline" onClick={() => setShowCourseModal(false)} className="rounded-2xl border-slate-200 font-bold px-8">
                  Discard
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold px-10">
                  Build Now
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    );
  }

  const totalLessons = course.sections.reduce((acc: number, s: Section) => acc + s.lessons.length, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header/Cover */}
      <div className="relative min-h-[28rem] bg-slate-900 overflow-hidden flex flex-col">
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px] transition-all duration-1000 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-end pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${course.isPublished
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${course.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {course.isPublished ? 'Live Production' : 'Draft Workspace'}
                  </div>
                </Badge>
                {course.tags.map((tag, i) => (
                  <Badge key={i} className="bg-white/5 text-white/60 border-white/10 px-3 py-1 rounded-full text-[10px] font-bold">#{tag}</Badge>
                ))}
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                {course.title}
              </h1>
              <p className="text-slate-400 text-lg font-medium line-clamp-2 max-w-2xl italic">
                {course.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Button
                onClick={() => setIsPreviewOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 py-3 font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" /> Preview Course
              </Button>
              <Button
                onClick={handleEditCourse}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl px-6 py-3 font-bold backdrop-blur-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 -mt-24 relative z-20 pb-24 w-full">
        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Community</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{course.enrolledCount}</p>
              <p className="text-[10px] font-bold text-slate-400">Total Enrolled Users</p>
            </div>
            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center border border-blue-100 shadow-inner">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-900/5 flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Architecture</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{course.sections.length}</p>
              <p className="text-[10px] font-bold text-slate-400">Structural Modules</p>
            </div>
            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center border border-slate-100 shadow-inner">
              <Layers className="w-7 h-7 text-slate-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl shadow-indigo-900/5 flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Content</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{totalLessons}</p>
              <p className="text-[10px] font-bold text-slate-400">Total Educational Units</p>
            </div>
            <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center border border-indigo-100 shadow-inner">
              <BarChart3 className="w-7 h-7 text-indigo-600" />
            </div>
          </motion.div>
        </div>

        {/* Content Builder Section */}
        <div className="space-y-12 mt-16">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Layout className="w-7 h-7 text-blue-600" />
              Content Architecture
            </h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-slate-200 font-bold px-6"
                onClick={loadCourse}
              >
                Refresh
              </Button>
              <Button
                className="bg-slate-900 hover:bg-black text-white rounded-2xl px-6 py-3 font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
                onClick={() => {
                  setSectionMode('add');
                  setSelectedSection(null);
                  setShowSectionModal(true);
                }}
              >
                <Plus className="w-4 h-4 stroke-[3px]" /> New Module
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {course.sections.length === 0 ? (
              <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-24 text-center space-y-4">
                <div className="p-4 bg-slate-50 rounded-[2rem] w-bit mx-auto inline-block">
                  <Layers className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 font-bold tracking-tight text-xl uppercase italic">The canvas is blank</p>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm italic">Start building your course structure by adding your first educational module.</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {course.sections
                  .map((section, idx) => ({ ...section, originalIndex: idx }))
                  .sort((a, b) => b.priority - a.priority)
                  .map(({ originalIndex: sectionIndex, ...section }, displayIndex) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        layout: { duration: 0.3, ease: "easeInOut" },
                        opacity: { duration: 0.2 }
                      }}
                      key={section._id}
                      className="glass dark:glass-dark rounded-[2.5rem] border border-white/20 shadow-xl shadow-slate-200/20 relative group overflow-hidden"
                    >
                      {/* Section Header */}
                      <div className="p-8 pb-6 flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleSection(section._id)}
                            className={`mt-2 p-3 ${expandedSections.has(section._id) ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 rotate-180' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'} rounded-2xl transition-all duration-500`}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg">Module {displayIndex + 1}</span>
                              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{section.title}</h3>
                            </div>
                            {section.description && <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{section.description}</p>}
                            <div className="flex items-center gap-4 pt-2">
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <FileText className="w-3 h-3" />
                                {section.lessons.length} Units
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock className="w-3 h-3" />
                                {section.lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 0), 0)} min
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="w-11 h-11 p-0 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-blue-600"
                            onClick={() => {
                              setLessonMode('add');
                              setLessonSectionIndex(sectionIndex);
                              setSelectedLesson(null);
                              setShowLessonModal(true);
                            }}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                          <div className="w-px h-6 bg-slate-100 mx-1" />
                          <Button
                            variant="ghost"
                            className="w-11 h-11 p-0 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            onClick={() => {
                              setSectionMode('edit');
                              setSelectedSection({ section, index: sectionIndex });
                              setShowSectionModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-11 h-11 p-0 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500"
                            onClick={() => handleDeleteSection(sectionIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Section Content (Lessons) */}
                      <AnimatePresence>
                        {expandedSections.has(section._id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/50 border-t border-slate-50"
                          >
                            <div className="p-8 pt-6 space-y-4">
                              {section.lessons.length === 0 ? (
                                <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                                  <p className="text-slate-400 font-bold uppercase italic text-xs tracking-widest">No units in this module</p>
                                  <Button
                                    variant="ghost"
                                    className="mt-4 text-blue-600 font-black flex items-center gap-2 hover:bg-blue-50 rounded-2xl px-6"
                                    onClick={() => {
                                      setLessonMode('add');
                                      setLessonSectionIndex(sectionIndex);
                                      setShowLessonModal(true);
                                    }}
                                  >
                                    <Plus className="w-4 h-4" /> Initialize Unit
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {section.lessons
                                    .map((lesson, idx) => ({ ...lesson, originalLessonIndex: idx }))
                                    .sort((a, b) => b.priority - a.priority)
                                    .map(({ originalLessonIndex: lessonIndex, ...lesson }) => (
                                      <motion.div
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          layout: { duration: 0.3, ease: "easeInOut" },
                                          opacity: { duration: 0.2 }
                                        }}
                                        key={lesson._id}
                                        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group/lesson"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/lesson:bg-blue-50 group-hover/lesson:text-blue-600 transition-colors flex-shrink-0">
                                              {lesson.videoUrl ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-bold text-slate-900 truncate">{lesson.title}</h4>
                                              <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lesson.estimatedMinutes} Mins</span>
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Prio:</span>
                                                  <input
                                                    type="number"
                                                    value={lesson.priority || 0}
                                                    onChange={(e) => handleUpdateLessonPriority(sectionIndex, lessonIndex, parseInt(e.target.value) || 0)}
                                                    className="w-10 text-[10px] font-black bg-slate-50 border-none focus:ring-1 focus:ring-blue-500 rounded px-1 transition-all"
                                                  />
                                                </div>
                                                {lesson.quiz && lesson.quiz.length > 0 && (
                                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase px-2 py-0.5">
                                                    Quiz Available
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              className="w-8 h-8 p-0"
                                              onClick={() => handleMoveLesson(sectionIndex, lessonIndex, 'up')}
                                            >
                                              <ChevronDown className="w-4 h-4 rotate-180" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              className="w-8 h-8 p-0"
                                              onClick={() => handleMoveLesson(sectionIndex, lessonIndex, 'down')}
                                            >
                                              <ChevronDown className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              className="w-8 h-8 p-0 text-slate-400 hover:text-blue-600"
                                              onClick={() => setViewLesson(lesson)}
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              className="w-8 h-8 p-0 text-slate-400 hover:text-slate-900"
                                              onClick={() => {
                                                setLessonMode('edit');
                                                setSelectedLesson({ lesson, sectionIndex, lessonIndex });
                                                setLessonSectionIndex(sectionIndex);
                                                setShowLessonModal(true);
                                              }}
                                            >
                                              <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              className="w-8 h-8 p-0 text-slate-400 hover:text-red-500"
                                              onClick={() => handleDeleteLesson(sectionIndex, lessonIndex)}
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SectionModal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false);
          setSelectedSection(null);
        }}
        onSubmit={sectionMode === 'add' ? handleAddSection : handleUpdateSection}
        section={selectedSection?.section}
        mode={sectionMode}
      />

      <Modal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setSelectedLesson(null);
        }}
        title={lessonMode === 'add' ? 'Add Educational Unit' : 'Edit Unit Details'}
      >
        <LessonForm
          isOpen={showLessonModal}
          onClose={() => {
            setShowLessonModal(false);
            setSelectedLesson(null);
          }}
          onSubmit={handleSaveLesson}
          lesson={selectedLesson?.lesson}
          sectionIndex={lessonSectionIndex}
          mode={lessonMode}
        />
      </Modal>

      <Modal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title="Master Curriculum Details">
        <form onSubmit={handleSaveCourseDetails} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Curriculum Title</label>
              <Input
                required
                value={courseFormData.title}
                onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                className="rounded-2xl border-slate-100 bg-slate-50 px-6 py-4 h-auto focus:ring-blue-500 text-lg font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Description Overview</label>
              <Textarea
                required
                rows={4}
                value={courseFormData.description}
                onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                className="rounded-2xl border-slate-100 bg-slate-50 px-6 py-4 h-auto focus:ring-blue-500 font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Hero Image URL</label>
                <Input
                  type="url"
                  value={courseFormData.thumbnail}
                  onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
                  className="rounded-2xl border-slate-100 bg-slate-50 px-5 py-3 h-auto"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Search Keywords</label>
                <Input
                  value={courseFormData.tags}
                  onChange={(e) => setCourseFormData({ ...courseFormData, tags: e.target.value })}
                  className="rounded-2xl border-slate-100 bg-slate-50 px-5 py-3 h-auto"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-700">Production Status</span>
              </div>
              <input
                type="checkbox"
                checked={courseFormData.isPublished}
                onChange={(e) => setCourseFormData({ ...courseFormData, isPublished: e.target.checked })}
                className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
            <Button type="button" variant="outline" onClick={() => setShowCourseModal(false)} className="rounded-2xl border-slate-200 font-bold px-8">
              Discard
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold px-10">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Course Preview Viewer */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Course Preview"
        size="xl"
        className="p-0 overflow-hidden"
        hideHeader={true}
      >
        <div className="flex flex-col h-[85vh]">
          {/* Preview Header */}
          <div className="p-8 bg-slate-900 shrink-0">
            <Badge variant="outline" className="text-white/40 border-white/10 text-[10px] mb-4">STUDENT PREVIEW MODE</Badge>
            <h2 className="text-3xl font-black text-white tracking-tighter">{course.title}</h2>
            <p className="text-slate-400 mt-2 text-sm">{course.description}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
            <AnimatePresence>
              {course.sections
                .slice()
                .sort((a, b) => b.priority - a.priority)
                .map((section, displayIdx) => (
                  <motion.div
                    layout
                    key={section._id}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-slate-900 text-xs shadow-sm">
                        {displayIdx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                      {section.lessons
                        .slice()
                        .sort((a, b) => b.priority - a.priority)
                        .map((lesson) => (
                          <motion.div
                            layout
                            key={lesson._id}
                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-50 rounded-lg">
                                {lesson.videoUrl ? <Video className="w-4 h-4 text-slate-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{lesson.title}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lesson.estimatedMinutes} Mins</p>
                              </div>
                            </div>
                            {lesson.quiz && lesson.quiz.length > 0 && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-white border-t flex justify-end">
            <Button onClick={() => setIsPreviewOpen(false)} className="bg-slate-900 text-white font-black px-8">Close Preview</Button>
          </div>
        </div>
      </Modal>

      {/* Lesson View Modal */}
      <Modal
        isOpen={!!viewLesson}
        onClose={() => setViewLesson(null)}
        title="Educational Unit Overview"
        size="lg"
      >
        {viewLesson && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                {viewLesson.videoUrl ? <Video className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{viewLesson.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-[10px] uppercase font-black tracking-widest px-2 py-0.5">
                    {viewLesson.estimatedMinutes} Minutes
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] uppercase font-black tracking-widest px-2 py-0.5">
                    Priority: {viewLesson.priority || 0}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-3 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resources & Media</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Media Files</span>
                    <span className="font-bold text-slate-900">{viewLesson.mediaIds?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Doc References</span>
                    <span className="font-bold text-slate-900">{viewLesson.docSubtopicIds?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-100 rounded-3xl space-y-3 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Assessments</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Quizzes</span>
                    <span className="font-bold text-slate-900">{viewLesson.linkedQuizIds?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Assignments</span>
                    <span className="font-bold text-slate-900">{viewLesson.linkedAssignmentIds?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Activities</span>
                    <span className="font-bold text-slate-900">{viewLesson.linkedActivityIds?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setViewLesson(null)} className="bg-slate-900 text-white font-black px-10 rounded-2xl">
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CoursePage;