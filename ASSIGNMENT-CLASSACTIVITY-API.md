# Assignment & Class Activity Modules - API Documentation

Complete documentation for independent Assignment and Class Activity modules that can be linked to course lessons.

## Overview

Both modules are **completely independent** and follow the same pattern as the Quiz module:
- Can exist with or without courses
- Store markdown content
- Optionally link to course lessons
- Support file upload for markdown files
- Full CRUD operations

---

## Assignment Module

### Database Schema

```typescript
{
  _id: ObjectId,
  title: String (required),
  description: String (optional),
  content: String (required, markdown),
  lessonId: ObjectId (optional, indexed),
  dueDate: Date (optional),
  maxScore: Number (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Admin Endpoints

**1. Create Assignment**
```
POST /assignment/admin
Content-Type: multipart/form-data

Body:
- title: "DBMS Assignment 1" (required)
- description: "Complete the normalization exercises" (optional)
- content: "# Assignment..." (required if no file)
- file: assignment.md (optional, overrides content)
- lessonId: "lessonId123" (optional)
- dueDate: "2026-02-15T23:59:59Z" (optional)
- maxScore: 100 (optional)
```

**2. Get All Assignments**
```
GET /assignment/admin
```

**3. Get Assignment by ID**
```
GET /assignment/admin/:assignmentId
```

**4. Update Assignment**
```
PUT /assignment/admin/:assignmentId
Content-Type: multipart/form-data

Body: (all optional)
- title: "Updated Title"
- description: "Updated description"
- content: "Updated content"
- file: updated.md
- dueDate: "2026-02-20T23:59:59Z"
- maxScore: 150
```

**5. Delete Assignment**
```
DELETE /assignment/admin/:assignmentId
```

**6. Link Assignment to Lesson**
```
POST /assignment/admin/:assignmentId/link-lesson/:lessonId
```

**7. Unlink Assignment from Lesson**
```
DELETE /assignment/admin/:assignmentId/unlink-lesson
```

#### User Endpoints

**8. Get All Assignments**
```
GET /assignment
```

**9. Get Assignment by ID**
```
GET /assignment/:assignmentId
```

**10. Get Assignment by Lesson**
```
GET /assignment/lesson/:lessonId
```

---

## Class Activity Module

### Database Schema

```typescript
{
  _id: ObjectId,
  title: String (required),
  description: String (optional),
  content: String (required, markdown),
  lessonId: ObjectId (optional, indexed),
  duration: Number (optional, minutes),
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Admin Endpoints

**1. Create Class Activity**
```
POST /class-activity/admin
Content-Type: multipart/form-data

Body:
- title: "Group Discussion" (required)
- description: "Discuss normalization concepts" (optional)
- content: "# Activity..." (required if no file)
- file: activity.md (optional, overrides content)
- lessonId: "lessonId123" (optional)
- duration: 30 (optional, minutes)
```

**2. Get All Activities**
```
GET /class-activity/admin
```

**3. Get Activity by ID**
```
GET /class-activity/admin/:activityId
```

**4. Update Activity**
```
PUT /class-activity/admin/:activityId
Content-Type: multipart/form-data

Body: (all optional)
- title: "Updated Title"
- description: "Updated description"
- content: "Updated content"
- file: updated.md
- duration: 45
```

**5. Delete Activity**
```
DELETE /class-activity/admin/:activityId
```

**6. Link Activity to Lesson**
```
POST /class-activity/admin/:activityId/link-lesson/:lessonId
```

**7. Unlink Activity from Lesson**
```
DELETE /class-activity/admin/:activityId/unlink-lesson
```

#### User Endpoints

**8. Get All Activities**
```
GET /class-activity
```

**9. Get Activity by ID**
```
GET /class-activity/:activityId
```

**10. Get Activity by Lesson**
```
GET /class-activity/lesson/:lessonId
```

---

## Usage Examples

### Create Assignment with File Upload

```bash
curl -X POST http://localhost:3000/assignment/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Normalization Assignment" \
  -F "description=Complete all exercises" \
  -F "file=@assignment1.md" \
  -F "lessonId=697b799d68dbbd913f3bc6af" \
  -F "dueDate=2026-02-15T23:59:59Z" \
  -F "maxScore=100"
```

### Create Class Activity with Content

```bash
curl -X POST http://localhost:3000/class-activity/admin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Group Discussion" \
  -F "description=Discuss database concepts" \
  -F "content=# Discussion Topics\n\n1. Normalization\n2. ACID properties" \
  -F "lessonId=697b799d68dbbd913f3bc6af" \
  -F "duration=30"
```

### Link Existing Assignment to Lesson

```bash
curl -X POST http://localhost:3000/assignment/admin/assignmentId123/link-lesson/lessonId456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Assignment for a Lesson

```bash
curl -X GET http://localhost:3000/assignment/lesson/lessonId456
```

---

## Integration with Courses

### How to Link to Lessons

1. **Create the resource first** (assignment or activity)
2. **Link to lesson** using the link endpoint
3. **Frontend fetches** using the lesson ID

### Example Workflow

```javascript
// 1. Create assignment
const assignment = await fetch('/assignment/admin', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
}).then(r => r.json());

