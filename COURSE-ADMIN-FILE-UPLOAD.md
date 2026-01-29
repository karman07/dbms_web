# Course Admin API - File Upload Guide

## File Upload Endpoints

### Add Lesson with Video and Resources
**POST** `/courses/admin/section/:sectionIndex/lesson`

**Description:** Add a new lesson with uploaded video and resource files.

**Auth Required:** JWT Token + Admin Role

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Lesson title |
| `content` | file OR string | Yes | Markdown file (.md, .markdown, .txt) OR markdown text |
| `videoDescription` | string | No | Video description |
| `video` | file | No | Video file (mp4, avi, mkv, mov, wmv, flv, webm) OR use `videoUrl` field |
| `videoUrl` | string | No | Video URL (YouTube, Vimeo, or any URL) - use instead of uploading file |
| `resources` | file[] | No | Resource files (pdf, doc, docx, ppt, pptx, zip, rar, txt, md) - up to 10 files OR use `resources` field |
| `resources` | string[] | No | Resource URLs (array of strings) - use instead of uploading files |
| `order` | number | No | Display order |
| `estimatedMinutes` | number | No | Estimated time |
| `isPublished` | boolean | No | Published status |
| `quiz` | JSON string | No | Quiz questions (JSON stringified) |

**Note:** You can either upload files OR provide text/URLs:
- **Content:** Upload a .md file using `content` field, OR provide markdown text using `content` field
- **Video:** Upload a file using `video` field, OR provide a URL (YouTube/Vimeo) using `videoUrl` field
- **Resources:** Upload files using `resources` field, OR provide URLs using `resources` array field

**Request Example (Using FormData):**
```javascript
// Example 1: Upload markdown content file + video file
const addLessonWithFiles = async (sectionIndex) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  
  // Text fields
  formData.append('title', 'SQL Joins');
  formData.append('videoDescription', 'Learn INNER JOIN, LEFT JOIN, RIGHT JOIN with examples');
  formData.append('order', '0');
  formData.append('estimatedMinutes', '45');
  formData.append('isPublished', 'true');
  
  // Content file (markdown .md file)
  const contentFile = document.getElementById('contentInput').files[0];
  if (contentFile) {
    formData.append('content', contentFile);
  }
  
  // Video file (uploaded)
  const videoFile = document.getElementById('videoInput').files[0];
  if (videoFile) {
    formData.append('video', videoFile);
  }
  
  // Resource files (multiple)
  const resourceFiles = document.getElementById('resourcesInput').files;
  for (let i = 0; i < resourceFiles.length; i++) {
    formData.append('resources', resourceFiles[i]);
  }
  
  // Quiz (as JSON string)
  const quiz = [
    {
      question: 'What does INNER JOIN return?',
      options: [
        { text: 'All matching rows from both tables', isCorrect: true },
        { text: 'All rows from left table', isCorrect: false },
        { text: 'All rows from right table', isCorrect: false }
      ],
      explanation: 'INNER JOIN returns only matching rows'
    }
  ];
  formData.append('quiz', JSON.stringify(quiz));
  
  const response = await fetch(`/courses/admin/section/${sectionIndex}/lesson`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Note: Don't set Content-Type, browser will set it with boundary
    },
    body: formData
  });
  
  if (response.ok) {
    const course = await response.json();
    console.log('Lesson added:', course);
  }
};

// Example 2: Use markdown text + YouTube URL
const addLessonWithYouTubeURL = async (sectionIndex) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  
  formData.append('title', 'SQL Joins - Video Tutorial');
  formData.append('content', '# SQL Joins\n\nJoins combine rows from multiple tables...\n\n## Types\n- INNER JOIN\n- LEFT JOIN\n- RIGHT JOIN');
  formData.append('videoUrl', 'https://youtu.be/DTN78zxMs-I?si=zNoXmlJPUNFX6qp9'); // YouTube URL
  formData.append('videoDescription', 'Complete SQL Joins tutorial');
  
  // Resource URLs (instead of uploading files)
  formData.append('resources', JSON.stringify([
    'https://example.com/sql-joins-slides.pdf',
    'https://github.com/user/repo/blob/main/exercises.zip'
  ]));
  
  formData.append('order', '0');
  formData.append('estimatedMinutes', '45');
  formData.append('isPublished', 'true');
  
  const response = await fetch(`/courses/admin/section/${sectionIndex}/lesson`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (response.ok) {
    const course = await response.json();
    console.log('Lesson added:', course);
  }
};

// Example 3: Upload markdown file + YouTube URL + uploaded resources
const addLessonMixed = async (sectionIndex) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  
  formData.append('title', 'Database Normalization');
  
  // Upload markdown content file
  const contentFile = document.getElementById('contentInput').files[0];
  if (contentFile) {
    formData.append('content', contentFile);
  }
  
  // Use YouTube URL for video
  formData.append('videoUrl', 'https://youtu.be/NSCHqbR3NUE?si=UvClhqVZEUrr1UxU');
  formData.append('videoDescription', 'Normalization explained');
  
  // Upload resource files
  const resourceFiles = document.getElementById('resourcesInput').files;
  for (let i = 0; i < resourceFiles.length; i++) {
    formData.append('resources', resourceFiles[i]);
  }
  
  const response = await fetch(`/courses/admin/section/${sectionIndex}/lesson`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (response.ok) {
    const course = await response.json();
    console.log('Lesson added:', course);
  }
};
```

