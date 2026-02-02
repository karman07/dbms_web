# Independent Quiz Module - API Documentation

## Overview

The Quiz module is **completely independent** and can exist with or without courses. Quizzes can optionally be linked to course lessons.

## Key Features

✅ **Independent Existence**: Quizzes exist separately, not tied to courses  
✅ **Optional Linking**: Can link quiz to lesson or keep it standalone  
✅ **No Course API Changes**: Course GET APIs remain exactly the same  
✅ **Full CRUD**: Create, read, update, delete quizzes independently  
✅ **Flexible**: Link/unlink quizzes to lessons anytime  

## Database Schema

```typescript
{
  _id: ObjectId,
  title: String (required),
  description: String (optional),
  lessonId: ObjectId (optional, indexed),
  questions: [
    {
      question: String (required),
      options: [
        {
          text: String (required),
          isCorrect: Boolean (required)
        }
      ],
      explanation: String (optional)
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Admin Endpoints

#### 1. Create Quiz (Independent)
```
POST /quiz/admin
```
**Body:**
```json
{
  "title": "DBMS Fundamentals Quiz",
  "description": "Test your knowledge of database basics",
  "questions": [
    {
      "question": "What is DBMS?",
      "options": [
        {"text": "Database Management System", "isCorrect": true},
        {"text": "Data Binary Management", "isCorrect": false}
      ],
      "explanation": "DBMS stands for Database Management System"
    }
  ]
}
```

#### 2. Get All Quizzes
```
GET /quiz/admin
```

#### 3. Get Quiz by ID
```
GET /quiz/admin/:quizId
```

#### 4. Update Quiz
```
PUT /quiz/admin/:quizId
```
**Body:**
```json
{
  "questions": [...]
}
```

#### 5. Delete Quiz
```
DELETE /quiz/admin/:quizId
```

#### 6. Link Quiz to Lesson
```
POST /quiz/admin/:quizId/link-lesson/:lessonId
```
**Description:** Links an existing quiz to a lesson

#### 7. Unlink Quiz from Lesson
```
DELETE /quiz/admin/:quizId/unlink-lesson
```
**Description:** Removes lesson link, quiz remains independent

### User Endpoints

#### 8. Get All Quizzes (Public)
```
GET /quiz
```

#### 9. Get Quiz by ID (Public)
```
GET /quiz/:quizId
```

#### 10. Get Quiz by Lesson
```
GET /quiz/lesson/:lessonId
```
**Description:** Get quiz linked to a specific lesson (if any)

#### 11. Submit Quiz
```
POST /quiz/submit
```
**Body:**
```json
{
  "quizId": "697c1234abcd1234abcd1234",
  "lessonId": "697b799d68dbbd913f3bc6af",
  "answers": [
    {"questionIndex": 0, "selectedOptionIndex": 0}
  ]
}
```

## Usage Workflows

### Workflow 1: Create Independent Quiz
```
1. POST /quiz/admin
   Body: { "title": "...", "questions": [...] }
   
2. Quiz exists independently
   Can be used for practice, assessments, etc.
```

### Workflow 2: Create Quiz and Link to Lesson
```
1. POST /quiz/admin
   Body: { "title": "...", "questions": [...] }
   Response: { "_id": "quizId123", ... }

2. POST /quiz/admin/quizId123/link-lesson/lessonId456
   Quiz now linked to lesson
```

### Workflow 3: Create Quiz with Lesson (One Step)
```
1. POST /quiz/admin
   Body: { 
     "title": "...",
     "lessonId": "lessonId456",
     "questions": [...]
   }
   Quiz created and linked in one step
```

### Workflow 4: Unlink Quiz from Lesson
```
1. DELETE /quiz/admin/quizId123/unlink-lesson
   Quiz becomes independent again
   Lesson no longer has quiz
```

### Workflow 5: User Takes Quiz
```
1. GET /quiz (browse all quizzes)
   OR
   GET /quiz/lesson/lessonId456 (get quiz for lesson)

2. POST /quiz/submit
   Body: { "quizId": "...", "answers": [...] }
   
3. Receive score and feedback
```

## Course Integration

### How Lessons Reference Quizzes

In your lesson, you can store the quizId:

```typescript
// Lesson schema (existing)
{
  _id: ObjectId,
  title: String,
  content: String,
  quizId: ObjectId (optional) // Reference to Quiz
}
```

### Getting Quiz for a Lesson

```javascript
// Frontend code
const lesson = await fetch('/courses').then(r => r.json());
const lessonId = lesson.sections[0].lessons[0]._id;

// Get quiz for this lesson
const quiz = await fetch(`/quiz/lesson/${lessonId}`).then(r => r.json());
```

### Course GET API (Unchanged)

```
GET /courses
GET /courses/admin
```

**Response remains exactly the same:**
```json
{
  "sections": [
    {
      "lessons": [
        {
          "_id": "lessonId",
          "title": "Lesson Title",
          "content": "...",
          "quiz": [...]  // This stays as is (embedded quiz)
        }
      ]
    }
  ]
}
```

**Note:** The embedded `quiz` field in lessons is separate from the Quiz module. You can:
- Keep using embedded quizzes (current approach)
- Use Quiz module for new quizzes
- Gradually migrate to Quiz module
- Use both simultaneously

## Benefits

1. **Independence**: Quizzes can exist without courses
2. **Flexibility**: Link/unlink quizzes anytime
3. **Reusability**: Same quiz can be used in multiple places
4. **No Breaking Changes**: Existing course APIs unchanged
5. **Scalability**: Manage quizzes separately from courses

## Complete Endpoint Summary

**Admin Endpoints (7):**
1. `POST /quiz/admin` - Create quiz
2. `GET /quiz/admin` - Get all quizzes
3. `GET /quiz/admin/:quizId` - Get quiz by ID
4. `PUT /quiz/admin/:quizId` - Update quiz
5. `DELETE /quiz/admin/:quizId` - Delete quiz
6. `POST /quiz/admin/:quizId/link-lesson/:lessonId` - Link to lesson
7. `DELETE /quiz/admin/:quizId/unlink-lesson` - Unlink from lesson

**User Endpoints (4):**
8. `GET /quiz` - Get all quizzes
9. `GET /quiz/:quizId` - Get quiz by ID
10. `GET /quiz/lesson/:lessonId` - Get quiz by lesson
11. `POST /quiz/submit` - Submit quiz

**Total: 11 Quiz Endpoints**

## Next Steps

Use this pattern for Assignment and Class Activity modules:
- Independent collections
- Optional lessonId reference
- Link/unlink functionality
- No changes to course APIs