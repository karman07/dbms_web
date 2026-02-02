# Complete API Documentation - All Modules

This document provides comprehensive API documentation for Courses, Quiz, Class Activity, and Assignments modules.

---

## Table of Contents
- [Courses API](#courses-api)
- [Quiz API](#quiz-api)
- [Class Activity API](#class-activity-api)
- [Assignments API](#assignments-api)

---

# Courses API 

## Admin Endpoints

### 1. Create Course
**Endpoint:** `POST /courses/admin`  
**Auth Required:** Yes (Admin only)  
**Description:** Create a new course

**Request Body:**
```json
{
  "title": "Database Management Systems",
  "description": "Comprehensive DBMS course",
  "instructor": "Professor Name",
  "price": 999,
  "estimatedHours": 40,
  "thumbnail": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "_id": "course_id",
  "title": "Database Management Systems",
  "sections": [],
  "createdBy": "admin_id",
  "isPublished": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Update Course
**Endpoint:** `PUT /courses/admin`  
**Auth Required:** Yes (Admin only)  
**Description:** Update course details

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 1299,
  "isPublished": true
}
```

---

### 3. Get Course (Admin View)
**Endpoint:** `GET /courses/admin`  
**Auth Required:** Yes (Admin only)  
**Description:** Get course with all details including unpublished content

**Response:**
```json
{
  "_id": "course_id",
  "title": "Database Management Systems",
  "sections": [...],
  "isPublished": true,
  "totalLessons": 25,
  "totalQuizzes": 10
}
```

---

## Section Management (Admin)

### 4. Add Section
**Endpoint:** `POST /courses/admin/section`  
**Auth Required:** Yes (Admin only)  
**Description:** Add a new section to the course

**Request Body:**
```json
{
  "title": "Introduction to Databases",
  "description": "Fundamentals of database systems",
  "order": 1
}
```

---

### 5. Update Section
**Endpoint:** `PUT /courses/admin/section/:sectionIndex`  
**Auth Required:** Yes (Admin only)  
**Description:** Update an existing section

**URL Parameters:**
- `sectionIndex` - Index of the section (0-based)

**Request Body:**
```json
{
  "title": "Updated Section Title",
  "description": "Updated description"
}
```

---

### 6. Delete Section
**Endpoint:** `DELETE /courses/admin/section/:sectionIndex`  
**Auth Required:** Yes (Admin only)  
**Description:** Delete a section and all its lessons

**URL Parameters:**
- `sectionIndex` - Index of the section to delete

---

## Lesson Management (Admin)

### 7. Add Lesson
**Endpoint:** `POST /courses/admin/section/:sectionIndex/lesson`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `multipart/form-data`  
**Description:** Add a new lesson to a section with optional file uploads

**URL Parameters:**
- `sectionIndex` - Index of the section

**Form Data:**
```
title: "Introduction to SQL"
description: "Learn SQL basics"
order: 1
estimatedMinutes: 45
isPublished: true
videoUrl: "https://youtube.com/video" (optional if uploading video file)
content: [markdown file] (optional)
video: [video file] (optional)
resources: [resource files] (optional, max 10)
quiz: {"questions": [...]} (optional, JSON string)
```

**Files Accepted:**
- `content` - Markdown file (.md)
- `video` - Video file (.mp4, .webm, .avi, etc.)
- `resources` - Resource files (PDFs, documents, etc.)

---

### 8. Update Lesson
**Endpoint:** `PUT /courses/admin/section/:sectionIndex/lesson/:lessonIndex`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `multipart/form-data`  
**Description:** Update an existing lesson

**URL Parameters:**
- `sectionIndex` - Index of the section
- `lessonIndex` - Index of the lesson (0-based)

**Form Data:** Same as Add Lesson

---

### 9. Delete Lesson
**Endpoint:** `DELETE /courses/admin/section/:sectionIndex/lesson/:lessonIndex`  
**Auth Required:** Yes (Admin only)  
**Description:** Delete a lesson from a section

**URL Parameters:**
- `sectionIndex` - Index of the section
- `lessonIndex` - Index of the lesson to delete

---

## Public/User Endpoints

### 10. Get Published Course
**Endpoint:** `GET /courses`  
**Auth Required:** No  
**Description:** Get the published course with all published lessons

**Response:**
```json
{
  "_id": "course_id",
  "title": "Database Management Systems",
  "sections": [
    {
      "title": "Introduction",
      "lessons": [
        {
          "title": "Lesson 1",
          "content": "...",
          "videoUrl": "...",
          "isPublished": true
        }
      ]
    }
  ]
}
```

---

### 11. Enroll in Course
**Endpoint:** `POST /courses/enroll`  
**Auth Required:** Yes  
**Description:** Enroll the current user in the course

**Response:**
```json
{
  "message": "Successfully enrolled in the course",
  "enrollment": {
    "userId": "user_id",
    "courseId": "course_id",
    "enrolledAt": "2024-01-01T00:00:00.000Z",
    "progress": {
      "completedLessons": [],
      "quizResults": [],
      "overallProgress": 0
    }
  }
}
```

---

### 12. Update Progress
**Endpoint:** `PUT /courses/progress`  
**Auth Required:** Yes  
**Description:** Update user's lesson completion progress

**Request Body:**
```json
{
  "lessonId": "lesson_id",
  "completed": true,
  "timeSpent": 45
}
```

**Response:**
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "completedLessons": ["lesson_id"],
    "overallProgress": 15
  }
}
```

---

### 13. Get My Progress
**Endpoint:** `GET /courses/my-progress`  
**Auth Required:** Yes  
**Description:** Get current user's course progress

**Response:**
```json
{
  "enrollment": {
    "courseId": "course_id",
    "enrolledAt": "2024-01-01T00:00:00.000Z",
    "progress": {
      "completedLessons": ["lesson_id_1", "lesson_id_2"],
      "quizResults": [...],
      "overallProgress": 25
    }
  }
}
```

---

### 14. Submit Quiz (Course)
**Endpoint:** `POST /courses/quiz/submit`  
**Auth Required:** Yes  
**Description:** Submit quiz answers for a lesson

**Request Body:**
```json
{
  "lessonId": "lesson_id",
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": 2
    },
    {
      "questionId": "q2",
      "selectedAnswer": 0
    }
  ]
}
```

**Response:**
```json
{
  "score": 80,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "passed": true,
  "results": [...]
}
```

---

# Quiz API

## Admin Endpoints

### 1. Create Quiz
**Endpoint:** `POST /quiz/admin`  
**Auth Required:** Yes (Admin only)  
**Description:** Create an independent quiz

**Request Body:**
```json
{
  "title": "DBMS Fundamentals Quiz",
  "description": "Test your knowledge of database fundamentals",
  "questions": [
    {
      "question": "What does SQL stand for?",
      "options": [
        "Structured Query Language",
        "Simple Query Language",
        "Standard Query Language",
        "System Query Language"
      ],
      "correctAnswer": 0
    }
  ],
  "passingScore": 70,
  "timeLimit": 30,
  "linkedLessonId": "lesson_id" // optional
}
```

**Response:**
```json
{
  "_id": "quiz_id",
  "title": "DBMS Fundamentals Quiz",
  "totalQuestions": 10,
  "passingScore": 70,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get All Quizzes (Admin)
**Endpoint:** `GET /quiz/admin`  
**Auth Required:** Yes (Admin only)  
**Description:** Get all quizzes with full details

**Response:**
```json
[
  {
    "_id": "quiz_id",
    "title": "DBMS Fundamentals Quiz",
    "questions": [...],
    "linkedLessonId": "lesson_id",
    "totalQuestions": 10
  }
]
```

---

### 3. Get Quiz by ID (Admin)
**Endpoint:** `GET /quiz/admin/:quizId`  
**Auth Required:** Yes (Admin only)  
**Description:** Get a specific quiz with all details including correct answers

**URL Parameters:**
- `quizId` - Quiz ID

---

### 4. Update Quiz
**Endpoint:** `PUT /quiz/admin/:quizId`  
**Auth Required:** Yes (Admin only)  
**Description:** Update quiz details

**URL Parameters:**
- `quizId` - Quiz ID

**Request Body:**
```json
{
  "title": "Updated Quiz Title",
  "questions": [...],
  "passingScore": 75
}
```

---

### 5. Delete Quiz
**Endpoint:** `DELETE /quiz/admin/:quizId`  
**Auth Required:** Yes (Admin only)  
**Description:** Delete a quiz

**URL Parameters:**
- `quizId` - Quiz ID

**Response:**
```json
{
  "message": "Quiz deleted successfully"
}
```

---

### 6. Link Quiz to Lesson
**Endpoint:** `POST /quiz/admin/:quizId/link-lesson/:lessonId`  
**Auth Required:** Yes (Admin only)  
**Description:** Link a quiz to a specific lesson

**URL Parameters:**
- `quizId` - Quiz ID
- `lessonId` - Lesson ID

---

### 7. Unlink Quiz from Lesson
**Endpoint:** `DELETE /quiz/admin/:quizId/unlink-lesson`  
**Auth Required:** Yes (Admin only)  
**Description:** Remove the link between quiz and lesson

**URL Parameters:**
- `quizId` - Quiz ID

---

## User Endpoints

### 8. Get All Quizzes
**Endpoint:** `GET /quiz`  
**Auth Required:** No  
**Description:** Get all available quizzes (questions without correct answers)

**Response:**
```json
[
  {
    "_id": "quiz_id",
    "title": "DBMS Fundamentals Quiz",
    "description": "Test your knowledge",
    "totalQuestions": 10,
    "timeLimit": 30,
    "passingScore": 70
  }
]
```

---

### 9. Get Quiz by ID
**Endpoint:** `GET /quiz/:quizId`  
**Auth Required:** No  
**Description:** Get a specific quiz (questions without correct answers)

**URL Parameters:**
- `quizId` - Quiz ID

---

### 10. Get Quiz by Lesson
**Endpoint:** `GET /quiz/lesson/:lessonId`  
**Auth Required:** No  
**Description:** Get quiz associated with a specific lesson

**URL Parameters:**
- `lessonId` - Lesson ID

---

### 11. Submit Quiz
**Endpoint:** `POST /quiz/submit`  
**Auth Required:** Yes  
**Description:** Submit quiz answers and get results

**Request Body:**
```json
{
  "quizId": "quiz_id",
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": 0
    }
  ]
}
```

**Response:**
```json
{
  "score": 85,
  "totalQuestions": 10,
  "correctAnswers": 9,
  "passed": true,
  "submittedAt": "2024-01-01T00:00:00.000Z"
}
```

---

# Class Activity API

## Admin Endpoints

### 1. Create Class Activity
**Endpoint:** `POST /class-activity/admin`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `multipart/form-data`  
**Description:** Create a new class activity

**Form Data:**
```
title: "Database Design Exercise"
description: "Design a database schema for a library system"
duration: 60
linkedLessonId: "lesson_id" (optional)
file: [markdown file] (optional)
```

**Response:**
```json
{
  "_id": "activity_id",
  "title": "Database Design Exercise",
  "description": "Design a database schema for a library system",
  "duration": 60,
  "content": "...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get All Class Activities (Admin)
**Endpoint:** `GET /class-activity/admin`  
**Auth Required:** Yes (Admin only)  
**Description:** Get all class activities with full details

**Response:**
```json
[
  {
    "_id": "activity_id",
    "title": "Database Design Exercise",
    "description": "...",
    "duration": 60,
    "content": "Full markdown content...",
    "linkedLessonId": "lesson_id"
  }
]
```

---

### 3. Get Class Activity by ID (Admin)
**Endpoint:** `GET /class-activity/admin/:activityId`  
**Auth Required:** Yes (Admin only)  
**Description:** Get a specific class activity with full details

**URL Parameters:**
- `activityId` - Activity ID

---

### 4. Update Class Activity
**Endpoint:** `PUT /class-activity/admin/:activityId`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `multipart/form-data`  
**Description:** Update class activity details

**URL Parameters:**
- `activityId` - Activity ID

**Form Data:**
```
title: "Updated Title" (optional)
description: "Updated description" (optional)
duration: 90 (optional)
file: [markdown file] (optional)
```

---

### 5. Delete Class Activity
**Endpoint:** `DELETE /class-activity/admin/:activityId`  
**Auth Required:** Yes (Admin only)  
**Description:** Delete a class activity

**URL Parameters:**
- `activityId` - Activity ID

**Response:**
```json
{
  "message": "Class activity deleted successfully"
}
```

---

### 6. Link Activity to Lesson
**Endpoint:** `POST /class-activity/admin/:activityId/link-lesson/:lessonId`  
**Auth Required:** Yes (Admin only)  
**Description:** Link a class activity to a specific lesson

**URL Parameters:**
- `activityId` - Activity ID
- `lessonId` - Lesson ID

---

### 7. Unlink Activity from Lesson
**Endpoint:** `DELETE /class-activity/admin/:activityId/unlink-lesson`  
**Auth Required:** Yes (Admin only)  
**Description:** Remove the link between activity and lesson

**URL Parameters:**
- `activityId` - Activity ID

---

## User Endpoints

### 8. Get All Class Activities
**Endpoint:** `GET /class-activity`  
**Auth Required:** No  
**Description:** Get all available class activities

**Response:**
```json
[
  {
    "_id": "activity_id",
    "title": "Database Design Exercise",
    "description": "Design a database schema",
    "duration": 60
  }
]
```

---

### 9. Get Class Activity by ID
**Endpoint:** `GET /class-activity/:activityId`  
**Auth Required:** No  
**Description:** Get a specific class activity

**URL Parameters:**
- `activityId` - Activity ID

---

### 10. Get Activity by Lesson
**Endpoint:** `GET /class-activity/lesson/:lessonId`  
**Auth Required:** No  
**Description:** Get class activity associated with a specific lesson

**URL Parameters:**
- `lessonId` - Lesson ID

---

# Assignments API

## Admin Endpoints

### 1. Create Assignment
**Endpoint:** `POST /assignment/admin`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `multipart/form-data`  
**Description:** Create a new assignment

**Form Data:**
```
title: "SQL Queries Assignment"
description: "Practice writing complex SQL queries"
linkedLessonId: "lesson_id" (optional)
file: [markdown file] (optional)
```

**Response:**
```json
{
  "_id": "assignment_id",
  "title": "SQL Queries Assignment",
  "description": "Practice writing complex SQL queries",
  "content": "...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get All Assignments (Admin)
**Endpoint:** `GET /assignment/admin`  
**Auth Required:** Yes (Admin only)  
**Description:** Get all assignments with full details

**Response:**
```json
[
  {
    "_id": "assignment_id",
    "title": "SQL Queries Assignment",
    "description": "...",
    "content": "Full markdown content...",
    "linkedLessonId": "lesson_id"
  }
]
```

---

### 3. Get Assignment by ID (Admin)
**Endpoint:** `GET /assignment/admin/:assignmentId`  
**Auth Required:** Yes (Admin only)  
**Description:** Get a specific assignment with full details

**URL Parameters:**
- `assignmentId` - Assignment ID

---

### 4. Update Assignment
**Endpoint:** `PUT /assignment/admin/:assignmentId`  
**Auth Required:** Yes (Admin only)  
**Content-Type:** `multipart/form-data`  
**Description:** Update assignment details

**URL Parameters:**
- `assignmentId` - Assignment ID

**Form Data:**
```
title: "Updated Title" (optional)
description: "Updated description" (optional)
file: [markdown file] (optional)
```

---

### 5. Delete Assignment
**Endpoint:** `DELETE /assignment/admin/:assignmentId`  
**Auth Required:** Yes (Admin only)  
**Description:** Delete an assignment

**URL Parameters:**
- `assignmentId` - Assignment ID

**Response:**
```json
{
  "message": "Assignment deleted successfully"
}
```

---

### 6. Link Assignment to Lesson
**Endpoint:** `POST /assignment/admin/:assignmentId/link-lesson/:lessonId`  
**Auth Required:** Yes (Admin only)  
**Description:** Link an assignment to a specific lesson

**URL Parameters:**
- `assignmentId` - Assignment ID
- `lessonId` - Lesson ID

---

### 7. Unlink Assignment from Lesson
**Endpoint:** `DELETE /assignment/admin/:assignmentId/unlink-lesson`  
**Auth Required:** Yes (Admin only)  
**Description:** Remove the link between assignment and lesson

**URL Parameters:**
- `assignmentId` - Assignment ID

---

## User Endpoints

### 8. Get All Assignments
**Endpoint:** `GET /assignment`  
**Auth Required:** No  
**Description:** Get all available assignments

**Response:**
```json
[
  {
    "_id": "assignment_id",
    "title": "SQL Queries Assignment",
    "description": "Practice writing complex SQL queries"
  }
]
```

---

### 9. Get Assignment by ID
**Endpoint:** `GET /assignment/:assignmentId`  
**Auth Required:** No  
**Description:** Get a specific assignment

**URL Parameters:**
- `assignmentId` - Assignment ID

---

### 10. Get Assignment by Lesson
**Endpoint:** `GET /assignment/lesson/:lessonId`  
**Auth Required:** No  
**Description:** Get assignment associated with a specific lesson

**URL Parameters:**
- `lessonId` - Lesson ID

---

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Invalid data)
- `401` - Unauthorized (Not authenticated)
- `403` - Forbidden (Not authorized/admin required)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Admin endpoints additionally require the user to have the `ADMIN` role.

---

## File Upload Notes

For endpoints accepting file uploads:
- Use `multipart/form-data` content type
- Markdown files (.md) for content
- Video files for lessons (.mp4, .webm, etc.)
- Resource files (PDFs, documents, etc.)
- Maximum file sizes and types are configured server-side

---

## Base URL

All endpoints should be prefixed with your API base URL:
```
http://localhost:3000/api
```

or for production:
```
https://your-domain.com/api
```
