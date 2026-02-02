# Course Management API - Complete Guide for UI Development

This document explains all course-related endpoints with schemas and UI implementation guidance.

## Table of Contents
- [Admin Course Routes](#admin-course-routes)
- [User Course Routes](#user-course-routes)
- [UI Implementation Guide](#ui-implementation-guide)

---

## Admin Course Routes

### 1. Create Course
**Endpoint:** `POST /courses/admin`  
**Auth:** JWT + ADMIN role

**Request Schema:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "thumbnail": "string (optional, URL)",
  "isPublished": "boolean (optional, default: false)",
  "tags": "string[] (optional)"
}
```

**Response Schema:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Complete Web Development Course",
  "description": "Learn full-stack web development",
  "thumbnail": "https://example.com/thumb.jpg",
  "sections": [],
  "isPublished": false,
  "tags": ["web", "javascript"],
  "enrolledCount": 0,
  "createdBy": "507f191e810c19729de860ea",
  "createdAt": "2026-01-29T10:00:00.000Z",
  "updatedAt": "2026-01-29T10:00:00.000Z"
}
```

**UI Implementation:**
- **Page:** Admin Dashboard > Create Course
- **Form Fields:**
  - Title (text input, required)
  - Description (textarea, required)
  - Thumbnail URL (text input, optional)
  - Tags (multi-select or chip input, optional)
  - Published status (toggle/checkbox, default: false)
- **Action:** Submit button calls this endpoint
- **After Success:** Redirect to course management page or show success message

---

### 2. Update Course
**Endpoint:** `PUT /courses/admin`  
**Auth:** JWT + ADMIN role

**Request Schema:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "thumbnail": "string (optional)",
  "isPublished": "boolean (optional)",
  "tags": "string[] (optional)"
}
```

**Response:** Updated course object (same as create response)

**UI Implementation:**
- **Page:** Admin Dashboard > Edit Course
- **Load Data:** First call GET /courses/admin to populate form
- **Form Fields:** Same as create, but pre-filled with existing data
- **Action:** Save button calls this endpoint with changed fields only
- **After Success:** Show success message, update UI with new data

---

### 3. Get Course (Admin View)
**Endpoint:** `GET /courses/admin`  
**Auth:** JWT + ADMIN role

**Response Schema:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Complete Web Development Course",
  "description": "Learn full-stack web development",
  "thumbnail": "https://example.com/thumb.jpg",
  "sections": [
    {
      "_id": "507f191e810c19729de860ec",
      "title": "Introduction to JavaScript",
      "description": "Learn JS fundamentals",
      "order": 1,
      "lessons": [
        {
          "_id": "507f191e810c19729de860ed",
          "title": "Variables and Data Types",
          "content": "# Variables\n\nMarkdown content here...",
          "order": 1,
          "videoUrl": "https://youtube.com/watch?v=example",
          "videoDescription": "Intro to variables",
          "resources": [
            "/uploads/courses/resources/cheatsheet.pdf",
            "https://example.com/docs.pdf"
          ],
          "quiz": [
            {
              "question": "What is a variable?",
              "options": [
                {"text": "A container for data", "isCorrect": true},
                {"text": "A function", "isCorrect": false},
                {"text": "A loop", "isCorrect": false}
              ],
              "explanation": "Variables store data values"
            }
          ],
          "estimatedMinutes": 30,
          "isPublished": true
        }
      ]
    }
  ],
  "isPublished": true,
  "tags": ["web", "javascript"],
  "enrolledCount": 150,
  "createdBy": "507f191e810c19729de860ea",
  "createdAt": "2026-01-29T10:00:00.000Z",
  "updatedAt": "2026-01-29T10:00:00.000Z"
}
```

**UI Implementation:**
- **Page:** Admin Dashboard > Course Management
- **Display:**
  - Course header with title, description, thumbnail
  - Publish toggle button
  - Enrolled count badge
  - List of sections (collapsible/expandable)
  - Each section shows lessons
  - Edit/Delete buttons for sections and lessons
- **Actions:**
  - Edit course button → opens edit form
  - Add section button → opens section creation modal
  - Toggle publish → calls update endpoint

---

### 4. Add Section
**Endpoint:** `POST /courses/admin/section`  
**Auth:** JWT + ADMIN role

**Request Schema:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "order": "number (optional, min: 0)"
}
```

**Response:** Full course object with new section added

**UI Implementation:**
- **Component:** Modal/Dialog on course management page
- **Form Fields:**
  - Section title (text input, required)
  - Description (textarea, optional)
  - Order (number input, optional - auto-calculate if not provided)
- **Action:** Add Section button calls this endpoint
- **After Success:** Close modal, refresh course data, show new section in list

---

### 5. Update Section
**Endpoint:** `PUT /courses/admin/section/:sectionIndex`  
**Auth:** JWT + ADMIN role  
**Params:** `sectionIndex` - Section index in array (0-based)

**Request Schema:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "order": "number (optional, min: 0)"
}
```

