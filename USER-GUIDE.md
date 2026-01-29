# User Guide - DBMS Course API

## 🎓 For Students/Users

This guide covers all the endpoints you need as a student to access the DBMS course, track your progress, and complete lessons.

---

## Authentication

All user endpoints require JWT authentication. Include your token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Get Course Content

### GET `/courses`

Fetch the complete DBMS course with all sections, lessons, videos, and quizzes.

**Auth Required**: No (Public endpoint)

**Request Example**:
```bash
curl http://localhost:3000/courses
```

**Response Example**:
```json
{
  "_id": "679a1234567890abcdef1234",
  "title": "Database Management Systems (DBMS)",
  "description": "Complete DBMS tutorial covering database fundamentals, SQL, normalization...",
  "isPublished": true,
  "sections": [
    {
      "_id": "679a1234567890abcdef1235",
      "title": "Introduction to Database Management Systems",
      "description": "Understand the fundamentals of databases and DBMS",
      "order": 0,
      "lessons": [
        {
          "_id": "679a1234567890abcdef1236",
          "title": "DBMS Tutorial for Beginners",
          "content": "# Introduction to Database Management Systems\n\n## What is a Database?...",
          "videoUrl": "https://youtu.be/DTN78zxMs-I?si=CMHYZVq7IL60GMLD",
          "videoDescription": "DBMS Tutorial for Beginners | Learn Database Management Step by Step",
          "resources": [],
          "quiz": [
            {
              "question": "What does DBMS stand for?",
              "options": [
                { "text": "Database Management System", "isCorrect": true },
                { "text": "Data Binary Management System", "isCorrect": false },
                { "text": "Digital Base Management System", "isCorrect": false },
                { "text": "Database Manipulation System", "isCorrect": false }
              ],
              "explanation": "DBMS stands for Database Management System, which is software that manages databases."
            }
          ],
          "order": 0,
          "estimatedMinutes": 45,
          "isPublished": true
        },
        {
          "_id": "679a1234567890abcdef1237",
          "title": "File-Based System vs Centralized Database",
          "content": "# File-Based System vs Centralized Database Approach...",
          "videoUrl": "https://youtu.be/NSCHqbR3NUE?si=5TzxeTSf4qA7aI9Z",
          "videoDescription": "File Based System Vs Centralized Database Approach",
          "order": 1,
          "estimatedMinutes": 30,
          "isPublished": true
        }
      ]
    }
  ],
  "createdAt": "2026-01-29T15:30:00.000Z",
  "updatedAt": "2026-01-29T15:30:00.000Z"
}
```

**What You Get**:
- Complete course structure
- All sections and lessons
- Lesson content (markdown)
- Video URLs (YouTube links)
- Quiz questions and options
- Estimated time for each lesson

---

## 2. Enroll in Course

### POST `/courses/enroll`

Enroll yourself in the DBMS course to start tracking your progress.

**Auth Required**: Yes (JWT Token)

**Request Example**:
```bash
curl -X POST http://localhost:3000/courses/enroll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example**:
```json
{
  "_id": "679a1234567890abcdef1240",
  "userId": "679a1234567890abcdef1239",
  "sections": [],
  "overallProgress": 0,
  "enrolledAt": "2026-01-29T16:00:00.000Z",
  "totalTimeSpentMinutes": 0
}
```

**Note**: You need to enroll before you can track progress or submit quizzes.

---

## 3. Get My Progress

### GET `/courses/my-progress`

Fetch your learning progress including completed lessons, quiz scores, and time spent.

**Auth Required**: Yes (JWT Token)

**Request Example**:
```bash
curl http://localhost:3000/courses/my-progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response Example**:
```json
{
  "_id": "679a1234567890abcdef1240",
  "userId": "679a1234567890abcdef1239",
  "sections": [
    {
      "sectionId": "679a1234567890abcdef1235",
      "lessons": [
        {
          "lessonId": "679a1234567890abcdef1236",
          "completed": true,
          "completedAt": "2026-01-29T16:30:00.000Z",
          "timeSpentMinutes": 50,
          "lastAccessedAt": "2026-01-29T16:30:00.000Z",
          "quizScore": 80,
          "quizAttempts": 2
        },
        {
          "lessonId": "679a1234567890abcdef1237",
          "completed": false,
          "timeSpentMinutes": 15,
          "lastAccessedAt": "2026-01-29T17:00:00.000Z",
          "quizScore": 0,
          "quizAttempts": 0
        }
      ]
    }
  ],
  "overallProgress": 33.33,
  "enrolledAt": "2026-01-29T16:00:00.000Z",
  "totalTimeSpentMinutes": 65,
  "lastAccessedAt": "2026-01-29T17:00:00.000Z"
}
```

