# Complete API Reference & Testing Guide

## Overview
This document contains all API endpoints with curl examples, test results, and implementation details for the DBMS Course Management Platform.

---

## Table of Contents
1. [Authentication & Users](#1-authentication--users)
2. [Courses Module](#2-courses-module)
3. [Quiz Module](#3-quiz-module)
4. [Assignment Module](#4-assignment-module)
5. [Class Activity Module](#5-class-activity-module)
6. [Notes Module](#6-notes-module)
7. [Documentation Module](#7-documentation-module)
8. [Test Results Summary](#test-results-summary)

---

## 1. Authentication & Users

### 1.1 Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 1.2 Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@courseapp.com",
    "password": "admin123"
  }'
```

### 1.3 Get My Profile
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer <TOKEN>"
```
**Status**: ✅ Tested - 200 OK


---

## 2. Courses Module

### 2.1 Create Course (Admin)
```bash
curl -X POST http://localhost:3000/courses/admin \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Management Systems",
    "description": "Complete DBMS course covering fundamentals to advanced topics",
    "isPublished": true,
    "tags": ["database", "sql", "nosql"]
  }'
```
**Status**: ⚠️ Single course system - fails on duplicate

### 2.2 Get Course (Admin View)
```bash
curl -X GET http://localhost:3000/courses/admin \
  -H "Authorization: Bearer <TOKEN>"
```
**Status**: ✅ Tested - 200 OK

### 2.3 Get Published Course (Public)
```bash
curl -X GET http://localhost:3000/courses
```
**Status**: ✅ Tested - 200 OK


### 2.5 Add Section (Admin)
```bash
curl -X POST http://localhost:3000/courses/admin/section \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to DBMS",
    "description": "Learn database fundamentals",
    "order": 0
  }'
```
**Status**: ✅ Tested - 201 Created

### 2.6 Update Section (Admin)
```bash
curl -X PATCH http://localhost:3000/courses/admin/section/0 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Section Title"
  }'
```

### 2.7 Delete Section (Admin)
```bash
curl -X DELETE http://localhost:3000/courses/admin/section/0 \
  -H "Authorization: Bearer <TOKEN>"
```

### 2.8 Add Lesson (Admin)
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Introduction to SQL" \
  -F "content=# SQL Basics\n\nLearn SQL fundamentals..." \
  -F "order=0" \
  -F "videoUrl=https://youtube.com/watch?v=example" \
  -F "estimatedMinutes=45" \
  -F "isPublished=true" \
  -F "video=@lesson-video.mp4"
```
**Status**: ✅ Tested - 201 Created
**Note**: Uses multipart/form-data for file uploads

### 2.9 Update Lesson (Admin)
```bash
curl -X PATCH http://localhost:3000/courses/admin/section/0/lesson/1 \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Updated Lesson Title" \
  -F "content=Updated content" \
  -F "isPublished=true"
```

### 2.10 Delete Lesson (Admin)
```bash
curl -X DELETE http://localhost:3000/courses/admin/section/0/lesson/1 \
  -H "Authorization: Bearer <TOKEN>"
```

### 2.11 Enroll in Course
```bash
curl -X POST http://localhost:3000/courses/enroll \
  -H "Authorization: Bearer <TOKEN>"
```
**Status**: ✅ Tested - 201 Created

### 2.12 Get My Progress
```bash
curl -X GET http://localhost:3000/courses/my-progress \
  -H "Authorization: Bearer <TOKEN>"
```
**Status**: ✅ Tested - 200 OK

### 2.13 Mark Lesson Complete
```bash
curl -X POST http://localhost:3000/courses/progress \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "<LESSON_ID>"
  }'
```

---

## 3. Quiz Module

### 3.1 Create Quiz (Admin)
```bash
curl -X POST http://localhost:3000/quiz/admin \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "DBMS Fundamentals Quiz",
    "description": "Test your knowledge of database basics",
    "lessonId": "<LESSON_ID>",
    "questions": [
      {
        "question": "What does DBMS stand for?",
        "options": [
          {"text": "Database Management System", "isCorrect": true},
          {"text": "Data Binary Management", "isCorrect": false},
          {"text": "Digital Base Management", "isCorrect": false},
          {"text": "Database Monitoring System", "isCorrect": false}
        ],
        "explanation": "DBMS stands for Database Management System"
      }
    ]
  }'
```
**Status**: ✅ Tested - 201 Created

### 3.2 Get All Quizzes (Admin)
```bash
curl -X GET http://localhost:3000/quiz/admin \
  -H "Authorization: Bearer <TOKEN>"
```
**Status**: ✅ Tested - 200 OK

### 3.3 Get Quiz by ID
```bash
curl -X GET http://localhost:3000/quiz/<QUIZ_ID>
```

### 3.4 Get Quizzes by Lesson
```bash
curl -X GET http://localhost:3000/quiz/lesson/<LESSON_ID>
```
**Status**: ✅ Tested - 200 OK

### 3.5 Update Quiz (Admin)
```bash
curl -X PATCH http://localhost:3000/quiz/admin/<QUIZ_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Quiz Title"
  }'
```

### 3.6 Delete Quiz (Admin)
```bash
curl -X DELETE http://localhost:3000/quiz/admin/<QUIZ_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 3.7 Link Quiz to Lesson (Admin)
```bash
curl -X POST http://localhost:3000/quiz/admin/<QUIZ_ID>/link \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "<LESSON_ID>"
  }'
```

### 3.8 Unlink Quiz from Lesson (Admin)
```bash
curl -X POST http://localhost:3000/quiz/admin/<QUIZ_ID>/unlink \
  -H "Authorization: Bearer <TOKEN>"
```

### 3.9 Submit Quiz
```bash
curl -X POST http://localhost:3000/quiz/submit \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "<QUIZ_ID>",
    "lessonId": "<LESSON_ID>",
    "answers": [
      {"questionIndex": 0, "selectedOptionIndex": 0}
    ]
  }'
```
**Status**: ✅ Tested - 201 Created

### 3.10 Get My Quiz Submissions
```bash
curl -X GET http://localhost:3000/quiz/my-submissions \
  -H "Authorization: Bearer <TOKEN>"
```

### 3.11 Get All Submissions (Admin)
```bash
curl -X GET http://localhost:3000/quiz/admin/submissions \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 4. Assignment Module

### 4.1 Create Assignment (Admin)
```bash
curl -X POST http://localhost:3000/assignment/admin \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Database Normalization Assignment" \
  -F "description=Complete all normalization exercises" \
  -F "content=# Assignment\n\n## Exercise 1\nNormalize the given table..." \
  -F "lessonId=<LESSON_ID>" \
  -F "dueDate=2024-12-31T23:59:59Z" \
  -F "maxScore=100" \
  -F "file=@assignment.md"
```
**Status**: ✅ Tested - 201 Created
**Note**: Supports markdown file upload

### 4.2 Get All Assignments (Admin)
```bash
curl -X GET http://localhost:3000/assignment/admin \
  -H "Authorization: Bearer <TOKEN>"
```
**Status**: ✅ Tested - 200 OK

### 4.3 Get Assignment by ID
```bash
curl -X GET http://localhost:3000/assignment/<ASSIGNMENT_ID>
```

### 4.4 Get Assignments by Lesson
```bash
curl -X GET http://localhost:3000/assignment/lesson/<LESSON_ID>
```
**Status**: ✅ Tested - 200 OK

### 4.5 Update Assignment (Admin)
```bash
curl -X PATCH http://localhost:3000/assignment/admin/<ASSIGNMENT_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Updated Assignment Title" \
  -F "content=Updated content"
```

### 4.6 Delete Assignment (Admin)
```bash
curl -X DELETE http://localhost:3000/assignment/admin/<ASSIGNMENT_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 4.7 Link Assignment to Lesson (Admin)
```bash
curl -X POST http://localhost:3000/assignment/admin/<ASSIGNMENT_ID>/link \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "<LESSON_ID>"
  }'
```

### 4.8 Unlink Assignment from Lesson (Admin)
```bash
curl -X POST http://localhost:3000/assignment/admin/<ASSIGNMENT_ID>/unlink \
  -H "Authorization: Bearer <TOKEN>"
```

### 4.9 Submit Assignment
```bash
curl -X POST http://localhost:3000/assignment/submit \
  -H "Authorization: Bearer <TOKEN>" \
  -F "assignmentId=<ASSIGNMENT_ID>" \
  -F "lessonId=<LESSON_ID>" \
  -F "content=My submission content..." \
  -F "file=@submission.pdf"
```

### 4.10 Get My Submissions
```bash
curl -X GET http://localhost:3000/assignment/my-submissions \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 5. Class Activity Module

### 5.1 Create Class Activity (Admin)
```bash
curl -X POST http://localhost:3000/class-activity/admin \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=SQL Practice Session" \
  -F "description=Hands-on SQL query practice" \
  -F "content=# Activity\n\n## Task 1\nWrite SELECT queries..." \
  -F "lessonId=<LESSON_ID>" \
  -F "duration=60" \
  -F "file=@activity.md"
```
**Status**: ✅ Tested - 201 Created
**Note**: Supports markdown file upload

### 5.2 Get All Activities (Admin)
```bash
curl -X GET http://localhost:3000/class-activity/admin \
  -H "Authorization: Bearer <TOKEN>"
```
**Status**: ✅ Tested - 200 OK

### 5.3 Get Activity by ID
```bash
curl -X GET http://localhost:3000/class-activity/<ACTIVITY_ID>
```

### 5.4 Get Activities by Lesson
```bash
curl -X GET http://localhost:3000/class-activity/lesson/<LESSON_ID>
```
**Status**: ✅ Tested - 200 OK

### 5.5 Update Activity (Admin)
```bash
curl -X PATCH http://localhost:3000/class-activity/admin/<ACTIVITY_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Updated Activity Title" \
  -F "content=Updated content"
```

### 5.6 Delete Activity (Admin)
```bash
curl -X DELETE http://localhost:3000/class-activity/admin/<ACTIVITY_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 5.7 Link Activity to Lesson (Admin)
```bash
curl -X POST http://localhost:3000/class-activity/admin/<ACTIVITY_ID>/link \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "<LESSON_ID>"
  }'
```

### 5.8 Unlink Activity from Lesson (Admin)
```bash
curl -X POST http://localhost:3000/class-activity/admin/<ACTIVITY_ID>/unlink \
  -H "Authorization: Bearer <TOKEN>"
```

### 5.9 Submit Activity
```bash
curl -X POST http://localhost:3000/class-activity/submit \
  -H "Authorization: Bearer <TOKEN>" \
  -F "activityId=<ACTIVITY_ID>" \
  -F "lessonId=<LESSON_ID>" \
  -F "content=My activity submission..." \
  -F "file=@submission.pdf"
```

### 5.10 Get My Submissions
```bash
curl -X GET http://localhost:3000/class-activity/my-submissions \
  -H "Authorization: Bearer <TOKEN>"
```

---

