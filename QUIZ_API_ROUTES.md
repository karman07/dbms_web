# Quiz API Documentation

This document lists all Quiz-related API routes, authentication, request/response examples, and usage notes.

---

## Base Path
All endpoints are prefixed with `/quiz` (e.g., `POST /quiz/admin`).

---

## Admin Endpoints

### 1. Create Quiz
- **Method:** `POST`
- **Path:** `/quiz/admin`
- **Auth:** Yes (Admin only)
- **Description:** Create an independent quiz
- **Request Body:**
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
  "linkedLessonId": "lesson_id"
}
```
- **Success Response:** `201 Created`
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
- **Method:** `GET`
- **Path:** `/quiz/admin`
- **Auth:** Yes (Admin only)
- **Description:** Fetch all quizzes with full details including correct answers
- **Success Response:** `200 OK`
```json
[
  {
    "_id": "quiz_id",
    "title": "DBMS Fundamentals Quiz",
    "description": "Test your knowledge",
    "questions": [...],
    "totalQuestions": 10,
    "passingScore": 70,
    "timeLimit": 30,
    "linkedLessonId": "lesson_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3. Get Quiz by ID (Admin)
- **Method:** `GET`
- **Path:** `/quiz/admin/:quizId`
- **Auth:** Yes (Admin only)
- **Params:**
  - `quizId` — ID of the quiz
- **Description:** Get a specific quiz including correct answers
- **Success Response:** `200 OK`
```json
{
  "_id": "quiz_id",
  "title": "DBMS Fundamentals Quiz",
  "description": "Test your knowledge",
  "questions": [
    {
      "_id": "q1",
      "question": "What does SQL stand for?",
      "options": ["Structured Query Language", "Simple Query Language", ...],
      "correctAnswer": 0
    }
  ],
  "passingScore": 70,
  "timeLimit": 30,
  "linkedLessonId": "lesson_id"
}
```

---

### 4. Update Quiz
- **Method:** `PUT`
- **Path:** `/quiz/admin/:quizId`
- **Auth:** Yes (Admin only)
- **Params:**
  - `quizId` — ID of the quiz
- **Request Body:**
```json
{
  "title": "Updated Quiz Title",
  "description": "Updated description",
  "questions": [...],
  "passingScore": 75,
  "timeLimit": 45
}
```
- **Success Response:** `200 OK`
```json
{
  "_id": "quiz_id",
  "title": "Updated Quiz Title",
  "totalQuestions": 10,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Delete Quiz
- **Method:** `DELETE`
- **Path:** `/quiz/admin/:quizId`
- **Auth:** Yes (Admin only)
- **Params:**
  - `quizId` — ID of the quiz
- **Success Response:** `200 OK`
```json
{
  "message": "Quiz deleted successfully"
}
```

---

### 6. Link Quiz to Lesson
- **Method:** `POST`
- **Path:** `/quiz/admin/:quizId/link-lesson/:lessonId`
- **Auth:** Yes (Admin only)
- **Params:**
  - `quizId` — Quiz ID
  - `lessonId` — Lesson ID
- **Description:** Link quiz to a lesson
- **Success Response:** `200 OK`
```json
{
  "message": "Quiz linked to lesson successfully",
  "quiz": {
    "_id": "quiz_id",
    "linkedLessonId": "lesson_id"
  }
}
```

---

### 7. Unlink Quiz from Lesson
- **Method:** `DELETE`
- **Path:** `/quiz/admin/:quizId/unlink-lesson`
- **Auth:** Yes (Admin only)
- **Params:**
  - `quizId` — Quiz ID
- **Description:** Remove the link between quiz and lesson
- **Success Response:** `200 OK`
```json
{
  "message": "Quiz unlinked from lesson successfully"
}
```

---

## User Endpoints

### 8. Get All Quizzes
- **Method:** `GET`
- **Path:** `/quiz`
- **Auth:** No
- **Description:** Get a list of quizzes (questions returned without correct answers)
- **Success Response:** `200 OK`
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
- **Method:** `GET`
- **Path:** `/quiz/:quizId`
- **Auth:** No
- **Params:**
  - `quizId` — Quiz ID
- **Description:** Get quiz details (no correct answers exposed)
- **Success Response:** `200 OK`
```json
{
  "_id": "quiz_id",
  "title": "DBMS Fundamentals Quiz",
  "description": "Test your knowledge",
  "questions": [
    {
      "_id": "q1",
      "question": "What does SQL stand for?",
      "options": ["Structured Query Language", "Simple Query Language", ...]
    }
  ],
  "totalQuestions": 10,
  "timeLimit": 30,
  "passingScore": 70
}
```

---

### 10. Get Quiz by Lesson
- **Method:** `GET`
- **Path:** `/quiz/lesson/:lessonId`
- **Auth:** No
- **Params:**
  - `lessonId` — Lesson ID
- **Description:** Get quiz associated with a lesson
- **Success Response:** `200 OK`
```json
{
  "_id": "quiz_id",
  "title": "Lesson Quiz",
  "description": "Quiz for this lesson",
  "questions": [...],
  "totalQuestions": 5,
  "timeLimit": 15,
  "passingScore": 60
}
```

---

### 11. Submit Quiz
- **Method:** `POST`
- **Path:** `/quiz/submit`
- **Auth:** Yes (User must be authenticated)
- **Description:** Submit answers for evaluation
- **Request Body:**
```json
{
  "quizId": "quiz_id",
  "answers": [
    { "questionId": "q1", "selectedAnswer": 0 },
    { "questionId": "q2", "selectedAnswer": 2 }
  ]
}
```
- **Success Response:** `200 OK`
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

## Authentication
- Use `Authorization: Bearer <token>` header for endpoints requiring authentication.
- Admin endpoints require the user to have the `ADMIN` role.
- User endpoints that require auth will return `401 Unauthorized` if no valid token is provided.

---

## Common Response Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (quiz or lesson not found)
- `500` - Internal Server Error

---

## Notes
- **Admin endpoints** can expose correct answers for management purposes
- **User endpoints** exclude correct answers from responses to maintain quiz integrity
- When linking/unlinking quizzes to lessons, ensure lesson IDs exist
- A quiz can only be linked to one lesson at a time
- Deleting a quiz will automatically unlink it from any associated lesson
- Questions must have at least 2 options and a valid `correctAnswer` index

---

## Implementation Summary

### Total Endpoints: 11
- **Admin Endpoints:** 7
  1. Create Quiz
  2. Get All Quizzes (Admin)
  3. Get Quiz by ID (Admin)
  4. Update Quiz
  5. Delete Quiz
  6. Link Quiz to Lesson
  7. Unlink Quiz from Lesson

- **User Endpoints:** 4
  8. Get All Quizzes
  9. Get Quiz by ID
  10. Get Quiz by Lesson
  11. Submit Quiz
