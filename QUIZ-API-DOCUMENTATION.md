# Quiz API Documentation

This document lists all Quiz-related API routes, authentication, request/response examples, and usage notes.

---

## Base Path
All endpoints are prefixed with `/quiz` (e.g., `POST /quiz/admin`).

---

# Admin Endpoints

1. Create Quiz
- Method: POST
- Path: /quiz/admin
- Auth: Yes (Admin only)
- Description: Create an independent quiz
- Body (example):
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
- Success Response (example): 201
```json
{
  "_id": "quiz_id",
  "title": "DBMS Fundamentals Quiz",
  "totalQuestions": 10,
  "passingScore": 70,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```


2. Get All Quizzes (Admin)
- Method: GET
- Path: /quiz/admin
- Auth: Yes (Admin only)
- Description: Fetch all quizzes with full details


3. Get Quiz by ID (Admin)
- Method: GET
- Path: /quiz/admin/:quizId
- Auth: Yes (Admin only)
- Params:
  - quizId — ID of the quiz
- Description: Get a specific quiz including correct answers


4. Update Quiz
- Method: PUT
- Path: /quiz/admin/:quizId
- Auth: Yes (Admin only)
- Params:
  - quizId — ID of the quiz
- Body (example):
```json
{
  "title": "Updated Quiz Title",
  "questions": [...],
  "passingScore": 75
}
```


5. Delete Quiz
- Method: DELETE
- Path: /quiz/admin/:quizId
- Auth: Yes (Admin only)
- Params:
  - quizId — ID of the quiz
- Success Response (example): 200
```json
{ "message": "Quiz deleted successfully" }
```


6. Link Quiz to Lesson
- Method: POST
- Path: /quiz/admin/:quizId/link-lesson/:lessonId
- Auth: Yes (Admin only)
- Params:
  - quizId — Quiz ID
  - lessonId — Lesson ID
- Description: Link quiz to a lesson


7. Unlink Quiz from Lesson
- Method: DELETE
- Path: /quiz/admin/:quizId/unlink-lesson
- Auth: Yes (Admin only)
- Params:
  - quizId — Quiz ID
- Description: Remove the link between quiz and lesson

---

# User Endpoints

8. Get All Quizzes
- Method: GET
- Path: /quiz
- Auth: No
- Description: Get a list of quizzes (questions returned without correct answers)
- Response (example):
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


9. Get Quiz by ID
- Method: GET
- Path: /quiz/:quizId
- Auth: No
- Params:
  - quizId — Quiz ID
- Description: Get quiz details (no correct answers)


10. Get Quiz by Lesson
- Method: GET
- Path: /quiz/lesson/:lessonId
- Auth: No
- Params:
  - lessonId — Lesson ID
- Description: Get quiz associated with a lesson


11. Submit Quiz
- Method: POST
- Path: /quiz/submit
- Auth: Yes
- Description: Submit answers for evaluation
- Body (example):
```json
{
  "quizId": "quiz_id",
  "answers": [
    { "questionId": "q1", "selectedAnswer": 0 }
  ]
}
```
- Success Response (example): 200
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

---

## Common Response Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes
- Admin endpoints can expose correct answers; user endpoints should exclude correct answers from responses.
- When linking/unlinking quizzes to lessons, ensure lesson IDs exist.

