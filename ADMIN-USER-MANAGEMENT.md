# Admin User Management API Documentation

This document describes all admin endpoints for managing users, courses, and system administration.

## Table of Contents
- [Authentication & Access](#authentication--access)
- [User Management](#user-management)
- [Course Management](#course-management)
- [System Administration](#system-administration)

---

## Authentication & Access

### Admin Login
**Endpoint:** `POST /auth/login`
**Description:** Login for admin users (same endpoint as regular users)
**Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminPassword123"
}
```
**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f191e810c19729de860ea",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "isEmailVerified": true
  }
}
```

### Admin Registration
**Endpoint:** `POST /auth/register`
**Description:** Register new admin (requires manual role change after registration)
**Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "adminPassword123",
  "confirmPassword": "adminPassword123"
}
```
**Note:** New registrations default to USER role. Use admin endpoints to change role to ADMIN.

### Authentication Requirements
All admin endpoints require:
- Valid JWT token in Authorization header
- User role must be `ADMIN`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## User Management

### Get All Users
**Endpoint:** `GET /users/admin/all`
**Description:** Retrieve all users with pagination and filtering
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role (USER/ADMIN)
- `isEmailVerified` (optional): Filter by email verification status

### Get User by ID
**Endpoint:** `GET /users/admin/:id`
**Description:** Get detailed information about a specific user
**Parameters:**
- `id`: User's MongoDB ObjectId

### Update User
**Endpoint:** `PUT /users/admin/:id`
**Description:** Update any user's information (full admin access)
**Parameters:**
- `id`: User's MongoDB ObjectId
**Body:** Any user fields to update

### Delete User
**Endpoint:** `DELETE /users/admin/:id`
**Description:** Permanently delete a user account
**Parameters:**
- `id`: User's MongoDB ObjectId

### Verify User Email (Admin Override)
**Endpoint:** `POST /users/admin/:id/verify-email`
**Description:** Manually verify a user's email address
**Parameters:**
- `id`: User's MongoDB ObjectId

### Change User Role
**Endpoint:** `PUT /users/admin/:id/role`
**Description:** Change user's role between USER and ADMIN
**Parameters:**
- `id`: User's MongoDB ObjectId
**Body:**
```json
{
  "role": "ADMIN" // or "USER"
}
```

### Get User Statistics
**Endpoint:** `GET /users/admin/stats`
**Description:** Get system-wide user statistics
**Response:**
```json
{
  "totalUsers": 150,
  "verifiedUsers": 120,
  "adminUsers": 5,
  "regularUsers": 145,
  "newUsersThisMonth": 25,
  "activeUsersThisWeek": 80
}
```

---

## Course Management

### Create Course
**Endpoint:** `POST /courses/admin`
**Description:** Create a new course (only one course allowed)
**Body:**
```json
{
  "title": "Complete Web Development Course",
  "description": "Learn full-stack web development",
  "price": 99.99,
  "discountPrice": 79.99,
  "thumbnail": "https://example.com/thumbnail.jpg",
  "isPublished": false,
  "tags": ["web", "javascript", "react"],
  "difficulty": "intermediate",
  "estimatedDuration": "40 hours"
}
```

### Update Course
**Endpoint:** `PUT /courses/admin`
**Description:** Update course information
**Body:** Any course fields to update

### Get Course (Admin View)
**Endpoint:** `GET /courses/admin`
**Description:** Get course with all details including unpublished content

### Add Section
**Endpoint:** `POST /courses/admin/section`
**Description:** Add a new section to the course
**Body:**
```json
{
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript fundamentals",
  "order": 1
}
```

### Update Section
**Endpoint:** `PUT /courses/admin/section/:sectionIndex`
**Description:** Update a specific section
**Parameters:**
- `sectionIndex`: Index of section in array (0-based)

### Delete Section
**Endpoint:** `DELETE /courses/admin/section/:sectionIndex`
**Description:** Delete a section and all its lessons
**Parameters:**
- `sectionIndex`: Index of section in array (0-based)

### Add Lesson
**Endpoint:** `POST /courses/admin/section/:sectionIndex/lesson`
**Description:** Add a lesson to a section with file uploads
**Parameters:**
- `sectionIndex`: Index of section in array (0-based)
**Content-Type:** `multipart/form-data`
**Body:**
```json
{
  "title": "Variables and Data Types",
  "description": "Learn about JavaScript variables",
  "order": 1,
  "type": "video", // video, text, quiz
  "content": "Lesson content in markdown",
  "videoUrl": "https://youtube.com/watch?v=...", // or upload file
  "resources": ["https://example.com/resource1.pdf"], // or upload files
  "quiz": [
    {
      "question": "What is a variable?",
      "options": [
        {"text": "A container for data", "isCorrect": true},
        {"text": "A function", "isCorrect": false}
      ],
      "explanation": "Variables store data values"
    }
  ]
}
```
**File Fields:**
- `content`: Markdown file (optional)
- `video`: Video file (optional)
- `resources`: Multiple resource files (optional)

### Update Lesson
**Endpoint:** `PUT /courses/admin/section/:sectionIndex/lesson/:lessonIndex`
**Description:** Update a specific lesson
**Parameters:**
- `sectionIndex`: Index of section in array (0-based)
- `lessonIndex`: Index of lesson in array (0-based)

### Delete Lesson
**Endpoint:** `DELETE /courses/admin/section/:sectionIndex/lesson/:lessonIndex`
**Description:** Delete a specific lesson
**Parameters:**
- `sectionIndex`: Index of section in array (0-based)
- `lessonIndex`: Index of lesson in array (0-based)

---

## System Administration

### Get System Statistics
**Endpoint:** `GET /admin/stats`
**Description:** Get comprehensive system statistics
**Response:**
```json
{
  "users": {
    "total": 150,
    "verified": 120,
    "admins": 5,
    "newThisMonth": 25
  },
  "course": {
    "enrolled": 89,
    "completionRate": 65,
    "averageProgress": 45
  },
  "notes": {
    "total": 450,
    "bookmarked": 120,
    "liked": 200
  },
  "storage": {
    "totalFiles": 250,
    "totalSizeMB": 1024
  }
}
```

### Get User Activity Logs
**Endpoint:** `GET /admin/activity-logs`
**Description:** Get recent user activity across the system
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `userId` (optional): Filter by specific user
- `action` (optional): Filter by action type

### Export User Data
**Endpoint:** `GET /admin/export/users`
**Description:** Export all user data as CSV
**Query Parameters:**
- `format`: csv or json
**Response:** File download

### Export Course Progress
**Endpoint:** `GET /admin/export/progress`
**Description:** Export all user progress data
**Query Parameters:**
- `format`: csv or json
**Response:** File download

### System Health Check
**Endpoint:** `GET /admin/health`
**Description:** Check system health and database connectivity
**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": "5 days, 3 hours",
  "memoryUsage": "45%",
  "diskSpace": "78% used"
}
```

### Backup Database
**Endpoint:** `POST /admin/backup`
**Description:** Create a database backup
**Response:**
```json
{
  "message": "Backup created successfully",
  "filename": "backup_2026-01-29_10-30-00.gz",
  "size": "15.2 MB"
}
```

---

## Admin Capabilities Summary

### User Management Powers
- **View All Users**: Access complete user database with search/filter
- **Modify Any User**: Update profiles, verify emails, change roles
- **Delete Users**: Permanently remove user accounts
- **User Analytics**: Track registration, activity, and engagement metrics
- **Role Management**: Promote users to admin or demote to regular user

### Course Management Powers
- **Full Course Control**: Create, update, publish/unpublish course
- **Content Management**: Add/edit/delete sections and lessons
- **File Management**: Upload videos, documents, and resources
- **Quiz Management**: Create and modify quizzes with scoring
- **Progress Monitoring**: View all user progress and completion rates

### System Administration Powers
- **System Monitoring**: Health checks, performance metrics
- **Data Export**: Export user data and progress reports
- **Analytics Dashboard**: Comprehensive system statistics
- **Backup Management**: Create and manage database backups
- **Activity Monitoring**: Track user actions and system events

### Security Features
- **Role-Based Access**: All endpoints protected by admin role verification
- **JWT Authentication**: Secure token-based authentication
- **Audit Logging**: Track all admin actions for security
- **Data Validation**: Input validation and sanitization on all endpoints

---

## Error Responses

All admin endpoints may return these common errors:

```json
// 401 Unauthorized - Invalid or missing JWT token
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 403 Forbidden - User is not an admin
{
  "statusCode": 403,
  "message": "Forbidden resource"
}

// 404 Not Found - Resource doesn't exist
{
  "statusCode": 404,
  "message": "User not found" // or other resource
}

// 400 Bad Request - Validation error
{
  "statusCode": 400,
  "message": ["Validation error details"],
  "error": "Bad Request"
}
```