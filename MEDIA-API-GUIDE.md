# Media Manager API Documentation

## Overview
The Media Manager module provides a complete library for managing video, image, and document uploads. It supports both URL-based uploads and file uploads via multipart/form-data with thumbnail support.

---

## Features
- ✅ Upload videos via URL or file upload
- ✅ Upload thumbnail images
- ✅ Store video metadata (duration, description, tags)
- ✅ Search media by title, description, or tags
- ✅ Filter by media type (video, image, document)
- ✅ Update media details and thumbnails
- ✅ Delete media with automatic file cleanup
- ✅ User-specific media library

---

## Schema

### Media Model
```typescript
{
  _id: ObjectId,
  title: string,              // Required
  description: string,        // Optional
  type: 'video' | 'image' | 'document',  // Required
  url: string,                // Optional - for URL-based uploads
  filePath: string,           // Optional - for file uploads
  thumbnailUrl: string,       // Optional - thumbnail URL
  thumbnailPath: string,      // Optional - uploaded thumbnail file path
  duration: number,           // Optional - video duration in seconds
  fileSize: number,           // Auto-populated from file
  mimeType: string,           // Auto-populated from file
  tags: string[],             // Optional - for categorization
  uploadedBy: string,         // User ID
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### 1. Upload Media (File Upload)
**POST** `/media`

Upload a video/image file with optional thumbnail.

**Headers:**
```
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <VIDEO_FILE>           // Optional - video/image file
thumbnail: <IMAGE_FILE>      // Optional - thumbnail image
title: string                // Required
description: string          // Optional
type: 'video' | 'image'      // Required
duration: number             // Optional - in seconds
tags: ["tag1", "tag2"]       // Optional - JSON string array
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@video.mp4" \
  -F "thumbnail=@thumb.jpg" \
  -F "title=Introduction to DBMS" \
  -F "description=Complete tutorial on database basics" \
  -F "type=video" \
  -F "duration=1800" \
  -F 'tags=["database", "tutorial"]'
```

**Response (201):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Introduction to DBMS",
  "description": "Complete tutorial on database basics",
  "type": "video",
  "filePath": "uploads/media/file-1234567890-123456789.mp4",
  "thumbnailPath": "uploads/media/thumbnail-1234567890-987654321.jpg",
  "duration": 1800,
  "fileSize": 52428800,
  "mimeType": "video/mp4",
  "tags": ["database", "tutorial"],
  "uploadedBy": "65f1234567890abcdef00001",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Upload Media (URL-based)
**POST** `/media`

Upload media using a URL (e.g., YouTube, Vimeo).

**Headers:**
```
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
```

**Form Data:**
```
title: string                // Required
description: string          // Optional
type: 'video'                // Required
url: string                  // Required - video URL
thumbnailUrl: string         // Optional - thumbnail URL
duration: number             // Optional - in seconds
tags: ["tag1", "tag2"]       // Optional
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=SQL Tutorial" \
  -F "description=Learn SQL basics" \
  -F "type=video" \
  -F "url=https://youtube.com/watch?v=example" \
  -F "thumbnailUrl=https://img.youtube.com/vi/example/maxresdefault.jpg" \
  -F "duration=2400" \
  -F 'tags=["sql", "database"]'