**HTML Form Example:**
```html
<!-- Option 1: Upload markdown file + video file -->
<form id="addLessonFormUpload" enctype="multipart/form-data">
  <input type="text" name="title" placeholder="Lesson Title" required />
  
  <label>Upload Markdown Content (.md file):</label>
  <input type="file" id="contentInput" accept=".md,.markdown,.txt" required />
  
  <textarea name="videoDescription" placeholder="Video Description"></textarea>
  
  <label>Upload Video (max 500MB):</label>
  <input type="file" id="videoInput" accept="video/mp4,video/avi,video/mkv,video/mov,video/webm" />
  
  <label>Upload Resources (PDFs, Documents, up to 10 files):</label>
  <input type="file" id="resourcesInput" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.md" />
  
  <input type="number" name="order" placeholder="Order" value="0" />
  <input type="number" name="estimatedMinutes" placeholder="Estimated Minutes" value="30" />
  <input type="checkbox" name="isPublished" checked /> Published
  
  <button type="submit">Add Lesson</button>
</form>

<!-- Option 2: Use markdown text + YouTube URL -->
<form id="addLessonFormText" enctype="multipart/form-data">
  <input type="text" name="title" placeholder="Lesson Title" required />
  
  <label>Markdown Content:</label>
  <textarea name="content" placeholder="# Lesson Content\n\nWrite markdown here..." rows="10" required></textarea>
  
  <label>YouTube/Video URL:</label>
  <input type="url" name="videoUrl" placeholder="https://youtu.be/DTN78zxMs-I?si=..." />
  
  <textarea name="videoDescription" placeholder="Video Description"></textarea>
  
  <label>Resource URLs (comma-separated):</label>
  <textarea name="resourceUrls" placeholder="https://example.com/file1.pdf, https://example.com/file2.zip"></textarea>
  
  <input type="number" name="order" placeholder="Order" value="0" />
  <input type="number" name="estimatedMinutes" placeholder="Estimated Minutes" value="30" />
  <input type="checkbox" name="isPublished" checked /> Published
  
  <button type="submit">Add Lesson</button>
</form>
```

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "DBMS Fundamentals",
  "sections": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "SQL Basics",
      "lessons": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "title": "SQL Joins",
          "content": "# SQL Joins\n\nJoins combine rows...",
          "videoUrl": "/uploads/courses/videos/video-1706012345678-123456789.mp4",
          "videoDescription": "Learn INNER JOIN, LEFT JOIN, RIGHT JOIN with examples",
          "resources": [
            "/uploads/courses/resources/resources-1706012345678-987654321.pdf",
            "/uploads/courses/resources/resources-1706012345679-123456780.zip"
          ],
          "quiz": [...],
          "order": 0,
          "estimatedMinutes": 45,
          "isPublished": true
        }
      ]
    }
  ]
}
```

---

### Update Lesson with New Files
**PUT** `/courses/admin/section/:sectionIndex/lesson/:lessonIndex`

**Description:** Update lesson and optionally upload new video/resources.

**Content-Type:** `multipart/form-data`

**Notes:**
- If new markdown content file is uploaded, it replaces the old content
- If new video is uploaded, it replaces the old one
- If new resources are uploaded, they replace the old ones
- To keep existing content/files, don't include them in the form

**Request Example:**
```javascript
const updateLessonVideo = async (sectionIndex, lessonIndex) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  
  // Only update video
  const newVideoFile = document.getElementById('newVideoInput').files[0];
  if (newVideoFile) {
    formData.append('video', newVideoFile);
  }
  
  // Optionally update other fields
  formData.append('videoDescription', 'Updated video description');
  
  const response = await fetch(
    `/courses/admin/section/${sectionIndex}/lesson/${lessonIndex}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );
  
  if (response.ok) {
    const course = await response.json();
    console.log('Lesson updated:', course);
  }
};
```

---

## File Upload Specifications

### Markdown Content Files
- **Allowed formats:** md, markdown, txt
- **Storage path:** `/uploads/courses/content/`
- **Naming format:** `content-{timestamp}-{random}.{ext}`
- **Note:** File content is read and stored as text in the database, not as a file path

### Video Files
- **Allowed formats:** mp4, avi, mkv, mov, wmv, flv, webm
- **Max file size:** 500MB
- **Storage path:** `/uploads/courses/videos/`
- **Naming format:** `video-{timestamp}-{random}.{ext}`

### Resource Files
- **Allowed formats:** pdf, doc, docx, ppt, pptx, zip, rar, txt, md
- **Max count:** 10 files per lesson
- **Storage path:** `/uploads/courses/resources/`
- **Naming format:** `resources-{timestamp}-{random}.{ext}`

---

## Complete React Example

```jsx
import React, { useState } from 'react';

function AddLessonForm({ sectionIndex, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    videoDescription: '',
    order: 0,
    estimatedMinutes: 30,
    isPublished: true
  });
  
  const [contentFile, setContentFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [resourceFiles, setResourceFiles] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const token = localStorage.getItem('authToken');
    const data = new FormData();
    
    // Append text fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    // Append markdown content file
    if (contentFile) {
      data.append('content', contentFile);
    }
    
    // Append video
    if (videoFile) {
      data.append('video', videoFile);
    }
    
    // Append resources
    resourceFiles.forEach(file => {
      data.append('resources', file);
    });
    
    // Append quiz
    if (quiz.length > 0) {
      data.append('quiz', JSON.stringify(quiz));
    }
    
    try {
      const response = await fetch(
        `/courses/admin/section/${sectionIndex}/lesson`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: data
        }
      );
      
      if (response.ok) {
        const course = await response.json();
        onSuccess(course);
        alert('Lesson added successfully!');
      } else {
        alert('Failed to add lesson');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Upload Markdown Content (.md file):</label>
        <input
          type="file"
          accept=".md,.markdown,.txt"
          onChange={(e) => setContentFile(e.target.files[0])}
          required
        />
        {contentFile && <p>Selected: {contentFile.name}</p>}
      </div>
      
      <div>
        <label>Video Description:</label>
        <textarea
          value={formData.videoDescription}
          onChange={(e) => setFormData({...formData, videoDescription: e.target.value})}
          rows={3}
        />
      </div>
      
      <div>
        <label>Upload Video:</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
        />
        {videoFile && <p>Selected: {videoFile.name}</p>}
      </div>
      
      <div>
        <label>Upload Resources (PDFs, Documents):</label>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.md"
          onChange={(e) => setResourceFiles(Array.from(e.target.files))}
        />
        {resourceFiles.length > 0 && (
          <ul>
            {resourceFiles.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>
      
      <div>
        <label>Order:</label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
        />
      </div>
      
      <div>
        <label>Estimated Minutes:</label>
        <input
          type="number"
          value={formData.estimatedMinutes}
          onChange={(e) => setFormData({...formData, estimatedMinutes: parseInt(e.target.value)})}
        />
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
          />
          Published
        </label>
      </div>
      
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Add Lesson'}
      </button>
    </form>
  );
}

export default AddLessonForm;
```

---

## Upload Progress Tracking

```javascript
const uploadWithProgress = async (sectionIndex, formData, onProgress) => {
  const token = localStorage.getItem('authToken');
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });
    
    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Network error')));
    
    xhr.open('POST', `/courses/admin/section/${sectionIndex}/lesson`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};

// Usage
const [uploadProgress, setUploadProgress] = useState(0);

uploadWithProgress(0, formData, (progress) => {
  setUploadProgress(progress);
  console.log(`Upload progress: ${progress.toFixed(2)}%`);
})
  .then(course => console.log('Upload complete!', course))
  .catch(error => console.error('Upload failed:', error));
```

---

## Error Handling

### File Type Not Allowed
```json
{
  "message": "Only video files are allowed (mp4, avi, mkv, mov, wmv, flv, webm)",
  "statusCode": 400
}
```

### File Too Large
```json
{
  "message": "File too large",
  "statusCode": 413
}
```

### Too Many Files
```json
{
  "message": "Too many files. Maximum 10 resource files allowed",
  "statusCode": 400
}
```

---

## Best Practices

### Video Upload
1. **Compress videos** before uploading (use H.264 codec)
2. **Recommended resolution:** 1080p (1920x1080) or 720p (1280x720)
3. **Keep file size under 200MB** when possible
4. **Use .mp4 format** for best compatibility
5. **Test video playback** after upload

### Resource Upload
1. **Compress documents** (use PDF instead of DOCX when possible)
2. **Use .zip for multiple files** instead of uploading individually
3. **Name files descriptively** before uploading
4. **Keep total resources under 50MB per lesson**
5. **Provide clear resource descriptions** in lesson content

### Upload Performance
1. **Upload during off-peak hours** for large files
2. **Use wired connection** for stability
3. **Don't close browser** during upload
4. **Save lesson draft** before uploading large files
5. **Test with small files first**

---

## Curl Examples

### Upload Markdown File + Video + Resources
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=SQL Joins" \
  -F "content=@/path/to/lesson-content.md" \
  -F "videoDescription=Learn INNER JOIN, LEFT JOIN, RIGHT JOIN" \
  -F "video=@/path/to/video.mp4" \
  -F "resources=@/path/to/slides.pdf" \
  -F "resources=@/path/to/exercises.zip" \
  -F "order=0" \
  -F "estimatedMinutes=45" \
  -F "isPublished=true"
```

### Use Markdown Text + YouTube URL
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SQL Joins Tutorial",
    "content": "# SQL Joins\n\nJoins combine rows from multiple tables...\n\n## Types\n- INNER JOIN\n- LEFT JOIN\n- RIGHT JOIN",
    "videoUrl": "https://youtu.be/DTN78zxMs-I?si=zNoXmlJPUNFX6qp9",
    "videoDescription": "Complete SQL Joins guide",
    "resources": [
      "https://example.com/sql-joins-slides.pdf",
      "https://github.com/user/repo/blob/main/exercises.zip"
    ],
    "order": 0,
    "estimatedMinutes": 45,
    "isPublished": true
  }'
```

### Mix: Markdown File + YouTube URL + Uploaded Resources
```bash
curl -X POST http://localhost:3000/courses/admin/section/0/lesson \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Database Normalization" \
  -F "content=@/path/to/normalization-lesson.md" \
  -F "videoUrl=https://youtu.be/NSCHqbR3NUE?si=UvClhqVZEUrr1UxU" \
  -F "videoDescription=Normalization explained" \
  -F "resources=@/path/to/exercises.pdf" \
  -F "order=0" \
  -F "estimatedMinutes=30" \
  -F "isPublished=true"
```

### Update Only Video
```bash
curl -X PUT http://localhost:3000/courses/admin/section/0/lesson/0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/new-video.mp4" \
  -F "videoDescription=Updated video with better examples"
```
