# Documentation Management API - Complete Guide

Complete documentation for the docs module covering admin and user endpoints with schemas and UI implementation guidance.

## Table of Contents
- [Overview](#overview)
- [Data Schema](#data-schema)
- [Admin Routes](#admin-routes)
- [User Routes](#user-routes)
- [UI Implementation Guide](#ui-implementation-guide)

---

## Overview

The documentation module manages educational content organized as **Topics** and **Subtopics**. Each topic contains multiple subtopics with markdown content.

**Key Features:**
- Upload markdown files as documentation
- Organize content by topics and subtopics
- Course-specific documentation (default: 'dbms')
- Download subtopics as markdown files
- Public access to documentation

---

## Data Schema

### DocTopic Schema
```typescript
{
  _id: "string (MongoDB ObjectId)",
  topic: "string (required) - Topic name",
  course: "string (default: 'dbms') - Course identifier",
  subtopics: [
    {
      name: "string (required) - Subtopic name",
      filename: "string (required) - Original filename",
      content: "string (required) - Markdown content",
      createdAt: "Date - Creation timestamp"
    }
  ],
  createdAt: "Date - Topic creation timestamp",
  updatedAt: "Date - Last update timestamp"
}
```

### DTOs

**CreateDocTopicDto:**
```typescript
{
  topic: "string (required)",
  course: "string (optional, default: 'dbms')",
  subtopics: [
    {
      name: "string (required)",
      content: "string (required, markdown)"
    }
  ]
}
```

**AddSubtopicDto:**
```typescript
{
  name: "string (required)",
  content: "string (required, markdown)"
}
```

---

## Admin Routes

### 1. Create Topic with Subtopics
**Endpoint:** `POST /docs/admin/topic`  
**Auth:** JWT + ADMIN role  
**Content-Type:** multipart/form-data

**Request:**
```
topic: "string (required) - Topic name"
course: "string (optional, default: 'dbms')"
files: "file[] (required, at least 1 .md file, max 10)"
```

**Response Schema:**
```json
{
  "_id": "697b799d68dbbd913f3bc6a0",
  "topic": "Database Normalization",
  "course": "dbms",
  "subtopics": [
    {
      "name": "First Normal Form",
      "filename": "first_normal_form.md",
      "content": "# First Normal Form (1NF)\n\n...",
      "createdAt": "2026-01-29T10:00:00.000Z"
    },
    {
      "name": "Second Normal Form",
      "filename": "second_normal_form.md",
      "content": "# Second Normal Form (2NF)\n\n...",
      "createdAt": "2026-01-29T10:00:00.000Z"
    }
  ],
  "createdAt": "2026-01-29T10:00:00.000Z",
  "updatedAt": "2026-01-29T10:00:00.000Z"
}
```

**How It Works:**
1. Admin uploads multiple markdown files
2. System reads each file's content
3. Filename (without .md) becomes subtopic name
4. Underscores in filename replaced with spaces
5. All subtopics grouped under one topic

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

**UI Implementation:**
- **Page:** Admin Dashboard > Documentation > Create Topic
- **Form:**
  - Topic name (text input, required)
  - Course (text input, optional, default: 'dbms')
  - File upload (multiple .md files, required)
  - File list preview with remove option
- **Action:** Submit uploads files and creates topic
- **After Success:** Redirect to topic list, show success message

---

### 2. Delete Topic
**Endpoint:** `DELETE /docs/admin/topic/:id`  
**Auth:** JWT + ADMIN role

**Params:**
- `id` - Topic's MongoDB ObjectId

**Response:**
```json
{
  "message": "Topic deleted successfully"
}
```

**Curl Example:**
```bash
curl -X DELETE http://localhost:3000/docs/admin/topic/697b799d68dbbd913f3bc6a0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**UI Implementation:**
- **Component:** Delete button on topic card
- **Action:** 
  - Show confirmation dialog ("Delete topic and all subtopics?")
  - If confirmed, call endpoint
- **After Success:** Remove topic from list, show success message

---

### 3. Add Subtopic to Topic
**Endpoint:** `POST /docs/admin/topic/:id/subtopic`  
**Auth:** JWT + ADMIN role  
**Content-Type:** multipart/form-data

**Params:**
- `id` - Topic's MongoDB ObjectId

**Request:**
```
name: "string (optional) - Subtopic name, uses filename if not provided"
file: "file (required, single .md file)"
```

**Response:** Full topic object with new subtopic added

**Curl Example:**
```bash
curl -X POST http://localhost:3000/docs/admin/topic/697b799d68dbbd913f3bc6a0/subtopic \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=BCNF Normal Form" \
  -F "file=@bcnf.md"
```

**UI Implementation:**
- **Component:** "Add Subtopic" button on topic detail page
- **Form:**
  - Subtopic name (text input, optional)
  - File upload (single .md file, required)
- **Action:** Upload file and add to topic
- **After Success:** Refresh topic, show new subtopic in list

---

### 4. Update Subtopic
**Endpoint:** `PUT /docs/admin/topic/:id/subtopic/:name`  
**Auth:** JWT + ADMIN role  
**Content-Type:** multipart/form-data

**Params:**
- `id` - Topic's MongoDB ObjectId
- `name` - Current subtopic name (URL encoded)

**Request:**
```
newName: "string (optional) - New subtopic name"
file: "file (optional, single .md file) - New content"
```

**Response:** Full topic object with updated subtopic

**Curl Example:**
```bash
curl -X PUT "http://localhost:3000/docs/admin/topic/697b799d68dbbd913f3bc6a0/subtopic/01-introduction" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "newName=Introduction to DBMS" \
  -F "file=@updated_intro.md"
```

**UI Implementation:**
- **Component:** Edit button on subtopic item
- **Form:**
  - New name (text input, optional)
  - File upload (single .md file, optional)
- **Action:** Update subtopic name and/or content
- **After Success:** Refresh topic, show updated subtopic

---

### 5. Delete Subtopic
**Endpoint:** `DELETE /docs/admin/topic/:id/subtopic/:name`  
**Auth:** JWT + ADMIN role

**Params:**
- `id` - Topic's MongoDB ObjectId
- `name` - Subtopic name (URL encoded)

**Response:** Full topic object without deleted subtopic

**Curl Example:**
```bash
curl -X DELETE "http://localhost:3000/docs/admin/topic/697b799d68dbbd913f3bc6a0/subtopic/BCNF%20Normal%20Form" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**UI Implementation:**
- **Component:** Delete button on subtopic item
- **Action:**
  - Show confirmation dialog ("Delete this subtopic?")
  - URL encode subtopic name
  - Call endpoint
- **After Success:** Remove subtopic from UI, show success message

---

## User Routes

### 5. Get All Topics
**Endpoint:** `GET /docs/topics`  
**Auth:** None (public)

**Response Schema:**
```json
[
  {
    "_id": "697b799d68dbbd913f3bc6a0",
    "topic": "Database Normalization",
    "course": "dbms",
    "subtopics": [
      {
        "name": "First Normal Form",
        "filename": "first_normal_form.md",
        "content": "# First Normal Form...",
        "createdAt": "2026-01-29T10:00:00.000Z"
      }
    ],
    "createdAt": "2026-01-29T10:00:00.000Z",
    "updatedAt": "2026-01-29T10:00:00.000Z"
  }
]
```

**Curl Example:**
```bash
curl -X GET http://localhost:3000/docs/topics
```

**UI Implementation:**
- **Page:** Documentation Home / Browse Topics
- **Display:**
  - Grid or list of topic cards
  - Each card shows:
    - Topic name
    - Number of subtopics
    - Course badge
    - Click to view subtopics
- **Action:** Call on page load
- **After Success:** Display topics list

---

### 6. List Subtopics for Topic
**Endpoint:** `GET /docs/topic/:id/subtopics`  
**Auth:** None (public)

**Params:**
- `id` - Topic's MongoDB ObjectId

**Response Schema:**
```json
{
  "_id": "697b799d68dbbd913f3bc6a0",
  "topic": "Database Normalization",
  "course": "dbms",
  "subtopics": [
    {
      "name": "First Normal Form",
      "filename": "first_normal_form.md",
      "createdAt": "2026-01-29T10:00:00.000Z"
    },
    {
      "name": "Second Normal Form",
      "filename": "second_normal_form.md",
      "createdAt": "2026-01-29T10:00:00.000Z"
    }
  ]
}
```

**Note:** Content field excluded for performance

**Curl Example:**
```bash
curl -X GET http://localhost:3000/docs/topic/697b799d68dbbd913f3bc6a0/subtopics
```

**UI Implementation:**
- **Page:** Topic Detail Page
- **Display:**
  - Topic header with name
  - List of subtopics (clickable)
  - Each subtopic shows name and creation date
- **Action:** Call when user clicks on topic
- **After Success:** Display subtopics list

---

### 7. Get Subtopic Content
**Endpoint:** `GET /docs/topic/:id/subtopic/:name`  
**Auth:** None (public)

**Params:**
- `id` - Topic's MongoDB ObjectId
- `name` - Subtopic name (URL encoded)

**Response Schema:**
```json
{
  "name": "First Normal Form",
  "filename": "first_normal_form.md",
  "content": "# First Normal Form (1NF)\n\n## Definition\n\nA relation is in first normal form if...",
  "createdAt": "2026-01-29T10:00:00.000Z"
}
```

**Curl Example:**
```bash
curl -X GET "http://localhost:3000/docs/topic/697b799d68dbbd913f3bc6a0/subtopic/First%20Normal%20Form"
```

**UI Implementation:**
- **Page:** Subtopic Content Page
- **Display:**
  - Subtopic title
  - Rendered markdown content
  - Download button
  - Navigation (previous/next subtopic)
- **Action:** Call when user clicks on subtopic
- **After Success:** Render markdown content

---

### 8. Download Subtopic
**Endpoint:** `GET /docs/topic/:id/subtopic/:name/download`  
**Auth:** None (public)

**Params:**
- `id` - Topic's MongoDB ObjectId
- `name` - Subtopic name (URL encoded)

**Response:** File download (text/markdown)

**Headers:**
```
Content-Type: text/markdown
Content-Disposition: attachment; filename="first_normal_form.md"
```

**Curl Example:**
```bash
curl -X GET "http://localhost:3000/docs/topic/697b799d68dbbd913f3bc6a0/subtopic/First%20Normal%20Form/download" \
  -o first_normal_form.md
```

**UI Implementation:**
- **Component:** Download button on subtopic page
- **Action:** 
  - Create download link with endpoint URL
  - Trigger browser download
- **After Success:** File downloads to user's device

---

## UI Implementation Guide

### Admin Documentation Manager

```
Admin Dashboard > Documentation
├── Topics List
│   ├── Create Topic Button
│   └── For each topic:
│       ├── Topic Card
│       │   ├── Topic Name
│       │   ├── Course Badge
│       │   ├── Subtopic Count
│       │   ├── Edit Button
│       │   └── Delete Button
│       └── Subtopics List (expandable)
│           └── For each subtopic:
│               ├── Subtopic Name
│               ├── Preview Button
│               └── Delete Button
│
├── Create Topic Modal
│   ├── Topic Name Input
│   ├── Course Input
│   ├── File Upload (multiple .md)
│   ├── File List Preview
│   └── Submit Button
│
└── Add Subtopic Modal
    ├── Subtopic Name Input (optional)
    ├── File Upload (single .md)
    └── Submit Button
```

### User Documentation Browser

```
Documentation Page
├── Topics Grid/List
│   └── For each topic:
│       ├── Topic Card
│       │   ├── Topic Name
│       │   ├── Subtopic Count
│       │   └── Click to View
│
├── Topic Detail Page
│   ├── Topic Header
│   ├── Breadcrumb Navigation
│   ├── Subtopics Sidebar
│   │   └── For each subtopic:
│   │       ├── Subtopic Name
│   │       └── Click to View
│   │
│   └── Content Area
│       ├── Subtopic Title
│       ├── Markdown Renderer
│       ├── Download Button
│       └── Navigation (Prev/Next)
│
└── Search/Filter
    ├── Search by topic name
    └── Filter by course
```

### Key Features to Implement

**1. Admin Features:**
- Bulk upload markdown files
- Drag-and-drop file upload
- Markdown preview before upload
- Edit subtopic content inline
- Reorder subtopics
- Duplicate topic/subtopic

**2. User Features:**
- Markdown rendering with syntax highlighting
- Table of contents generation
- Search within documentation
- Bookmark favorite topics
- Print-friendly view
- Dark mode for reading

**3. File Handling:**
- Accept only .md files
- Validate markdown syntax
- Auto-generate subtopic names from filenames
- Handle special characters in filenames
- Preview uploaded files before submission

### API Call Flow Examples

**Admin Creating Documentation:**
```
1. GET /docs/topics (load existing topics)
2. POST /docs/admin/topic (create new topic with files)
3. POST /docs/admin/topic/:id/subtopic (add more subtopics)
4. DELETE /docs/admin/topic/:id/subtopic/:name (remove subtopic)
```

**User Reading Documentation:**
```
1. GET /docs/topics (browse all topics)
2. GET /docs/topic/:id/subtopics (view topic subtopics)
3. GET /docs/topic/:id/subtopic/:name (read content)
4. GET /docs/topic/:id/subtopic/:name/download (download file)
```

### Error Handling

**Common Errors:**
- 400: No files uploaded or invalid file format
- 401: Unauthorized (admin routes only)
- 403: Forbidden (not admin)
- 404: Topic or subtopic not found

**UI Error Messages:**
- "Please upload at least one markdown file"
- "Only .md files are allowed"
- "Topic not found"
- "Failed to upload files. Please try again"

### Best Practices

**For Admin:**
- Use descriptive topic names
- Keep subtopic names concise
- Organize related content under same topic
- Use consistent markdown formatting
- Include code examples with syntax highlighting

**For Users:**
- Provide search functionality
- Show reading progress
- Enable bookmarking
- Add print/export options
- Implement responsive design for mobile

---

## Complete Endpoint Summary

### Admin Endpoints (5)
1. `POST /docs/admin/topic` - Create topic with subtopics
2. `DELETE /docs/admin/topic/:id` - Delete topic
3. `POST /docs/admin/topic/:id/subtopic` - Add subtopic
4. `PUT /docs/admin/topic/:id/subtopic/:name` - Update subtopic
5. `DELETE /docs/admin/topic/:id/subtopic/:name` - Delete subtopic

### User Endpoints (4)
6. `GET /docs/topics` - Get all topics
7. `GET /docs/topic/:id/subtopics` - List subtopics
8. `GET /docs/topic/:id/subtopic/:name` - Get subtopic content
9. `GET /docs/topic/:id/subtopic/:name/download` - Download subtopic

**Total: 9 Documentation Endpoints**

---

## File Upload Configuration

**Accepted File Types:** `.md` (markdown)  
**Max Files per Upload:** 10 (create topic), 1 (add subtopic)  
**Max File Size:** Configured in multerDocsConfig  
**Storage:** Local filesystem in `uploads/docs/`

**Filename Processing:**
- Remove `.md` extension
- Replace underscores with spaces
- Example: `first_normal_form.md` → "First Normal Form"

---

## Response Codes

- `200 OK` - Successful GET, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Missing files or validation error
- `401 Unauthorized` - Missing JWT token
- `403 Forbidden` - Not admin
- `404 Not Found` - Topic/subtopic not found
- `500 Internal Server Error` - Server error