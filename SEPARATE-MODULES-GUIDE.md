# Separate Modules Implementation Guide

## Overview
Creating separate modules for Quiz, Assignment, and Class Activities that link to course lessons while maintaining the existing GET API response structure.

## Architecture

### 1. Quiz Module
- Separate collection storing quizzes
- Linked to lessons via `lessonId`
- When deleted, unpublishes associated lesson

### 2. Assignment Module  
- Separate collection storing assignments (markdown content)
- Linked to lessons via `lessonId`
- File upload support for markdown

### 3. Class Activity Module
- Separate collection storing class activities (markdown content)
- Linked to lessons via `lessonId`
- File upload support for markdown

## Database Schema

### Quiz Schema
```typescript
{
  _id: ObjectId,
  lessonId: ObjectId (ref: Lesson),
  sectionId: ObjectId,
  questions: [
    {
      question: String,
      options: [{ text: String, isCorrect: Boolean }],
      explanation: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Assignment Schema
```typescript
{
  _id: ObjectId,
  lessonId: ObjectId (ref: Lesson),
  sectionId: ObjectId,
  title: String,
  content: String (markdown),
  dueDate: Date (optional),
  maxScore: Number (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Class Activity Schema
```typescript
{
  _id: ObjectId,
  lessonId: ObjectId (ref: Lesson),
  sectionId: ObjectId,
  title: String,
  content: String (markdown),
  duration: Number (minutes, optional),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Quiz Endpoints
```
POST   /quiz/admin/lesson/:lessonId - Create quiz for lesson
GET    /quiz/admin/lesson/:lessonId - Get quiz by lesson
PUT    /quiz/admin/:quizId - Update quiz
DELETE /quiz/admin/:quizId - Delete quiz (unpublishes lesson)
GET    /quiz/lesson/:lessonId - Get quiz (user)
POST   /quiz/submit - Submit quiz answers
```

### Assignment Endpoints
```
POST   /assignment/admin/lesson/:lessonId - Create assignment
GET    /assignment/admin/lesson/:lessonId - Get assignment by lesson
PUT    /assignment/admin/:assignmentId - Update assignment
DELETE /assignment/admin/:assignmentId - Delete assignment
GET    /assignment/lesson/:lessonId - Get assignment (user)
POST   /assignment/submit - Submit assignment
```

### Class Activity Endpoints
```
POST   /class-activity/admin/lesson/:lessonId - Create activity
GET    /class-activity/admin/lesson/:lessonId - Get activity by lesson
PUT    /class-activity/admin/:activityId - Update activity
DELETE /class-activity/admin/:activityId - Delete activity
GET    /class-activity/lesson/:lessonId - Get activity (user)
```

## Modified Course GET Response

The GET /courses and GET /courses/admin endpoints will populate related data:

```json
{
  "sections": [
    {
      "lessons": [
        {
          "_id": "lessonId",
          "title": "Lesson Title",
          "content": "...",
          "quiz": {
            "_id": "quizId",
            "questions": [...]
          },
          "assignment": {
            "_id": "assignmentId",
            "title": "...",
            "content": "..."
          },
          "classActivity": {
            "_id": "activityId",
            "title": "...",
            "content": "..."
          }
        }
      ]
    }
  ]
}
```

## Implementation Steps

### Step 1: Create Schemas
- quiz.schema.ts
- assignment.schema.ts
- class-activity.schema.ts

### Step 2: Create DTOs
- quiz.dto.ts (CreateQuizDto, UpdateQuizDto, SubmitQuizDto)
- assignment.dto.ts (CreateAssignmentDto, UpdateAssignmentDto)
- class-activity.dto.ts (CreateActivityDto, UpdateActivityDto)

### Step 3: Implement Services
- QuizService with CRUD + unpublish lesson on delete
- AssignmentService with CRUD
- ClassActivityService with CRUD

### Step 4: Implement Controllers
- QuizController with admin and user routes
- AssignmentController with admin and user routes
- ClassActivityController with admin and user routes

### Step 5: Modify Course Service
- Update getCourse methods to populate quiz, assignment, classActivity
- Use MongoDB populate or manual aggregation

### Step 6: Update Course Module
- Import Quiz, Assignment, ClassActivity modules
- Share Course model with other modules

## Key Features

1. **Separation of Concerns**: Each module manages its own data
2. **Backward Compatible**: GET API response structure unchanged
3. **Cascade Unpublish**: Deleting quiz unpublishes lesson
4. **File Upload**: Assignments and activities support markdown file upload
5. **Flexible**: Can add/remove quiz, assignment, activity independently

## Benefits

- Cleaner code organization
- Easier to maintain and extend
- Better performance (can query only needed data)
- Independent scaling of modules
- Reusable across different courses (future)

## Migration Strategy

1. Keep existing quiz field in lesson schema for backward compatibility
2. Gradually migrate to new quiz module
3. Deprecate old quiz field after migration
4. Or: Keep both and sync them during transition period

This implementation maintains your existing API structure while providing better modularity and flexibility for future enhancements.