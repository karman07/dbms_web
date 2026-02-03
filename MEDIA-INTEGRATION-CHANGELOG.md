# Media Module Integration - Changelog

## Overview
This document outlines all changes made to integrate the Media Manager module with the Course module, enabling video management through reference IDs and supporting multiple videos and subtopics per lesson.

---

## New Module: Media Manager

### Files Created

#### 1. `src/media/schemas/media.schema.ts`
**Purpose**: Define Media schema for video storage

**Fields**:
- `title` (string, required) - Video title
- `description` (string, optional) - Video description
- `url` (string, optional) - External video URL (YouTube, Vimeo)
- `filePath` (string, optional) - Uploaded video file path
- `thumbnailUrl` (string, optional) - External thumbnail URL
- `thumbnailPath` (string, optional) - Uploaded thumbnail file path
- `fileSize` (number, optional) - File size in bytes
- `mimeType` (string, optional) - Video MIME type
- `uploadedBy` (string, required) - User ID who uploaded
- `createdAt` (Date, auto) - Creation timestamp
- `updatedAt` (Date, auto) - Update timestamp

**Removed Fields** (simplified):
- `type` - Always video, no need for enum
- `duration` - Not required
- `tags` - Not required

---

#### 2. `src/media/dto/media.dto.ts`
**Purpose**: DTOs for media operations

**CreateMediaDto**:
```typescript
{
  title: string;              // Required
  description?: string;       // Optional
  url?: string;              // Optional - for URL-based uploads
  thumbnailUrl?: string;     // Optional
}
```

**UpdateMediaDto**:
```typescript
{
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}
```

---

#### 3. `src/media/media.service.ts`
**Purpose**: Business logic for media operations

**Methods**:
- `create()` - Upload video via file or URL with optional thumbnail
- `findAll()` - Get all videos (optionally filter by user)
- `findById()` - Get single video by ID
- `findByIds()` - Get multiple videos by IDs array (for course integration)
- `update()` - Update video details and thumbnail
- `delete()` - Delete video and cleanup files
- `search()` - Search videos by title/description

---

#### 4. `src/media/media.controller.ts`
**Purpose**: API endpoints for media management

**Endpoints**:
- `POST /media` - Upload video (file or URL)
- `GET /media` - Get all videos
- `GET /media/search?q=query` - Search videos
- `GET /media/:id` - Get video by ID
- `PATCH /media/:id` - Update video
- `DELETE /media/:id` - Delete video

---

#### 5. `src/media/media.module.ts`
**Purpose**: Register media module components

**Imports**: MongooseModule with Media schema
**Exports**: MediaService (for use in other modules)

---

#### 6. `src/config/multer-media.config.ts`
**Purpose**: File upload configuration for videos

**Features**:
- Storage: `uploads/media/` directory
- Allowed formats: MP4, MPEG, QuickTime, AVI, WebM, JPEG, PNG, GIF, WebP
- Max file size: 500MB
- Auto-generated unique filenames

---

#### 7. `MEDIA-API-GUIDE.md`
**Purpose**: Complete API documentation for media module

**Contents**:
- All 6 API endpoints with curl examples
- Schema documentation
- File upload specifications
- Error responses
- Integration examples

---

## Course Module Changes

### Modified Files

#### 1. `src/courses/schemas/course.schema.ts`

**Lesson Schema Changes**:

**Removed Fields**:
```typescript
content: string;              // Removed - now use docSubtopicIds
videoUrl?: string;            // Removed - now use mediaIds
videoDescription?: string;    // Removed - not needed
docSubtopicId?: ObjectId;    // Removed - now array
```

**Added Fields**:
```typescript
mediaIds?: Types.ObjectId[];        // Array of Media references
docSubtopicIds?: Types.ObjectId[];  // Array of DocSubtopic references
```

**Final Lesson Structure**:
```typescript
{
  _id: ObjectId;
  title: string;                      // Required
  order: number;                      // Default: 0
  mediaIds?: ObjectId[];              // Multiple videos
  docSubtopicIds?: ObjectId[];        // Multiple subtopics
  resources: string[];                // URLs or file paths
  quiz: QuizQuestion[];               // Embedded quiz
  linkedQuizIds?: ObjectId[];         // Independent quizzes
  linkedAssignmentIds?: ObjectId[];   // Independent assignments
  linkedActivityIds?: ObjectId[];     // Independent activities
  estimatedMinutes: number;           // Default: 0
  isPublished: boolean;               // Default: false
}
```