**Progress Data Explained**:
- `completed`: Lesson marked as complete
- `completedAt`: When you completed the lesson
- `timeSpentMinutes`: Total time spent on this lesson
- `quizScore`: Your quiz score (0-100)
- `quizAttempts`: Number of times you attempted the quiz
- `overallProgress`: Overall course completion percentage

---

## 4. Update Progress

### PUT `/courses/progress`

Update your progress when you complete a lesson or spend time studying.

**Auth Required**: Yes (JWT Token)

**Request Body**:
```json
{
  "sectionId": "679a1234567890abcdef1235",
  "lessonId": "679a1234567890abcdef1236",
  "completed": true,
  "timeSpentMinutes": 50
}
```

**Request Example**:
```bash
curl -X PUT http://localhost:3000/courses/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": "679a1234567890abcdef1235",
    "lessonId": "679a1234567890abcdef1236",
    "completed": true,
    "timeSpentMinutes": 50
  }'
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sectionId` | string | Yes | Section ID from course data |
| `lessonId` | string | Yes | Lesson ID from course data |
| `completed` | boolean | No | Mark lesson as complete |
| `timeSpentMinutes` | number | No | Time spent on this lesson |

**Response Example**:
```json
{
  "_id": "679a1234567890abcdef1240",
  "userId": "679a1234567890abcdef1239",
  "sections": [
    {
      "sectionId": "679a1234567890abcdef1235",
      "lessons": [
        {
          "lessonId": "679a1234567890abcdef1236",
          "completed": true,
          "completedAt": "2026-01-29T16:30:00.000Z",
          "timeSpentMinutes": 50,
          "lastAccessedAt": "2026-01-29T16:30:00.000Z"
        }
      ]
    }
  ],
  "overallProgress": 33.33,
  "totalTimeSpentMinutes": 50,
  "lastAccessedAt": "2026-01-29T16:30:00.000Z"
}
```

---

## 5. Submit Quiz

### POST `/courses/quiz/submit`

Submit your answers to a lesson quiz and get your score.

**Auth Required**: Yes (JWT Token)

**Request Body**:
```json
{
  "sectionId": "679a1234567890abcdef1235",
  "lessonId": "679a1234567890abcdef1236",
  "answers": [
    { "questionIndex": 0, "selectedOptionIndex": 0 },
    { "questionIndex": 1, "selectedOptionIndex": 2 },
    { "questionIndex": 2, "selectedOptionIndex": 1 },
    { "questionIndex": 3, "selectedOptionIndex": 1 },
    { "questionIndex": 4, "selectedOptionIndex": 1 }
  ]
}
```

**Request Example**:
```bash
curl -X POST http://localhost:3000/courses/quiz/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": "679a1234567890abcdef1235",
    "lessonId": "679a1234567890abcdef1236",
    "answers": [
      { "questionIndex": 0, "selectedOptionIndex": 0 },
      { "questionIndex": 1, "selectedOptionIndex": 2 },
      { "questionIndex": 2, "selectedOptionIndex": 1 },
      { "questionIndex": 3, "selectedOptionIndex": 1 },
      { "questionIndex": 4, "selectedOptionIndex": 1 }
    ]
  }'
```

