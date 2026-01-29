# Course Enrollment and Progress API Documentation

This document describes the enrollment and progress tracking endpoints for the course system.

## Table of Contents
- [Enroll in Course](#enroll-in-course)
- [Update Progress](#update-progress)
- [Get My Progress](#get-my-progress)
- [Submit Quiz](#submit-quiz)

---

## Enroll in Course

Enrolls an authenticated user in the course. Creates a progress tracking record with all sections and lessons initialized.

**Endpoint:** `POST /courses/enroll`

**Authentication:** Required (JWT)

**Authorization:** Any authenticated user

### Request

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:** None

### Response

**Success (200 OK):**

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
  "totalTimeSpentMinutes": 0,
  "createdAt": "2026-01-29T10:30:00.000Z",
  "updatedAt": "2026-01-29T10:30:00.000Z"
}
```

**Notes:**
- If the user is already enrolled, returns the existing progress record
- Course must be published to enroll
- Automatically increments the course's `enrolledCount`
- Initializes all sections and lessons with default values (completed: false, timeSpent: 0)

**Error Responses:**

```json
// 401 Unauthorized - No valid JWT token
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 404 Not Found - Course does not exist
{
  "statusCode": 404,
  "message": "Course not found"
}

// 403 Forbidden - Course is not published
{
  "statusCode": 403,
  "message": "Course is not published yet"
}
```

---

## Update Progress

Updates the user's progress for a specific lesson within a section. Tracks completion status and time spent.

**Endpoint:** `PUT /courses/progress`

**Authentication:** Required (JWT)

**Authorization:** User must be enrolled in the course

### Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "sectionId": "507f191e810c19729de860ec",
  "lessonId": "507f191e810c19729de860ed",
  "completed": true,
  "timeSpentMinutes": 15
}
```

**Request Body Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sectionId | string | Yes | MongoDB ObjectId of the section |
| lessonId | string | Yes | MongoDB ObjectId of the lesson |
| completed | boolean | Yes | Whether the lesson is completed |
| timeSpentMinutes | number | No | Time spent on this lesson (in minutes, minimum 0) |

### Response

**Success (200 OK):**

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
          "completed": true,
          "completedAt": "2026-01-29T11:45:00.000Z",
          "timeSpentMinutes": 15,
          "lastAccessedAt": "2026-01-29T11:45:00.000Z"
        }
      ],
      "completedLessons": 1,
      "totalLessons": 1
    }
  ],
  "overallProgress": 100,
  "enrolledAt": "2026-01-29T10:30:00.000Z",
  "lastAccessedAt": "2026-01-29T11:45:00.000Z",
  "totalTimeSpentMinutes": 15,
  "createdAt": "2026-01-29T10:30:00.000Z",
  "updatedAt": "2026-01-29T11:45:00.000Z"
}
```

**Progress Calculation:**
- Section progress: Automatically recalculates `completedLessons` count
- Overall progress: Calculated as `(total completed lessons / total lessons) * 100`
- Time tracking: Accumulates time spent at both lesson and overall progress levels
- Completion timestamp: Sets `completedAt` when a lesson is marked complete for the first time

**Error Responses:**

```json
// 401 Unauthorized - No valid JWT token
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 404 Not Found - Course does not exist
{
  "statusCode": 404,
  "message": "Course not found"
}

// 404 Not Found - User is not enrolled
{
  "statusCode": 404,
  "message": "You are not enrolled in this course"
}

// 400 Bad Request - Invalid sectionId
{
  "statusCode": 400,
  "message": "Section not found in progress"
}

// 400 Bad Request - Invalid lessonId
{
  "statusCode": 400,
  "message": "Lesson not found in progress"
}

