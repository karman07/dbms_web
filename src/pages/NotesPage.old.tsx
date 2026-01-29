import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Bookmark, 
  Heart, 
  Eye,
  X,
  Tag,
  Calendar,
  User,
  BookmarkCheck,
  HeartIcon,
  FileText,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import notesService, { Note, CreateNoteDto, UpdateNoteDto } from "@/services/notes.service";
import { useNotification } from "@/contexts/NotificationContext";
import { GRADIENTS, BUTTON_STYLES, fadeIn, fadeInUp, staggerContainer } from "@/constants";

type FilterType = 'all' | 'my-notes' | 'bookmarked' | 'liked';
type SourceType = Note['source'] | 'all';

const NotesPage = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateNoteDto>({
    title: '',
    content: '',
    source: 'personal',
    sourceDetails: '',
    tags: [],
    isPublic: true,
    attachments: []
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, filterType, sourceFilter]);

  const loadNotes = async (type: FilterType = 'all') => {
    try {
      setLoading(true);
      let data: Note[];
      
      switch (type) {
        case 'my-notes':
          data = await notesService.getMyNotes();
          break;
        case 'bookmarked':
          data = await notesService.getBookmarkedNotes();
          break;
        case 'liked':
          data = await notesService.getLikedNotes();
          break;
        default:
          data = await notesService.getAllNotes();
      }
      
      setNotes(data);
    } catch (error: any) {
      notification.error('Failed to load notes', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(note => note.source === sourceFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNotes(filtered);
  };

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    loadNotes(type);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await notesService.createNote(formData);
      notification.success('Note created!', 'Your note has been saved successfully');
      setShowCreateModal(false);
      resetForm();
      loadNotes(filterType);
    } catch (error: any) {
      notification.error('Failed to create note', error.message || 'Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote) return;
    
    try {
      setSubmitting(true);
      const updateData: UpdateNoteDto = {
        title: formData.title,
        content: formData.content,
        source: formData.source,
        sourceDetails: formData.sourceDetails,
        tags: formData.tags,
        isPublic: formData.isPublic,
        attachments: formData.attachments
      };
      
      await notesService.updateNote(selectedNote._id, updateData);
      notification.success('Note updated!', 'Your changes have been saved');
      setShowEditModal(false);
      setSelectedNote(null);
      resetForm();
      loadNotes(filterType);
    } catch (error: any) {
      notification.error('Failed to update note', error.message || 'Please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesService.deleteNote(id);
      notification.success('Note deleted', 'The note has been removed');
      loadNotes(filterType);
    } catch (error: any) {
      notification.error('Failed to delete note', error.message || 'Please try again');
    }
  };

  const handleToggleBookmark = async (note: Note) => {
    try {
      await notesService.toggleBookmark(note._id);
      loadNotes(filterType);
    } catch (error: any) {
      notification.error('Failed to bookmark', error.message);
    }
  };

  const handleToggleLike = async (note: Note) => {
    try {
      await notesService.toggleLike(note._id);
      loadNotes(filterType);
    } catch (error: any) {
      notification.error('Failed to like', error.message);
    }
  };

  const openEditModal = (note: Note) => {
    setSelectedNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      source: note.source,
      sourceDetails: note.sourceDetails || '',
      tags: note.tags,
      isPublic: true,
      attachments: note.attachments
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      source: 'personal',
      sourceDetails: '',
      tags: [],
      isPublic: true,
      attachments: []
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) || [] });
  };

  const isBookmarked = (note: Note) => {
    return note.isBookmarked;
  };

  const isLiked = (note: Note) => {
    return note.isLiked;
  };

  const isAuthor = (note: Note) => {
    return currentUser && note.author._id === currentUser._id;
  };

  const sourceOptions: { value: SourceType; label: string }[] = [
    { value: 'all', label: 'All Sources' },
    { value: 'course', label: 'Course' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'class_activity', label: 'Class Activity' },
    { value: 'docs', label: 'Documentation' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className={`text-4xl font-bold ${GRADIENTS.gradientText}`}>
                  My Notes
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Organize and manage your study notes
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className={BUTTON_STYLES.gradient + " gap-2"}
            >
              <Plus className="h-5 w-5" />
              Create Note
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notes by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {['all', 'my-notes', 'bookmarked', 'liked'].map((filter) => (
                <Button
                  key={filter}
                  variant={filterType === filter ? 'default' : 'outline'}
                  onClick={() => handleFilterChange(filter as FilterType)}
                  className={filterType === filter ? BUTTON_STYLES.gradient : ''}
                  size="sm"
                >
                  {filter === 'all' && <FileText className="h-4 w-4 mr-2" />}
                  {filter === 'my-notes' && <User className="h-4 w-4 mr-2" />}
                  {filter === 'bookmarked' && <BookmarkCheck className="h-4 w-4 mr-2" />}
                  {filter === 'liked' && <Heart className="h-4 w-4 mr-2" />}
                  {filter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Button>
              ))}
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceType)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
              <Loader2 className="h-20 w-20 animate-spin text-blue-600 dark:text-blue-400 absolute top-0 left-0" />
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading your notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-center py-20"
          >
            <div className="flex items-center justify-center w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl">
              <FileText className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">No notes found</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search criteria or browse all notes' : 'Start organizing your knowledge by creating your first note'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)} className={`${BUTTON_STYLES.gradient} h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all`}>
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Note
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredNotes.map((note) => (
              <motion.div
                key={note._id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Note Header */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-3">
                    {note.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                    {note.content}
                  </p>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                          +{note.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{note.author.firstName} {note.author.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Source Badge */}
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                      {note.source.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{note.viewCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className={`h-4 w-4 ${isLiked(note) ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{note.likeCount ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className={`h-4 w-4 ${isBookmarked(note) ? 'fill-blue-500 text-blue-500' : ''}`} />
                      <span>{note.bookmarkCount ?? 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleLike(note)}
                      className={`flex-1 ${isLiked(note) ? 'border-red-500 text-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isLiked(note) ? 'fill-red-500' : ''}`} />
                      {isLiked(note) ? 'Liked' : 'Like'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleBookmark(note)}
                      className={`flex-1 ${isBookmarked(note) ? 'border-blue-500 text-blue-500' : ''}`}
                    >
                      <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked(note) ? 'fill-blue-500' : ''}`} />
                      {isBookmarked(note) ? 'Saved' : 'Save'}
                    </Button>
                  </div>

                  {/* Edit/Delete Actions (only for author) */}
                  {isAuthor(note) && (
                    <div className="flex gap-2 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(note)}
                        className="flex-1 h-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400 font-medium"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Note
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note._id)}
                        className="flex-1 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 font-medium"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${GRADIENTS.gradientText}`}>
                  {showEditModal ? 'Edit Note' : 'Create New Note'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={showEditModal ? handleUpdateNote : handleCreateNote} className="p-8 space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-base font-semibold text-gray-900 dark:text-white">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a descriptive title for your note..."
                    required
                    maxLength={200}
                    className="mt-2 h-12 text-base"
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content" className="text-base font-semibold text-gray-900 dark:text-white">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note content here... You can include detailed information, code snippets, or any other relevant details."
                    required
                    rows={10}
                    className="mt-2 resize-none text-base leading-relaxed"
                  />
                </div>

                {/* Source and Source Details */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="source" className="text-base font-semibold text-gray-900 dark:text-white">Source Type *</Label>
                    <select
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value as Note['source'] })}
                      className="mt-2 w-full h-12 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="course">📚 Course</option>
                      <option value="quiz">📝 Quiz</option>
                      <option value="assignment">✍️ Assignment</option>
                      <option value="class_activity">🎯 Class Activity</option>
                      <option value="docs">📖 Documentation</option>
                      <option value="personal">💭 Personal</option>
                      <option value="other">📌 Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="sourceDetails" className="text-base font-semibold text-gray-900 dark:text-white">Source Details</Label>
                    <Input
                      id="sourceDetails"
                      value={formData.sourceDetails}
                      onChange={(e) => setFormData({ ...formData, sourceDetails: e.target.value })}
                      placeholder="e.g., Chapter 5, Lecture 3..."
                      className="mt-2 h-12 text-base"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags" className="text-base font-semibold text-gray-900 dark:text-white">Tags</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tags to organize your notes..."
                      className="h-12 text-base"
                    />
                    <Button type="button" onClick={addTag} variant="outline" className="h-12 px-4">
                      <Tag className="h-5 w-5 mr-2" />
                      Add
                    </Button>
                  </div>
                  {(formData.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      {formData.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg"
                        >
                          <Tag className="h-3 w-3 mr-1.5" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 h-12 text-base font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className={`${BUTTON_STYLES.gradient} flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Saving your note...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        {showEditModal ? 'Update Note' : 'Create Note'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;
