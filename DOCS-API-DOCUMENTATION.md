# Documentation API Documentation

## Base URL
```
http://localhost:3000
```

## Overview
This API provides documentation management with markdown file uploads for admin users and public access for regular users.

---

## Admin Endpoints (Authentication Required)

### 1. Create Topic with Subtopics
**POST** `/docs/admin/topic`

**Description:** Upload multiple markdown files to create a new documentation topic with subtopics.

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body (multipart/form-data):**
```
topic: "DBMS Complete Guide"
course: "dbms"
files: [multiple .md files]
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/docs/admin/topic \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "topic=DBMS Complete Guide" \
  -F "course=dbms" \
  -F "files=@sample_docs/01-introduction.md" \
  -F "files=@sample_docs/02-er-model.md" \
  -F "files=@sample_docs/03-relational-model.md" \
  -F "files=@sample_docs/04-sql-basics.md"
```

**Success Response (201):**
```json
{
  "topic": "DBMS Complete Guide",
  "course": "dbms",
  "subtopics": [
    {
      "name": "01-introduction",
      "filename": "01-introduction.md",
      "content": "# Introduction to DBMS\n\nA Database Management System...",
      "createdAt": "2026-01-28T13:47:11.615Z",
      "_id": "697a135f484227377a73d13f",
      "updatedAt": "2026-01-28T13:47:11.615Z"
    },
    {
      "name": "02-er-model",
      "filename": "02-er-model.md",
      "content": "# Entity-Relationship (ER) Model...",
      "createdAt": "2026-01-28T13:47:11.615Z",
      "_id": "697a135f484227377a73d140",
      "updatedAt": "2026-01-28T13:47:11.615Z"
    }
  ],
  "_id": "697a135f484227377a73d13e",
  "createdAt": "2026-01-28T13:47:11.616Z",
  "updatedAt": "2026-01-28T13:47:11.616Z",
  "__v": 0
}
```

**Notes:**
- Files are uploaded to `uploads/docs/` directory
- Subtopic names are derived from filenames (without `.md` extension)
- Underscores in filenames are preserved
- Multiple files can be uploaded simultaneously

---

### 2. Add Subtopic to Topic
**POST** `/docs/admin/topic/:id/subtopic`

**Description:** Upload a markdown file to add a new subtopic to an existing topic.

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**URL Parameters:**
- `id`: Topic ID (MongoDB ObjectId)

**Request Body (multipart/form-data):**
```
file: <.md file>
name: "Relational Model" (optional)
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/docs/admin/topic/697a135f484227377a73d13e/subtopic \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@sample_docs/03-relational-model.md" \
  -F "name=Relational Model"
```

**Success Response (200):**
```json
{
  "_id": "697a135f484227377a73d13e",
  "topic": "DBMS Complete Guide",
  "course": "dbms",
  "subtopics": [
    {
      "name": "01-introduction",
      "filename": "01-introduction.md",
      "content": "# Introduction to DBMS...",
      "createdAt": "2026-01-28T13:47:11.615Z",
      "_id": "697a135f484227377a73d13f"
    },
    {
      "name": "Relational Model",
      "filename": "Relational_Model.md",
      "content": "# Relational Model...",
      "createdAt": "2026-01-28T13:50:00.000Z",
      "_id": "697a141f484227377a73d145"
    }
  ],
  "createdAt": "2026-01-28T13:47:11.616Z",
  "updatedAt": "2026-01-28T13:50:00.100Z",
  "__v": 1
}
```

**Notes:**
- If `name` is not provided, filename (without `.md`) is used
- File is saved to `uploads/docs/` directory
- Only one file per request

---

### 3. Delete Topic
**DELETE** `/docs/admin/topic/:id`

**Description:** Delete a documentation topic and all its subtopics.

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**URL Parameters:**
- `id`: Topic ID (MongoDB ObjectId)

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/docs/admin/topic/697a135f484227377a73d13e \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Success Response (200):**
```json
{
  "_id": "697a135f484227377a73d13e",
  "topic": "DBMS Complete Guide",
  "course": "dbms",
  "subtopics": [...],
  "createdAt": "2026-01-28T13:47:11.616Z",
  "updatedAt": "2026-01-28T13:47:11.616Z",
  "__v": 0
}
```

---

### 4. Delete Subtopic
**DELETE** `/docs/admin/topic/:id/subtopic/:name`

**Description:** Delete a specific subtopic from a topic.

**Authentication:** Required (Admin role)

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**URL Parameters:**
- `id`: Topic ID (MongoDB ObjectId)
- `name`: Subtopic name (URL encoded if contains spaces)

