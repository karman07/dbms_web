# DBMS Course - User API Documentation

## Base URL
```
http://localhost:3000/courses
```

## Authentication
All user endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## User Endpoints

### 1. Get Course Content
**GET** `/`

**Description:** Get the published DBMS course with all sections and lessons.

**Auth Required:** No  
**Access:** Public (only published content visible)

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "DBMS Fundamentals",
  "description": "Complete Database Management System Course covering SQL, normalization, transactions, and more.",
  "thumbnail": "https://example.com/dbms-thumb.jpg",
  "isPublished": true,
  "tags": ["database", "sql", "dbms", "normalization"],
  "enrolledCount": 245,
  "sections": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Introduction to Databases",
      "description": "Learn the fundamentals of database systems",
      "order": 0,
      "lessons": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "title": "What is a Database?",
          "content": "# Introduction to Databases\n\nA database is an organized collection of structured information...",
          "videoUrl": "/uploads/courses/videos/video-1706012345678-123456789.mp4",
          "videoDescription": "This video introduces database concepts, types, and real-world applications.",
          "resources": [
            "/uploads/courses/resources/resources-1706012345678-987654321.pdf",
            "/uploads/courses/resources/resources-1706012345679-123456780.zip"
          ],
          "quiz": [
            {
              "question": "What is a primary key?",
              "options": [
                { "text": "A unique identifier for each record", "isCorrect": true },
                { "text": "A foreign key reference", "isCorrect": false },
                { "text": "An index on the table", "isCorrect": false },
                { "text": "A constraint type", "isCorrect": false }
              ],
              "explanation": "A primary key uniquely identifies each record in a database table."
            },
            {
              "question": "Which of the following is NOT a type of database?",
              "options": [
                { "text": "Relational", "isCorrect": false },
                { "text": "NoSQL", "isCorrect": false },
                { "text": "Sequential", "isCorrect": true },
                { "text": "Graph", "isCorrect": false }
              ],
              "explanation": "Sequential is not a database type. Common types include Relational, NoSQL, Graph, and Document databases."
            }
          ],
          "order": 0,
          "estimatedMinutes": 30,
          "isPublished": true
        }
      ]
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "SQL Fundamentals",
      "description": "Master SQL queries and operations",
      "order": 1,
      "lessons": [
        {
          "_id": "507f1f77bcf86cd799439015",
          "title": "SELECT Statement",
          "content": "# SQL SELECT Statement\n\nThe SELECT statement retrieves data from database tables...",
          "videoUrl": "https://cdn.example.com/videos/sql-select.mp4",
          "videoDescription": "Learn how to query data using SELECT with WHERE, ORDER BY, and JOIN clauses.",
          "resources": ["https://docs.example.com/sql-select.pdf"],
          "quiz": [],
          "order": 0,
          "estimatedMinutes": 45,
          "isPublished": true
        }
      ]
    }
  ],
  "createdBy": "507f1f77bcf86cd799439020",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

---

### 2. Enroll in Course
**POST** `/enroll`

**Description:** Enroll in the DBMS course and initialize your progress tracking.

