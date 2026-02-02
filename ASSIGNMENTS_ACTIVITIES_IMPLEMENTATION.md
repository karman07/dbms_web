# Assignments & Class Activities Implementation Guide

## Overview
This implementation adds comprehensive Assignment and Class Activity management to the DBMS Course Platform, including CRUD operations, submission tracking, grading functionality, and user-friendly dropdown selections.

## Features Implemented

### 1. **Assignment Management System**
- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Link assignments to specific lessons or sections
- ✅ Set due dates and point values
- ✅ Publish/unpublish assignments
- ✅ Track student submissions
- ✅ Grade submissions with feedback
- ✅ View all submissions for an assignment

### 2. **Class Activity Management System**
- ✅ CRUD operations for class activities
- ✅ Multiple activity types (Discussion, Group Work, Presentation, Lab, Other)
- ✅ Optional due dates and point values
- ✅ Link activities to lessons or sections
- ✅ Track student participation
- ✅ Grade activity submissions
- ✅ Publish/unpublish activities

### 3. **Quiz Management System** (Enhanced)
- ✅ Complete CRUD operations
- ✅ Link quizzes to lessons
- ✅ Submit and grade quizzes automatically
- ✅ Admin and user endpoints

### 4. **Dropdown Selection Feature**
- ✅ Section dropdown for linking content
- ✅ Lesson dropdown with section context
- ✅ Activity type dropdown with color coding
- ✅ Dynamic options loaded from course structure

## API Endpoints

### Assignment Endpoints

#### Admin Endpoints
```
POST   /assignments/admin                           - Create assignment
GET    /assignments/admin                           - Get all assignments
GET    /assignments/admin/:id                       - Get assignment by ID
PUT    /assignments/admin/:id                       - Update assignment
DELETE /assignments/admin/:id                       - Delete assignment
GET    /assignments/admin/:id/submissions           - Get all submissions
POST   /assignments/admin/:id/submissions/:sid/grade - Grade a submission
```

#### User Endpoints
```
GET    /assignments                                 - Get all published assignments
GET    /assignments/:id                             - Get assignment by ID
POST   /assignments/:id/submit                      - Submit assignment
GET    /assignments/my-submissions                  - Get my submissions
GET    /assignments/:id/submissions/:sid            - Get submission by ID
```

### Class Activity Endpoints

#### Admin Endpoints
```
POST   /class-activities/admin                      - Create class activity
GET    /class-activities/admin                      - Get all activities
GET    /class-activities/admin/:id                  - Get activity by ID
PUT    /class-activities/admin/:id                  - Update activity
DELETE /class-activities/admin/:id                  - Delete activity
GET    /class-activities/admin/:id/submissions      - Get all submissions
POST   /class-activities/admin/:id/submissions/:sid/grade - Grade submission
```

#### User Endpoints
```
GET    /class-activities                            - Get all published activities
GET    /class-activities/:id                        - Get activity by ID
POST   /class-activities/:id/submit                 - Submit activity
GET    /class-activities/my-submissions             - Get my submissions
GET    /class-activities/:id/submissions/:sid       - Get submission by ID
```

### Quiz Endpoints

#### Admin Endpoints
```
POST   /quiz/admin                                  - Create quiz
GET    /quiz/admin                                  - Get all quizzes
GET    /quiz/admin/:id                              - Get quiz by ID
PUT    /quiz/admin/:id                              - Update quiz
DELETE /quiz/admin/:id                              - Delete quiz
POST   /quiz/admin/:id/link-lesson/:lessonId        - Link quiz to lesson
DELETE /quiz/admin/:id/unlink-lesson                - Unlink quiz from lesson
```

#### User Endpoints
```
GET    /quiz                                        - Get all quizzes
GET    /quiz/:id                                    - Get quiz by ID
GET    /quiz/lesson/:lessonId                       - Get quiz by lesson
POST   /quiz/submit                                 - Submit quiz answers
```

## Data Structures

