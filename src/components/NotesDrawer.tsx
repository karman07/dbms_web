import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit2, Save, StickyNote, Bookmark, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/contexts/NotesContext';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  screen: string;
}

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

export const NotesDrawer = ({ isOpen, onClose, screen }: NotesDrawerProps) => {
  const { getNotesByScreen, addNote, updateNote, deleteNote, toggleBookmark, toggleLike, loading } = useNotes();
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const screenNotes = getNotesByScreen(screen);

  const toggleExpanded = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleAddNote = async () => {
    if (newNoteContent.trim() && newNoteTitle.trim()) {
      try {
        setSubmitting(true);
        await addNote(newNoteContent, screen, newNoteTitle);
        setNewNoteTitle('');
        setNewNoteContent('');
      } catch (error) {
        console.error('Failed to add note');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleUpdateNote = async (id: string) => {
    if (editContent.trim() && editTitle.trim()) {
      try {
        setSubmitting(true);
        await updateNote(id, editContent, editTitle);
        setEditingId(null);
        setEditTitle('');
        setEditContent('');
      } catch (error) {
        console.error('Failed to update note');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setSubmitting(true);
      await deleteNote(id);
    } catch (error) {
      console.error('Failed to delete note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      await toggleBookmark(id);
    } catch (error) {
      console.error('Failed to toggle bookmark');
    }
  };

  const handleToggleLike = async (id: string) => {
    try {
      await toggleLike(id);
    } catch (error) {
      console.error('Failed to toggle like');
    }
  };

  const startEditing = (id: string, title: string, content: string) => {
    setEditingId(id);
    setEditTitle(title);
    setEditContent(content);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notes</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Add Note */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Title *"
                className="w-full p-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write a note... *"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNoteContent.trim() || !newNoteTitle.trim() || submitting}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </>
                )}
              </Button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Loading notes...</p>
                </div>
              ) : screenNotes.length === 0 ? (
                <div className="text-center py-8">
                  <StickyNote className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No notes yet</p>
                </div>
              ) : (
                screenNotes.map((note) => (
                  <div
                    key={note._id}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3"
                  >
                    {editingId === note._id ? (
                      <div className="space-y-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title *"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                          required
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Content *"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm resize-none"
                          rows={3}
                          required
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateNote(note._id)}
                            disabled={submitting || !editTitle.trim() || !editContent.trim()}
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            {submitting ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingId(null);
                              setEditTitle('');
                              setEditContent('');
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {note.title && (
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {note.title}
                          </h3>
                        )}
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-2">
                          {note.content.length > 150 && !expandedNotes.has(note._id)
                            ? note.content.slice(0, 150) + '...'
                            : note.content}
                        </p>
                        {note.content.length > 150 && (
                          <button
                            onClick={() => toggleExpanded(note._id)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-2"
                          >
                            {expandedNotes.has(note._id) ? 'Read less' : 'Read more'}
                          </button>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(note.createdAt)}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleToggleBookmark(note._id)}
                              className={`p-1 rounded transition-colors ${
                                note.isBookmarked 
                                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                                  : 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                              }`}
                            >
                              <Bookmark className={`h-3 w-3 ${
                                note.isBookmarked 
                                  ? 'text-blue-600 dark:text-blue-400 fill-current' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </button>
                            <button
                              onClick={() => handleToggleLike(note._id)}
                              className={`p-1 rounded transition-colors ${
                                note.isLiked 
                                  ? 'bg-red-100 dark:bg-red-900/30' 
                                  : 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                              }`}
                            >
                              <Heart className={`h-3 w-3 ${
                                note.isLiked 
                                  ? 'text-red-600 dark:text-red-400 fill-current' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </button>
                            <button
                              onClick={() => startEditing(note._id, note.title, note.content)}
                              className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded transition-colors"
                            >
                              <Edit2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              disabled={submitting}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
