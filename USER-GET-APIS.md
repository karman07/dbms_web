# User GET APIs Documentation

This document lists all GET endpoints available for regular users (non-admin routes).

---

## Table of Contents

- [Courses](#courses)
- [Docs (Documentation)](#docs-documentation)
- [Quiz](#quiz)
- [Assignment](#assignment)
- [Class Activity](#class-activity)
- [Media](#media)
- [Notes](#notes)
- [Users/Profile](#usersprofile)

---

## Courses

### 1. Get Published Course
- **Endpoint:** `GET /courses`
- **Authentication:** Not required
- **Description:** Get the published course with all published sections and lessons, including linked resources
- **Response:** Complete course object with populated resources (quizzes, assignments, activities, media, docs)

### 2. Get My Progress
- **Endpoint:** `GET /courses/my-progress`
- **Authentication:** Required (JWT)
- **Description:** Get the current user's progress in the course
- **Response:** UserProgress object with section and lesson progress details

---

## Docs (Documentation)

### 1. Get All Topics
- **Endpoint:** `GET /docs/topics`
- **Authentication:** Not required
- **Description:** List all documentation topics (default course: dbms)
- **Response:** Array of topic objects (without subtopic content)

### 2. List Subtopics
- **Endpoint:** `GET /docs/topic/:id/subtopics`
- **Authentication:** Not required
- **Description:** List all subtopics for a specific topic
- **URL Parameters:**
  - `id` - Topic ID
- **Response:** Array of subtopics with name and filename

### 3. Get Subtopic Content
- **Endpoint:** `GET /docs/topic/:id/subtopic/:name`
- **Authentication:** Not required
- **Description:** Get markdown content of a specific subtopic
- **URL Parameters:**
  - `id` - Topic ID
  - `name` - Subtopic name
- **Response:** Subtopic object with content

### 4. Download Subtopic
- **Endpoint:** `GET /docs/topic/:id/subtopic/:name/download`
- **Authentication:** Not required
- **Description:** Download subtopic as markdown file
- **URL Parameters:**
  - `id` - Topic ID
  - `name` - Subtopic name
- **Response:** Markdown file download

---

## Quiz

### 1. Get All Quizzes
- **Endpoint:** `GET /quiz`
- **Authentication:** Not required
- **Description:** Get all quizzes
- **Response:** Array of quiz objects

### 2. Get Quiz by ID
- **Endpoint:** `GET /quiz/:quizId`
- **Authentication:** Not required
- **Description:** Get a specific quiz by ID
- **URL Parameters:**
  - `quizId` - Quiz ID
- **Response:** Quiz object with questions

### 3. Get Quizzes by Lesson
- **Endpoint:** `GET /quiz/lesson/:lessonId`
- **Authentication:** Not required
- **Description:** Get all quizzes linked to a specific lesson
- **URL Parameters:**
  - `lessonId` - Lesson ID
- **Response:** Array of quiz objects

---

## Assignment

### 1. Get All Assignments
- **Endpoint:** `GET /assignment`
- **Authentication:** Not required
- **Description:** Get all assignments
- **Response:** Array of assignment objects

### 2. Get Assignment by ID
- **Endpoint:** `GET /assignment/:assignmentId`
- **Authentication:** Not required
- **Description:** Get a specific assignment by ID
- **URL Parameters:**
  - `assignmentId` - Assignment ID
- **Response:** Assignment object

### 3. Get Assignments by Lesson
- **Endpoint:** `GET /assignment/lesson/:lessonId`
- **Authentication:** Not required
- **Description:** Get all assignments linked to a specific lesson
- **URL Parameters:**
  - `lessonId` - Lesson ID
- **Response:** Array of assignment objects

---

## Class Activity

### 1. Get All Class Activities
- **Endpoint:** `GET /class-activity`
- **Authentication:** Not required
- **Description:** Get all class activities
- **Response:** Array of class activity objects

### 2. Get Class Activity by ID
- **Endpoint:** `GET /class-activity/:activityId`
- **Authentication:** Not required
- **Description:** Get a specific class activity by ID
- **URL Parameters:**
  - `activityId` - Activity ID
- **Response:** Class activity object

### 3. Get Class Activities by Lesson
- **Endpoint:** `GET /class-activity/lesson/:lessonId`
- **Authentication:** Not required
- **Description:** Get all class activities linked to a specific lesson
- **URL Parameters:**
  - `lessonId` - Lesson ID
- **Response:** Array of class activity objects

---

## Media

### 1. Get All Media
- **Endpoint:** `GET /media`
- **Authentication:** Required (JWT)
- **Description:** Get all media items
- **Query Parameters:**
  - `userId` (optional) - Filter by user ID
- **Response:** Array of media objects sorted by creation date (newest first)

### 2. Search Media
- **Endpoint:** `GET /media/search`
- **Authentication:** Required (JWT)
- **Description:** Search media by title or description
- **Query Parameters:**
  - `q` - Search query string
- **Response:** Array of matching media objects

### 3. Get Media by ID
- **Endpoint:** `GET /media/:id`
- **Authentication:** Required (JWT)
- **Description:** Get a specific media item by ID
- **URL Parameters:**
  - `id` - Media ID
- **Response:** Media object with details

---

## Notes

### 1. Get All Notes
- **Endpoint:** `GET /notes`
- **Authentication:** Required (JWT)
- **Description:** Get all notes for the current user
- **Response:** Array of note objects

### 2. Get My Notes
- **Endpoint:** `GET /notes/my-notes`
- **Authentication:** Required (JWT)
- **Description:** Get notes created by the current user
- **Response:** Array of user's notes

### 3. Get Bookmarked Notes
- **Endpoint:** `GET /notes/bookmarked`
- **Authentication:** Required (JWT)
- **Description:** Get notes bookmarked by the current user
- **Response:** Array of bookmarked notes

### 4. Get Liked Notes
- **Endpoint:** `GET /notes/liked`
- **Authentication:** Required (JWT)
- **Description:** Get notes liked by the current user
- **Response:** Array of liked notes

### 5. Search Notes
- **Endpoint:** `GET /notes/search`
- **Authentication:** Optional (JWT)
- **Description:** Search notes by content or title
- **Query Parameters:**
  - `q` - Search query string
- **Response:** Array of matching notes

### 6. Get Notes by Source
- **Endpoint:** `GET /notes/source/:source`
- **Authentication:** Optional (JWT)
- **Description:** Get notes from a specific source (lesson, quiz, assignment, etc.)
- **URL Parameters:**
  - `source` - Source identifier
- **Response:** Array of notes from the specified source

### 7. Get Note by ID
- **Endpoint:** `GET /notes/:id`
- **Authentication:** Optional (JWT)
- **Description:** Get a specific note by ID
- **URL Parameters:**
  - `id` - Note ID
- **Response:** Note object

---

## Users/Profile

### 1. Get User Profile
- **Endpoint:** `GET /users/profile`
- **Authentication:** Required (JWT)
- **Description:** Get the current user's profile
- **Response:** User profile object

---

## Response Format Examples

### Course Response
```json
{
  "_id": "697b799d68dbbd913f3bc6a0",
  "title": "Database Management Systems (DBMS)",
  "description": "Complete DBMS tutorial...",
  "isPublished": true,
  "tags": [],
  "enrolledCount": 12,
  "sections": [
    {
      "_id": "69803f20da6a54b4d17839e9",
      "title": "Introduction to DBMS",
      "description": "Learn the basics",
      "order": 0,
      "lessons": [
        {
          "_id": "698204d7f417b09c8ec3e55a",
          "title": "What is DBMS?",
          "order": 0,
          "estimatedMinutes": 30,
          "isPublished": true,
          "linkedQuizzes": [...],
          "linkedAssignments": [...],
          "linkedActivities": [...],
          "media": [...],
          "docSubtopics": [...]
        }
      ]
    }
  ]
}
```

### User Progress Response
```json
{
  "_id": "...",
  "userId": "...",
  "courseId": "...",
  "sections": [
    {
      "sectionId": "...",
      "lessons": [
        {
          "lessonId": "...",
          "completed": true,
          "completedAt": "2026-02-03T10:00:00.000Z",
          "timeSpentMinutes": 45,
          "quizScore": 85,
          "quizAttempts": 2
        }
      ],
      "completedLessons": 5,
      "totalLessons": 10
    }
  ],
  "overallProgress": 50,
  "totalTimeSpentMinutes": 225,
  "enrolledAt": "2026-02-01T08:00:00.000Z",
  "lastAccessedAt": "2026-02-03T12:00:00.000Z"
}
```

### Quiz Response
```json
{
  "_id": "69803ff6da6a54b4d1783a21",
  "title": "DBMS Basics Quiz",
  "description": "Test your knowledge",
  "lessonId": "698204d7f417b09c8ec3e55a",
  "questions": [
    {
      "question": "What does DBMS stand for?",
      "options": [
        { "text": "Database Management System", "isCorrect": true },
        { "text": "Data Binary Management System", "isCorrect": false }
      ],
      "explanation": "DBMS stands for Database Management System"
    }
  ]
}
```

### Note Response
```json
{
  "_id": "...",
  "userId": "...",
  "title": "Important Concepts",
  "content": "# ACID Properties...",
  "source": "lesson-123",
  "isPublic": true,
  "bookmarkedBy": ["user1", "user2"],
  "likedBy": ["user3"],
  "createdAt": "2026-02-03T10:00:00.000Z",
  "updatedAt": "2026-02-03T12:00:00.000Z"
}
```

### Media Response
```json
{
  "_id": "69820e9e36ff5db32c9e9132",
  "title": "ER Diagram Tutorial",
  "description": "How to create ER diagrams",
  "type": "video",
  "filePath": "/uploads/media/video-123.mp4",
  "thumbnailPath": "/uploads/media/thumb-123.jpg",
  "fileSize": 25600000,
  "mimeType": "video/mp4",
  "uploadedBy": "...",
  "createdAt": "2026-02-03T10:00:00.000Z"
}
```

---

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Endpoints marked as "Not required" can be accessed without authentication but may return limited data for unauthenticated users.

---

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

**Last Updated:** February 3, 2026
