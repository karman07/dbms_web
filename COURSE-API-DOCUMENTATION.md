# Course API Documentation

## Base URL
```
http://localhost:3000/courses
```

## Authentication
All user endpoints require Firebase JWT token, admin endpoints require admin role.

```
Authorization: Bearer <firebase-token>
```

---

## Overview

This API manages a **single course** with sections, lessons, quizzes, and user progress tracking. Admin can upload videos, documentation, and quizzes for each lesson.

---

## Admin Endpoints

### 1. Get Course (Admin View)
**GET** `/admin`

**Description:** Get the course with all details (including unpublished content).

**Auth Required:** Firebase Token + Admin Role  
**Access:** Admin only

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "DBMS Fundamentals",
  "description": "Complete Database Management System Course",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "isPublished": true,
  "tags": ["database", "sql", "dbms"],
  "enrolledCount": 150,
  "sections": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Introduction to Databases",
      "description": "Learn database basics",
      "order": 0,
      "lessons": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "title": "What is a Database?",
          "content": "# Database Introduction\n\nA database is...",
          "videoUrl": "https://example.com/video.mp4",
          "videoDescription": "In this video, we cover database fundamentals...",
          "resources": ["https://docs.example.com/intro.pdf"],
          "quiz": [
            {
              "question": "What is a primary key?",
              "options": [
                { "text": "A unique identifier", "isCorrect": true },
                { "text": "A foreign key", "isCorrect": false },
                { "text": "An index", "isCorrect": false }
              ],
              "explanation": "A primary key uniquely identifies each record in a table."
            }
          ],
          "order": 0,
          "estimatedMinutes": 30,
          "isPublished": true
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Update Course
**PUT** `/admin`

**Description:** Update course details (title, description, thumbnail, etc.).

**Auth Required:** Firebase Token + Admin Role  
**Access:** Admin only

**Request Body:**
```json
{
  "title": "Advanced DBMS",
  "description": "Updated description",
  "thumbnail": "https://example.com/new-thumb.jpg",
  "isPublished": true,
  "tags": ["database", "sql", "advanced"]
}
```

**Success Response (200):** Same format as Get Course

---

### 3. Add Section
**POST** `/admin/section`

**Description:** Add a new section to the course.

**Auth Required:** Firebase Token + Admin Role  
**Access:** Admin only

**Request Body:**
```json
{
  "title": "Database Design",
  "description": "Learn how to design databases",
  "order": 1,
  "lessons": []
}
```

**Success Response (200):** Updated course object

---

### 4. Update Section
**PUT** `/admin/section/:sectionIndex`

**Description:** Update section details.

**Path Parameters:**
- `sectionIndex`: Index of the section (0-based)

**Request Body:**
```json
{
  "title": "Updated Section Title",
  "description": "Updated description"
}
```

**Success Response (200):** Updated course object

---

### 5. Delete Section
**DELETE** `/admin/section/:sectionIndex`

**Description:** Remove a section from the course.

**Path Parameters:**
- `sectionIndex`: Index of the section (0-based)

**Success Response (200):** Updated course object

---

### 6. Add Lesson to Section
**POST** `/admin/section/:sectionIndex/lesson`

**Description:** Add a new lesson with video, docs, and quiz.

**Path Parameters:**
- `sectionIndex`: Index of the section (0-based)

**Request Body:**
```json
{
  "title": "Normalization Basics",
  "content": "# Normalization\n\nNormalization is the process of...",
  "videoUrl": "https://example.com/normalization.mp4",
  "videoDescription": "This video explains 1NF, 2NF, and 3NF with examples.",
  "resources": [
    "https://docs.example.com/normalization.pdf",
    "https://example.com/exercises.zip"
  ],
  "quiz": [
    {
      "question": "What is 1NF?",
      "options": [
        { "text": "First Normal Form", "isCorrect": true },
        { "text": "First Number Format", "isCorrect": false },
        { "text": "First Node Form", "isCorrect": false }
      ],
      "explanation": "1NF stands for First Normal Form"
    },
    {
      "question": "Which form eliminates partial dependencies?",
      "options": [
        { "text": "1NF", "isCorrect": false },
        { "text": "2NF", "isCorrect": true },
        { "text": "3NF", "isCorrect": false }
      ],
      "explanation": "2NF eliminates partial dependencies on the primary key"
    }
  ],
  "order": 0,
  "estimatedMinutes": 45,
  "isPublished": true
}
```