```

**Response (201):**
```json
{
  "_id": "65f1234567890abcdef12346",
  "title": "SQL Tutorial",
  "description": "Learn SQL basics",
  "type": "video",
  "url": "https://youtube.com/watch?v=example",
  "thumbnailUrl": "https://img.youtube.com/vi/example/maxresdefault.jpg",
  "duration": 2400,
  "tags": ["sql", "database"],
  "uploadedBy": "65f1234567890abcdef00001",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 3. Get All Media
**GET** `/media`

Get all media items (optionally filter by user).

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Query Parameters:**
```
userId: string  // Optional - filter by user ID
```

**Example (curl):**
```bash
curl -X GET http://localhost:3000/media \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200):**
```json
[
  {
    "_id": "65f1234567890abcdef12345",
    "title": "Introduction to DBMS",
    "type": "video",
    "url": null,
    "filePath": "uploads/media/file-1234567890-123456789.mp4",
    "thumbnailPath": "uploads/media/thumbnail-1234567890-987654321.jpg",
    "duration": 1800,
    "tags": ["database", "tutorial"],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 4. Get Media by ID
**GET** `/media/:id`

Get a specific media item by ID.

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Example (curl):**
```bash
curl -X GET http://localhost:3000/media/65f1234567890abcdef12345 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Introduction to DBMS",
  "description": "Complete tutorial on database basics",
  "type": "video",
  "filePath": "uploads/media/file-1234567890-123456789.mp4",
  "thumbnailPath": "uploads/media/thumbnail-1234567890-987654321.jpg",
  "duration": 1800,
  "fileSize": 52428800,
  "mimeType": "video/mp4",
  "tags": ["database", "tutorial"],
  "uploadedBy": "65f1234567890abcdef00001",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 5. Get Media by Type
**GET** `/media/type/:type`

Get all media items of a specific type.

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
```
type: 'video' | 'image' | 'document'
```

**Query Parameters:**
```
userId: string  // Optional - filter by user ID
```

**Example (curl):**
```bash
curl -X GET http://localhost:3000/media/type/video \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200):**
```json
[
  {
    "_id": "65f1234567890abcdef12345",
    "title": "Introduction to DBMS",
    "type": "video",
    "duration": 1800,
    "tags": ["database", "tutorial"]
  }
]
```

---

### 6. Search Media
**GET** `/media/search`

Search media by title, description, or tags.

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Query Parameters:**
```
q: string       // Required - search query
type: string    // Optional - filter by type
```

**Example (curl):**
```bash
curl -X GET "http://localhost:3000/media/search?q=database&type=video" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200):**
```json
[
  {
    "_id": "65f1234567890abcdef12345",
    "title": "Introduction to DBMS",
    "description": "Complete tutorial on database basics",
    "type": "video",
    "tags": ["database", "tutorial"]
  }
]
```

---

### 7. Update Media
**PATCH** `/media/:id`

Update media details and optionally upload a new thumbnail.

**Headers:**
```
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
```

**Form Data:**
```
thumbnail: <IMAGE_FILE>      // Optional - new thumbnail
title: string                // Optional
description: string          // Optional
thumbnailUrl: string         // Optional
duration: number             // Optional
tags: ["tag1", "tag2"]       // Optional
```

**Example (curl):**
```bash
curl -X PATCH http://localhost:3000/media/65f1234567890abcdef12345 \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Updated Title" \
  -F "description=Updated description" \
  -F "thumbnail=@new-thumb.jpg"
```

**Response (200):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Updated Title",
  "description": "Updated description",
  "thumbnailPath": "uploads/media/thumbnail-1234567890-111111111.jpg",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

---

### 8. Delete Media
**DELETE** `/media/:id`

Delete a media item and its associated files.

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Example (curl):**
```bash
curl -X DELETE http://localhost:3000/media/65f1234567890abcdef12345 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200):**
```json
{
  "message": "Media deleted successfully"
}
```

---

## File Upload Specifications

### Supported Video Formats
- MP4 (video/mp4)
- MPEG (video/mpeg)
- QuickTime (video/quicktime)
- AVI (video/x-msvideo)
- WebM (video/webm)

### Supported Image Formats
- JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

### File Size Limits
- Maximum file size: 500MB
- Recommended thumbnail size: < 5MB

---

## Usage Examples

### Example 1: Upload Video with Thumbnail
```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "file=@lecture-01.mp4" \
  -F "thumbnail=@lecture-01-thumb.jpg" \
  -F "title=Database Fundamentals - Lecture 1" \
  -F "description=Introduction to relational databases" \
  -F "type=video" \
  -F "duration=3600" \
  -F 'tags=["database", "lecture", "fundamentals"]'
```

### Example 2: Upload YouTube Video
```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=SQL Joins Explained" \
  -F "description=Complete guide to SQL joins" \
  -F "type=video" \
  -F "url=https://youtube.com/watch?v=abc123" \
  -F "thumbnailUrl=https://img.youtube.com/vi/abc123/maxresdefault.jpg" \
  -F "duration=1200" \
  -F 'tags=["sql", "joins", "tutorial"]'
```

### Example 3: Search Videos
```bash
curl -X GET "http://localhost:3000/media/search?q=sql&type=video" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Example 4: Update Video Details
```bash
curl -X PATCH http://localhost:3000/media/65f1234567890abcdef12345 \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=SQL Joins - Updated" \
  -F "description=Updated description with more details" \
  -F 'tags=["sql", "joins", "advanced"]'
```

---

## Integration with Course Module

You can reference media in course lessons:

```typescript
// In lesson creation
{
  "title": "Introduction to SQL",
  "content": "Learn SQL basics...",
  "videoUrl": "media://65f1234567890abcdef12345",  // Reference media ID
  "order": 0
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only videos and images allowed.",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Media not found",
  "error": "Not Found"
}
```

### 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "File too large. Maximum size is 500MB",
  "error": "Payload Too Large"
}
```

---

## Notes
- All endpoints require JWT authentication
- Files are stored in `uploads/media/` directory
- Deleting media automatically removes associated files
- Tags are case-insensitive for search
- Duration should be in seconds
- Both URL-based and file-based uploads are supported in the same endpoint