**Auth Required:** JWT Token  
**Access:** Authenticated users

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "userId": "507f1f77bcf86cd799439031",
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
      "totalLessons": 1
    },
    {
      "sectionId": "507f1f77bcf86cd799439014",
      "lessons": [
        {
          "lessonId": "507f1f77bcf86cd799439015",
          "completed": false,
          "timeSpentMinutes": 0,
          "quizScore": 0,
          "quizAttempts": 0
        }
      ],
      "completedLessons": 0,
      "totalLessons": 1
    }
  ],
  "overallProgress": 0,
  "enrolledAt": "2024-01-20T10:30:00.000Z",
  "lastAccessedAt": "2024-01-20T10:30:00.000Z",
  "totalTimeSpentMinutes": 0
}
```

**Notes:**
- If already enrolled, returns existing progress
- Automatically increments course `enrolledCount`
- Initializes progress for all sections and lessons

---

### 3. Get My Progress
**GET** `/my-progress`

**Description:** Get your current progress for the DBMS course.

**Auth Required:** JWT Token  
**Access:** Enrolled users only

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "userId": "507f1f77bcf86cd799439031",
  "courseId": "507f1f77bcf86cd799439011",
  "sections": [
    {
      "sectionId": "507f1f77bcf86cd799439012",
      "lessons": [
        {
          "lessonId": "507f1f77bcf86cd799439013",
          "completed": true,
          "completedAt": "2024-01-20T11:15:00.000Z",
          "timeSpentMinutes": 35,
          "lastAccessedAt": "2024-01-20T11:15:00.000Z",
          "quizScore": 100,
          "quizAttempts": 1
        }
      ],
      "completedLessons": 1,
      "totalLessons": 1
    },
    {
      "sectionId": "507f1f77bcf86cd799439014",
      "lessons": [
        {
          "lessonId": "507f1f77bcf86cd799439015",
          "completed": false,
          "timeSpentMinutes": 15,
          "lastAccessedAt": "2024-01-20T12:00:00.000Z",
          "quizScore": 0,
          "quizAttempts": 0
        }
      ],
      "completedLessons": 0,
      "totalLessons": 1
    }
  ],
  "overallProgress": 50,
  "enrolledAt": "2024-01-20T10:30:00.000Z",
  "lastAccessedAt": "2024-01-20T12:00:00.000Z",
  "totalTimeSpentMinutes": 50
}
```

**Error Response (403):**
```json
{
  "message": "You are not enrolled in this course",
  "statusCode": 403
}
```

---

### 4. Update Lesson Progress
**PUT** `/progress`

**Description:** Mark a lesson as complete/incomplete and track time spent.

**Auth Required:** JWT Token  
**Access:** Enrolled users only