**Request Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sectionId` | string | Yes | Section ID containing the lesson |
| `lessonId` | string | Yes | Lesson ID with the quiz |
| `answers` | array | Yes | Array of your answers |
| `answers[].questionIndex` | number | Yes | Question index (0-based) |
| `answers[].selectedOptionIndex` | number | Yes | Your selected option index (0-based) |

**Response Example**:
```json
{
  "score": 80,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "passed": true,
  "results": [
    {
      "questionIndex": 0,
      "question": "What does DBMS stand for?",
      "yourAnswer": "Database Management System",
      "correctAnswer": "Database Management System",
      "isCorrect": true,
      "explanation": "DBMS stands for Database Management System, which is software that manages databases."
    },
    {
      "questionIndex": 1,
      "question": "Which of the following is NOT a key feature of DBMS?",
      "yourAnswer": "Manual File Management",
      "correctAnswer": "Manual File Management",
      "isCorrect": true,
      "explanation": "Manual file management is a characteristic of file-based systems, not DBMS."
    },
    {
      "questionIndex": 2,
      "question": "Who is responsible for managing the entire database system?",
      "yourAnswer": "Database Administrator (DBA)",
      "correctAnswer": "Database Administrator (DBA)",
      "isCorrect": true,
      "explanation": "Database Administrators (DBAs) are responsible for managing the entire database system."
    },
    {
      "questionIndex": 3,
      "question": "Which decade saw the introduction of the Relational Model?",
      "yourAnswer": "1970s",
      "correctAnswer": "1970s",
      "isCorrect": true,
      "explanation": "E.F. Codd introduced the Relational Model in the 1970s."
    },
    {
      "questionIndex": 4,
      "question": "Which application uses DBMS for account management?",
      "yourAnswer": "Banking",
      "correctAnswer": "Banking",
      "isCorrect": false,
      "explanation": "Banking systems use DBMS for managing accounts, transactions, and customer information."
    }
  ]
}
```

**Quiz Results Explained**:
- `score`: Your score as a percentage (0-100)
- `totalQuestions`: Total number of questions
- `correctAnswers`: Number of correct answers
- `passed`: True if score >= 60%
- `results`: Detailed results for each question
  - Shows your answer vs correct answer
  - Includes explanation for each question

---

## Complete User Flow Example

### Step 1: Get Course Content
```javascript
const getCourse = async () => {
  const response = await fetch('http://localhost:3000/courses');
  const course = await response.json();
  console.log('Course:', course.title);
  console.log('Sections:', course.sections.length);
  return course;
};
```

### Step 2: Enroll in Course
```javascript
const enrollInCourse = async (token) => {
  const response = await fetch('http://localhost:3000/courses/enroll', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const progress = await response.json();
  console.log('Enrolled! Progress:', progress.overallProgress + '%');
  return progress;
};
```

### Step 3: Watch Lesson & Update Progress
```javascript
const completeLesson = async (token, sectionId, lessonId, timeSpent) => {
  const response = await fetch('http://localhost:3000/courses/progress', {
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
  const progress = await response.json();
  console.log('Lesson completed! Overall progress:', progress.overallProgress + '%');
  return progress;
};
```

### Step 4: Take Quiz
```javascript
const takeQuiz = async (token, sectionId, lessonId, answers) => {
  const response = await fetch('http://localhost:3000/courses/quiz/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sectionId,
      lessonId,
      answers: [
        { questionIndex: 0, selectedOptionIndex: 0 },
        { questionIndex: 1, selectedOptionIndex: 2 },
        { questionIndex: 2, selectedOptionIndex: 1 },
        { questionIndex: 3, selectedOptionIndex: 1 },
        { questionIndex: 4, selectedOptionIndex: 1 }
      ]
    })
  });
  const result = await response.json();
  console.log('Quiz Score:', result.score + '%');
  console.log('Passed:', result.passed);
  return result;
};
```

### Step 5: Check Your Progress
```javascript
const getMyProgress = async (token) => {
  const response = await fetch('http://localhost:3000/courses/my-progress', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const progress = await response.json();
  console.log('Overall Progress:', progress.overallProgress + '%');
  console.log('Total Time Spent:', progress.totalTimeSpentMinutes + ' minutes');
  return progress;
};
```

---

## React/Next.js Example

```jsx
import { useState, useEffect } from 'react';

function DBMSCourse() {
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const token = localStorage.getItem('authToken');

  // Fetch course on mount
  useEffect(() => {
    fetchCourse();
    if (token) {
      fetchProgress();
    }
  }, []);

  const fetchCourse = async () => {
    const res = await fetch('http://localhost:3000/courses');
    const data = await res.json();
    setCourse(data);
  };

  const fetchProgress = async () => {
    const res = await fetch('http://localhost:3000/courses/my-progress', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setProgress(data);
  };

  const enrollNow = async () => {
    const res = await fetch('http://localhost:3000/courses/enroll', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setProgress(data);
  };

  const markComplete = async (sectionId, lessonId, timeSpent) => {
    const res = await fetch('http://localhost:3000/courses/progress', {
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
    const data = await res.json();
    setProgress(data);
  };

  const submitQuiz = async (sectionId, lessonId, answers) => {
    const res = await fetch('http://localhost:3000/courses/quiz/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sectionId, lessonId, answers })
    });
    const result = await res.json();
    alert(`Score: ${result.score}% - ${result.passed ? 'Passed!' : 'Try again'}`);
    fetchProgress();
  };

  if (!course) return <div>Loading course...</div>;

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      
      {!progress && token && (
        <button onClick={enrollNow}>Enroll Now</button>
      )}
      
      {progress && (
        <div>
          <h2>Your Progress: {progress.overallProgress}%</h2>
          <p>Time Spent: {progress.totalTimeSpentMinutes} minutes</p>
        </div>
      )}

      {course.sections.map(section => (
        <div key={section._id}>
          <h2>{section.title}</h2>
          {section.lessons.map(lesson => (
            <div key={lesson._id}>
              <h3>{lesson.title}</h3>
              <p>Duration: {lesson.estimatedMinutes} minutes</p>
              {lesson.videoUrl && (
                <a href={lesson.videoUrl} target="_blank">Watch Video</a>
              )}
              <button onClick={() => setCurrentLesson(lesson)}>
                Start Lesson
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default DBMSCourse;
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Solution**: Provide valid JWT token in Authorization header

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Course not found"
}
```
**Solution**: Ensure course exists in the database

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "You must enroll in the course first"
}
```
**Solution**: Call `/courses/enroll` before updating progress

---

## Tips for Students

### 1. **Learning Flow**
1. Fetch the course to see all lessons
2. Enroll in the course
3. Watch videos and read content
4. Update progress as you learn
5. Take quizzes to test knowledge
6. Check your overall progress

### 2. **Quiz Strategy**
- Read lesson content thoroughly
- Watch the video
- Take notes
- Quiz requires 60% to pass
- You can retake quizzes (attempts are tracked)
- Review explanations after submission

### 3. **Progress Tracking**
- Update `timeSpentMinutes` honestly for accurate analytics
- Mark lessons `completed: true` only when fully understood
- Check `my-progress` regularly to see your advancement

### 4. **Best Practices**
- Complete lessons in order
- Don't skip quizzes - they reinforce learning
- Use the markdown content for reference
- Watch videos multiple times if needed
- Track your study time for better time management

---

## Summary

**User Endpoints**:
- `GET /courses` - Fetch course content (public)
- `POST /courses/enroll` - Enroll in course (auth required)
- `GET /courses/my-progress` - Get your progress (auth required)
- `PUT /courses/progress` - Update lesson progress (auth required)
- `POST /courses/quiz/submit` - Submit quiz answers (auth required)

**Authentication**: All endpoints except `GET /courses` require JWT token

**Course Features**:
- 3 comprehensive lessons with markdown content
- YouTube video tutorials
- 16 quiz questions total
- Progress tracking
- Quiz scoring with explanations
- Time tracking

Happy Learning! 🎓