**Success Response (200):** Updated course object

---

### 7. Update Lesson
**PUT** `/admin/section/:sectionIndex/lesson/:lessonIndex`

**Description:** Update lesson content, video, or quiz.

**Path Parameters:**
- `sectionIndex`: Index of the section (0-based)
- `lessonIndex`: Index of the lesson (0-based)

**Request Body:** Same as Add Lesson (all fields optional)

**Success Response (200):** Updated course object

---

### 8. Delete Lesson
**DELETE** `/admin/section/:sectionIndex/lesson/:lessonIndex`

**Description:** Remove a lesson from a section.

**Path Parameters:**
- `sectionIndex`: Index of the section (0-based)
- `lessonIndex`: Index of the lesson (0-based)

**Success Response (200):** Updated course object

---

## User Endpoints

### 9. Get Course (User View)
**GET** `/`

**Description:** Get the published course content.

**Auth Required:** None  
**Access:** Public (only published content)

**Success Response (200):** Same format as admin view but only published content

---

### 10. Enroll in Course
**POST** `/enroll`

**Description:** Enroll in the course and initialize progress tracking.

**Auth Required:** Firebase Token  
**Access:** Authenticated users

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439021",
  "courseId": "507f1f77bcf86cd799439011",
  "sections": [
    {
      "sectionId": "507f1f77bcf86cd799439012",
      "lessons": [
        {
          "lessonId": "507f1f77bcf86cd799439013",
          "completed": false,
          "timeSpentMinutes": 0,
          "quizScore": 0,
          "quizAttempts": 0
        }
      ],
      "completedLessons": 0,
      "totalLessons": 5
    }
  ],
  "overallProgress": 0,
  "enrolledAt": "2024-01-01T00:00:00.000Z",
  "lastAccessedAt": "2024-01-01T00:00:00.000Z",
  "totalTimeSpentMinutes": 0
}
```

---

### 11. Get My Progress
**GET** `/my-progress`

**Description:** Get your progress for the course.

**Auth Required:** Firebase Token  
**Access:** Authenticated users (enrolled only)

**Success Response (200):** Same format as Enroll response

---

### 12. Update Lesson Progress
**PUT** `/progress`

**Description:** Mark a lesson as complete/incomplete and track time.

**Auth Required:** Firebase Token  
**Access:** Authenticated users (enrolled only)

**Request Body:**
```json
{
  "sectionId": "507f1f77bcf86cd799439012",
  "lessonId": "507f1f77bcf86cd799439013",
  "completed": true,
  "timeSpentMinutes": 25
}
```

**Success Response (200):** Updated progress object

---

### 13. Submit Quiz
**POST** `/quiz/submit`

**Description:** Submit quiz answers and get score.

**Auth Required:** Firebase Token  
**Access:** Authenticated users (enrolled only)

**Request Body:**
```json
{
  "sectionId": "507f1f77bcf86cd799439012",
  "lessonId": "507f1f77bcf86cd799439013",
  "answers": [
    { "questionIndex": 0, "selectedOptionIndex": 0 },
    { "questionIndex": 1, "selectedOptionIndex": 1 }
  ]
}
```

**Success Response (200):**
```json
{
  "score": 100,
  "totalQuestions": 2,
  "correctAnswers": 2,
  "passed": true,
  "results": [
    {
      "questionIndex": 0,
      "correct": true,
      "explanation": "A primary key uniquely identifies each record in a table."
    },
    {
      "questionIndex": 1,
      "correct": true,
      "explanation": "2NF eliminates partial dependencies on the primary key"
    }
  ],
  "progress": {
    "quizScore": 100,
    "quizAttempts": 1,
    "overallProgress": 20
  }
}
```

---

## Data Models

### Lesson Structure
```typescript
{
  title: string;              // Lesson title
  content: string;            // Markdown/HTML content
  videoUrl?: string;          // Video URL
  videoDescription?: string;  // Video description/summary
  resources?: string[];       // Additional resources (PDFs, links)
  quiz?: QuizQuestion[];      // Quiz questions
  order: number;              // Display order
  estimatedMinutes: number;   // Estimated completion time
  isPublished: boolean;       // Visibility status
}
```

### Quiz Question Structure
```typescript
{
  question: string;           // Question text
  options: [                  // Multiple choice options
    {
      text: string;           // Option text
      isCorrect: boolean;     // Correct answer flag
    }
  ];
  explanation?: string;       // Explanation shown after answering
}
```

### User Progress Structure
```typescript
{
  lessonId: ObjectId;         // Reference to lesson
  completed: boolean;         // Completion status
  completedAt?: Date;         // Completion timestamp
  timeSpentMinutes: number;   // Time spent on lesson
  lastAccessedAt?: Date;      // Last access timestamp
  quizScore?: number;         // Quiz score (0-100)
  quizAttempts?: number;      // Number of quiz attempts
}
```

---

## Usage Examples

### Admin: Add Lesson with Quiz
```javascript
const addLesson = async (sectionIndex) => {
  const token = localStorage.getItem('firebaseToken');
  
  const response = await fetch(`/courses/admin/section/${sectionIndex}/lesson`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'SQL Joins',
      content: '# SQL Joins\n\nJoins are used to combine rows...',
      videoUrl: 'https://cdn.example.com/sql-joins.mp4',
      videoDescription: 'Learn INNER JOIN, LEFT JOIN, RIGHT JOIN with examples',
      resources: ['https://docs.example.com/joins.pdf'],
      quiz: [
        {
          question: 'What does INNER JOIN return?',
          options: [
            { text: 'All matching rows from both tables', isCorrect: true },
            { text: 'All rows from left table', isCorrect: false },
            { text: 'All rows from right table', isCorrect: false }
          ],
          explanation: 'INNER JOIN returns only matching rows'
        }
      ],
      order: 0,
      estimatedMinutes: 40,
      isPublished: true
    })
  });
  
  const course = await response.json();
  console.log('Lesson added:', course);
};
```

### User: Enroll and Track Progress
```javascript
const enrollInCourse = async () => {
  const token = localStorage.getItem('firebaseToken');
  
  const response = await fetch('/courses/enroll', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const progress = await response.json();
  console.log('Enrolled! Progress:', progress);
};

const markLessonComplete = async (sectionId, lessonId, timeSpent) => {
  const token = localStorage.getItem('firebaseToken');
  
  const response = await fetch('/courses/progress', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sectionId,
      lessonId,
      completed: true,
      timeSpentMinutes: timeSpent
    })
  });
  
  const updated = await response.json();
  console.log('Progress updated:', updated.overallProgress + '%');
};
```

### User: Submit Quiz
```javascript
const submitQuiz = async (sectionId, lessonId, answers) => {
  const token = localStorage.getItem('firebaseToken');
  
  const response = await fetch('/courses/quiz/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sectionId,
      lessonId,
      answers // [{ questionIndex: 0, selectedOptionIndex: 1 }, ...]
    })
  });
  
  const result = await response.json();
  console.log(`Quiz Score: ${result.score}%`);
  console.log(`Overall Progress: ${result.progress.overallProgress}%`);
  
  // Show explanations
  result.results.forEach((r, i) => {
    console.log(`Q${i+1}: ${r.correct ? '✓' : '✗'} - ${r.explanation}`);
  });
};
```

---

## Best Practices

### For Admin
1. **Structure content logically** - Organize lessons into clear sections
2. **Add video descriptions** - Help users understand what each video covers
3. **Include quizzes** - Test comprehension after each major concept
4. **Provide resources** - Link to PDFs, exercises, and additional reading
5. **Set realistic estimates** - Help users plan their learning time

### For Users
1. **Complete lessons in order** - Follow the intended learning path
2. **Watch videos fully** - Don't skip ahead without understanding
3. **Attempt quizzes** - Test your knowledge before moving forward
4. **Track your time** - Be honest about time spent for accurate progress
5. **Review explanations** - Learn from quiz mistakes

### Performance
1. **Cache course structure** - Reduce repeated API calls
2. **Stream videos** - Don't download entire videos upfront
3. **Lazy load lessons** - Load content as user progresses
4. **Save progress regularly** - Update after each lesson/quiz

---

## Error Responses

### 403 Forbidden
```json
{
  "message": "You are not enrolled in this course",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Course not found or not published",
  "statusCode": 404
}
```

### 400 Bad Request
```json
{
  "message": "Invalid section or lesson index",
  "statusCode": 400
}
```
