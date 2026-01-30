import axiosInstance from '@/lib/axios';

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  question: string;
  options: (string | QuizOption)[];
  correctAnswer: number;
  explanation: string;
}

export interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  videoDescription?: string;
  quiz: Quiz[];
  order: number;
  estimatedMinutes: number;
  isPublished: boolean;
  resources?: string[];
}

export interface Section {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  isPublished: boolean;
  tags: string[];
  enrolledCount: number;
  createdBy: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  timeSpentMinutes: number;
  quizScore?: number;
  quizAttempts?: number;
  lastAccessedAt?: string;
}

export interface SectionProgress {
  sectionId: string;
  lessons: LessonProgress[];
}

export interface CourseProgress {
  userId: string;
  sections: SectionProgress[];
  overallProgress: number;
  totalTimeSpentMinutes: number;
  enrolledAt: string;
  lastAccessedAt: string;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
}

export interface QuizResult {
  questionIndex: number;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmissionResponse {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  results: QuizResult[];
}

class CourseService {
  /**
   * Get complete course content (public)
   */
  async getCourse(): Promise<Course> {
    const response = await axiosInstance.get('/courses');
    return response.data;
  }

  /**
   * Enroll in the course
   */
  async enrollInCourse(): Promise<{ message: string; progress: CourseProgress }> {
    const response = await axiosInstance.post('/courses/enroll');
    return response.data;
  }

  /**
   * Get my course progress
   */
  async getMyProgress(): Promise<CourseProgress> {
    const response = await axiosInstance.get('/courses/my-progress');
    return response.data;
  }

  /**
   * Update lesson progress
   */
  async updateProgress(
    sectionId: string,
    lessonId: string,
    completed: boolean,
    timeSpentMinutes: number
  ): Promise<CourseProgress> {
    const response = await axiosInstance.put('/courses/progress', {
      sectionId,
      lessonId,
      completed,
      timeSpentMinutes,
    });
    return response.data;
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(
    sectionId: string,
    lessonId: string,
    answers: QuizAnswer[]
  ): Promise<QuizSubmissionResponse> {
    const response = await axiosInstance.post('/courses/quiz/submit', {
      sectionId,
      lessonId,
      answers,
    });
    return response.data;
  }
}

export default new CourseService();
