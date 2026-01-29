# Notes Management API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

---

## Notes API Endpoints

### 1. Create Note
**POST** `/notes`

**Description:** Create a new note with specified source and content.

**Auth Required:** JWT Token  
**Access:** Authenticated users only

**Request Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "JavaScript Fundamentals",
  "content": "Variables are containers for storing data values. In JavaScript, you can declare variables using var, let, or const keywords.",
  "source": "course",
  "sourceDetails": "Web Development Course - Chapter 2",
  "tags": ["javascript", "variables", "programming"],
  "isPublic": true,
  "attachments": ["code-example.js", "diagram.png"]
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "JavaScript Fundamentals",
  "content": "Variables are containers for storing data values...",
  "author": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "source": "course",
  "sourceDetails": "Web Development Course - Chapter 2",
  "tags": ["javascript", "variables", "programming"],
  "isPublic": true,
  "isBookmarked": false,
  "isLiked": false,
  "attachments": ["code-example.js", "diagram.png"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get All Notes
**GET** `/notes`

**Description:** Retrieve all public notes, or public + user's private notes if authenticated.

**Auth Required:** Optional  
**Access:** Public (limited to public notes) / Authenticated (public + own private)

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "JavaScript Fundamentals",
    "content": "Variables are containers...",
    "author": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "source": "course",
    "sourceDetails": "Web Development Course - Chapter 2",
    "tags": ["javascript", "variables"],
    "isPublic": true,
    "isBookmarked": false,
    "isLiked": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3. Get My Notes
**GET** `/notes/my-notes`

**Description:** Retrieve all notes created by the authenticated user.

**Auth Required:** JWT Token  
**Access:** Own notes only

**Success Response (200):** Same format as Get All Notes

---

### 4. Get Bookmarked Notes
**GET** `/notes/bookmarked`

**Description:** Retrieve all notes that you have bookmarked.

**Auth Required:** JWT Token  
**Access:** Own bookmarked notes only

**Success Response (200):** Same format as Get All Notes

---

### 5. Get Liked Notes
**GET** `/notes/liked`

**Description:** Retrieve all notes that you have liked.

**Auth Required:** JWT Token  
**Access:** Own liked notes only

**Success Response (200):** Same format as Get All Notes

---

### 6. Search Notes
**GET** `/notes/search?q={query}`

**Description:** Search notes by title, content, or tags.

**Auth Required:** Optional  
**Access:** Public notes / Public + own private if authenticated

**Query Parameters:**
- `q` (required): Search query string

**Example:**
```
GET /notes/search?q=javascript
```

**Success Response (200):** Same format as Get All Notes

---

### 7. Get Notes by Source
**GET** `/notes/source/{source}`

**Description:** Retrieve notes filtered by source type.

**Auth Required:** Optional  
**Access:** Public notes / Public + own private if authenticated

**Path Parameters:**
- `source`: One of the valid source types

**Example:**
```
GET /notes/source/course
GET /notes/source/quiz
```

**Success Response (200):** Same format as Get All Notes

---

### 8. Get Single Note
**GET** `/notes/{id}`

**Description:** Retrieve a specific note by ID.

**Auth Required:** Optional (required for private notes)  
**Access:** Public notes / Own private notes

**Path Parameters:**
- `id`: Note ID

**Success Response (200):** Same format as Create Note response

---

### 9. Update Note
**PATCH** `/notes/{id}`

**Description:** Update a note (only by the author).

**Auth Required:** JWT Token  
**Access:** Note author only

**Request Body:** Same as Create Note (all fields optional)

**Success Response (200):** Same format as Create Note response

---

### 10. Delete Note
**DELETE** `/notes/{id}`

**Description:** Delete a note (only by the author).

**Auth Required:** JWT Token  
**Access:** Note author only

**Success Response (204):** No content

---

### 11. Toggle Bookmark
**POST** `/notes/{id}/bookmark`

**Description:** Toggle bookmark status for your own note.

**Auth Required:** JWT Token  
**Access:** Note author only (can only bookmark your own notes)

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "JavaScript Fundamentals",
  "isBookmarked": true,
  "author": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### 12. Toggle Like
**POST** `/notes/{id}/like`

**Description:** Toggle like status for your own note.

**Auth Required:** JWT Token  
**Access:** Note author only (can only like your own notes)

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "JavaScript Fundamentals",
  "isLiked": true,
  "author": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

## Note Schema

### Core Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Note title (1-200 chars) |
| `content` | string | Yes | Note content (min 1 char) |
| `author` | ObjectId | Yes | Reference to User who created the note |
| `source` | enum | Yes | Source type of the note |
| `sourceDetails` | string | No | Additional details about the source |

### Source Types
| Value | Description |
|-------|-------------|
| `quiz` | Notes from quiz activities |
| `docs` | Notes from documentation |
| `assignment` | Notes from assignments |
| `class_activity` | Notes from class activities |
| `course` | Notes from course content |
| `personal` | Personal notes |
| `other` | Other sources |

### Organization Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tags` | string[] | No | Array of tags for categorization |
| `isPublic` | boolean | No | Visibility (default: false) |
| `isBookmarked` | boolean | No | Author's bookmark flag (default: false) |
| `isLiked` | boolean | No | Author's like flag (default: false) |
| `attachments` | string[] | No | Array of attachment file paths |

### System Fields
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique note identifier |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

---

## Validation Rules

### String Fields
- **title**: 1-200 characters
- **content**: Minimum 1 character
- **sourceDetails**: Optional string
- **tags**: Array of strings
- **attachments**: Array of file paths

### Enum Values
- **source**: Must be one of the valid source types
- **isPublic**: Boolean (default: false)

### Arrays
- **tags**: Each element must be a string
- **attachments**: Each element must be a string (file path)

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "message": [
    "title must be longer than or equal to 1 characters",
    "source must be a valid enum value"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized - Missing Token
```json
{
  "message": "Invalid token",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden - Access Denied
```json
{
  "message": "You can only update your own notes",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found - Note Not Found
```json
{
  "message": "Note not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Usage Examples

### JavaScript/Frontend Integration

#### Create Note
```javascript
const createNote = async (noteData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/notes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(noteData)
  });
  
  if (response.ok) {
    const note = await response.json();
    console.log('Note created:', note);
  }
};

// Usage
createNote({
  title: 'React Hooks',
  content: 'useState and useEffect are the most commonly used hooks...',
  source: 'course',
  sourceDetails: 'React Course - Lesson 5',
  tags: ['react', 'hooks', 'frontend'],
  isPublic: true
});
```

#### Get Notes by Source
```javascript
const getNotesBySource = async (source) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`/notes/source/${source}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const notes = await response.json();
    console.log(`${source} notes:`, notes);
  }
};

// Get all course notes
getNotesBySource('course');
```

#### Toggle Bookmark
```javascript
const toggleBookmark = async (noteId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`/notes/${noteId}/bookmark`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const updatedNote = await response.json();
    console.log('Bookmark toggled:', updatedNote);
  }
};
```

#### Search Notes
```javascript
const searchNotes = async (query) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`/notes/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const results = await response.json();
    console.log('Search results:', results);
  }
};

// Search for JavaScript notes
searchNotes('javascript');
```

---

## Best Practices

### Content Organization
1. **Use descriptive titles** for easy identification
2. **Add relevant tags** for better categorization
3. **Include source details** for context
4. **Set appropriate visibility** (public/private)

### Performance Optimization
1. **Paginate results** for large note collections
2. **Cache frequently accessed notes**
3. **Optimize search queries** with proper indexing
4. **Lazy load note content** for list views

### User Experience
1. **Show loading states** during operations
2. **Provide search suggestions** based on tags
3. **Enable offline access** for personal notes
4. **Implement auto-save** for draft notes

### Security Considerations
1. **Validate all inputs** on both client and server
2. **Sanitize content** to prevent XSS attacks
3. **Implement rate limiting** for note creation
4. **Audit note access** for sensitive content