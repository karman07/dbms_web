# Complete Admin API Documentation

Comprehensive documentation for all admin endpoints with full schemas and curl examples.

## Table of Contents
- [Authentication](#authentication)
- [User Management](#user-management)
- [Course Management](#course-management)
- [Documentation Management](#documentation-management)

---

## Authentication

### 1. Admin Login
**Endpoint:** `POST /auth/login`

**Request Schema:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
```

**Response Schema:**
```json
{
  "access_token": "string (JWT token)",
  "user": {
    "id": "string (MongoDB ObjectId)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "admin|user",
    "isEmailVerified": "boolean",
    "profilePicture": "string (optional)",
    "phoneNumber": "string (optional)",
    "age": "number (optional)",
    "gender": "male|female|other (optional)",
    "currentPosition": "string (optional)",
    "company": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "country": "string (optional)",
    "bio": "string (optional)",
    "dateOfBirth": "string (ISO date, optional)",
    "linkedinProfile": "string (optional)",
    "githubProfile": "string (optional)",
    "website": "string (optional)",
    "isActive": "boolean",
    "lastLoginAt": "string (ISO date)",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 2. Admin Registration
**Endpoint:** `POST /auth/register`

**Request Schema:**
```json
{
  "firstName": "string (required, 2-50 chars)",
  "lastName": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "confirmPassword": "string (required, must match password)"
}
```

**Response:** Same as login response

**Curl Example:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "admin123",
    "confirmPassword": "admin123"
  }'
```

**Note:** New users default to USER role. Use admin endpoints to promote to ADMIN.

---

## User Management

### 3. Create Admin User
**Endpoint:** `POST /users/admin`
**Auth:** None (public for initial admin setup)

**Request Schema (CreateUserDto):**
```json
{
  "email": "string (required, valid email)",
  "firstName": "string (required, 2-50 chars)",
  "lastName": "string (required, 2-50 chars)",
  "password": "string (optional, min 6 chars)",
  "phoneNumber": "string (optional, valid phone)",
  "age": "number (optional)",
  "gender": "male|female|other (optional)",
  "currentPosition": "string (optional)",
  "company": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "country": "string (optional)",
  "bio": "string (optional)",
  "firebaseUid": "string (optional)",
  "isGoogleSignup": "boolean (optional)",
  "referralSource": "string (optional)",
  "dateOfBirth": "string (ISO date, optional)",
  "linkedinProfile": "string (optional)",
  "githubProfile": "string (optional)",
  "website": "string (optional)"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/users/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "password": "admin123",
    "phoneNumber": "+1234567890",
    "currentPosition": "System Administrator",
    "company": "Tech Corp"
  }'
```

### 4. Get All Users
**Endpoint:** `GET /users`
**Auth:** JWT + ADMIN role

**Response Schema:**
```json
[
  {
    "_id": "string (MongoDB ObjectId)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string (optional)",
    "age": "number (optional)",
    "gender": "male|female|other (optional)",
    "currentPosition": "string (optional)",
    "company": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "country": "string (optional)",
    "profilePicture": "string (optional)",
    "bio": "string (optional)",
    "isEmailVerified": "boolean",
    "isPhoneVerified": "boolean",
    "role": "admin|user",
    "firebaseUid": "string (optional)",
    "isGoogleSignup": "boolean",
    "referralSource": "string (optional)",
    "dateOfBirth": "string (ISO date, optional)",
    "linkedinProfile": "string (optional)",
    "githubProfile": "string (optional)",
    "website": "string (optional)",
    "isActive": "boolean",
    "lastLoginAt": "string (ISO date, optional)",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
]
```

**Curl Example:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get User by ID
**Endpoint:** `GET /users/:id`
**Auth:** JWT + ADMIN role

**Response Schema:** Single user object (same as array item above)

**Curl Example:**
```bash
curl -X GET http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update User (Admin)
**Endpoint:** `PATCH /users/:id`
**Auth:** JWT + ADMIN role

**Request Schema (AdminUpdateUserDto):**
```json
{
  "firstName": "string (optional, 2-50 chars)",
  "lastName": "string (optional, 2-50 chars)",
  "phoneNumber": "string (optional, valid phone)",
  "age": "number (optional)",
  "gender": "male|female|other (optional)",
  "currentPosition": "string (optional)",
  "company": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "country": "string (optional)",
  "bio": "string (optional)",
  "dateOfBirth": "string (ISO date, optional)",
  "linkedinProfile": "string (optional)",
  "githubProfile": "string (optional)",
  "website": "string (optional)",
  "role": "admin|user (optional, ADMIN ONLY)",
  "isActive": "boolean (optional, ADMIN ONLY)",
  "isEmailVerified": "boolean (optional, ADMIN ONLY)",
  "isPhoneVerified": "boolean (optional, ADMIN ONLY)"
}
```

**Curl Example:**
```bash
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "isEmailVerified": true,
    "currentPosition": "Senior Developer"
  }'
```

### 7. Delete User
**Endpoint:** `DELETE /users/:id`
**Auth:** JWT + ADMIN role

**Response Schema:**
```json
{
  "message": "User deleted successfully"
}
```

**Curl Example:**
```bash
curl -X DELETE http://localhost:3000/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Verify User Email (Admin Override)
**Endpoint:** `PATCH /users/:id/verify-email`
**Auth:** JWT + ADMIN role

**Response Schema:**
```json
{
  "_id": "string",
  "email": "string",
  "isEmailVerified": true,
  ...
}
```

**Curl Example:**
```bash
curl -X PATCH http://localhost:3000/users/507f1f77bcf86cd799439011/verify-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Course Management

### 9. Create Course
**Endpoint:** `POST /courses/admin`
**Auth:** JWT + ADMIN role

**Request Schema (CreateCourseDto):**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "thumbnail": "string (optional, URL)",
  "sections": "array (optional, CreateSectionDto[])",
  "isPublished": "boolean (optional, default: false)",
  "tags": "string[] (optional)"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/courses/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Web Development Course",
    "description": "Learn full-stack web development from scratch",
    "thumbnail": "https://example.com/thumbnail.jpg",
    "isPublished": false,
    "tags": ["web", "javascript", "react", "nodejs"]
  }'
```

### 10. Update Course
**Endpoint:** `PUT /courses/admin`
**Auth:** JWT + ADMIN role

**Request Schema (UpdateCourseDto):**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "thumbnail": "string (optional)",
  "isPublished": "boolean (optional)",
  "tags": "string[] (optional)"
}
```

**Curl Example:**
```bash
curl -X PUT http://localhost:3000/courses/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Course Title",
    "isPublished": true
  }'
```

### 11. Get Course (Admin View)
**Endpoint:** `GET /courses/admin`
**Auth:** JWT + ADMIN role

**Response Schema:**
```json
{
  "_id": "string (MongoDB ObjectId)",
  "title": "string",
  "description": "string",
  "thumbnail": "string",
  "sections": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "order": "number",
      "lessons": [
        {
          "_id": "string",
          "title": "string",
          "content": "string (markdown)",
          "order": "number",
          "videoUrl": "string (optional)",
          "videoDescription": "string (optional)",
          "resources": "string[] (optional)",
          "quiz": [
            {
              "question": "string",
              "options": [
                {
                  "text": "string",
                  "isCorrect": "boolean"
                }
              ],
              "explanation": "string (optional)"
            }
          ],
          "estimatedMinutes": "number (optional)",
          "isPublished": "boolean"
        }
      ]
    }
  ],
  "isPublished": "boolean",
  "tags": "string[]",
  "enrolledCount": "number",
  "createdBy": "string (ObjectId)",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

**Curl Example:**
```bash
curl -X GET http://localhost:3000/courses/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 12. Add Section
**Endpoint:** `POST /courses/admin/section`
**Auth:** JWT + ADMIN role

**Request Schema (CreateSectionDto):**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "order": "number (optional, min: 0)",
  "lessons": "array (optional, CreateLessonDto[])"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/courses/admin/section \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to JavaScript",
    "description": "Learn JavaScript fundamentals",
    "order": 1
  }'
```

### 13. Update Section
**Endpoint:** `PUT /courses/admin/section/:sectionIndex`
**Auth:** JWT + ADMIN role

**Request Schema (UpdateSectionDto):**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "order": "number (optional, min: 0)"
}
```

**Curl Example:**
```bash
curl -X PUT http://localhost:3000/courses/admin/section/0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Section Title",
    "description": "Updated description"
  }'
```

### 14. Delete Section
**Endpoint:** `DELETE /courses/admin/section/:sectionIndex`
**Auth:** JWT + ADMIN role

**Curl Example:**
```bash
curl -X DELETE http://localhost:3000/courses/admin/section/0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 15. Add Lesson
**Endpoint:** `POST /courses/admin/section/:sectionIndex/lesson`
**Auth:** JWT + ADMIN role
**Content-Type:** multipart/form-data

**Request Schema (CreateLessonDto):**
```json
{
  "title": "string (required)",
  "content": "string (required, markdown)",
  "order": "number (optional, min: 0)",
  "videoUrl": "string (optional, URL or file upload)",
  "videoDescription": "string (optional)",
  "resources": "string[] (optional, URLs or file uploads)",
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
  "isPublished": "boolean (optional)"
}
```

**File Fields:**
- `content` - Markdown file (optional, overrides content field)
- `video` - Video file (optional, overrides videoUrl field)
- `resources` - Multiple resource files (optional, overrides resources array)

**Curl Example (JSON only):**
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Variables and Data Types",
    "content": "# Variables\n\nLearn about JavaScript variables...",
    "order": 1,
    "videoUrl": "https://youtube.com/watch?v=example",
    "videoDescription": "Introduction to variables",
    "resources": ["https://example.com/cheatsheet.pdf"],
    "quiz": [
      {
        "question": "What keyword is used to declare a constant?",
        "options": [
          {"text": "const", "isCorrect": true},
          {"text": "let", "isCorrect": false},
          {"text": "var", "isCorrect": false}
        ],
        "explanation": "const is used for constants that cannot be reassigned"
      }
    ],
    "estimatedMinutes": 30,
    "isPublished": true
  }'
```

**Curl Example (with file uploads):**
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Variables and Data Types" \
  -F "order=1" \
  -F "content=@lesson1.md" \
  -F "video=@intro-video.mp4" \
  -F "resources=@cheatsheet.pdf" \
  -F "resources=@exercises.pdf" \
  -F "estimatedMinutes=30" \
  -F "isPublished=true"
```

### 16. Update Lesson
**Endpoint:** `PUT /courses/admin/section/:sectionIndex/lesson/:lessonIndex`
**Auth:** JWT + ADMIN role
**Content-Type:** multipart/form-data

**Request Schema:** Same as CreateLessonDto (all fields optional)

**Curl Example:**
```bash
curl -X PUT http://localhost:3000/courses/admin/section/0/lesson/0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Lesson Title",
    "isPublished": true
  }'
```

### 17. Delete Lesson
**Endpoint:** `DELETE /courses/admin/section/:sectionIndex/lesson/:lessonIndex`
**Auth:** JWT + ADMIN role

**Curl Example:**
```bash
curl -X DELETE http://localhost:3000/courses/admin/section/0/lesson/0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Documentation Management

### 18. Create Topic with Subtopics
**Endpoint:** `POST /docs/admin/topic`
**Auth:** JWT + ADMIN role
**Content-Type:** multipart/form-data

**Request Schema:**
```
topic: "string (required, topic name)"
course: "string (optional, default: 'dbms')"
files: "file[] (required, at least 1 markdown file)"
```

**Response Schema:**
```json
{
  "_id": "string (MongoDB ObjectId)",
  "topic": "string",
  "course": "string",
  "subtopics": [
    {
      "name": "string",
      "content": "string (markdown)",
      "filename": "string",
      "createdAt": "string (ISO date)"
    }
  ],
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/docs/admin/topic \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "topic=Database Normalization" \
  -F "course=dbms" \
  -F "files=@first_normal_form.md" \
  -F "files=@second_normal_form.md" \
  -F "files=@third_normal_form.md"
```

### 19. Delete Topic
**Endpoint:** `DELETE /docs/admin/topic/:id`
**Auth:** JWT + ADMIN role

**Response Schema:**
```json
{
  "message": "Topic deleted successfully"
}
```

**Curl Example:**
```bash
curl -X DELETE http://localhost:3000/docs/admin/topic/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 20. Add Subtopic to Topic
**Endpoint:** `POST /docs/admin/topic/:id/subtopic`
**Auth:** JWT + ADMIN role
**Content-Type:** multipart/form-data

**Request Schema:**
```
name: "string (optional, uses filename if not provided)"
file: "file (required, single markdown file)"
```

**Response Schema:** Same as Create Topic response

**Curl Example:**
```bash
curl -X POST http://localhost:3000/docs/admin/topic/507f1f77bcf86cd799439011/subtopic \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=BCNF Normal Form" \
  -F "file=@bcnf.md"
```

### 21. Delete Subtopic
**Endpoint:** `DELETE /docs/admin/topic/:id/subtopic/:name`
**Auth:** JWT + ADMIN role

**Response Schema:**
```json
{
  "message": "Subtopic deleted successfully"
}
```

**Curl Example:**
```bash
curl -X DELETE "http://localhost:3000/docs/admin/topic/507f1f77bcf86cd799439011/subtopic/BCNF%20Normal%20Form" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Complete Endpoint Summary

### Authentication (2 endpoints)
1. `POST /auth/login` - Admin login
2. `POST /auth/register` - Register user (promote to admin later)

### User Management (6 endpoints)
3. `POST /users/admin` - Create admin user
4. `GET /users` - Get all users
5. `GET /users/:id` - Get user by ID
6. `PATCH /users/:id` - Update user (admin)
7. `DELETE /users/:id` - Delete user
8. `PATCH /users/:id/verify-email` - Verify user email

### Course Management (9 endpoints)
9. `POST /courses/admin` - Create course
10. `PUT /courses/admin` - Update course
11. `GET /courses/admin` - Get course (admin view)
12. `POST /courses/admin/section` - Add section
13. `PUT /courses/admin/section/:sectionIndex` - Update section
14. `DELETE /courses/admin/section/:sectionIndex` - Delete section
15. `POST /courses/admin/section/:sectionIndex/lesson` - Add lesson
16. `PUT /courses/admin/section/:sectionIndex/lesson/:lessonIndex` - Update lesson
17. `DELETE /courses/admin/section/:sectionIndex/lesson/:lessonIndex` - Delete lesson

### Documentation Management (4 endpoints)
18. `POST /docs/admin/topic` - Create topic with subtopics
19. `DELETE /docs/admin/topic/:id` - Delete topic
20. `POST /docs/admin/topic/:id/subtopic` - Add subtopic
21. `DELETE /docs/admin/topic/:id/subtopic/:name` - Delete subtopic

**Total: 21 Admin Endpoints**

---

## Common Response Codes

- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - User is not admin
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Authentication Header Format

All authenticated endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

Get JWT token from login/register response and use in subsequent requests.