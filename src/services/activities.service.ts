import axiosInstance from '@/lib/axios';

export interface ClassActivity {
  _id: string;
  title: string;
  description: string;
  content: string;
  lessonId: string | null;
  duration: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lessonTitle?: string; // Optional lesson title
}

class ActivitiesService {
  async getAllActivities(): Promise<ClassActivity[]> {
    const response = await axiosInstance.get('/class-activity');
    return response.data;
  }
}

export default new ActivitiesService();
