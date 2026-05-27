export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  sections: Section[];
  isPublished: boolean;
  tags: string[];
  enrolledCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  _id: string;
  title: string;
  description?: string;
  priority: number;
  lessons: Lesson[];
}

export interface Lesson {
  _id: string;
  title: string;
  priority: number;
  // New: Array of media references (videos, images, documents)
  mediaIds?: string[];
  // Populated media items (returned by API)
  media?: Media[];
  resources?: string[];
  quiz?: QuizQuestion[];
  // New: Array of doc subtopic references
  docSubtopicIds?: string[];
  // Populated doc subtopics (returned by API)
  docSubtopics?: DocSubtopic[];
  estimatedMinutes?: number;
  isPublished: boolean;
  // Multiple linked resource IDs (stored in DB)
  linkedQuizIds?: string[];
  linkedAssignmentIds?: string[];
  linkedActivityIds?: string[];
  // Populated linked resources (returned by API, not in DB)
  linkedQuizzes?: Quiz[];
  linkedAssignments?: Assignment[];
  linkedActivities?: ClassActivity[];

  contentOrder?: Array<{ type: string; id: string }>;

  // Legacy fields (for backward compatibility - will be removed)
  content?: string;
  videoUrl?: string;
  videoDescription?: string;
  docSubtopicId?: string;
  doc?: {
    _id: string;
    name: string;
    filename: string;
    content: string;
    topicId?: string;
    topic?: string;
  };
}

export interface Media {
  _id: string;
  title: string;
  description?: string;
  type: 'video' | 'image' | 'document';
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation?: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  sections: SectionProgress[];
  overallProgress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  totalTimeSpentMinutes: number;
}

export interface SectionProgress {
  sectionId: string;
  lessons: LessonProgress[];
  completedLessons: number;
  totalLessons: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  timeSpentMinutes: number;
  quizScore?: number;
  quizAttempts?: number;
}

export interface QuizSubmitRequest {
  sectionId: string;
  lessonId: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  results: QuizQuestionResult[];
  progress: {
    quizScore: number;
    quizAttempts: number;
    overallProgress: number;
  };
}

export interface QuizQuestionResult {
  questionIndex: number;
  correct: boolean;
  explanation?: string;
}

export interface DocSubtopic {
  name: string;
  filename: string;
  content?: string;
  createdAt?: string;
}

export interface DocTopic {
  _id: string;
  topic?: string;
  name?: string; // Alternative field name
  course?: string;
  subtopics?: DocSubtopic[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemStats {
  users: {
    total: number;
    verified: number;
    admins: number;
    newThisMonth: number;
  };
  course: {
    enrolled: number;
    completionRate: number;
    averageProgress: number;
  };
  notes: {
    total: number;
    bookmarked: number;
    liked: number;
  };
  storage: {
    totalFiles: number;
    totalSizeMB: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
}

// Quiz Types
export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  lessonId?: string; // Changed to match backend field name
  linkedLessonId?: string; // Deprecated, kept for backward compatibility
  questions: QuizQuestion[];
  passingScore?: number;
  timeLimit?: number;
  totalQuestions?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Assignment Types
export interface Assignment {
  _id: string;
  title: string;
  description: string;
  content?: string;
  lessonId?: string; // Changed to match backend field name
  linkedLessonId?: string; // Deprecated, kept for backward compatibility
  createdAt: string;
  updatedAt: string;
}

// Class Activity Types
export interface ClassActivity {
  _id: string;
  title: string;
  description: string;
  content?: string;
  duration?: number;
  lessonId?: string; // Changed to match backend field name
  linkedLessonId?: string; // Deprecated, kept for backward compatibility
  createdAt: string;
  updatedAt: string;
}

// Dropdown Option Types for UI
export interface DropdownOption {
  value: string;
  label: string;
  metadata?: any;
}