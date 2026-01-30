import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notesService, Note as ApiNote } from '@/services/notes.service';

interface NotesContextType {
  notes: ApiNote[];
  loading: boolean;
  addNote: (content: string, screen: string, title: string) => Promise<void>;
  updateNote: (id: string, content: string, title: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNotesByScreen: (screen: string) => ApiNote[];
  getNotesBySource: (source: string) => ApiNote[];
  toggleBookmark: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshNotes = async () => {
    try {
      setLoading(true);
      const data = await notesService.getAllNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotes();
  }, []);

  const addNote = async (content: string, screen: string, title: string) => {
    try {
      const newNote = await notesService.createNote({
        title,
        content,
        source: 'course',
        sourceDetails: screen,
        isPublic: false,
      });
      setNotes(prev => [...prev, newNote]);
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, content: string, title: string) => {
    try {
      const updated = await notesService.updateNote(id, {
        content,
        title,
      });
      setNotes(prev => prev.map(note => note._id === id ? updated : note));
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await notesService.deleteNote(id);
      setNotes(prev => prev.filter(note => note._id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  const toggleBookmark = async (id: string) => {
    try {
      const updated = await notesService.toggleBookmark(id);
      setNotes(prev => prev.map(note => note._id === id ? updated : note));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      throw error;
    }
  };

  const toggleLike = async (id: string) => {
    try {
      const updated = await notesService.toggleLike(id);
      setNotes(prev => prev.map(note => note._id === id ? updated : note));
    } catch (error) {
      console.error('Failed to toggle like:', error);
      throw error;
    }
  };

  const getNotesByScreen = (screen: string) => {
    return notes.filter(note => note.sourceDetails === screen);
  };

  const getNotesBySource = (source: string) => {
    return notes.filter(note => note.source === source);
  };

  return (
    <NotesContext.Provider value={{ 
      notes, 
      loading,
      addNote, 
      updateNote, 
      deleteNote, 
      getNotesByScreen,
      getNotesBySource,
      toggleBookmark,
      toggleLike,
      refreshNotes
    }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return context;
};
