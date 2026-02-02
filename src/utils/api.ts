import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// User Management API
export const userAPI = {
  createAdminUser: async (userData: any) => {
    const response = await api.post('/users/admin', userData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  verifyUserEmail: async (id: string) => {
    const response = await api.patch(`/users/${id}/verify-email`);
    return response.data;
  },
};

// Course Management API (Admin - 9 endpoints)
export const courseAPI = {
  // 1. Create Course
  createCourse: async (courseData: any) => {
    const response = await api.post('/courses/admin', courseData);
    return response.data;
  },

  // 2. Update Course
  updateCourse: async (courseData: any) => {
    const response = await api.put('/courses/admin', courseData);
    return response.data;
  },

  // 3. Get Course (Admin View)
  getCourse: async () => {
    const response = await api.get('/courses/admin');
    return response.data;
  },

  // 4. Add Section
  addSection: async (sectionData: any) => {
    const response = await api.post('/courses/admin/section', sectionData);
    return response.data;
  },

  // 5. Update Section
  updateSection: async (sectionIndex: number, sectionData: any) => {
    const response = await api.put(`/courses/admin/section/${sectionIndex}`, sectionData);
    return response.data;
  },

  // 6. Delete Section
  deleteSection: async (sectionIndex: number) => {
    const response = await api.delete(`/courses/admin/section/${sectionIndex}`);
    return response.data;
  },

  // 7. Add Lesson
  addLesson: async (sectionIndex: number, lessonData: FormData) => {
    const response = await api.post(`/courses/admin/section/${sectionIndex}/lesson`, lessonData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 8. Update Lesson
  updateLesson: async (sectionIndex: number, lessonIndex: number, lessonData: FormData) => {
    const response = await api.put(`/courses/admin/section/${sectionIndex}/lesson/${lessonIndex}`, lessonData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 9. Delete Lesson
  deleteLesson: async (sectionIndex: number, lessonIndex: number) => {
    const response = await api.delete(`/courses/admin/section/${sectionIndex}/lesson/${lessonIndex}`);
    return response.data;
  },
};

// Course User API (5 endpoints)
export const courseUserAPI = {
  // 10. Get Published Course
  getPublishedCourse: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  // 11. Enroll in Course
  enrollInCourse: async () => {
    const response = await api.post('/courses/enroll');
    return response.data;
  },

  // 12. Get My Progress
  getMyProgress: async () => {
    const response = await api.get('/courses/my-progress');
    return response.data;
  },

  // 13. Update Progress
  updateProgress: async (progressData: {
    lessonId: string;
    completed: boolean;
    timeSpent?: number;
  }) => {
    const response = await api.put('/courses/progress', progressData);
    return response.data;
  },

  // 14. Submit Quiz (Course)
  submitQuiz: async (quizData: {
    lessonId: string;
    answers: Array<{ questionId: string; selectedAnswer: number }>;
  }) => {
    const response = await api.post('/courses/quiz/submit', quizData);
    return response.data;
  },
};

// Documentation Management API (Admin - 4 endpoints + User - 4 endpoints)
export const docsAPI = {
  // Admin Endpoints
  // 1. Create Topic with Subtopics
  createTopic: async (formData: FormData) => {
    const response = await api.post('/docs/admin/topic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 2. Delete Topic
  deleteTopic: async (id: string) => {
    const response = await api.delete(`/docs/admin/topic/${id}`);
    return response.data;
  },

  // 3. Add Subtopic to Topic
  addSubtopic: async (id: string, formData: FormData) => {
    const response = await api.post(`/docs/admin/topic/${id}/subtopic`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 4. Delete Subtopic
  deleteSubtopic: async (id: string, name: string) => {
    const response = await api.delete(`/docs/admin/topic/${id}/subtopic/${encodeURIComponent(name)}`);
    return response.data;
  },

  // 5. Get Subtopic Content (Admin)
  getSubtopicContentAdmin: async (topicId: string, subtopicName: string) => {
    const response = await api.get(`/docs/admin/topic/${topicId}/subtopic/${encodeURIComponent(subtopicName)}/content`);
    return response.data;
  },

  // 6. Update Subtopic
  updateSubtopic: async (topicId: string, subtopicName: string, formData: FormData) => {
    const response = await api.put(`/docs/admin/topic/${topicId}/subtopic/${encodeURIComponent(subtopicName)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // User Endpoints
  // 7. Get All Topics
  getAllTopics: async () => {
    const response = await api.get('/docs/topics');
    return response.data;
  },

  // 8. List Subtopics for Topic
  getTopicSubtopics: async (id: string) => {
    const response = await api.get(`/docs/topic/${id}/subtopics`);
    return response.data;
  },

  // 9. Get Subtopic Content
  getSubtopicContent: async (id: string, name: string) => {
    const response = await api.get(`/docs/topic/${id}/subtopic/${encodeURIComponent(name)}`);
    return response.data;
  },

  // 10. Download Subtopic
  downloadSubtopic: async (id: string, name: string) => {
    const response = await api.get(`/docs/topic/${id}/subtopic/${encodeURIComponent(name)}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Quiz Management API (Admin + User)
export const quizAPI = {
  // Admin Endpoints
  // 1. Create Quiz
  createQuiz: async (quizData: any) => {
    const response = await api.post('/quiz/admin', quizData);
    return response.data;
  },

  // 2. Get All Quizzes (Admin)
  getAllQuizzesAdmin: async () => {
    const response = await api.get('/quiz/admin');
    return response.data;
  },

  // 3. Get Quiz by ID (Admin)
  getQuizByIdAdmin: async (quizId: string) => {
    const response = await api.get(`/quiz/admin/${quizId}`);
    return response.data;
  },

  // 4. Update Quiz
  updateQuiz: async (quizId: string, quizData: any) => {
    const response = await api.put(`/quiz/admin/${quizId}`, quizData);
    return response.data;
  },

  // 5. Delete Quiz
  deleteQuiz: async (quizId: string) => {
    const response = await api.delete(`/quiz/admin/${quizId}`);
    return response.data;
  },

  // 6. Link Quiz to Lesson
  linkQuizToLesson: async (quizId: string, lessonId: string) => {
    const response = await api.post(`/quiz/admin/${quizId}/link-lesson/${lessonId}`);
    return response.data;
  },

  // 7. Unlink Quiz from Lesson
  unlinkQuizFromLesson: async (quizId: string) => {
    const response = await api.delete(`/quiz/admin/${quizId}/unlink-lesson`);
    return response.data;
  },

  // User Endpoints
  // 8. Get All Quizzes
  getAllQuizzes: async () => {
    const response = await api.get('/quiz');
    return response.data;
  },

  // 9. Get Quiz by ID
  getQuizById: async (quizId: string) => {
    const response = await api.get(`/quiz/${quizId}`);
    return response.data;
  },

  // 10. Get Quiz by Lesson
  getQuizByLesson: async (lessonId: string) => {
    const response = await api.get(`/quiz/lesson/${lessonId}`);
    return response.data;
  },

  // 11. Submit Quiz
  submitQuiz: async (quizData: {
    quizId: string;
    answers: Array<{ questionId: string; selectedAnswer: number }>;
  }) => {
    const response = await api.post('/quiz/submit', quizData);
    return response.data;
  },
};

// Assignment Management API (Admin + User)
export const assignmentAPI = {
  // Admin Endpoints
  // 1. Create Assignment
  createAssignment: async (formData: FormData) => {
    const response = await api.post('/assignment/admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 2. Get All Assignments (Admin)
  getAllAssignmentsAdmin: async () => {
    const response = await api.get('/assignment/admin');
    return response.data;
  },

  // 3. Get Assignment by ID (Admin)
  getAssignmentByIdAdmin: async (assignmentId: string) => {
    const response = await api.get(`/assignment/admin/${assignmentId}`);
    return response.data;
  },

  // 4. Update Assignment
  updateAssignment: async (assignmentId: string, formData: FormData) => {
    const response = await api.put(`/assignment/admin/${assignmentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 5. Delete Assignment
  deleteAssignment: async (assignmentId: string) => {
    const response = await api.delete(`/assignment/admin/${assignmentId}`);
    return response.data;
  },

  // 6. Link Assignment to Lesson
  linkAssignmentToLesson: async (assignmentId: string, lessonId: string) => {
    const response = await api.post(`/assignment/admin/${assignmentId}/link-lesson/${lessonId}`);
    return response.data;
  },

  // 7. Unlink Assignment from Lesson
  unlinkAssignmentFromLesson: async (assignmentId: string) => {
    const response = await api.delete(`/assignment/admin/${assignmentId}/unlink-lesson`);
    return response.data;
  },

  // User Endpoints
  // 8. Get All Assignments
  getAllAssignments: async () => {
    const response = await api.get('/assignment');
    return response.data;
  },

  // 9. Get Assignment by ID
  getAssignmentById: async (assignmentId: string) => {
    const response = await api.get(`/assignment/${assignmentId}`);
    return response.data;
  },

  // 10. Get Assignment by Lesson
  getAssignmentByLesson: async (lessonId: string) => {
    const response = await api.get(`/assignment/lesson/${lessonId}`);
    return response.data;
  },
};

// Class Activity Management API (Admin + User)
export const classActivityAPI = {
  // Admin Endpoints
  // 1. Create Class Activity
  createClassActivity: async (formData: FormData) => {
    try {
      const response = await api.post('/class-activity/admin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      if (Array.isArray(msg) ? msg.join(' ').includes('title should not exist') : typeof msg === 'string' && msg.includes('title should not exist')) {
        const compatData = new FormData();
        for (const [key, value] of (formData as any).entries()) {
          compatData.append(key === 'title' ? 'name' : key, value as any);
        }
        const response = await api.post('/class-activity/admin', compatData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }
      throw error;
    }
  },

  // 2. Get All Class Activities (Admin)
  getAllClassActivitiesAdmin: async () => {
    const response = await api.get('/class-activity/admin');
    return response.data;
  },

  // 3. Get Class Activity by ID (Admin)
  getClassActivityByIdAdmin: async (activityId: string) => {
    const response = await api.get(`/class-activity/admin/${activityId}`);
    return response.data;
  },

  // 4. Update Class Activity
  updateClassActivity: async (activityId: string, formData: FormData) => {
    try {
      const response = await api.put(`/class-activity/admin/${activityId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      if (Array.isArray(msg) ? msg.join(' ').includes('title should not exist') : typeof msg === 'string' && msg.includes('title should not exist')) {
        const compatData = new FormData();
        for (const [key, value] of (formData as any).entries()) {
          compatData.append(key === 'title' ? 'name' : key, value as any);
        }
        const response = await api.put(`/class-activity/admin/${activityId}`, compatData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }
      throw error;
    }
  },

  // 5. Delete Class Activity
  deleteClassActivity: async (activityId: string) => {
    const response = await api.delete(`/class-activity/admin/${activityId}`);
    return response.data;
  },

  // 6. Link Activity to Lesson
  linkActivityToLesson: async (activityId: string, lessonId: string) => {
    const response = await api.post(`/class-activity/admin/${activityId}/link-lesson/${lessonId}`);
    return response.data;
  },

  // 7. Unlink Activity from Lesson
  unlinkActivityFromLesson: async (activityId: string) => {
    const response = await api.delete(`/class-activity/admin/${activityId}/unlink-lesson`);
    return response.data;
  },

  // User Endpoints
  // 8. Get All Class Activities
  getAllClassActivities: async () => {
    const response = await api.get('/class-activity');
    return response.data;
  },

  // 9. Get Class Activity by ID
  getClassActivityById: async (activityId: string) => {
    const response = await api.get(`/class-activity/${activityId}`);
    return response.data;
  },

  // 10. Get Activity by Lesson
  getActivityByLesson: async (lessonId: string) => {
    const response = await api.get(`/class-activity/lesson/${lessonId}`);
    return response.data;
  },
};

export default api;