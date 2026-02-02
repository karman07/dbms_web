# API Routes Quick Reference

## 🔐 Authentication Routes
```
POST   /auth/register              - Register new user
POST   /auth/login                 - Login user
POST   /auth/verify-email          - Verify email with token
```

## 👥 User Management Routes
```
POST   /users/admin                - Create admin user
GET    /users                      - Get all users (Admin)
GET    /users/:id                  - Get user by ID (Admin)
PATCH  /users/:id                  - Update user (Admin)
DELETE /users/:id                  - Delete user (Admin)
PATCH  /users/:id/verify-email     - Verify user email (Admin)
GET    /users/profile              - Get my profile
PATCH  /users/profile              - Update my profile
POST   /users/profile/picture      - Upload profile picture
```

## 📚 Course Management Routes
```
POST   /courses/admin              - Create course (Admin)
PUT    /courses/admin              - Update course (Admin)
GET    /courses/admin              - Get course (Admin)
POST   /courses/admin/section      - Add section (Admin)
PUT    /courses/admin/section/:idx - Update section (Admin)
DELETE /courses/admin/section/:idx - Delete section (Admin)
POST   /courses/admin/section/:idx/lesson        - Add lesson (Admin)
PUT    /courses/admin/section/:idx/lesson/:lidx  - Update lesson (Admin)
DELETE /courses/admin/section/:idx/lesson/:lidx  - Delete lesson (Admin)
GET    /courses                    - Get published course
POST   /courses/enroll             - Enroll in course
GET    /courses/my-progress        - Get my progress
PUT    /courses/progress           - Update progress
POST   /courses/quiz/submit        - Submit quiz (Old)
```

## 📝 Quiz Management Routes
```
POST   /quiz/admin                 - Create quiz (Admin)
GET    /quiz/admin                 - Get all quizzes (Admin)
GET    /quiz/admin/:id             - Get quiz by ID (Admin)
PUT    /quiz/admin/:id             - Update quiz (Admin)
DELETE /quiz/admin/:id             - Delete quiz (Admin)
POST   /quiz/admin/:id/link-lesson/:lessonId - Link quiz to lesson (Admin)
DELETE /quiz/admin/:id/unlink-lesson          - Unlink quiz from lesson (Admin)
GET    /quiz                       - Get all quizzes
GET    /quiz/:id                   - Get quiz by ID
GET    /quiz/lesson/:lessonId      - Get quiz by lesson
POST   /quiz/submit                - Submit quiz
```

## 📋 Assignment Management Routes
```
POST   /assignments/admin          - Create assignment (Admin)
GET    /assignments/admin          - Get all assignments (Admin)
GET    /assignments/admin/:id      - Get assignment by ID (Admin)
PUT    /assignments/admin/:id      - Update assignment (Admin)
DELETE /assignments/admin/:id      - Delete assignment (Admin)
GET    /assignments/admin/:id/submissions           - Get submissions (Admin)
POST   /assignments/admin/:id/submissions/:sid/grade - Grade submission (Admin)
GET    /assignments                - Get all assignments
GET    /assignments/:id            - Get assignment by ID
POST   /assignments/:id/submit     - Submit assignment
GET    /assignments/my-submissions - Get my submissions
GET    /assignments/:id/submissions/:sid - Get submission by ID
```

## 🎯 Class Activity Management Routes
```
POST   /class-activities/admin     - Create activity (Admin)
GET    /class-activities/admin     - Get all activities (Admin)
GET    /class-activities/admin/:id - Get activity by ID (Admin)
PUT    /class-activities/admin/:id - Update activity (Admin)
DELETE /class-activities/admin/:id - Delete activity (Admin)
GET    /class-activities/admin/:id/submissions           - Get submissions (Admin)
POST   /class-activities/admin/:id/submissions/:sid/grade - Grade submission (Admin)
GET    /class-activities            - Get all activities
GET    /class-activities/:id        - Get activity by ID
POST   /class-activities/:id/submit - Submit activity
GET    /class-activities/my-submissions - Get my submissions
GET    /class-activities/:id/submissions/:sid - Get submission by ID
```