**Request Body:**
```json
{
  "sectionId": "507f1f77bcf86cd799439012",
  "lessonId": "507f1f77bcf86cd799439013",
  "completed": true,
  "timeSpentMinutes": 35
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sectionId` | string | Yes | MongoDB ObjectId of the section |
| `lessonId` | string | Yes | MongoDB ObjectId of the lesson |
| `completed` | boolean | Yes | Mark lesson as complete/incomplete |
| `timeSpentMinutes` | number | No | Time spent on this session (added to total) |

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "userId": "507f1f77bcf86cd799439031",
  "courseId": "507f1f77bcf86cd799439011",
  "sections": [...],
  "overallProgress": 50,
  "enrolledAt": "2024-01-20T10:30:00.000Z",
  "lastAccessedAt": "2024-01-20T11:15:00.000Z",
  "totalTimeSpentMinutes": 35
}
```

**Notes:**
- Automatically recalculates section and overall progress percentages
- `completedAt` timestamp set when marking as complete
- `lastAccessedAt` updated on every progress update
- `timeSpentMinutes` is cumulative (added to existing time)

---

### 5. Submit Quiz
**POST** `/quiz/submit`

**Description:** Submit quiz answers for a lesson and get your score with explanations.

**Auth Required:** JWT Token  
**Access:** Enrolled users only

**Request Body:**
```json
{
  "sectionId": "507f1f77bcf86cd799439012",
  "lessonId": "507f1f77bcf86cd799439013",
  "answers": [
    { "questionIndex": 0, "selectedOptionIndex": 0 },
    { "questionIndex": 1, "selectedOptionIndex": 2 }
  ]
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sectionId` | string | Yes | MongoDB ObjectId of the section |
| `lessonId` | string | Yes | MongoDB ObjectId of the lesson |
| `answers` | array | Yes | Array of answer objects |
| `answers[].questionIndex` | number | Yes | Index of the question (0-based) |
| `answers[].selectedOptionIndex` | number | Yes | Index of selected option (0-based) |

**Success Response (200):**
```json
{
  "score": 50,
  "totalQuestions": 2,
  "correctAnswers": 1,
  "passed": false,
  "results": [
    {
      "questionIndex": 0,
      "correct": true,
      "explanation": "A primary key uniquely identifies each record in a database table."
    },
    {
      "questionIndex": 1,
      "correct": false,
      "explanation": "Sequential is not a database type. Common types include Relational, NoSQL, Graph, and Document databases."
    }
  ],
  "progress": {
    "quizScore": 50,
    "quizAttempts": 1,
    "overallProgress": 0
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `score` | number | Percentage score (0-100) |
| `totalQuestions` | number | Total questions in the quiz |
| `correctAnswers` | number | Number of correct answers |
| `passed` | boolean | True if score >= 60% |
| `results` | array | Detailed results for each question |
| `results[].questionIndex` | number | Question index |
| `results[].correct` | boolean | Whether answer was correct |
| `results[].explanation` | string | Explanation for the question |
| `progress.quizScore` | number | Updated quiz score in progress |
| `progress.quizAttempts` | number | Total number of attempts |
| `progress.overallProgress` | number | Overall course progress % |

**Notes:**
- Pass threshold is 60%
- Quiz can be attempted multiple times
- `quizAttempts` counter increments on each submission
- Best score is saved in progress tracking

---

## Data Schemas

### Course Schema
```typescript
{
  _id: ObjectId;              // Unique course identifier
  title: string;              // Course title
  description: string;        // Course description
  thumbnail?: string;         // Course thumbnail URL
  sections: Section[];        // Array of course sections
  isPublished: boolean;       // Published status
  tags: string[];             // Course tags
  enrolledCount: number;      // Total enrolled students
  createdBy: ObjectId;        // Admin who created the course
  createdAt: Date;            // Creation timestamp
  updatedAt: Date;            // Last update timestamp
}
```

### Section Schema
```typescript
{
  _id: ObjectId;              // Unique section identifier
  title: string;              // Section title
  description?: string;       // Section description
  order: number;              // Display order (0-based)
  lessons: Lesson[];          // Array of lessons in this section
}
```

### Lesson Schema
```typescript
{
  _id: ObjectId;              // Unique lesson identifier
  title: string;              // Lesson title
  content: string;            // Lesson content (Markdown/HTML)
  videoUrl?: string;          // Uploaded video path (e.g., /uploads/courses/videos/video-xxx.mp4)
  videoDescription?: string;  // Video description/summary
  resources?: string[];       // Uploaded resource paths (e.g., /uploads/courses/resources/file-xxx.pdf)
  quiz?: QuizQuestion[];      // Quiz questions
  order: number;              // Display order (0-based)
  estimatedMinutes: number;   // Estimated completion time
  isPublished: boolean;       // Published status
}
```

### Quiz Question Schema
```typescript
{
  question: string;           // Question text
  options: QuizOption[];      // Array of options (usually 4)
  explanation?: string;       // Explanation shown after submission
}
```

### Quiz Option Schema
```typescript
{
  text: string;               // Option text
  isCorrect: boolean;         // Correct answer flag
}
```

### User Progress Schema
```typescript
{
  _id: ObjectId;              // Unique progress identifier
  userId: ObjectId;           // User reference
  courseId: ObjectId;         // Course reference
  sections: SectionProgress[]; // Progress per section
  overallProgress: number;    // Overall percentage (0-100)
  enrolledAt: Date;           // Enrollment date
  lastAccessedAt: Date;       // Last access date
  totalTimeSpentMinutes: number; // Total time spent
}
```

### Section Progress Schema
```typescript
{
  sectionId: ObjectId;        // Section reference
  lessons: LessonProgress[];  // Progress per lesson
  completedLessons: number;   // Count of completed lessons
  totalLessons: number;       // Total lessons in section
}
```

### Lesson Progress Schema
```typescript
{
  lessonId: ObjectId;         // Lesson reference
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

### Accessing Uploaded Files

All uploaded videos and resources are served as static files:

```javascript
// Video URL example
const videoUrl = 'http://localhost:3000/uploads/courses/videos/video-1706012345678-123456789.mp4';

// Resource URL example
const pdfUrl = 'http://localhost:3000/uploads/courses/resources/resources-1706012345678-987654321.pdf';

// Display video in HTML
<video controls>
  <source src={videoUrl} type="video/mp4" />
  Your browser does not support the video tag.
</video>

// Download resource
<a href={pdfUrl} download>Download PDF</a>
```

### JavaScript/Frontend Integration

#### 1. Fetch Course Content
```javascript
const getCourse = async () => {
  const response = await fetch('/courses');
  
  if (response.ok) {
    const course = await response.json();
    console.log('Course:', course.title);
    console.log('Total sections:', course.sections.length);
    
    // Display sections and lessons
    course.sections.forEach((section, i) => {
      console.log(`\nSection ${i + 1}: ${section.title}`);
      section.lessons.forEach((lesson, j) => {
        console.log(`  Lesson ${j + 1}: ${lesson.title} (${lesson.estimatedMinutes} min)`);
      });
    });
  }
};
```

#### 2. Enroll in Course
```javascript
const enrollInCourse = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/courses/enroll', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const progress = await response.json();
    console.log('Enrolled! Overall Progress:', progress.overallProgress + '%');
    console.log('Total time spent:', progress.totalTimeSpentMinutes + ' minutes');
  } else if (response.status === 403) {
    console.log('Course not published yet');
  }
};
```

#### 3. Get My Progress
```javascript
const getMyProgress = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/courses/my-progress', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const progress = await response.json();
    
    console.log(`Overall Progress: ${progress.overallProgress}%`);
    console.log(`Total Time: ${progress.totalTimeSpentMinutes} minutes`);
    
    // Show section-wise progress
    progress.sections.forEach((section, i) => {
      const percentage = Math.round((section.completedLessons / section.totalLessons) * 100);
      console.log(`Section ${i + 1}: ${section.completedLessons}/${section.totalLessons} lessons (${percentage}%)`);
    });
  }
};
```

#### 4. Mark Lesson Complete
```javascript
const completeLesson = async (sectionId, lessonId, timeSpent) => {
  const token = localStorage.getItem('authToken');
  
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
  
  if (response.ok) {
    const updatedProgress = await response.json();
    console.log('Lesson completed!');
    console.log('Overall progress:', updatedProgress.overallProgress + '%');
  }
};

