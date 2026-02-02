# Quiz Module API Documentation

Complete documentation for the separate Quiz module that links to course lessons.

## Overview

The Quiz module is a separate collection that stores quizzes linked to course lessons via `lessonId`. When a quiz is deleted, the associated lesson is automatically unpublished.

## Key Features

- ✅ Separate quiz collection (not embedded in lessons)
- ✅ Linked to lessons via `lessonId` reference
- ✅ Auto-unpublish lesson when quiz is deleted
- ✅ GET course API automatically populates quiz data
- ✅ Maintains backward compatibility with existing API structure
- ✅ Full CRUD operations for admins
- ✅ Quiz submission and scoring for users

## Database Schema

```typescript
{
  _id: ObjectId,
  lessonId: ObjectId (indexed, required),
  sectionId: ObjectId (required),
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

#### 1. Create Quiz for Lesson
**Endpoint:** `POST /quiz/admin/lesson/:lessonId`  
**Auth:** JWT + ADMIN role

**Request:**
```json
{
  "sectionId": "697b799d68dbbd913f3bc6aa",
  "questions": [
    {
      "question": "What is a database?",
      "options": [
        {"text": "A collection of data", "isCorrect": true},
        {"text": "A programming language", "isCorrect": false},
        {"text": "An operating system", "isCorrect": false}
      ],
      "explanation": "A database is an organized collection of structured data"
    }
  ]
}
```

**Response:**
```json
{
  "_id": "697c1234abcd1234abcd1234",
  "lessonId": "697b799d68dbbd913f3bc6af",
  "sectionId": "697b799d68dbbd913f3bc6aa",
  "questions": [...],
  "createdAt": "2026-01-29T10:00:00.000Z",
  "updatedAt": "2026-01-29T10:00:00.000Z"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/quiz/admin/lesson/697b799d68dbbd913f3bc6af \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": "697b799d68dbbd913f3bc6aa",
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
  }'
