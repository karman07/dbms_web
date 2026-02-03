import axiosInstance from '@/lib/axios';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  content: string;
  lessonId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

class AssignmentsService {
  async getAllAssignments(): Promise<Assignment[]> {
    const response = await axiosInstance.get('/assignment');
    return response.data;
  }
}

export default new AssignmentsService();