### Assignment Type
```typescript
interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  lessonId?: string;
  sectionId?: string;
  attachments?: string[];
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Assignment Submission Type
```typescript
interface AssignmentSubmission {
  _id: string;
  assignmentId: string;
  userId: string;
  content?: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'pending';
  gradedAt?: string;
  gradedBy?: string;
}
```

### Class Activity Type
```typescript
interface ClassActivity {
  _id: string;
  title: string;
  description: string;
  activityType: 'discussion' | 'group-work' | 'presentation' | 'lab' | 'other';
  dueDate?: string;
  totalPoints?: number;
  lessonId?: string;
  sectionId?: string;
  instructions?: string;
  resources?: string[];
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Class Activity Submission Type
```typescript
interface ClassActivitySubmission {
  _id: string;
  activityId: string;
  userId: string;
  content?: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'pending';
  gradedAt?: string;
  gradedBy?: string;
}
```

## UI Components

### AssignmentManager Component
Located at: `src/components/course/AssignmentManager.tsx`

**Features:**
- Grid layout displaying all assignments
- Create/Edit modal with form validation
- Submissions viewer with grading interface
- Dropdown selectors for sections and lessons
- Status badges (Published/Draft)
- Due date and points display

**Props:**
```typescript
interface AssignmentManagerProps {
  lessonOptions?: Array<{ value: string; label: string }>;
  sectionOptions?: Array<{ value: string; label: string }>;
}
```

### ClassActivityManager Component
Located at: `src/components/course/ClassActivityManager.tsx`

**Features:**
- Grid layout with color-coded activity types
- Create/Edit modal with all activity fields
- Submissions tracking and grading
- Activity type selector (Discussion, Group Work, etc.)
- Optional due dates and points
- Dropdown selectors for linking to course content

**Props:**
```typescript
interface ClassActivityManagerProps {
  lessonOptions?: Array<{ value: string; label: string }>;
  sectionOptions?: Array<{ value: string; label: string }>;
}
```

### AssignmentsActivitiesPage
Located at: `src/pages/AssignmentsActivitiesPage.tsx`

**Features:**
- Tabbed interface for Assignments and Class Activities
- Automatic loading of course structure
- Dynamic dropdown options generation
- Responsive layout

## Usage Examples

### Creating an Assignment

```typescript
import { assignmentAPI } from '@/utils/api';

const createAssignment = async () => {
  const assignment = await assignmentAPI.createAssignment({
    title: "Database Design Project",
    description: "Design a normalized database schema",
    dueDate: "2026-03-15",
    totalPoints: 100,
    lessonId: "lesson-id-here",
    isPublished: true
  });
};
```

### Creating a Class Activity

```typescript
import { classActivityAPI } from '@/utils/api';

const createActivity = async () => {
  const activity = await classActivityAPI.createClassActivity({
    title: "SQL Query Discussion",
    description: "Discuss complex SQL queries",
    activityType: "discussion",
    dueDate: "2026-03-10",
    totalPoints: 50,
    lessonId: "lesson-id-here",
    instructions: "Participate in the discussion forum",
    isPublished: true
  });
};
```

### Grading a Submission

```typescript
import { assignmentAPI } from '@/utils/api';

const gradeSubmission = async () => {
  await assignmentAPI.gradeSubmission(
    "assignment-id",
    "submission-id",
    {
      grade: 85,
      feedback: "Great work! Consider optimizing your queries."
    }
  );
};
```

## Navigation

The new features are accessible via:
1. **Sidebar Menu**: "Assignments & Activities" (with ClipboardList icon)
2. **Route**: `/assignments-activities`

## Styling & UX Features

### Color Coding
- **Activity Types**: Each type has distinct colors (blue, purple, orange, green, gray)
- **Status Badges**: 
  - Published: Green
  - Draft: Gray
  - Graded: Green
  - Late: Red
  - Pending: Yellow

### Responsive Design
- Grid layout adapts to screen size (1/2/3 columns)
- Mobile-friendly forms and modals
- Collapsible sidebar support

### User Experience
- Loading states for async operations
- Confirmation dialogs for destructive actions
- Error handling with console logging
- Real-time updates after operations

## Integration with Existing Code

### Updated Files
1. **src/utils/api.ts** - Added assignmentAPI, classActivityAPI, quizAPI
2. **src/types/index.ts** - Added new type definitions
3. **src/App.tsx** - Added new route
4. **src/components/layout/Sidebar.tsx** - Added navigation item

### New Files
1. **src/components/course/AssignmentManager.tsx**
2. **src/components/course/ClassActivityManager.tsx**
3. **src/pages/AssignmentsActivitiesPage.tsx**
4. **ASSIGNMENTS_ACTIVITIES_IMPLEMENTATION.md** (this file)

## Error Handling

All API calls include try-catch blocks with console error logging. For production:
- Consider adding toast notifications
- Implement proper error boundaries
- Add user-friendly error messages

## Future Enhancements

Potential improvements:
1. **File Uploads**: Support attachments for assignments and activities
2. **Rich Text Editor**: Better content editing
3. **Bulk Operations**: Grade multiple submissions at once
4. **Analytics**: Track completion rates and average scores
5. **Notifications**: Email/push notifications for new assignments
6. **Calendar View**: Visual timeline of due dates
7. **Export Features**: Download grades as CSV
8. **Plagiarism Detection**: Integration with plagiarism checking tools
9. **Peer Review**: Allow students to review each other's work
10. **Templates**: Save and reuse assignment templates

## Testing Checklist

- [ ] Create assignment with all fields
- [ ] Create assignment with optional fields only
- [ ] Edit existing assignment
- [ ] Delete assignment
- [ ] Publish/unpublish assignment
- [ ] View submissions
- [ ] Grade submission
- [ ] Create class activity (all types)
- [ ] Link assignment to lesson
- [ ] Link assignment to section
- [ ] Dropdown selection works correctly
- [ ] Tab navigation between assignments and activities
- [ ] Responsive layout on mobile
- [ ] Error handling for failed API calls

## Backend Requirements

For full functionality, the backend must implement:
1. All endpoints listed above
2. Proper authentication/authorization
3. File upload handling (multipart/form-data)
4. MongoDB schemas matching the type definitions
5. Validation for due dates, points, etc.
6. Status calculation (late submissions)
7. Grade calculation and storage

## Security Considerations

- All admin endpoints require authentication
- Role-based access control (only admins can manage)
- Input validation on both client and server
- File upload restrictions (size, type)
- XSS protection for user-generated content
- CSRF protection for forms

## Performance Optimization

- Lazy loading of submission data
- Pagination for large lists (to be implemented)
- Caching of course structure
- Debounced search/filter inputs
- Optimistic UI updates

---

**Implementation Date**: February 2, 2026  
**Version**: 1.0.0  
**Status**: ✅ Complete