**Response:** Full course object with updated section

**UI Implementation:**
- **Component:** Edit modal/inline edit on section
- **Form Fields:** Same as add section, pre-filled
- **Action:** Save button calls this endpoint with section index
- **After Success:** Update section in UI, show success message

---

### 6. Delete Section
**Endpoint:** `DELETE /courses/admin/section/:sectionIndex`  
**Auth:** JWT + ADMIN role  
**Params:** `sectionIndex` - Section index (0-based)

**Response:** Full course object without deleted section

**UI Implementation:**
- **Component:** Delete button on section header
- **Action:** 
  - Show confirmation dialog ("Delete section and all lessons?")
  - If confirmed, call this endpoint with section index
- **After Success:** Remove section from UI, show success message

---

### 7. Add Lesson
**Endpoint:** `POST /courses/admin/section/:sectionIndex/lesson`  
**Auth:** JWT + ADMIN role  
**Content-Type:** multipart/form-data  
**Params:** `sectionIndex` - Section index (0-based)

**Request Schema:**
```json
{
  "title": "string (required)",
  "content": "string (required, markdown)",
  "order": "number (optional, min: 0)",
  "videoUrl": "string (optional)",
  "videoDescription": "string (optional)",
  "resources": "string[] (optional, URLs)",
  "quiz": [
    {
      "question": "string (required)",
      "options": [
        {
          "text": "string (required)",
          "isCorrect": "boolean (required)"
        }
      ],
      "explanation": "string (optional)"
    }
  ],
  "estimatedMinutes": "number (optional, min: 0)",
  "isPublished": "boolean (optional, default: false)"
}
```

**File Upload Fields:**
- `content` - Markdown file (optional, overrides content field)
- `video` - Video file (optional, overrides videoUrl)
- `resources` - Multiple files (optional, overrides resources array)

**Response:** Full course object with new lesson added

**UI Implementation:**
- **Page:** Admin Dashboard > Add Lesson Form
- **Form Sections:**
  
  **1. Basic Info:**
  - Title (text input, required)
  - Order (number input, optional)
  - Estimated time (number input in minutes, optional)
  - Published status (toggle, default: false)
  
  **2. Content:**
  - Markdown editor OR file upload (required)
  - Preview pane showing rendered markdown
  
  **3. Video:**
  - Option 1: YouTube URL (text input)
  - Option 2: Upload video file (file input, accept: .mp4, .webm)
  - Video description (textarea, optional)
  
  **4. Resources:**
  - Option 1: Add URLs (text input with "Add" button)
  - Option 2: Upload files (multiple file input, accept: .pdf, .zip, .doc)
  - List of added resources with remove button
  
  **5. Quiz (Optional):**
  - "Add Question" button
  - For each question:
    - Question text (textarea, required)
    - Options (minimum 2):
      - Option text (text input, required)
      - Correct checkbox (at least 1 must be correct)
      - Add/Remove option buttons
    - Explanation (textarea, optional)
  - Remove question button

- **Action:** Submit button sends multipart/form-data
- **After Success:** Redirect to course management, show success message

---

### 8. Update Lesson
**Endpoint:** `PUT /courses/admin/section/:sectionIndex/lesson/:lessonIndex`  
**Auth:** JWT + ADMIN role  
**Content-Type:** multipart/form-data  
**Params:** 
- `sectionIndex` - Section index (0-based)
- `lessonIndex` - Lesson index (0-based)

**Request Schema:** Same as Add Lesson (all fields optional)

**Response:** Full course object with updated lesson

**UI Implementation:**
- **Page:** Same form as Add Lesson, but pre-filled with existing data
- **Load Data:** Extract lesson data from course object using indices
- **Form:** Same as add lesson form
- **Action:** Save button calls this endpoint
- **After Success:** Update lesson in UI, show success message

---

### 9. Delete Lesson
**Endpoint:** `DELETE /courses/admin/section/:sectionIndex/lesson/:lessonIndex`  
**Auth:** JWT + ADMIN role  
**Params:**
- `sectionIndex` - Section index (0-based)
- `lessonIndex` - Lesson index (0-based)

**Response:** Full course object without deleted lesson

**UI Implementation:**
- **Component:** Delete button on lesson item
- **Action:**
  - Show confirmation dialog ("Delete this lesson?")
  - If confirmed, call this endpoint
