# Courses Module - Routes & Schema Documentation

## Table of Contents
- [Overview](#overview)
- [API Routes](#api-routes)
  - [Admin Routes](#admin-routes)
  - [User Routes](#user-routes)
- [Database Schemas](#database-schemas)
- [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)

---

## Overview

The Courses module manages course content, sections, lessons, and user progress tracking. It supports multimedia content including videos, resources, quizzes, and integration with docs, media, assignments, class activities, and independent quizzes.

**Base URL:** `/courses`

---

## API Routes

### Admin Routes

All admin routes require:
- **Authentication:** JWT Token
- **Authorization:** ADMIN role

#### 1. Create Course
- **Endpoint:** `POST /courses/admin`
- **Description:** Create a new course
- **Request Body:** [CreateCourseDto](#createcoursedto)
- **Response:** Created course object

#### 2. Update Course
- **Endpoint:** `PUT /courses/admin`
- **Description:** Update course details (title, description, thumbnail, tags, publish status)
- **Request Body:** [UpdateCourseDto](#updatecoursedto)
- **Response:** Updated course object

#### 3. Get Course (Admin View)
- **Endpoint:** `GET /courses/admin`
- **Description:** Get complete course with unpublished sections/lessons
- **Response:** Complete course object with all content

#### 4. Add Section
- **Endpoint:** `POST /courses/admin/section`
- **Description:** Add a new section to the course
- **Request Body:** [CreateSectionDto](#createsectiondto)
- **Response:** Updated course with new section

#### 5. Update Section
- **Endpoint:** `PUT /courses/admin/section/:sectionIndex`
- **Description:** Update section details
- **URL Parameters:**
  - `sectionIndex` - Index of section to update (0-based)
- **Request Body:** [UpdateSectionDto](#updatesectiondto)
- **Response:** Updated course object

#### 6. Delete Section
- **Endpoint:** `DELETE /courses/admin/section/:sectionIndex`
- **Description:** Delete a section and all its lessons
- **URL Parameters:**
  - `sectionIndex` - Index of section to delete (0-based)
- **Response:** Updated course object

#### 7. Add Lesson
- **Endpoint:** `POST /courses/admin/section/:sectionIndex/lesson`
- **Description:** Add a new lesson to a section with file uploads
- **URL Parameters:**
  - `sectionIndex` - Index of section (0-based)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `title` (string, required)
  - `content` (string or file upload) - Markdown content or .md file
  - `order` (number, optional)
  - `videoUrl` (string or file upload) - Video URL or video file upload
  - `videoDescription` (string, optional)
  - `resources` (array of files, optional) - Up to 10 resource files
  - `quiz` (JSON string, optional) - Quiz questions array
  - `estimatedMinutes` (number, optional)
  - `isPublished` (boolean, optional)
  - `docSubtopicId` (string, optional) - Link to doc subtopic
- **File Upload Fields:**
  - `content` - Single .md file (optional)
  - `video` - Single video file (optional)
  - `resources` - Up to 10 resource files (optional)
- **Response:** Updated course object

#### 8. Update Lesson
- **Endpoint:** `PUT /courses/admin/section/:sectionIndex/lesson/:lessonIndex`
- **Description:** Update lesson details with optional file uploads
- **URL Parameters:**
  - `sectionIndex` - Index of section (0-based)
  - `lessonIndex` - Index of lesson (0-based)
- **Content-Type:** `multipart/form-data`
- **Form Fields:** Same as Add Lesson (all optional)
- **File Upload Fields:** Same as Add Lesson
- **Response:** Updated course object

#### 9. Delete Lesson
- **Endpoint:** `DELETE /courses/admin/section/:sectionIndex/lesson/:lessonIndex`
- **Description:** Delete a lesson from a section
- **URL Parameters:**
  - `sectionIndex` - Index of section (0-based)
  - `lessonIndex` - Index of lesson (0-based)
- **Response:** Updated course object

---

### User Routes

#### 1. Get Published Course
- **Endpoint:** `GET /courses`
- **Description:** Get published course content (only published sections and lessons)
- **Authentication:** Not required
- **Response:** Published course object

#### 2. Enroll in Course
- **Endpoint:** `POST /courses/enroll`
- **Description:** Enroll current user in the course
- **Authentication:** Required (JWT)
- **Response:** UserProgress object

#### 3. Update Progress
- **Endpoint:** `PUT /courses/progress`
- **Description:** Mark lesson as completed/incomplete and track time spent
- **Authentication:** Required (JWT)
- **Request Body:** [UpdateProgressDto](#updateprogressdto)
- **Response:** Updated UserProgress object

#### 4. Get My Progress
- **Endpoint:** `GET /courses/my-progress`
- **Description:** Get current user's course progress
- **Authentication:** Required (JWT)
- **Response:** UserProgress object with detailed section and lesson progress

#### 5. Submit Quiz
- **Endpoint:** `POST /courses/quiz/submit`
- **Description:** Submit quiz answers for a lesson
- **Authentication:** Required (JWT)
- **Request Body:** [SubmitQuizDto](#submitquizdto)
- **Response:** Quiz results with score and updated progress

---

## Database Schemas

### Course Schema

```typescript
{
  _id: ObjectId,
  title: string,                    // Required
  description: string,              // Required
  thumbnail?: string,               // URL or file path
  sections: Section[],              // Array of sections
  isPublished: boolean,             // Default: false
  tags: string[],                   // Default: []
  enrolledCount: number,            // Default: 0
  createdBy: ObjectId,              // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

### Section Schema

```typescript
{
  _id: ObjectId,
  title: string,                    // Required
  description?: string,
  order: number,                    // Default: 0
  lessons: Lesson[],                // Array of lessons
  createdAt: Date,
  updatedAt: Date
}
```

### Lesson Schema

```typescript
{
  _id: ObjectId,
  title: string,                    // Required
  order: number,                    // Default: 0
  mediaIds?: ObjectId[],            // References to Media (videos, images, etc.)
  resources: string[],              // URLs or file paths
  quiz: QuizQuestion[],             // Embedded quiz questions
  docSubtopicIds?: ObjectId[],      // References to DocSubtopic
  linkedQuizIds?: ObjectId[],       // References to independent Quiz module
  linkedAssignmentIds?: ObjectId[], // References to Assignment module
  linkedActivityIds?: ObjectId[],   // References to ClassActivity module
  estimatedMinutes: number,         // Default: 0
  isPublished: boolean,             // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

### QuizQuestion Schema (Embedded)

```typescript
{
  question: string,                 // Required
  options: QuizOption[],            // Required, array of options
  explanation?: string              // Optional explanation for answer
}
```

### QuizOption Schema (Embedded)

```typescript
{
  text: string,                     // Required
  isCorrect: boolean                // Default: false
}
```

### UserProgress Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId,                 // Reference to User, required
  courseId: ObjectId,               // Reference to Course, required
  sections: SectionProgress[],      // Array of section progress
  overallProgress: number,          // Percentage 0-100, default: 0
  enrolledAt: Date,
  lastAccessedAt: Date,
  totalTimeSpentMinutes: number,    // Default: 0
  createdAt: Date,
  updatedAt: Date
}

// Compound Index: { userId: 1, courseId: 1 } (unique)
```

### SectionProgress Schema (Embedded)

```typescript
{
  sectionId: ObjectId,              // Required
  lessons: LessonProgress[],        // Array of lesson progress
  completedLessons: number,         // Default: 0
  totalLessons: number              // Default: 0
}
```

### LessonProgress Schema (Embedded)

```typescript
{
  lessonId: ObjectId,               // Required
  completed: boolean,               // Default: false
  completedAt?: Date,
  timeSpentMinutes: number,         // Default: 0
  lastAccessedAt?: Date,
  quizScore?: number,               // Percentage 0-100
  quizAttempts?: number             // Default: 0
}
```

---

## DTOs (Data Transfer Objects)

### CreateCourseDto

```typescript
{
  title: string,                    // Required
  description: string,              // Required
  thumbnail?: string,               // Optional
  sections?: CreateSectionDto[],    // Optional
  isPublished?: boolean,            // Optional
  tags?: string[]                   // Optional
}
```

### UpdateCourseDto

```typescript
{
  title?: string,
  description?: string,
  thumbnail?: string,
  isPublished?: boolean,
  tags?: string[]
}
```

### CreateSectionDto

```typescript
{
  title: string,                    // Required
  description?: string,
  order?: number,                   // Min: 0
  lessons?: CreateLessonDto[]       // Optional
}
```

### UpdateSectionDto

```typescript
{
  title?: string,
  description?: string,
  order?: number                    // Min: 0
}
```

### CreateLessonDto

```typescript
{
  title: string,                    // Required
  content: string,                  // Required (markdown or plain text)
  order?: number,                   // Min: 0
  videoUrl?: string,
  videoDescription?: string,
  resources?: string[],             // Array of URLs or file paths
  quiz?: QuizQuestionDto[],
  estimatedMinutes?: number,        // Min: 0
  isPublished?: boolean,
  docSubtopicId?: string            // MongoDB ObjectId as string
}
```

### UpdateLessonDto

```typescript
{
  title?: string,
  content?: string,
  order?: number,                   // Min: 0
  videoUrl?: string,
  videoDescription?: string,
  resources?: string[],
  quiz?: QuizQuestionDto[],
  estimatedMinutes?: number,        // Min: 0
  isPublished?: boolean,
  docSubtopicId?: string
}
```

### QuizQuestionDto

```typescript
{
  question: string,                 // Required
  options: QuizOptionDto[],         // Required
  explanation?: string              // Optional
}
```

### QuizOptionDto

```typescript
{
  text: string,                     // Required
  isCorrect: boolean                // Required
}
```

### UpdateProgressDto

```typescript
{
  sectionId: string,                // Required (MongoDB ObjectId)
  lessonId: string,                 // Required (MongoDB ObjectId)
  completed: boolean,               // Required
  timeSpentMinutes?: number         // Optional, min: 0
}
```

### SubmitQuizDto

```typescript
{
  sectionId: string,                // Required (MongoDB ObjectId)
  lessonId: string,                 // Required (MongoDB ObjectId)
  answers: QuizAnswerDto[]          // Required
}
```

### QuizAnswerDto

```typescript
{
  questionIndex: number,            // Required (0-based index)
  selectedOptionIndex: number       // Required (0-based index)
}
```

---

## File Upload Configuration

### Supported Formats

**Content Files (.md):**
- `.md`, `.markdown`

**Video Files:**
- `.mp4`, `.avi`, `.mov`, `.wmv`, `.flv`, `.mkv`, `.webm`

**Resource Files:**
- Documents: `.pdf`, `.doc`, `.docx`, `.txt`, `.ppt`, `.pptx`
- Code: `.js`, `.ts`, `.py`, `.java`, `.cpp`, `.c`, `.html`, `.css`
- Archives: `.zip`, `.rar`

### Upload Paths

- **Content Files:** `/uploads/courses/content/`
- **Videos:** `/uploads/courses/videos/`
- **Resources:** `/uploads/courses/resources/`

### File Size Limits

- **Content Files:** 10MB
- **Videos:** 500MB
- **Resources:** 50MB per file (max 10 files)

---

## Integration Points

### Media Module
- Lessons can reference media items through `mediaIds` field
- Supports videos, images, and other media types

### Docs Module
- Lessons can link to doc subtopics via `docSubtopicIds`
- Allows referencing detailed documentation within lessons

### Quiz Module
- Lessons can link to independent quizzes via `linkedQuizIds`
- Separate from embedded lesson quizzes

### Assignment Module
- Lessons can reference assignments via `linkedAssignmentIds`
- Link coursework to specific lessons

### Class Activity Module
- Lessons can reference class activities via `linkedActivityIds`
- Track in-class exercises and activities

---

## Notes

1. **Indexing:** Section and lesson indices are 0-based
2. **Progress Tracking:** Automatically calculated based on completed lessons
3. **Publishing:** Only published content is visible to non-admin users
4. **File Uploads:** Use multipart/form-data for routes accepting files
5. **Quiz Scoring:** Calculated as percentage of correct answers
6. **Enrollment:** Users must enroll before tracking progress
7. **Multiple Modules:** Lessons support integration with docs, media, quizzes, assignments, and activities

---

## Example Requests

### Create Course with Section and Lesson

```json
{
  "title": "Introduction to DBMS",
  "description": "Complete course on Database Management Systems",
  "thumbnail": "/uploads/courses/dbms-thumb.jpg",
  "isPublished": true,
  "tags": ["database", "sql", "dbms"],
  "sections": [
    {
      "title": "Getting Started",
      "description": "Introduction to databases",
      "order": 0,
      "lessons": [
        {
          "title": "What is a Database?",
          "content": "# Database Basics\n\nA database is...",
          "order": 0,
          "estimatedMinutes": 15,
          "isPublished": true
        }
      ]
    }
  ]
}
```

### Update Progress

```json
{
  "sectionId": "507f1f77bcf86cd799439011",
  "lessonId": "507f1f77bcf86cd799439012",
  "completed": true,
  "timeSpentMinutes": 25
}
```

### Submit Quiz

```json
{
  "sectionId": "507f1f77bcf86cd799439011",
  "lessonId": "507f1f77bcf86cd799439012",
  "answers": [
    {
      "questionIndex": 0,
      "selectedOptionIndex": 2
    },
    {
      "questionIndex": 1,
      "selectedOptionIndex": 0
    }
  ]
}
```

### Add Lesson with Quiz

```json
{
  "title": "SQL Basics",
  "content": "# Introduction to SQL\n\nSQL stands for...",
  "order": 1,
  "videoUrl": "https://example.com/sql-intro.mp4",
  "estimatedMinutes": 30,
  "isPublished": true,
  "quiz": [
    {
      "question": "What does SQL stand for?",
      "options": [
        { "text": "Structured Query Language", "isCorrect": true },
        { "text": "Simple Query Language", "isCorrect": false },
        { "text": "Standard Query Language", "isCorrect": false }
      ],
      "explanation": "SQL stands for Structured Query Language"
    }
  ]
}
```

---

**Last Updated:** February 3, 2026
