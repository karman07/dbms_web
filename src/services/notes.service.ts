import axiosInstance from '@/lib/axios';

export interface Note {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  source: 'quiz' | 'docs' | 'assignment' | 'class_activity' | 'course' | 'personal' | 'other';
  sourceDetails?: string;
  tags: string[];
  isPublic: boolean;
  isBookmarked: boolean;
  isLiked: boolean;
  bookmarkCount?: number;
  likeCount?: number;
  viewCount?: number;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  source: Note['source'];
  sourceDetails?: string;
  tags?: string[];
  isPublic?: boolean;
  attachments?: string[];
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  source?: Note['source'];
  sourceDetails?: string;
  tags?: string[];
  isPublic?: boolean;
  attachments?: string[];
}

class NotesService {
  /**
   * Create a new note
   */
  async createNote(data: CreateNoteDto): Promise<Note> {
    const response = await axiosInstance.post<Note>('/notes', data);
    return response.data;
  }

  /**
   * Get all notes (public + own private if authenticated)
   */
  async getAllNotes(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes');
    return response.data;
  }

  /**
   * Get user's own notes
   */
  async getMyNotes(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes/my-notes');
    return response.data;
  }

  /**
   * Get bookmarked notes
   */
  async getBookmarkedNotes(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes/bookmarked');
    return response.data;
  }

  /**
   * Get liked notes
   */
  async getLikedNotes(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes/liked');
    return response.data;
  }

  /**
   * Search notes
   */
  async searchNotes(query: string): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>(`/notes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  /**
   * Get notes by source
   */
  async getNotesBySource(source: Note['source']): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>(`/notes/source/${source}`);
    return response.data;
  }

  /**
   * Get single note by ID
   */
  async getNoteById(id: string): Promise<Note> {
    const response = await axiosInstance.get<Note>(`/notes/${id}`);
    return response.data;
  }

  /**
   * Update a note
   */
  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    const response = await axiosInstance.patch<Note>(`/notes/${id}`, data);
    return response.data;
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    await axiosInstance.delete(`/notes/${id}`);
  }

  /**
   * Toggle bookmark on a note
   */
  async toggleBookmark(id: string): Promise<Note> {
    const response = await axiosInstance.post<Note>(`/notes/${id}/bookmark`);
    return response.data;
  }

  /**
   * Toggle like on a note
   */
  async toggleLike(id: string): Promise<Note> {
    const response = await axiosInstance.post<Note>(`/notes/${id}/like`);
    return response.data;
  }
}

export default new NotesService();