// Usage
completeLesson('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013', 35);
```

#### 5. Submit Quiz
```javascript
const submitQuiz = async (sectionId, lessonId, answers) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/courses/quiz/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sectionId,
      lessonId,
      answers
    })
  });
  
  if (response.ok) {
    const result = await response.json();
    
    console.log(`Score: ${result.score}%`);
    console.log(`Passed: ${result.passed ? 'Yes' : 'No'}`);
    console.log(`Correct: ${result.correctAnswers}/${result.totalQuestions}`);
    
    // Show detailed results
    result.results.forEach((r, i) => {
      const status = r.correct ? '✓' : '✗';
      console.log(`\nQ${i + 1} ${status}`);
      console.log(`Explanation: ${r.explanation}`);
    });
    
    console.log(`\nOverall Progress: ${result.progress.overallProgress}%`);
    console.log(`Quiz Attempts: ${result.progress.quizAttempts}`);
  }
};

// Usage - Answer quiz with 2 questions
submitQuiz(
  '507f1f77bcf86cd799439012',
  '507f1f77bcf86cd799439013',
  [
    { questionIndex: 0, selectedOptionIndex: 0 },  // First question, first option
    { questionIndex: 1, selectedOptionIndex: 2 }   // Second question, third option
  ]
);
```

#### 6. Complete Lesson Flow
```javascript
// Track lesson progress with timer
class LessonTracker {
  constructor(sectionId, lessonId) {
    this.sectionId = sectionId;
    this.lessonId = lessonId;
    this.startTime = Date.now();
  }
  
