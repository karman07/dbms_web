# DBMS Course - Sample Content Files

This directory contains sample markdown content files for the DBMS course lessons.

## Files

### 1. `01-introduction-to-dbms.md`
- **Topic**: Introduction to Database Management Systems
- **Video**: https://youtu.be/DTN78zxMs-I?si=CMHYZVq7IL60GMLD
- **Content**: Overview of databases, DBMS features, database users, evolution, and real-world applications

### 2. `02-file-system-vs-dbms.md`
- **Topic**: File-Based System vs Centralized Database Approach
- **Video**: https://youtu.be/NSCHqbR3NUE?si=5TzxeTSf4qA7aI9Z
- **Content**: Problems with file-based systems, advantages of centralized databases, comparison table

### 3. `03-advantages-disadvantages-dbms.md`
- **Topic**: Advantages and Disadvantages of DBMS
- **Content**: Comprehensive overview of DBMS benefits and limitations, ACID properties, when to use DBMS

## How to Use These Files

### Option 1: Upload Markdown Files via API

Use multipart/form-data to upload the `.md` files:

```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Introduction to DBMS" \
  -F "content=@sample-content/01-introduction-to-dbms.md" \
  -F "videoUrl=https://youtu.be/DTN78zxMs-I?si=CMHYZVq7IL60GMLD" \
  -F "videoDescription=DBMS Tutorial for Beginners" \
  -F "order=0" \
  -F "estimatedMinutes=45" \
  -F "isPublished=true"
```

### Option 2: Use the Automated Script

Run the pre-configured script to create the entire course:

```bash
npm run ts-node scripts/create-dbms-course.ts
```

This script will:
- Create the DBMS course
- Add the "Introduction to Database Management Systems" section
- Add 3 lessons with:
  - Comprehensive markdown content
  - YouTube video URLs
  - Quiz questions (5-6 questions per lesson)
- Mark everything as published

### Option 3: Manual Copy-Paste

Copy the markdown content from these files and paste it into your admin dashboard or API requests.

## Course Structure Created

**Course**: Database Management Systems (DBMS)

**Section 1**: Introduction to Database Management Systems

**Lessons**:
1. **DBMS Tutorial for Beginners** (45 min)
   - Video: DBMS Tutorial for Beginners
   - 5 quiz questions
   
2. **File-Based System vs Centralized Database** (30 min)
   - Video: File Based System Vs Centralized Database Approach
   - 5 quiz questions
   
3. **Advantages and Disadvantages of DBMS** (35 min)
   - 6 quiz questions

## Quiz Topics Covered

### Lesson 1 Quizzes:
- What is DBMS?
- DBMS features
- Database user roles
- History of database systems
- Real-world applications

### Lesson 2 Quizzes:
- Data redundancy problems
- File system limitations
- Single source of truth
- Concurrent access control
- Ad-hoc queries

### Lesson 3 Quizzes:
- Data independence
- ACID properties
- Cost considerations
- Concurrent access control
- When to use/avoid DBMS
- Atomicity in transactions

## Next Steps

To expand the course, you can add more sections covering:
- **Data Models**: ER Model, Relational Model, Normalization
- **SQL**: DDL, DML, DCL, TCL commands
- **Database Design**: Normalization forms, ER diagrams
- **Transactions**: ACID properties, concurrency control
- **Indexing**: Types of indexes, B-tree, Hash indexing
- **Advanced Topics**: Stored procedures, triggers, views

Each new lesson can follow the same pattern:
- Upload markdown content file
- Add YouTube video URL
- Include 5-6 quiz questions
- Set estimated time and publish status

---

## User Routes - How Students Access Course Data

Once the course is created, students can access it using these endpoints:

### 1. **Get Complete Course Content**

```bash
# Public endpoint - No authentication required
GET http://localhost:3000/courses
```

**What users get:**
- Complete course structure with all sections
- All lessons with markdown content
- Video URLs (YouTube links)
- Quiz questions and options
- Estimated time for each lesson
- Resource files

**Example Response:**
```json
{
  "_id": "679a1234567890abcdef1234",
  "title": "Database Management Systems (DBMS)",
  "description": "Complete DBMS tutorial...",
  "sections": [
    {
      "_id": "679a1234567890abcdef1235",
      "title": "Introduction to Database Management Systems",
      "lessons": [
        {
          "_id": "679a1234567890abcdef1236",
          "title": "DBMS Tutorial for Beginners",
          "content": "# Introduction to DBMS...",
          "videoUrl": "https://youtu.be/DTN78zxMs-I",
          "quiz": [...],
          "estimatedMinutes": 45
        }
      ]
    }
  ]
}
```