- **After Success:** Remove lesson from UI, show success message

---

## User Course Routes

### 10. Get Published Course
**Endpoint:** `GET /courses`  
**Auth:** None (public)

**Response Schema:** Same as admin view, but only if `isPublished: true`

**UI Implementation:**
- **Page:** Public Course Landing Page
- **Display:**
  - Course header (title, description, thumbnail)
  - Enrollment count
  - Tags
  - Course outline (sections and lessons)
  - Enroll button (if not enrolled)
  - Continue learning button (if enrolled)
- **Action:** Call this endpoint on page load

---

### 11. Enroll in Course
**Endpoint:** `POST /courses/enroll`  
**Auth:** JWT (any authenticated user)

**Response Schema:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "courseId": "507f191e810c19729de860eb",
  "sections": [
    {
      "sectionId": "507f191e810c19729de860ec",
      "lessons": [
        {
          "lessonId": "507f191e810c19729de860ed",
          "completed": false,
          "timeSpentMinutes": 0
        }
      ],
      "completedLessons": 0,
      "totalLessons": 1
    }
  ],
  "overallProgress": 0,
  "enrolledAt": "2026-01-29T10:30:00.000Z",
  "lastAccessedAt": "2026-01-29T10:30:00.000Z",
  "totalTimeSpentMinutes": 0
}
```

**UI Implementation:**
- **Component:** Enroll button on course page
- **Action:** 
  - User clicks "Enroll Now" button
  - Call this endpoint
  - If already enrolled, returns existing progress
- **After Success:** 
  - Redirect to course learning page
  - Show "Enrolled successfully" message
  - Update button to "Continue Learning"

---

### 12. Get My Progress
**Endpoint:** `GET /courses/my-progress`  
**Auth:** JWT (enrolled user)

**Response Schema:** Same as enroll response, with updated progress data

**UI Implementation:**
- **Page:** User Dashboard / Course Learning Page
- **Display:**
  - Progress bar showing overall completion percentage
  - List of sections with completion status
  - Each lesson with:
    - Checkmark if completed
    - Time spent
    - Quiz score (if taken)
  - "Continue where you left off" button
- **Action:** Call on page load to get current progress

---

### 13. Update Progress
**Endpoint:** `PUT /courses/progress`  
**Auth:** JWT (enrolled user)

**Request Schema:**
```json
{
  "sectionId": "string (required, MongoDB ObjectId)",
  "lessonId": "string (required, MongoDB ObjectId)",
  "completed": "boolean (required)",
  "timeSpentMinutes": "number (optional, min: 0)"
}
```

**Response:** Updated progress object

**UI Implementation:**
- **Page:** Lesson viewing page
- **Triggers:**
  - User marks lesson as complete (checkbox)
  - User finishes watching video
  - Timer tracking time spent on lesson
- **Action:** 
  - Track time spent using JavaScript timer
  - When user completes lesson or leaves page, call this endpoint
  - Send accumulated time and completion status
- **After Success:** 
  - Update progress bar
  - Mark lesson as complete in UI
  - Unlock next lesson

---

### 14. Submit Quiz
**Endpoint:** `POST /courses/quiz/submit`  
**Auth:** JWT (enrolled user)

**Request Schema:**
```json
{
  "sectionId": "string (required, MongoDB ObjectId)",
  "lessonId": "string (required, MongoDB ObjectId)",
  "answers": [
    {
      "questionIndex": "number (required, 0-based)",
      "selectedOptionIndex": "number (required, 0-based)"
    }
  ]
}
```

**Response Schema:**
```json
{
  "score": 85,
  "totalQuestions": 3,
  "correctAnswers": 2,
  "passed": true,
  "results": [
    {
      "questionIndex": 0,
      "correct": true,
      "explanation": "Variables store data values"
    },
    {
      "questionIndex": 1,
      "correct": false,
      "explanation": "const is used for constants"
    }
  ],
  "progress": {
    "quizScore": 85,
    "quizAttempts": 1,
    "overallProgress": 45
  }
}
```

**UI Implementation:**
- **Page:** Quiz page within lesson
- **Display:**
  - Question counter (1 of 3)
  - Question text
  - Multiple choice options (radio buttons)
  - Previous/Next buttons
  - Submit button (on last question)
  
- **Flow:**
  1. User selects answers for all questions
  2. Click "Submit Quiz" button
  3. Call this endpoint with all answers
  4. Show results page with:
     - Score percentage
     - Pass/Fail status (60% threshold)
     - Question-by-question breakdown
     - Correct/incorrect indicators
     - Explanations for each question
     - "Retake Quiz" button
     - "Continue to Next Lesson" button

---

## UI Implementation Guide

### Admin Dashboard Structure

```
Admin Dashboard
├── Course Overview
│   ├── Course Info Card (title, description, thumbnail)
│   ├── Stats (enrolled count, completion rate)
│   ├── Publish Toggle
│   └── Edit Course Button
│
├── Sections List
│   └── For each section:
│       ├── Section Header (title, description, order)
│       ├── Edit/Delete Section Buttons
│       ├── Add Lesson Button
│       └── Lessons List
│           └── For each lesson:
│               ├── Lesson Title
│               ├── Duration, Published Status
│               ├── Edit/Delete Buttons
│               └── Preview Button
│
└── Add Section Button (floating or at bottom)
```

### User Learning Interface Structure

```
Course Learning Page
├── Header
│   ├── Course Title
│   ├── Progress Bar (overall %)
│   └── Back to Dashboard Button
│
├── Sidebar (Course Outline)
│   └── For each section:
│       ├── Section Title
│       ├── Section Progress (X/Y lessons)
│       └── Lessons List
│           └── For each lesson:
│               ├── Lesson Title
│               ├── Checkmark (if completed)
│               ├── Duration
│               └── Click to load lesson
│
└── Main Content Area
    ├── Lesson Title
    ├── Video Player (if video exists)
    ├── Markdown Content (rendered)
    ├── Resources Section (download links)
    ├── Quiz Section (if quiz exists)
    ├── Mark Complete Button
    └── Next Lesson Button
