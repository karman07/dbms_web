# Complete Postman Collection - Assignments & Class Activities

Add these to your existing Postman collection:

## Assignments & Class Activities Collection Items

```json
{
  "name": "Assignments",
  "item": [
    {
      "name": "Admin - Create Assignment",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "var jsonData = pm.response.json();",
              "pm.collectionVariables.set(\"assignmentId\", jsonData._id);"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": "{{baseUrl}}/assignments/admin",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Database Design Project\",\n  \"description\": \"Design a normalized database schema for an e-commerce system\",\n  \"dueDate\": \"2026-03-15T23:59:59.000Z\",\n  \"totalPoints\": 100,\n  \"lessonId\": \"{{lessonId}}\",\n  \"sectionId\": \"{{sectionId}}\",\n  \"isPublished\": true\n}"
        }
      }
    },
    {
      "name": "Admin - Get All Assignments",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments/admin"
      }
    },
    {
      "name": "Admin - Get Assignment by ID",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments/admin/{{assignmentId}}"
      }
    },
    {
      "name": "Admin - Update Assignment",
      "request": {
        "method": "PUT",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": "{{baseUrl}}/assignments/admin/{{assignmentId}}",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Updated Database Design Project\",\n  \"totalPoints\": 120,\n  \"isPublished\": true\n}"
        }
      }
    },
    {
      "name": "Admin - Delete Assignment",
      "request": {
        "method": "DELETE",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments/admin/{{assignmentId}}"
      }
    },
    {
      "name": "Admin - Get Assignment Submissions",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments/admin/{{assignmentId}}/submissions"
      }
    },
    {
      "name": "Admin - Grade Submission",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": "{{baseUrl}}/assignments/admin/{{assignmentId}}/submissions/{{submissionId}}/grade",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"grade\": 85,\n  \"feedback\": \"Great work! Your database schema is well normalized. Consider adding indexes for better performance.\"\n}"
        }
      }
    },
    {
      "name": "Get All Assignments",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments"
      }
    },
    {
      "name": "Get Assignment by ID",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments/{{assignmentId}}"
      }
    },
    {
      "name": "Submit Assignment",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments/{{assignmentId}}/submit",
        "body": {
          "mode": "formdata",
          "formdata": [
            {"key": "content", "value": "Here is my database schema design...", "type": "text"},
            {"key": "attachments", "type": "file", "src": ""}
          ]
        }
      }
    },
    {
      "name": "Get My Submissions",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments/my-submissions"
      }
    },
    {
      "name": "Get Submission by ID",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/assignments/{{assignmentId}}/submissions/{{submissionId}}"
      }
    }
  ]
},
{
  "name": "Class Activities",
  "item": [
    {
      "name": "Admin - Create Class Activity",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "var jsonData = pm.response.json();",
              "pm.collectionVariables.set(\"activityId\", jsonData._id);"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": "{{baseUrl}}/class-activities/admin",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"SQL Query Discussion\",\n  \"description\": \"Discuss complex SQL queries and optimization techniques\",\n  \"activityType\": \"discussion\",\n  \"dueDate\": \"2026-03-10T23:59:59.000Z\",\n  \"totalPoints\": 50,\n  \"lessonId\": \"{{lessonId}}\",\n  \"sectionId\": \"{{sectionId}}\",\n  \"instructions\": \"Participate in the forum discussion about query optimization\",\n  \"isPublished\": true\n}"
        }
      }
    },
    {
      "name": "Admin - Get All Class Activities",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities/admin"
      }
    },
    {
      "name": "Admin - Get Class Activity by ID",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities/admin/{{activityId}}"
      }
    },
    {
      "name": "Admin - Update Class Activity",
      "request": {
        "method": "PUT",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": "{{baseUrl}}/class-activities/admin/{{activityId}}",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Updated SQL Query Discussion\",\n  \"totalPoints\": 60,\n  \"activityType\": \"group-work\"\n}"
        }
      }
    },
    {
      "name": "Admin - Delete Class Activity",
      "request": {
        "method": "DELETE",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities/admin/{{activityId}}"
      }
    },
    {
      "name": "Admin - Get Activity Submissions",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities/admin/{{activityId}}/submissions"
      }
    },
    {
      "name": "Admin - Grade Activity Submission",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "url": "{{baseUrl}}/class-activities/admin/{{activityId}}/submissions/{{submissionId}}/grade",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"grade\": 45,\n  \"feedback\": \"Excellent participation in the discussion. Your insights on query optimization were valuable.\"\n}"
        }
      }
    },
    {
      "name": "Get All Class Activities",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities"
      }
    },
    {
      "name": "Get Class Activity by ID",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities/{{activityId}}"
      }
    },
    {
      "name": "Submit Class Activity",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities/{{activityId}}/submit",
        "body": {
          "mode": "formdata",
          "formdata": [
            {"key": "content", "value": "My contribution to the discussion...", "type": "text"},
            {"key": "attachments", "type": "file", "src": ""}
          ]
        }
      }
    },
    {
      "name": "Get My Activity Submissions",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities/my-submissions"
      }
    },
    {
      "name": "Get Activity Submission by ID",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "url": "{{baseUrl}}/class-activities/{{activityId}}/submissions/{{submissionId}}"
      }
    }
  ]
}
```

## Additional Collection Variables

Add these to your Postman collection variables:

```json
{
  "key": "assignmentId",
  "value": "",
  "type": "string"
},
{
  "key": "activityId",
  "value": "",
  "type": "string"
},
{
  "key": "submissionId",
  "value": "",
  "type": "string"
}
```

## Activity Types Reference

When creating class activities, use one of these activity types:
- `discussion` - Discussion forums or group conversations
- `group-work` - Collaborative group projects
- `presentation` - Student presentations
- `lab` - Laboratory work or practical exercises
- `other` - Any other type of activity

## Example Workflow

### 1. Create an Assignment
```
POST /assignments/admin
- Sets assignmentId variable from response
```

### 2. Students Submit Assignment
```
POST /assignments/{{assignmentId}}/submit
- Upload files and content
```

### 3. View Submissions
```
GET /assignments/admin/{{assignmentId}}/submissions
- See all student submissions
```

### 4. Grade a Submission
```
POST /assignments/admin/{{assignmentId}}/submissions/{{submissionId}}/grade
- Provide grade and feedback
```

### 5. Student Checks Grade
```
GET /assignments/my-submissions
- View all their submissions with grades
```

## Testing Tips

1. **Create Assignment**: First create an assignment to get an ID
2. **Link to Lesson**: Use existing lesson/section IDs from course
3. **Submit as User**: Switch to user token to test submissions
4. **Grade as Admin**: Switch back to admin token to grade
5. **Verify Status**: Check that status updates correctly (pending → graded)

## Status Flow

### Assignment Submission Status
- `pending` - Initial state when submitted
- `submitted` - Successfully submitted
- `late` - Submitted after due date
- `graded` - Has been graded by instructor

### Class Activity Submission Status
- Same as assignment submission status

## Best Practices

1. **Always set due dates** for better tracking
2. **Use descriptive titles** for easy identification
3. **Link to lessons** when possible for context
4. **Provide clear instructions** in the description field
5. **Set reasonable point values** that align with effort required
6. **Test with multiple users** to ensure proper access control