### 2. **Enroll in Course**

```bash
# Requires authentication
POST http://localhost:3000/courses/enroll
Authorization: Bearer YOUR_JWT_TOKEN
```

**What it does:**
- Creates a progress record for the user
- Starts tracking learning journey
- Required before updating progress or taking quizzes

### 3. **Get My Progress**

```bash
# Requires authentication
GET http://localhost:3000/courses/my-progress
Authorization: Bearer YOUR_JWT_TOKEN
```

**What users get:**
- Lesson completion status
- Quiz scores and attempts
- Time spent on each lesson
- Overall course progress percentage
- Last accessed dates

**Example Response:**
```json
{
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
          "quizScore": 80,
          "quizAttempts": 2
        }
      ]
    }
  ],
  "overallProgress": 33.33,
  "totalTimeSpentMinutes": 65
}
```

### 4. **Update Lesson Progress**

```bash
# Requires authentication
PUT http://localhost:3000/courses/progress
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "sectionId": "679a1234567890abcdef1235",
  "lessonId": "679a1234567890abcdef1236",
  "completed": true,
  "timeSpentMinutes": 50
}
```

**What it does:**
- Marks lesson as complete
- Tracks time spent studying
- Updates overall progress percentage

### 5. **Submit Quiz Answers**

```bash
# Requires authentication
POST http://localhost:3000/courses/quiz/submit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "sectionId": "679a1234567890abcdef1235",
  "lessonId": "679a1234567890abcdef1236",
  "answers": [
    { "questionIndex": 0, "selectedOptionIndex": 0 },
    { "questionIndex": 1, "selectedOptionIndex": 2 },
    { "questionIndex": 2, "selectedOptionIndex": 1 }
  ]
}
```

**What users get back:**
- Quiz score (0-100)
- Correct/incorrect for each question
- Detailed explanations
- Pass/fail status (60% required)

**Example Response:**
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
      "isCorrect": true,
      "explanation": "DBMS stands for Database Management System..."
    }
  ]
}
```

---

## Complete User Flow

**Step 1:** Fetch course content
```bash
curl http://localhost:3000/courses
```

**Step 2:** Enroll in the course
```bash
curl -X POST http://localhost:3000/courses/enroll \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 3:** Study lesson and update progress
```bash
curl -X PUT http://localhost:3000/courses/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": "SECTION_ID",
    "lessonId": "LESSON_ID",
    "completed": true,
    "timeSpentMinutes": 45
  }'
```

**Step 4:** Take the quiz
```bash
curl -X POST http://localhost:3000/courses/quiz/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": "SECTION_ID",
    "lessonId": "LESSON_ID",
    "answers": [...]
  }'
```

**Step 5:** Check overall progress
```bash
curl http://localhost:3000/courses/my-progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration Example

```javascript
// Fetch and display course
async function loadCourse() {
  const response = await fetch('http://localhost:3000/courses');
  const course = await response.json();
  
  console.log('Course Title:', course.title);
  console.log('Total Sections:', course.sections.length);
  
  // Display all lessons
  course.sections.forEach(section => {
    console.log(`\nSection: ${section.title}`);
    section.lessons.forEach(lesson => {
      console.log(`  - ${lesson.title} (${lesson.estimatedMinutes} min)`);
      console.log(`    Video: ${lesson.videoUrl}`);
      console.log(`    Quiz Questions: ${lesson.quiz.length}`);
    });
  });
}

// Enroll and track progress
async function enrollAndLearn(token, sectionId, lessonId) {
  // Enroll
  await fetch('http://localhost:3000/courses/enroll', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Mark lesson complete
  await fetch('http://localhost:3000/courses/progress', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sectionId,
      lessonId,
      completed: true,
      timeSpentMinutes: 45
    })
  });
  
  // Check progress
  const progressRes = await fetch('http://localhost:3000/courses/my-progress', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const progress = await progressRes.json();
  console.log('Overall Progress:', progress.overallProgress + '%');
}
```

---

## Summary

**Public Endpoints (No Auth):**
- `GET /courses` - Get complete course content

**Authenticated Endpoints (Require JWT Token):**
- `POST /courses/enroll` - Enroll in course
- `GET /courses/my-progress` - Get learning progress
- `PUT /courses/progress` - Update lesson progress
- `POST /courses/quiz/submit` - Submit quiz answers

**For complete API documentation, see:**
- [USER-GUIDE.md](../USER-GUIDE.md) - Detailed user documentation
- [COURSE-USER-API.md](../COURSE-USER-API.md) - Complete API reference