## 📖 Documentation Routes
```
POST   /docs/admin/topic                    - Create topic (Admin)
DELETE /docs/admin/topic/:id                - Delete topic (Admin)
POST   /docs/admin/topic/:id/subtopic       - Add subtopic (Admin)
DELETE /docs/admin/topic/:id/subtopic/:name - Delete subtopic (Admin)
GET    /docs/admin/topic/:id/subtopic/:name/content - Get subtopic content (Admin)
PUT    /docs/admin/topic/:id/subtopic/:name - Update subtopic (Admin)
GET    /docs/topics                         - Get all topics
GET    /docs/topic/:id/subtopics            - List subtopics
GET    /docs/topic/:id/subtopic/:name       - Get subtopic content
GET    /docs/topic/:id/subtopic/:name/download - Download subtopic
```

## 📓 Notes Routes (If Implemented)
```
POST   /notes                      - Create note
GET    /notes                      - Get all notes
GET    /notes/my-notes             - Get my notes
GET    /notes/bookmarked           - Get bookmarked notes
GET    /notes/liked                - Get liked notes
GET    /notes/search?q=query       - Search notes
GET    /notes/source/:source       - Get notes by source
GET    /notes/:id                  - Get note by ID
PATCH  /notes/:id                  - Update note
DELETE /notes/:id                  - Delete note
POST   /notes/:id/bookmark         - Toggle bookmark
POST   /notes/:id/like             - Toggle like
```

---

## Route Counts by Module

| Module | Admin Routes | User Routes | Total |
|--------|-------------|-------------|-------|
| Authentication | 0 | 3 | 3 |
| Users | 6 | 3 | 9 |
| Courses | 9 | 5 | 14 |
| Quizzes | 7 | 4 | 11 |
| Assignments | 7 | 5 | 12 |
| Class Activities | 7 | 5 | 12 |
| Documentation | 6 | 4 | 10 |
| Notes | 0 | 12 | 12 |
| **Total** | **42** | **41** | **83** |

---

## Authentication Required

- ✅ All routes except:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /courses` (public course view)
  - `GET /docs/*` (public documentation)
  - `GET /quiz` (public quiz list)
  - `GET /quiz/:id` (public quiz view)

## Admin Only Routes

All routes under these paths require admin role:
- `/users/*`
- `/courses/admin/*`
- `/quiz/admin/*`
- `/assignments/admin/*`
- `/class-activities/admin/*`
- `/docs/admin/*`

## Content-Type Requirements

### JSON Routes
Most routes use `application/json`

### Multipart/Form-Data Routes
- `POST /users/profile/picture`
- `POST /courses/admin/section/:idx/lesson`
- `PUT /courses/admin/section/:idx/lesson/:lidx`
- `POST /docs/admin/topic`
- `POST /docs/admin/topic/:id/subtopic`
- `PUT /docs/admin/topic/:id/subtopic/:name`
- `POST /assignments/:id/submit`
- `POST /class-activities/:id/submit`

---

## URL Parameters Reference

| Parameter | Description | Example |
|-----------|-------------|---------|
| `:id` | Document/Entity ID | `507f1f77bcf86cd799439011` |
| `:idx` | Section Index | `0`, `1`, `2` |
| `:lidx` | Lesson Index | `0`, `1`, `2` |
| `:lessonId` | Lesson ID | `507f1f77bcf86cd799439012` |
| `:sectionId` | Section ID | `507f1f77bcf86cd799439013` |
| `:quizId` | Quiz ID | `507f1f77bcf86cd799439014` |
| `:assignmentId` | Assignment ID | `507f1f77bcf86cd799439015` |
| `:activityId` | Activity ID | `507f1f77bcf86cd799439016` |
| `:sid` | Submission ID | `507f1f77bcf86cd799439017` |
| `:name` | Subtopic Name | `First Normal Form` |
| `:source` | Note Source | `personal`, `shared` |

---

## Query Parameters

| Endpoint | Parameter | Description |
|----------|-----------|-------------|
| `GET /notes/search` | `q` | Search query string |

---

## HTTP Status Codes

Expected responses:
- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (wrong role)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting Recommendations

- Authentication: 5 requests/minute
- File uploads: 10 requests/minute
- General API: 100 requests/minute
- Read operations: No limit