**cURL Example:**
```bash
curl -X DELETE "http://localhost:3000/docs/admin/topic/697a135f484227377a73d13e/subtopic/01-introduction" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Success Response (200):**
```json
{
  "_id": "697a135f484227377a73d13e",
  "topic": "DBMS Complete Guide",
  "course": "dbms",
  "subtopics": [
    {
      "name": "02-er-model",
      "filename": "02-er-model.md",
      "content": "# Entity-Relationship (ER) Model...",
      "_id": "697a135f484227377a73d140"
    }
  ],
  "updatedAt": "2026-01-28T14:00:00.000Z"
}
```

---

## Public Endpoints (No Authentication Required)

### 5. Get All Topics
**GET** `/docs/topics`

**Description:** Retrieve all documentation topics (without subtopic content).

**cURL Example:**
```bash
curl -X GET http://localhost:3000/docs/topics
```

**Success Response (200):**
```json
[
  {
    "_id": "697a111d87bc0c9061cacf6b",
    "topic": "DBMS Fundamentals",
    "course": "dbms",
    "createdAt": "2026-01-28T13:37:33.642Z",
    "updatedAt": "2026-01-28T13:37:33.642Z",
    "__v": 0
  },
  {
    "_id": "697a135f484227377a73d13e",
    "topic": "DBMS Advanced",
    "course": "dbms",
    "createdAt": "2026-01-28T13:47:11.616Z",
    "updatedAt": "2026-01-28T13:47:11.616Z",
    "__v": 0
  }
]
```

**Notes:**
- Returns topics for default course "dbms"
- Subtopic content is excluded for performance
- Public access, no authentication required

---

### 6. Get Topic with Subtopics
**GET** `/docs/topic/:id`

**Description:** Retrieve a specific topic with all its subtopics (including content).

**URL Parameters:**
- `id`: Topic ID (MongoDB ObjectId)

**cURL Example:**
```bash
curl -X GET http://localhost:3000/docs/topic/697a135f484227377a73d13e
```

**Success Response (200):**
```json
{
  "_id": "697a135f484227377a73d13e",
  "topic": "DBMS Advanced",
  "course": "dbms",
  "subtopics": [
    {
      "name": "01-introduction",
      "filename": "01-introduction.md",
      "content": "# Introduction to DBMS\n\n## What is a DBMS?\nA Database Management System (DBMS) is software that allows users to create, manage, and interact with databases efficiently...",
      "createdAt": "2026-01-28T13:47:11.615Z",
      "_id": "697a135f484227377a73d13f",
      "updatedAt": "2026-01-28T13:47:11.615Z"
    },
    {
      "name": "02-er-model",
      "filename": "02-er-model.md",
      "content": "# Entity-Relationship (ER) Model\n\n## What is the ER Model?\nThe Entity-Relationship (ER) model is a high-level conceptual data model...",
      "createdAt": "2026-01-28T13:47:11.615Z",
      "_id": "697a135f484227377a73d140",
      "updatedAt": "2026-01-28T13:47:11.615Z"
    }
  ],
  "createdAt": "2026-01-28T13:47:11.616Z",
  "updatedAt": "2026-01-28T13:47:11.616Z",
  "__v": 0
}
```

**Notes:**
- Returns full markdown content for all subtopics
- Public access, no authentication required

---

### 7. Get Subtopic Content
**GET** `/docs/topic/:id/subtopic/:name`

**Description:** Retrieve a specific subtopic's markdown content.

**URL Parameters:**
- `id`: Topic ID (MongoDB ObjectId)
- `name`: Subtopic name (URL encoded if contains spaces)

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/docs/topic/697a135f484227377a73d13e/subtopic/01-introduction"
```

**Success Response (200):**
```json
{
  "name": "01-introduction",
  "filename": "01-introduction.md",
  "content": "# Introduction to DBMS\n\n## What is a DBMS?\nA Database Management System (DBMS) is software that allows users to create, manage, and interact with databases efficiently. It acts as an interface between the database and end-users or application programs, ensuring data is stored securely and accessed systematically.\n\n## Why Use a DBMS?\nBefore DBMS, data was stored in file systems, which had several limitations:\n- **Data Redundancy**: Same data stored in multiple places\n- **Data Inconsistency**: Different copies of data with different values\n- **Difficult Data Access**: Complex queries required custom programs\n- **Security Issues**: No centralized access control\n- **Concurrent Access Anomalies**: Multiple users accessing the same data caused conflicts\n\nA DBMS solves these problems by providing a structured, centralized way to manage data.\n\n## Key Features of DBMS\n1. **Data Storage and Retrieval**: Efficiently store large volumes of data and retrieve it quickly\n2. **Data Security and Integrity**: Enforce access controls and validation rules\n3. **Transaction Management**: Ensure ACID properties (Atomicity, Consistency, Isolation, Durability)\n4. **Concurrent Access Control**: Allow multiple users to access data simultaneously without conflicts\n5. **Backup and Recovery**: Protect data from loss and corruption\n6. **Data Independence**: Separate data structure from application programs\n\n## Types of DBMS\n- **Relational DBMS (RDBMS)**: Data stored in tables (e.g., MySQL, PostgreSQL, Oracle)\n- **NoSQL DBMS**: Non-relational, flexible schema (e.g., MongoDB, Cassandra)\n- **Object-Oriented DBMS**: Data stored as objects (e.g., ObjectDB)\n- **Hierarchical DBMS**: Tree-like structure (e.g., IBM IMS)\n\n## Real-World Applications\n- **Banking Systems**: Managing customer accounts, transactions\n- **E-commerce Platforms**: Product catalogs, order management\n- **Social Media**: User profiles, posts, relationships\n- **Healthcare**: Patient records, appointments\n- **Education**: Student information, course management\n\nDBMS is fundamental to modern software systems, enabling efficient data management at scale.",
  "createdAt": "2026-01-28T13:47:11.615Z",
  "_id": "697a135f484227377a73d13f",
  "updatedAt": "2026-01-28T13:47:11.615Z"
}
```