---

#### 2. `src/courses/courses.service.ts`

**Import Changes**:
```typescript
import { Media } from '../media/schemas/media.schema';
```

**Constructor Changes**:
```typescript
@InjectModel(Media.name) private mediaModel: Model<Media>
```

**Method Updates**:

**`populateLinkedResources()` - Enhanced**:

**Before**:
- Fetched single media via `mediaId`
- Fetched single subtopic via `docSubtopicId`
- Returned `lesson.media` and `lesson.doc`

**After**:
- Fetches multiple media via `mediaIds` array
- Fetches multiple subtopics via `docSubtopicIds` array
- Returns `lesson.mediaList` and `lesson.docSubtopics`

**New Logic**:
```typescript
// Fetch multiple media
if (lesson.mediaIds && lesson.mediaIds.length > 0) {
  mediaList = await this.mediaModel.find({ 
    _id: { $in: lesson.mediaIds } 
  }).lean().exec();
}

// Fetch multiple subtopics
if (lesson.docSubtopicIds && lesson.docSubtopicIds.length > 0) {
  const topics = await this.docTopicModel.find().lean().exec();
  for (const topic of topics) {
    const matchingSubtopics = topic.subtopics.filter(s => 
      lesson.docSubtopicIds.some(id => s._id.toString() === id.toString())
    );
    matchingSubtopics.forEach(s => {
      s.topicId = topic._id;
      s.topic = topic.topic;
    });
    docSubtopics.push(...matchingSubtopics);
  }
}
```

---

#### 3. `src/courses/courses.module.ts`

**Import Changes**:
```typescript
import { Media, MediaSchema } from '../media/schemas/media.schema';
```

**MongooseModule.forFeature() Changes**:
```typescript
{ name: Media.name, schema: MediaSchema }  // Added
```

---

#### 4. `src/app.module.ts`

**Import Changes**:
```typescript
import { MediaModule } from './media/media.module';
```

**Module Registration**:
```typescript
imports: [
  // ... other modules
  MediaModule,  // Added
]
```

---

## Complete API Reference

---

## Media Module Endpoints

### 1. Upload Media (File Upload)
**POST** `/media`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
```

**Form Data**:
```
file: <VIDEO_FILE>           // Optional
thumbnail: <IMAGE_FILE>      // Optional
title: string                // Required
description: string          // Optional
url: string                  // Optional
thumbnailUrl: string         // Optional
```

**cURL Example (File Upload)**:
```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@video.mp4" \
  -F "thumbnail=@thumb.jpg" \
  -F "title=Introduction to DBMS" \
  -F "description=Complete tutorial on database basics"
```

**Response (201)**:
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Introduction to DBMS",
  "description": "Complete tutorial on database basics",
  "filePath": "uploads/media/file-1234567890-123456789.mp4",
  "thumbnailPath": "uploads/media/thumbnail-1234567890-987654321.jpg",
  "fileSize": 52428800,
  "mimeType": "video/mp4",
  "uploadedBy": "65f1234567890abcdef00001",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example (URL Upload)**:
```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=SQL Tutorial" \
  -F "description=Learn SQL basics" \
  -F "url=https://youtube.com/watch?v=example" \
  -F "thumbnailUrl=https://img.youtube.com/vi/example/maxresdefault.jpg"