// 400 Bad Request - Validation error
{
  "statusCode": 400,
  "message": [
    "sectionId must be a mongodb id",
    "lessonId must be a mongodb id",
    "completed must be a boolean value",
    "timeSpentMinutes must not be less than 0"
  ],
  "error": "Bad Request"
}
```

---

## Get My Progress

Retrieves the authenticated user's progress for the course.

**Endpoint:** `GET /courses/my-progress`

**Authentication:** Required (JWT)

**Authorization:** User must be enrolled in the course

### Request

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:** None

### Response

**Success (200 OK):**

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
          "completed": true,
          "completedAt": "2026-01-29T11:45:00.000Z",
          "timeSpentMinutes": 15,
          "lastAccessedAt": "2026-01-29T11:45:00.000Z",
          "quizScore": 85,
          "quizAttempts": 1
        },
        {
          "lessonId": "507f191e810c19729de860ee",
          "completed": false,
          "timeSpentMinutes": 5,
          "lastAccessedAt": "2026-01-29T12:00:00.000Z"
        }
      ],
      "completedLessons": 1,
      "totalLessons": 2
    }
  ],
  "overallProgress": 50,
  "enrolledAt": "2026-01-29T10:30:00.000Z",
  "lastAccessedAt": "2026-01-29T12:00:00.000Z",
  "totalTimeSpentMinutes": 20,
  "createdAt": "2026-01-29T10:30:00.000Z",
  "updatedAt": "2026-01-29T12:00:00.000Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| _id | string | Progress record ID |
| userId | string | User's MongoDB ObjectId |
| courseId | string | Course's MongoDB ObjectId |
| sections | array | Array of section progress objects |
| sections[].sectionId | string | Section's MongoDB ObjectId |
| sections[].lessons | array | Array of lesson progress objects |
| sections[].lessons[].lessonId | string | Lesson's MongoDB ObjectId |
| sections[].lessons[].completed | boolean | Whether lesson is completed |
| sections[].lessons[].completedAt | string | ISO timestamp of completion (optional) |
| sections[].lessons[].timeSpentMinutes | number | Time spent on this lesson |
| sections[].lessons[].lastAccessedAt | string | ISO timestamp of last access (optional) |
| sections[].lessons[].quizScore | number | Quiz score percentage 0-100 (optional) |
| sections[].lessons[].quizAttempts | number | Number of quiz attempts (optional) |
| sections[].completedLessons | number | Count of completed lessons in section |
| sections[].totalLessons | number | Total lessons in section |
| overallProgress | number | Overall course completion percentage (0-100) |
| enrolledAt | string | ISO timestamp of enrollment |
| lastAccessedAt | string | ISO timestamp of last activity |
| totalTimeSpentMinutes | number | Total time spent across all lessons |
| createdAt | string | ISO timestamp of record creation |
| updatedAt | string | ISO timestamp of last update |

**Error Responses:**

```json
// 401 Unauthorized - No valid JWT token
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 404 Not Found - Course does not exist
{
  "statusCode": 404,
  "message": "Course not found"
}

// 404 Not Found - User is not enrolled
{
  "statusCode": 404,
  "message": "You are not enrolled in this course"
}
```

---

## Submit Quiz

Submits quiz answers for a lesson and receives scoring feedback.

**Endpoint:** `POST /courses/quiz/submit`

**Authentication:** Required (JWT)

**Authorization:** User must be enrolled in the course

### Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "sectionId": "507f191e810c19729de860ec",
  "lessonId": "507f191e810c19729de860ed",
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

**Request Body Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sectionId | string | Yes | MongoDB ObjectId of the section |
| lessonId | string | Yes | MongoDB ObjectId of the lesson |
| answers | array | Yes | Array of quiz answer objects |
| answers[].questionIndex | number | Yes | Index of the question (0-based) |
| answers[].selectedOptionIndex | number | Yes | Index of selected option (0-based) |

### Response

**Success (200 OK):**

Response format depends on the service implementation. Typically includes:
- Score percentage
- Correct/incorrect answers
- Updated progress with quiz score and attempts

**Error Responses:**

```json
// 401 Unauthorized - No valid JWT token
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 400 Bad Request - Validation error
{
  "statusCode": 400,
  "message": [
    "sectionId must be a mongodb id",
    "lessonId must be a mongodb id",
    "answers must be an array"
  ],
  "error": "Bad Request"
}
```

---

## Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation error or invalid parameters |
| 401 | Unauthorized - Missing or invalid JWT token |
| 403 | Forbidden - Course not published or insufficient permissions |
| 404 | Not Found - Course not found or user not enrolled |
| 500 | Internal Server Error |

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Obtain the JWT token through the authentication endpoints (see AUTH-API-DOCUMENTATION.md).

## Notes

- The system assumes a single-course structure (queries for the first course)
- Progress is tracked at the lesson level within sections
- Overall progress is automatically calculated based on completed lessons
- Time spent is cumulative and tracked in minutes
- Once a lesson is marked complete, the `completedAt` timestamp is set and persists
- Quiz scores and attempts are tracked separately in the lesson progress