**Notes:**
- Returns full markdown content for the specific subtopic
- Public access, no authentication required
- 404 error if subtopic not found

---

### 8. Download Subtopic as Markdown File
**GET** `/docs/topic/:id/subtopic/:name/download`

**Description:** Download a specific subtopic as a markdown (.md) file.

**URL Parameters:**
- `id`: Topic ID (MongoDB ObjectId)
- `name`: Subtopic name (URL encoded if contains spaces)

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/docs/topic/697a135f484227377a73d13e/subtopic/01-introduction/download" \
  -o introduction.md
```

**Success Response (200):**
- **Content-Type:** `text/markdown`
- **Content-Disposition:** `attachment; filename="01-introduction.md"`
- **Body:** Raw markdown file content

**Example Response Headers:**
```
Content-Type: text/markdown
Content-Disposition: attachment; filename="01-introduction.md"
```

**Notes:**
- Downloads the actual .md file with proper headers
- File automatically downloaded by browser
- Filename is taken from the original uploaded filename
- Public access, no authentication required
- 404 error if subtopic not found

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "At least one markdown file is required",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Topic not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## File Upload Specifications

### Accepted File Types
- `.md` (Markdown files)
- MIME types: `text/markdown`, `text/md`

### File Size Limits
- Maximum file size: 10 MB per file
- Multiple files supported for topic creation

### Storage Location
- Files are stored in: `uploads/docs/`
- Filenames are made unique with timestamp and random suffix
- Example: `01-introduction-1769608031613-162093174.md`

---

## Authentication

Admin endpoints require JWT authentication:

**Header Format:**
```
Authorization: Bearer <jwt-token>
```

**Get Admin Token:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@courseapp.com",
    "password": "admin123456"
  }'
```

**Token Duration:** 24 hours

---

## Best Practices

### For Admins
1. **File Naming**: Use descriptive names like `01-introduction.md`, `02-er-model.md`
2. **Content Structure**: Start markdown files with `#` heading for consistency
3. **File Size**: Keep individual files under 10 MB for optimal performance
4. **Batch Uploads**: Upload all subtopics at once when creating a new topic

### For Frontend Developers
1. **Content Caching**: Cache topic lists and subtopic content
2. **Lazy Loading**: Load subtopic content on-demand
3. **Error Handling**: Handle 404 errors for missing topics/subtopics
4. **Markdown Rendering**: Use a markdown renderer to display content

---

## Integration Examples

### React Example - Fetch and Display Topics
```javascript
// Fetch all topics
const fetchTopics = async () => {
  const response = await fetch('http://localhost:3000/docs/topics');
  const topics = await response.json();
  return topics;
};

// Fetch specific subtopic content
const fetchSubtopic = async (topicId, subtopicName) => {
  const response = await fetch(
    `http://localhost:3000/docs/topic/${topicId}/subtopic/${subtopicName}`
  );
  const subtopic = await response.json();
  return subtopic;
};

// Example usage
const topics = await fetchTopics();
const content = await fetchSubtopic(
  '697a135f484227377a73d13e',
  '01-introduction'
);
```

### Admin Upload Example (JavaScript)
```javascript
const uploadTopic = async (topicName, files) => {
  const formData = new FormData();
  formData.append('topic', topicName);
  formData.append('course', 'dbms');
  
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch('http://localhost:3000/docs/admin/topic', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });

  return await response.json();
};
```

---

## Changelog

### Version 1.0.0 (2026-01-28)
- Initial release
- File upload support for markdown files
- Public API for documentation access
- Admin CRUD operations for topics and subtopics