// 2. Link to lesson
await fetch(`/assignment/admin/${assignment._id}/link-lesson/${lessonId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// 3. Later, get assignment for lesson
const lessonAssignment = await fetch(`/assignment/lesson/${lessonId}`)
  .then(r => r.json());
```

---

## Complete Endpoint Summary

### Assignment Module (10 endpoints)
**Admin (7):**
1. POST /assignment/admin - Create
2. GET /assignment/admin - Get all
3. GET /assignment/admin/:id - Get by ID
4. PUT /assignment/admin/:id - Update
5. DELETE /assignment/admin/:id - Delete
6. POST /assignment/admin/:id/link-lesson/:lessonId - Link
7. DELETE /assignment/admin/:id/unlink-lesson - Unlink

**User (3):**
8. GET /assignment - Get all
9. GET /assignment/:id - Get by ID
10. GET /assignment/lesson/:lessonId - Get by lesson

### Class Activity Module (10 endpoints)
**Admin (7):**
1. POST /class-activity/admin - Create
2. GET /class-activity/admin - Get all
3. GET /class-activity/admin/:id - Get by ID
4. PUT /class-activity/admin/:id - Update
5. DELETE /class-activity/admin/:id - Delete
6. POST /class-activity/admin/:id/link-lesson/:lessonId - Link
7. DELETE /class-activity/admin/:id/unlink-lesson - Unlink

**User (3):**
8. GET /class-activity - Get all
9. GET /class-activity/:id - Get by ID
10. GET /class-activity/lesson/:lessonId - Get by lesson

**Total: 20 New Endpoints**

---

## Response Examples

### Assignment Response
```json
{
  "_id": "697c1234abcd1234abcd1234",
  "title": "Normalization Assignment",
  "description": "Complete all exercises",
  "content": "# Assignment\n\n## Exercise 1...",
  "lessonId": "697b799d68dbbd913f3bc6af",
  "dueDate": "2026-02-15T23:59:59.000Z",
  "maxScore": 100,
  "createdAt": "2026-01-29T10:00:00.000Z",
  "updatedAt": "2026-01-29T10:00:00.000Z"
}
```

### Class Activity Response
```json
{
  "_id": "697c5678efgh5678efgh5678",
  "title": "Group Discussion",
  "description": "Discuss database concepts",
  "content": "# Discussion Topics\n\n1. Normalization...",
  "lessonId": "697b799d68dbbd913f3bc6af",
  "duration": 30,
  "createdAt": "2026-01-29T10:00:00.000Z",
  "updatedAt": "2026-01-29T10:00:00.000Z"
}
```

---

## Key Features

✅ **Independent**: Exist separately from courses  
✅ **Markdown Support**: Store rich content  
✅ **File Upload**: Upload .md files  
✅ **Optional Linking**: Link to lessons anytime  
✅ **Flexible**: Link/unlink as needed  
✅ **No Breaking Changes**: Course APIs unchanged  

---

## All Three Modules Summary

| Module | Purpose | Key Fields | Endpoints |
|--------|---------|------------|-----------|
| Quiz | Interactive assessments | questions, options | 11 |
| Assignment | Homework/tasks | content, dueDate, maxScore | 10 |
| Class Activity | In-class exercises | content, duration | 10 |

**Total New Modules: 3**  
**Total New Endpoints: 31**

All three modules follow the same pattern:
- Independent collections
- Optional lessonId reference
- Link/unlink functionality
- File upload support (Assignment & Activity)
- No changes to course APIs