```

---

#### 2. Get Quiz by Lesson ID
**Endpoint:** `GET /quiz/admin/lesson/:lessonId`  
**Auth:** JWT + ADMIN role

**Response:**
```json
{
  "_id": "697c1234abcd1234abcd1234",
  "lessonId": "697b799d68dbbd913f3bc6af",
  "sectionId": "697b799d68dbbd913f3bc6aa",
  "questions": [...],
  "createdAt": "2026-01-29T10:00:00.000Z",
  "updatedAt": "2026-01-29T10:00:00.000Z"
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:3000/quiz/admin/lesson/697b799d68dbbd913f3bc6af \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### 3. Update Quiz
**Endpoint:** `PUT /quiz/admin/:quizId`  
**Auth:** JWT + ADMIN role

**Request:**
```json
{
  "questions": [
    {
      "question": "Updated question?",
      "options": [
        {"text": "Option 1", "isCorrect": true},
        {"text": "Option 2", "isCorrect": false}
      ],
      "explanation": "Updated explanation"
    }
  ]
}
```

**Response:** Updated quiz object

**Curl Example:**
```bash
curl -X PUT http://localhost:3000/quiz/admin/697c1234abcd1234abcd1234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [...]
  }'
```

---

#### 4. Delete Quiz (Unpublishes Lesson)
**Endpoint:** `DELETE /quiz/admin/:quizId`  
**Auth:** JWT + ADMIN role

**Response:**
```json
{
  "message": "Quiz deleted and lesson unpublished successfully"
}
```

**Important:** When a quiz is deleted, the associated lesson's `isPublished` field is automatically set to `false`.

**Curl Example:**
```bash
curl -X DELETE http://localhost:3000/quiz/admin/697c1234abcd1234abcd1234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### User Endpoints

#### 5. Get Quiz for Lesson
**Endpoint:** `GET /quiz/lesson/:lessonId`  
**Auth:** None (public)

**Response:** Same as admin GET, but only for published lessons

**Curl Example:**
```bash
curl -X GET http://localhost:3000/quiz/lesson/697b799d68dbbd913f3bc6af
```

---

#### 6. Submit Quiz
**Endpoint:** `POST /quiz/submit`  
**Auth:** JWT (any authenticated user)

**Request:**
```json
{
  "quizId": "697c1234abcd1234abcd1234",
  "lessonId": "697b799d68dbbd913f3bc6af",
  "answers": [
    {
      "questionIndex": 0,
      "selectedOptionIndex": 0
    },
    {
      "questionIndex": 1,
      "selectedOptionIndex": 2
    }
  ]
}
```

**Response:**
```json
{
  "score": 85,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "passed": true,
  "results": [
    {
      "questionIndex": 0,
      "correct": true,
      "explanation": "Correct! DBMS stands for..."
    },
    {
      "questionIndex": 1,
      "correct": false,
      "explanation": "The correct answer is..."
    }
  ]
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/quiz/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "697c1234abcd1234abcd1234",
    "lessonId": "697b799d68dbbd913f3bc6af",
    "answers": [
      {"questionIndex": 0, "selectedOptionIndex": 0},
      {"questionIndex": 1, "selectedOptionIndex": 1}
    ]
  }'
```

---

## Course GET API Integration

The existing course GET endpoints automatically populate quiz data:

### GET /courses (Public)
### GET /courses/admin (Admin)

**Response Structure (Unchanged):**
```json
{
  "_id": "697b799d68dbbd913f3bc6a0",
  "title": "DBMS Course",
  "sections": [
    {
      "_id": "697b799d68dbbd913f3bc6aa",
      "title": "Introduction",
      "lessons": [
        {
          "_id": "697b799d68dbbd913f3bc6af",
          "title": "DBMS Tutorial",
          "content": "...",
          "quiz": [
            {
              "question": "What is DBMS?",
              "options": [
                {"text": "Database Management System", "isCorrect": true},
                {"text": "Data Binary Management", "isCorrect": false}
              ],
              "explanation": "DBMS stands for..."
            }
          ]
        }
      ]
    }
  ]
}
```

**Note:** The `quiz` field in lessons is automatically populated from the Quiz collection. The API response structure remains exactly the same as before.

---

## How It Works

### 1. Creating a Quiz
```
Admin creates lesson → Admin creates quiz for that lesson
Quiz stored in separate collection with lessonId reference
```

### 2. Getting Course Data
```
User/Admin calls GET /courses
→ Course service fetches course from database
→ For each lesson, queries Quiz collection by lessonId
→ Populates quiz data into lesson object
→ Returns complete course with quiz data
```

### 3. Deleting a Quiz
```
Admin deletes quiz
→ Quiz service finds associated lesson by lessonId
→ Sets lesson.isPublished = false in Course collection
→ Deletes quiz from Quiz collection
→ Lesson becomes unpublished automatically
```

### 4. Submitting a Quiz
```
User submits answers
→ Quiz service fetches quiz by quizId
→ Compares user answers with correct answers
→ Calculates score and pass/fail status
→ Returns detailed results with explanations
```

---

## Workflow Examples

### Admin Workflow: Adding Quiz to Lesson

```
1. POST /courses/admin/section (create section)
2. POST /courses/admin/section/0/lesson (create lesson)
   Response: { "_id": "lessonId123", ... }
3. POST /quiz/admin/lesson/lessonId123 (create quiz)
   Body: { "sectionId": "...", "questions": [...] }
4. GET /courses/admin (verify quiz appears in lesson)
```

### User Workflow: Taking Quiz

```
1. GET /courses (get course with quiz data)
2. User reads lesson content
3. User sees quiz questions
4. POST /quiz/submit (submit answers)
   Body: { "quizId": "...", "lessonId": "...", "answers": [...] }
5. Receive score and feedback
```

### Admin Workflow: Updating Quiz

```
1. GET /quiz/admin/lesson/lessonId123 (get current quiz)
2. PUT /quiz/admin/quizId456 (update questions)
   Body: { "questions": [...] }
3. GET /courses/admin (verify changes)
```

### Admin Workflow: Removing Quiz

```
1. DELETE /quiz/admin/quizId456
   → Quiz deleted
   → Lesson automatically unpublished
2. GET /courses/admin
   → Lesson shows isPublished: false
   → Quiz data no longer appears
```

---

## Benefits of Separate Quiz Module

1. **Better Organization**: Quizzes managed independently
2. **Easier Maintenance**: Update quizzes without touching course structure
3. **Scalability**: Can add more quiz features without bloating course model
4. **Reusability**: Same quiz can be linked to multiple lessons (future feature)
5. **Performance**: Can query/cache quizzes separately
6. **Backward Compatible**: Existing API structure unchanged

---

## Migration from Embedded Quiz

If you have existing quizzes embedded in lessons:

```typescript
// Migration script (run once)
async function migrateQuizzes() {
  const course = await courseModel.findOne();
  
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      if (lesson.quiz && lesson.quiz.length > 0) {
        // Create separate quiz
        await quizService.create({
          lessonId: lesson._id.toString(),
          sectionId: section._id.toString(),
          questions: lesson.quiz
        });
        
        // Optionally remove from lesson
        // lesson.quiz = [];
      }
    }
  }
  
  await course.save();
}
```

---

## Complete Endpoint Summary

**Admin Endpoints (4):**
1. `POST /quiz/admin/lesson/:lessonId` - Create quiz
2. `GET /quiz/admin/lesson/:lessonId` - Get quiz by lesson
3. `PUT /quiz/admin/:quizId` - Update quiz
4. `DELETE /quiz/admin/:quizId` - Delete quiz (unpublishes lesson)

**User Endpoints (2):**
5. `GET /quiz/lesson/:lessonId` - Get quiz
6. `POST /quiz/submit` - Submit quiz answers

**Total: 6 Quiz Endpoints**

---

## Error Handling

**Common Errors:**
- 400: Invalid quiz data or answers
- 401: Unauthorized (missing JWT)
- 403: Forbidden (not admin)
- 404: Quiz or lesson not found

**Example Error Response:**
```json
{
  "statusCode": 404,
  "message": "Quiz not found",
  "error": "Not Found"
}
```

---

## Next Steps

Use this Quiz module as a template to create:
- **Assignment Module**: Similar structure with markdown content
- **Class Activity Module**: Similar structure with markdown content

Both will follow the same pattern:
- Separate collection
- Linked via lessonId
- Auto-populate in GET course API
- Full CRUD operations
- File upload support for markdown