```

**Response (201)**:
```json
{
  "_id": "65f1234567890abcdef12346",
  "title": "SQL Tutorial",
  "description": "Learn SQL basics",
  "url": "https://youtube.com/watch?v=example",
  "thumbnailUrl": "https://img.youtube.com/vi/example/maxresdefault.jpg",
  "uploadedBy": "65f1234567890abcdef00001",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 2. Get All Media
**GET** `/media`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Query Parameters**:
```
userId: string  // Optional - filter by user
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/media \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200)**:
```json
[
  {
    "_id": "65f1234567890abcdef12345",
    "title": "Introduction to DBMS",
    "description": "Complete tutorial",
    "filePath": "uploads/media/file-123.mp4",
    "thumbnailPath": "uploads/media/thumb-123.jpg",
    "fileSize": 52428800,
    "mimeType": "video/mp4",
    "uploadedBy": "65f1234567890abcdef00001",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "65f1234567890abcdef12346",
    "title": "SQL Tutorial",
    "url": "https://youtube.com/watch?v=example",
    "thumbnailUrl": "https://img.youtube.com/vi/example/maxresdefault.jpg",
    "uploadedBy": "65f1234567890abcdef00001",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

---

### 3. Get Media by ID
**GET** `/media/:id`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/media/65f1234567890abcdef12345 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200)**:
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Introduction to DBMS",
  "description": "Complete tutorial on database basics",
  "filePath": "uploads/media/file-1234567890-123456789.mp4",
  "thumbnailPath": "uploads/media/thumbnail-1234567890-987654321.jpg",
  "fileSize": 52428800,
  "mimeType": "video/mp4",
  "uploadedBy": "65f1234567890abcdef00001",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 4. Search Media
**GET** `/media/search`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**Query Parameters**:
```
q: string  // Required - search query
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3000/media/search?q=database" \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200)**:
```json
[
  {
    "_id": "65f1234567890abcdef12345",
    "title": "Introduction to DBMS",
    "description": "Complete tutorial on database basics",
    "filePath": "uploads/media/file-123.mp4",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 5. Update Media
**PATCH** `/media/:id`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
```

**Form Data**:
```
thumbnail: <IMAGE_FILE>      // Optional
title: string                // Optional
description: string          // Optional
thumbnailUrl: string         // Optional
```

**cURL Example**:
```bash
curl -X PATCH http://localhost:3000/media/65f1234567890abcdef12345 \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=Updated Title" \
  -F "description=Updated description" \
  -F "thumbnail=@new-thumb.jpg"
```

**Response (200)**:
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Updated Title",
  "description": "Updated description",
  "filePath": "uploads/media/file-1234567890-123456789.mp4",
  "thumbnailPath": "uploads/media/thumbnail-9999999999-111111111.jpg",
  "fileSize": 52428800,
  "mimeType": "video/mp4",
  "uploadedBy": "65f1234567890abcdef00001",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

---

### 6. Delete Media
**DELETE** `/media/:id`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/media/65f1234567890abcdef12345 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response (200)**:
```json
{
  "message": "Media deleted successfully"
}
```

---

---

## Course Module Endpoints (Modified)

### 7. Create Course (Admin)
**POST** `/courses/admin`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Body**:
```json
{
  "title": "Database Management Systems",
  "description": "Complete DBMS course",
  "isPublished": true,
  "tags": ["database", "sql"]
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/courses/admin \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Management Systems",
    "description": "Complete DBMS course",
    "isPublished": true,
    "tags": ["database", "sql"]
  }'
```

**Response (201)** - Unchanged

---

### 8. Add Section (Admin)
**POST** `/courses/admin/section`

**cURL Example**:
```bash
curl -X POST http://localhost:3000/courses/admin/section \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to DBMS",
    "description": "Learn database fundamentals",
    "order": 0
  }'
```

**Response (201)** - Unchanged

---

### 9. Add Lesson (Admin) - MODIFIED
**POST** `/courses/admin/section/:sectionIndex/lesson`

**Headers**:
```
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
```

**OLD Form Data**:
```
title: string                // Required
content: string              // Required - REMOVED
videoUrl: string             // Optional - REMOVED
videoDescription: string     // Optional - REMOVED
order: number                // Optional
estimatedMinutes: number     // Optional
isPublished: boolean         // Optional
```

**NEW Form Data**:
```
title: string                      // Required
mediaIds: string[]                 // Optional - NEW (JSON array)
docSubtopicIds: string[]           // Optional - NEW (JSON array)
order: number                      // Optional
estimatedMinutes: number           // Optional
isPublished: boolean               // Optional
resources: string[]                // Optional
```

**OLD cURL Example**:
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=SQL Tutorial" \
  -F "content=# SQL Basics\n\nLearn SQL fundamentals..." \
  -F "videoUrl=https://youtube.com/watch?v=example" \
  -F "videoDescription=SQL tutorial video" \
  -F "order=0" \
  -F "estimatedMinutes=45" \
  -F "isPublished=true"
```

**NEW cURL Example**:
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=SQL Tutorial" \
  -F 'mediaIds=["65f1234567890abcdef12345", "65f1234567890abcdef12346"]' \
  -F 'docSubtopicIds=["65f1234567890abcdef12347", "65f1234567890abcdef12348"]' \
  -F "order=0" \
  -F "estimatedMinutes=45" \
  -F "isPublished=true"
```

**OLD Response (201)**:
```json
{
  "_id": "65f1234567890abcdef00000",
  "title": "Database Management Systems",
  "sections": [
    {
      "_id": "65f1234567890abcdef00001",
      "title": "Introduction to DBMS",
      "lessons": [
        {
          "_id": "65f1234567890abcdef00002",
          "title": "SQL Tutorial",
          "content": "# SQL Basics\n\nLearn SQL fundamentals...",
          "videoUrl": "https://youtube.com/watch?v=example",
          "videoDescription": "SQL tutorial video",
          "order": 0,
          "estimatedMinutes": 45,
          "isPublished": true
        }
      ]
    }
  ]
}
```

**NEW Response (201)**:
```json
{
  "_id": "65f1234567890abcdef00000",
  "title": "Database Management Systems",
  "sections": [
    {
      "_id": "65f1234567890abcdef00001",
      "title": "Introduction to DBMS",
      "lessons": [
        {
          "_id": "65f1234567890abcdef00002",
          "title": "SQL Tutorial",
          "mediaIds": [
            "65f1234567890abcdef12345",
            "65f1234567890abcdef12346"
          ],
          "docSubtopicIds": [
            "65f1234567890abcdef12347",
            "65f1234567890abcdef12348"
          ],
          "order": 0,
          "estimatedMinutes": 45,
          "isPublished": true,
          "resources": [],
          "quiz": [],
          "linkedQuizIds": [],
          "linkedAssignmentIds": [],
          "linkedActivityIds": []
        }
      ]
    }
  ]
}
```

---

### 10. Update Lesson (Admin) - MODIFIED
**PUT** `/courses/admin/section/:sectionIndex/lesson/:lessonIndex`

**OLD cURL Example**:
```bash
curl -X PUT http://localhost:3000/courses/admin/section/0/lesson/0 \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=Updated SQL Tutorial" \
  -F "content=# Updated Content" \
  -F "videoUrl=https://youtube.com/watch?v=updated"
```

**NEW cURL Example**:
```bash
curl -X PUT http://localhost:3000/courses/admin/section/0/lesson/0 \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=Updated SQL Tutorial" \
  -F 'mediaIds=["65f1234567890abcdef99999"]' \
  -F 'docSubtopicIds=["65f1234567890abcdef88888"]'
```

---

### 11. Get Course (Admin) - MODIFIED
**GET** `/courses/admin`

**Headers**:
```
Authorization: Bearer <TOKEN>
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/courses/admin \
  -H "Authorization: Bearer eyJhbGc..."
```

**OLD Response (200)**:
```json
{
  "_id": "65f1234567890abcdef00000",
  "title": "Database Management Systems",
  "description": "Complete DBMS course",
  "isPublished": true,
  "sections": [
    {
      "_id": "65f1234567890abcdef00001",
      "title": "Introduction to DBMS",
      "lessons": [
        {
          "_id": "65f1234567890abcdef00002",
          "title": "SQL Tutorial",
          "content": "# SQL Basics\n\nLearn SQL...",
          "videoUrl": "https://youtube.com/watch?v=example",
          "videoDescription": "SQL tutorial video",
          "order": 0,
          "estimatedMinutes": 45,
          "isPublished": true
        }
      ]
    }
  ]
}
```

**NEW Response (200)** - With Auto-Populated Media and Subtopics:
```json
{
  "_id": "65f1234567890abcdef00000",
  "title": "Database Management Systems",
  "description": "Complete DBMS course",
  "isPublished": true,
  "sections": [
    {
      "_id": "65f1234567890abcdef00001",
      "title": "Introduction to DBMS",
      "lessons": [
        {
          "_id": "65f1234567890abcdef00002",
          "title": "SQL Tutorial",
          "order": 0,
          "estimatedMinutes": 45,
          "isPublished": true,
          "mediaIds": [
            "65f1234567890abcdef12345",
            "65f1234567890abcdef12346"
          ],
          "docSubtopicIds": [
            "65f1234567890abcdef12347",
            "65f1234567890abcdef12348"
          ],
          "mediaList": [
            {
              "_id": "65f1234567890abcdef12345",
              "title": "SQL Basics Video",
              "description": "Introduction to SQL",
              "url": "https://youtube.com/watch?v=example",
              "thumbnailUrl": "https://img.youtube.com/vi/example/maxresdefault.jpg",
              "uploadedBy": "65f1234567890abcdef00001",
              "createdAt": "2024-01-15T10:30:00.000Z",
              "updatedAt": "2024-01-15T10:30:00.000Z"
            },
            {
              "_id": "65f1234567890abcdef12346",
              "title": "Advanced SQL",
              "description": "Complex queries",
              "filePath": "uploads/media/file-1234567890-123456789.mp4",
              "thumbnailPath": "uploads/media/thumbnail-1234567890-987654321.jpg",
              "fileSize": 52428800,
              "mimeType": "video/mp4",
              "uploadedBy": "65f1234567890abcdef00001",
              "createdAt": "2024-01-15T11:00:00.000Z",
              "updatedAt": "2024-01-15T11:00:00.000Z"
            }
          ],
          "docSubtopics": [
            {
              "_id": "65f1234567890abcdef12347",
              "name": "SELECT Statement",
              "content": "# SELECT Statement\n\nThe SELECT statement is used to query data...",
              "filename": "select-statement.md",
              "topicId": "65f1234567890abcdef11111",
              "topic": "SQL Basics",
              "createdAt": "2024-01-15T09:00:00.000Z"
            },
            {
              "_id": "65f1234567890abcdef12348",
              "name": "WHERE Clause",
              "content": "# WHERE Clause\n\nFiltering data with WHERE...",
              "filename": "where-clause.md",
              "topicId": "65f1234567890abcdef11111",
              "topic": "SQL Basics",
              "createdAt": "2024-01-15T09:15:00.000Z"
            }
          ],
          "linkedQuizzes": [],
          "linkedAssignments": [],
          "linkedActivities": [],
          "resources": [],
          "quiz": []
        }
      ]
    }
  ],
  "tags": ["database", "sql"],
  "enrolledCount": 0,
  "createdAt": "2024-01-15T08:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

---

### 12. Get Published Course (Public) - MODIFIED
**GET** `/courses`

**cURL Example**:
```bash
curl -X GET http://localhost:3000/courses
```

**Response (200)** - Same structure as Admin GET but only published courses with auto-populated media and subtopics

---

**Before**:
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=SQL Tutorial" \
  -F "content=# SQL Basics\n\nLearn SQL..." \
  -F "videoUrl=https://youtube.com/watch?v=example" \
  -F "order=0"
```

**After**:
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=SQL Tutorial" \
  -F 'mediaIds=["65f1234567890abcdef12345", "65f1234567890abcdef12346"]' \
  -F 'docSubtopicIds=["65f1234567890abcdef12347", "65f1234567890abcdef12348"]' \
  -F "order=0" \
  -F "estimatedMinutes=45" \
  -F "isPublished=true"
```

---

### Course GET Response

**Before**:
```json
{
  "sections": [{
    "lessons": [{
      "title": "SQL Tutorial",
      "content": "# SQL Basics\n\nLearn SQL...",
      "videoUrl": "https://youtube.com/watch?v=example",
      "videoDescription": "SQL tutorial video"
    }]
  }]
}
```

**After**:
```json
{
  "sections": [{
    "lessons": [{
      "title": "SQL Tutorial",
      "mediaIds": ["65f123...", "65f456..."],
      "docSubtopicIds": ["65f789...", "65fabc..."],
      "mediaList": [
        {
          "_id": "65f123...",
          "title": "SQL Basics Video",
          "url": "https://youtube.com/watch?v=example",
          "thumbnailUrl": "https://img.youtube.com/vi/example/maxresdefault.jpg",
          "description": "Introduction to SQL"
        },
        {
          "_id": "65f456...",
          "title": "Advanced SQL",
          "filePath": "uploads/media/file-1234567890-123456789.mp4",
          "thumbnailPath": "uploads/media/thumbnail-1234567890-987654321.jpg",
          "fileSize": 52428800,
          "mimeType": "video/mp4"
        }
      ],
      "docSubtopics": [
        {
          "_id": "65f789...",
          "name": "SELECT Statement",
          "content": "# SELECT Statement\n\nThe SELECT statement...",
          "topicId": "65faaa...",
          "topic": "SQL Basics"
        },
        {
          "_id": "65fabc...",
          "name": "WHERE Clause",
          "content": "# WHERE Clause\n\nFiltering data...",
          "topicId": "65faaa...",
          "topic": "SQL Basics"
        }
      ],
      "linkedQuizzes": [...],
      "linkedAssignments": [...],
      "linkedActivities": [...]
    }]
  }]
}
```

---

## Workflow Changes

---

## Complete Workflow with All cURL Commands

### Scenario: Create a Complete Lesson with Videos and Content

#### Step 1: Upload Videos to Media Library

**Upload Video File**:
```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@sql-basics.mp4" \
  -F "thumbnail=@sql-basics-thumb.jpg" \
  -F "title=SQL Basics Video" \
  -F "description=Introduction to SQL fundamentals"
```

**Response**:
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "SQL Basics Video",
  "filePath": "uploads/media/file-1234567890-123456789.mp4",
  "thumbnailPath": "uploads/media/thumbnail-1234567890-987654321.jpg"
}
```
**Save this ID**: `65f1234567890abcdef12345`

**Upload YouTube Video**:
```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=Advanced SQL Tutorial" \
  -F "url=https://youtube.com/watch?v=abc123" \
  -F "thumbnailUrl=https://img.youtube.com/vi/abc123/maxresdefault.jpg" \
  -F "description=Advanced SQL concepts"
```

**Response**:
```json
{
  "_id": "65f1234567890abcdef12346",
  "title": "Advanced SQL Tutorial",
  "url": "https://youtube.com/watch?v=abc123"
}
```
**Save this ID**: `65f1234567890abcdef12346`

---

#### Step 2: Create Documentation Subtopics

**Create Topic First** (if not exists):
```bash
curl -X POST http://localhost:3000/docs/admin/topic \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "topic=SQL Basics" \
  -F "description=Fundamental SQL concepts" \
  -F "order=0"
```

**Response**:
```json
{
  "_id": "65f1234567890abcdef11111",
  "topic": "SQL Basics",
  "subtopics": []
}
```
**Save this ID**: `65f1234567890abcdef11111`

**Add Subtopic 1**:
```bash
curl -X POST http://localhost:3000/docs/admin/topic/65f1234567890abcdef11111/subtopic \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "name=SELECT Statement" \
  -F "file=@select-statement.md" \
  -F "order=0"
```

**Response**:
```json
{
  "_id": "65f1234567890abcdef11111",
  "topic": "SQL Basics",
  "subtopics": [
    {
      "_id": "65f1234567890abcdef12347",
      "name": "SELECT Statement",
      "filename": "select-statement.md",
      "order": 0
    }
  ]
}
```
**Save this ID**: `65f1234567890abcdef12347`

**Add Subtopic 2**:
```bash
curl -X POST http://localhost:3000/docs/admin/topic/65f1234567890abcdef11111/subtopic \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "name=WHERE Clause" \
  -F "file=@where-clause.md" \
  -F "order=1"
```

**Response**:
```json
{
  "subtopics": [
    {...},
    {
      "_id": "65f1234567890abcdef12348",
      "name": "WHERE Clause"
    }
  ]
}
```
**Save this ID**: `65f1234567890abcdef12348`

---

#### Step 3: Create Course and Section

**Create Course**:
```bash
curl -X POST http://localhost:3000/courses/admin \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Management Systems",
    "description": "Complete DBMS course",
    "isPublished": true,
    "tags": ["database", "sql"]
  }'
```

**Add Section**:
```bash
curl -X POST http://localhost:3000/courses/admin/section \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to SQL",
    "description": "Learn SQL fundamentals",
    "order": 0
  }'
```

---

#### Step 4: Create Lesson with Media and Subtopic References

```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=SQL Fundamentals" \
  -F 'mediaIds=["65f1234567890abcdef12345", "65f1234567890abcdef12346"]' \
  -F 'docSubtopicIds=["65f1234567890abcdef12347", "65f1234567890abcdef12348"]' \
  -F "order=0" \
  -F "estimatedMinutes=60" \
  -F "isPublished=true"
```

**Response**:
```json
{
  "_id": "65f1234567890abcdef00000",
  "sections": [
    {
      "lessons": [
        {
          "_id": "65f1234567890abcdef00002",
          "title": "SQL Fundamentals",
          "mediaIds": [
            "65f1234567890abcdef12345",
            "65f1234567890abcdef12346"
          ],
          "docSubtopicIds": [
            "65f1234567890abcdef12347",
            "65f1234567890abcdef12348"
          ],
          "order": 0,
          "estimatedMinutes": 60,
          "isPublished": true
        }
      ]
    }
  ]
}
```

---

#### Step 5: Get Course with Auto-Populated Data

```bash
curl -X GET http://localhost:3000/courses/admin \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (Full lesson with populated media and subtopics):
```json
{
  "sections": [
    {
      "lessons": [
        {
          "title": "SQL Fundamentals",
          "mediaIds": ["65f123...", "65f456..."],
          "docSubtopicIds": ["65f789...", "65fabc..."],
          "mediaList": [
            {
              "_id": "65f1234567890abcdef12345",
              "title": "SQL Basics Video",
              "filePath": "uploads/media/file-123.mp4",
              "thumbnailPath": "uploads/media/thumb-123.jpg",
              "fileSize": 52428800,
              "mimeType": "video/mp4"
            },
            {
              "_id": "65f1234567890abcdef12346",
              "title": "Advanced SQL Tutorial",
              "url": "https://youtube.com/watch?v=abc123",
              "thumbnailUrl": "https://img.youtube.com/vi/abc123/maxresdefault.jpg"
            }
          ],
          "docSubtopics": [
            {
              "_id": "65f1234567890abcdef12347",
              "name": "SELECT Statement",
              "content": "# SELECT Statement\n\nThe SELECT statement...",
              "topicId": "65f1234567890abcdef11111",
              "topic": "SQL Basics"
            },
            {
              "_id": "65f1234567890abcdef12348",
              "name": "WHERE Clause",
              "content": "# WHERE Clause\n\nFiltering data...",
              "topicId": "65f1234567890abcdef11111",
              "topic": "SQL Basics"
            }
          ]
        }
      ]
    }
  ]
}
```

---
1. Admin creates lesson with embedded content and videoUrl
2. Video URL stored directly in lesson
3. Content stored as markdown string in lesson

### New Workflow: Reference-Based Architecture

#### Step 1: Upload Videos to Media Library
```bash
# Upload video file
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@video.mp4" \
  -F "thumbnail=@thumb.jpg" \
  -F "title=SQL Basics Video" \
  -F "description=Introduction to SQL"

# Response: { "_id": "65f123..." }

# Or use URL
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Advanced SQL" \
  -F "url=https://youtube.com/watch?v=example" \
  -F "thumbnailUrl=https://img.youtube.com/..."
```

#### Step 2: Create Documentation Subtopics
```bash
curl -X POST http://localhost:3000/docs/admin/topic/65faaa.../subtopic \
  -H "Authorization: Bearer <TOKEN>" \
  -F "name=SELECT Statement" \
  -F "file=@select-statement.md" \
  -F "order=0"

# Response includes subtopic _id
```

#### Step 3: Create Lesson with References
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=SQL Tutorial" \
  -F 'mediaIds=["65f123...", "65f456..."]' \
  -F 'docSubtopicIds=["65f789...", "65fabc..."]' \
  -F "order=0"
```

#### Step 4: GET Course - Auto-Populated
```bash
curl -X GET http://localhost:3000/courses/admin \
  -H "Authorization: Bearer <TOKEN>"

# Response includes full media and subtopic details
```

---

## Benefits of New Architecture

### 1. Reusability
- Same video can be used in multiple lessons
- Same subtopic can be referenced in multiple lessons
- No data duplication

### 2. Centralized Management
- Update video details once, reflects everywhere
- Update subtopic content once, reflects everywhere
- Easy to manage media library

### 3. Flexibility
- Multiple videos per lesson
- Multiple subtopics per lesson
- Mix URL-based and uploaded videos

### 4. Performance
- Efficient queries with reference IDs
- Lazy loading possible
- Better caching strategies

### 5. Scalability
- Separate storage for media files
- Independent media module
- Easy to add CDN integration

---

## Database Schema Summary

### Media Collection (New)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  url: String,
  filePath: String,
  thumbnailUrl: String,
  thumbnailPath: String,
  fileSize: Number,
  mimeType: String,
  uploadedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Course.Lesson (Modified)
```javascript
{
  _id: ObjectId,
  title: String,
  order: Number,
  mediaIds: [ObjectId],           // NEW - references Media
  docSubtopicIds: [ObjectId],     // NEW - references DocSubtopic
  resources: [String],
  quiz: [QuizQuestion],
  linkedQuizIds: [ObjectId],
  linkedAssignmentIds: [ObjectId],
  linkedActivityIds: [ObjectId],
  estimatedMinutes: Number,
  isPublished: Boolean
  // REMOVED: content, videoUrl, videoDescription, docSubtopicId
}
```

---

## Migration Guide

### For Existing Lessons

If you have existing lessons with `content`, `videoUrl`, or `videoDescription`:

1. **Extract video URLs**:
   - Create Media entries for each videoUrl
   - Upload to media library or keep as URL reference
   - Get media IDs

2. **Extract content**:
   - Create DocSubtopic entries for markdown content
   - Upload to docs module
   - Get subtopic IDs

3. **Update lessons**:
   - Replace `videoUrl` with `mediaIds` array
   - Replace `content` with `docSubtopicIds` array
   - Remove `videoDescription`

---

## Testing

### Test Media Upload
```bash
# File upload
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@test-video.mp4" \
  -F "thumbnail=@test-thumb.jpg" \
  -F "title=Test Video" \
  -F "description=Test description"

# URL upload
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=YouTube Video" \
  -F "url=https://youtube.com/watch?v=test" \
  -F "thumbnailUrl=https://img.youtube.com/vi/test/maxresdefault.jpg"
```

### Test Lesson Creation
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Test Lesson" \
  -F 'mediaIds=["<MEDIA_ID_1>", "<MEDIA_ID_2>"]' \
  -F 'docSubtopicIds=["<SUBTOPIC_ID_1>"]' \
  -F "order=0"
```

### Test Course GET
```bash
curl -X GET http://localhost:3000/courses/admin \
  -H "Authorization: Bearer <TOKEN>"

# Verify mediaList and docSubtopics are populated
```

---

## File Structure

```
backend/
├── src/
│   ├── media/                          # NEW MODULE
│   │   ├── dto/
│   │   │   └── media.dto.ts           # CreateMediaDto, UpdateMediaDto
│   │   ├── schemas/
│   │   │   └── media.schema.ts        # Media schema
│   │   ├── media.controller.ts        # 6 endpoints
│   │   ├── media.service.ts           # CRUD + search + findByIds
│   │   └── media.module.ts            # Module registration
│   ├── config/
│   │   └── multer-media.config.ts     # NEW - Media upload config
│   ├── courses/
│   │   ├── schemas/
│   │   │   └── course.schema.ts       # MODIFIED - Lesson schema
│   │   ├── courses.service.ts         # MODIFIED - Added media population
│   │   └── courses.module.ts          # MODIFIED - Import Media schema
│   └── app.module.ts                  # MODIFIED - Import MediaModule
├── uploads/
│   └── media/                          # NEW - Media storage directory
├── MEDIA-API-GUIDE.md                  # NEW - API documentation
└── MEDIA-INTEGRATION-CHANGELOG.md      # THIS FILE
```

---

## Summary of Changes

### New Features
✅ Media Manager module with 6 API endpoints
✅ Support for file upload and URL-based videos
✅ Thumbnail upload support
✅ Multiple videos per lesson (mediaIds array)
✅ Multiple subtopics per lesson (docSubtopicIds array)
✅ Auto-population of media and subtopic details in GET responses
✅ Centralized media library management
✅ Search functionality for videos

### Removed Features
❌ Direct video URL in lesson (videoUrl)
❌ Video description in lesson (videoDescription)
❌ Embedded content in lesson (content)
❌ Single subtopic reference (docSubtopicId)

### Modified Features
🔄 Lesson schema simplified to use reference IDs
🔄 Course GET API now populates full media and subtopic details
🔄 Lesson creation now accepts mediaIds and docSubtopicIds arrays

---

## Next Steps

### Recommended Enhancements
1. Add video transcoding service
2. Implement CDN integration for media files
3. Add video streaming support
4. Implement video analytics (views, watch time)
5. Add video playlist functionality
6. Implement lazy loading for media in frontend
7. Add media compression on upload
8. Implement video preview/thumbnail generation

### Frontend Integration
1. Create Media Library UI component
2. Add media picker for lesson creation
3. Implement video player with multiple sources
4. Add subtopic content renderer
5. Create media upload progress indicator
6. Implement media search and filter UI

---

## Contact & Support

For questions or issues related to media integration:
- Check `MEDIA-API-GUIDE.md` for API documentation
- Review `FINAL-API-REFERENCE.md` for complete API reference
- Test using `test-all-apis.sh` script
- Import `Complete-API-Collection.postman_collection.json` for Postman testing