```

### Key UI Features to Implement

**1. Admin Course Builder:**
- Drag-and-drop to reorder sections/lessons
- Rich markdown editor with preview
- Video upload with progress bar
- Quiz builder with dynamic question/option management
- Publish/unpublish toggle with confirmation

**2. User Learning Experience:**
- Persistent progress tracking
- Auto-save progress on page leave
- Video player with playback tracking
- Markdown renderer for lesson content
- Interactive quiz with immediate feedback
- Certificate generation on course completion

**3. Progress Tracking:**
- Real-time progress updates
- Visual progress indicators (bars, percentages)
- Time tracking per lesson
- Quiz score history
- "Continue where you left off" feature

**4. Responsive Design:**
- Mobile-friendly course viewing
- Collapsible sidebar on mobile
- Touch-friendly quiz interface
- Optimized video player for mobile

### API Call Flow Examples

**Admin Creating a Course:**
```
1. POST /courses/admin (create course)
2. POST /courses/admin/section (add section 1)
3. POST /courses/admin/section/0/lesson (add lesson to section 1)
4. POST /courses/admin/section/0/lesson (add another lesson)
5. POST /courses/admin/section (add section 2)
6. PUT /courses/admin (publish course)
```

**User Taking a Course:**
```
1. GET /courses (view course details)
2. POST /courses/enroll (enroll in course)
3. GET /courses/my-progress (load progress)
4. PUT /courses/progress (mark lesson 1 complete)
5. POST /courses/quiz/submit (submit quiz)
6. PUT /courses/progress (mark lesson 2 complete)
7. GET /courses/my-progress (check overall progress)
```

### Error Handling for UI

**Common Errors:**
- 401: Redirect to login page
- 403: Show "Admin access required" message
- 404: Show "Course not found" or "Not enrolled"
- 400: Display validation errors in form

**Loading States:**
- Show skeleton loaders while fetching course data
- Disable buttons during API calls
- Show progress indicators for file uploads

**Success Feedback:**
- Toast notifications for successful actions
- Smooth transitions when updating progress
- Confetti animation on course completion

---

## Complete Endpoint Summary

**Admin Endpoints (9):**
1. POST /courses/admin - Create course
2. PUT /courses/admin - Update course
3. GET /courses/admin - Get course (admin view)
4. POST /courses/admin/section - Add section
5. PUT /courses/admin/section/:sectionIndex - Update section
6. DELETE /courses/admin/section/:sectionIndex - Delete section
7. POST /courses/admin/section/:sectionIndex/lesson - Add lesson
8. PUT /courses/admin/section/:sectionIndex/lesson/:lessonIndex - Update lesson
9. DELETE /courses/admin/section/:sectionIndex/lesson/:lessonIndex - Delete lesson

**User Endpoints (5):**
10. GET /courses - Get published course
11. POST /courses/enroll - Enroll in course
12. GET /courses/my-progress - Get my progress
13. PUT /courses/progress - Update progress
14. POST /courses/quiz/submit - Submit quiz

**Total: 14 Course Endpoints**