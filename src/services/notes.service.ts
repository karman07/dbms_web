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
  tags?: string[];
  isPublic: boolean;
  isBookmarked: boolean;
  isLiked: boolean;
  attachments?: string[];
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


export const notesService = {
  async createNote(data: CreateNoteDto): Promise<Note> {
    const response = await axiosInstance.post<Note>('/notes', data);
    return response.data;
  },

  async getAllNotes(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes');
    return response.data;
  },

  async getMyNotes(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes/my-notes');
    return response.data;
  },

  async getBookmarkedNotes(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes/bookmarked');
    return response.data;
  },

  async getLikedNotes(): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes/liked');
    return response.data;
  },

  async getNotesBySource(source: Note['source']): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>(`/notes/source/${source}`);
    return response.data;
  },

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    const response = await axiosInstance.patch<Note>(`/notes/${id}`, data);
    return response.data;
  },

  async deleteNote(id: string): Promise<void> {
    await axiosInstance.delete(`/notes/${id}`);
  },

  async toggleBookmark(id: string): Promise<Note> {
    const response = await axiosInstance.post<Note>(`/notes/${id}/bookmark`, {});
    return response.data;
  },

  async toggleLike(id: string): Promise<Note> {
    const response = await axiosInstance.post<Note>(`/notes/${id}/like`, {});
    return response.data;
  },

  async searchNotes(query: string): Promise<Note[]> {
    const response = await axiosInstance.get<Note[]>('/notes/search', {
      params: { q: query },
    });
    return response.data;
  },
};

export default notesService;