  async complete() {
    const timeSpent = Math.round((Date.now() - this.startTime) / 60000); // Convert to minutes
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/courses/progress', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sectionId: this.sectionId,
        lessonId: this.lessonId,
        completed: true,
        timeSpentMinutes: timeSpent
      })
    });
    
    return response.json();
  }
}

// Usage
const tracker = new LessonTracker('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013');

// ... user watches video, reads content ...

// When user finishes lesson
tracker.complete().then(progress => {
  console.log('Lesson completed!');
  console.log('Progress:', progress.overallProgress + '%');
});
```

---

## Best Practices

### Learning Flow
1. **Fetch course content** before enrollment to preview
2. **Enroll** to start tracking progress
3. **Follow section order** for structured learning
4. **Download resources** for offline study (PDFs, exercises)
5. **Watch videos completely** before marking as done
6. **Attempt quizzes** after completing lesson content
7. **Review explanations** to learn from mistakes
8. **Track time honestly** for accurate analytics

### Progress Tracking
1. **Update progress regularly** - Don't wait until end
2. **Mark lessons complete** only after understanding
3. **Retry quizzes** if score is below 60%
4. **Track time per session** for better insights
5. **Check overall progress** to stay motivated

### Performance Optimization
1. **Cache course structure** - Fetch once and reuse
2. **Lazy load videos** - Don't load all at once
3. **Save progress frequently** - Every 5-10 minutes
4. **Batch quiz submissions** - Submit all answers together
5. **Prefetch next lesson** - While watching current video

### Error Handling
```javascript
const safeApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Not authenticated - please login');
        // Redirect to login
      } else if (response.status === 403) {
        console.error('Not enrolled or course not published');
      } else if (response.status === 404) {
        console.error('Resource not found');
      } else {
        console.error('Server error');
      }
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};
```

---

## Common Scenarios

### Scenario 1: First-Time User Journey
```javascript
// Step 1: View course without enrollment
const course = await fetch('/courses').then(r => r.json());
console.log('Course:', course.title);

// Step 2: Enroll
const token = localStorage.getItem('authToken');
const progress = await fetch('/courses/enroll', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
console.log('Enrolled! Progress:', progress.overallProgress + '%');

// Step 3: Start first lesson
const firstSection = course.sections[0];
const firstLesson = firstSection.lessons[0];
// Watch video, read content...

// Step 4: Complete lesson
await fetch('/courses/progress', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sectionId: firstSection._id,
    lessonId: firstLesson._id,
    completed: true,
    timeSpentMinutes: 30
  })
});

// Step 5: Take quiz if available
if (firstLesson.quiz && firstLesson.quiz.length > 0) {
  const answers = [
    { questionIndex: 0, selectedOptionIndex: 0 },
    { questionIndex: 1, selectedOptionIndex: 2 }
  ];
  
  const result = await fetch('/courses/quiz/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sectionId: firstSection._id,
      lessonId: firstLesson._id,
      answers
    })
  }).then(r => r.json());
  
  console.log('Quiz Score:', result.score + '%');
}
```

### Scenario 2: Returning User Resume
```javascript
const resumeLearning = async () => {
  const token = localStorage.getItem('authToken');
  
  // Get current progress
  const progress = await fetch('/courses/my-progress', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  // Find next incomplete lesson
  let nextLesson = null;
  let nextSection = null;
  
  for (const section of progress.sections) {
    const incompleteLesson = section.lessons.find(l => !l.completed);
    if (incompleteLesson) {
      nextSection = section;
      nextLesson = incompleteLesson;
      break;
    }
  }
  
  if (nextLesson) {
    console.log('Resume from lesson:', nextLesson.lessonId);
    // Load lesson content and continue
  } else {
    console.log('Course completed! 🎉');
  }
};
```

---

## Error Codes

| Status Code | Message | Description |
|-------------|---------|-------------|
| 200 | Success | Request successful |
| 400 | Bad Request | Invalid section/lesson ID or quiz answers |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Not enrolled or course not published |
| 404 | Not Found | Course/section/lesson not found |
| 500 | Internal Server Error | Server error |
