import axiosInstance from '@/lib/axios';

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  lessonId: string | null;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

class QuizService {
  async getAllQuizzes(): Promise<Quiz[]> {
    const response = await axiosInstance.get('/quiz');
    return response.data;
  }
}

export default new QuizService();