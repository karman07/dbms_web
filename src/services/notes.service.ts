import axios from 'axios';

const API_URL = 'http://localhost:3000';

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

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const notesService = {
  async createNote(data: CreateNoteDto): Promise<Note> {
    const response = await axios.post(`${API_URL}/notes`, data, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async getAllNotes(): Promise<Note[]> {
    const response = await axios.get(`${API_URL}/notes`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getMyNotes(): Promise<Note[]> {
    const response = await axios.get(`${API_URL}/notes/my-notes`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getBookmarkedNotes(): Promise<Note[]> {
    const response = await axios.get(`${API_URL}/notes/bookmarked`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getLikedNotes(): Promise<Note[]> {
    const response = await axios.get(`${API_URL}/notes/liked`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getNotesBySource(source: Note['source']): Promise<Note[]> {
    const response = await axios.get(`${API_URL}/notes/source/${source}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    const response = await axios.patch(`${API_URL}/notes/${id}`, data, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async deleteNote(id: string): Promise<void> {
    await axios.delete(`${API_URL}/notes/${id}`, {
      headers: getAuthHeader(),
    });
  },

  async toggleBookmark(id: string): Promise<Note> {
    const response = await axios.post(`${API_URL}/notes/${id}/bookmark`, {}, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async toggleLike(id: string): Promise<Note> {
    const response = await axios.post(`${API_URL}/notes/${id}/like`, {}, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async searchNotes(query: string): Promise<Note[]> {
    const response = await axios.get(`${API_URL}/notes/search`, {
      params: { q: query },
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

export default notesService;
