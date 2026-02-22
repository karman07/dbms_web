# Course Priority API Documentation

This document describes the management of content priority within a course. The `order` field has been removed and replaced entirely by the `priority` field for both Sections and Lessons.

## Sorting Logic

- **Descending Priority**: Content with a higher `priority` value will be returned **first**.
- **Default**: New content defaults to `priority: 0`.
- **Scope**: This apply to both Sections in a Course and Lessons in a Section.

## Update Lesson Priority

Change the display urgency of a specific lesson.

- **URL**: `/courses/admin/section/:sectionIndex/lesson/:lessonIndex/priority`
- **Method**: `PUT`
- **Auth Required**: YES (JwtAuthGuard + Admin Role)
- **Role Required**: `ADMIN`

### URL Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `sectionIndex` | `number` | The index of the section containing the lesson |
| `lessonIndex` | `number` | The index of the lesson within the section |

### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `priority` | `number` | Yes | Higher values appear first in the UI |

### Example Request (axios)

```javascript
// This will move the lesson to the top
const response = await axios.put('/courses/admin/section/0/lesson/1/priority', {
  priority: 100 
}, {
  headers: { Authorization: `Bearer ${adminToken}` }
});
```

## Section Management

Sections now also use `priority` instead of `order`.

### Add Section
- **URL**: `/courses/admin/section` (POST)
- **Body**: `{ "title": "string", "priority": number, ... }`

### Update Section
- **URL**: `/courses/admin/section/:sectionIndex` (PUT)
- **Body**: `{ "title": "string", "priority": number, ... }`
