# Course Management - Quick Start Guide

## 🎯 What's Been Implemented

A **complete Course Management System** with all 14 API endpoints and a modern, intuitive UI.

## 📁 Files Created/Modified

### New Components
- ✅ `src/components/ui/input.tsx` - Input field component
- ✅ `src/components/ui/textarea.tsx` - Textarea component  
- ✅ `src/components/ui/badge.tsx` - Badge component for status indicators
- ✅ `src/components/ui/card.tsx` - Card container components
- ✅ `src/components/ui/modal.tsx` - Modal/dialog component
- ✅ `src/components/course/SectionModal.tsx` - Section add/edit modal
- ✅ `src/components/course/LessonForm.tsx` - Comprehensive lesson form (500+ lines)
- ✅ `src/components/course/QuizBuilder.tsx` - Dynamic quiz builder

### Updated Files
- ✅ `src/pages/CoursePage.tsx` - Complete rewrite with full functionality (730 lines)
- ✅ `src/types/index.ts` - Added complete Course, Section, Lesson, Quiz types
- ✅ `src/utils/api.ts` - Added all 14 course API endpoints

## 🚀 How to Use

### 1. Start the Application
```bash
npm run dev
# or
pnpm dev
```

### 2. Navigate to Course Page
Go to `/course` route in your admin dashboard

### 3. Create Your First Course

**If no course exists:**
1. Click "Create Course" button
2. Fill in:
   - Title (required)
   - Description (required)
   - Thumbnail URL (optional)
   - Tags (comma-separated, optional)
   - Publish checkbox (optional)
3. Click "Create Course"

### 4. Add Sections
1. Click "Add Section" button
2. Enter section title (required)
3. Add description (optional)
4. Set order number (optional, auto-calculated if 0)
5. Click "Add Section"

### 5. Add Lessons
1. Click "Add Lesson" within a section
2. Fill in the comprehensive form:

**Basic Info:**
- Lesson title ✅ required
- Order number
- Estimated time (minutes)
- Publish status checkbox

**Content:**
- Write markdown directly OR
- Upload .md file

**Video (Optional):**
- Choose: YouTube URL or Upload video file
- Add video description

**Resources (Optional):**
- Add resource URLs
- Upload resource files (.pdf, .zip, .doc)

**Quiz (Optional):**
- Click "Add Question"
- Enter question text
- Add options (2-6 per question)
- Click checkmark to mark correct answer
- Add explanation (optional)
- Repeat for multiple questions

3. Click "Add Lesson"

### 6. Manage Content

**Edit Course:**
- Click "Edit Course" button
- Modify any course details
- Save changes

**Publish/Unpublish:**
- Click "Publish" or "Unpublish" button
- Instantly toggles course visibility

**Edit Section:**
- Click edit icon on section header
- Modify section details
- Save changes

**Delete Section:**
- Click trash icon on section
- Confirm deletion (removes all lessons too!)

**Edit Lesson:**
- Click edit icon on lesson row
- Modify any lesson details
- Upload new files if needed
- Save changes

**Delete Lesson:**
- Click trash icon on lesson
- Confirm deletion

## 🎨 UI Features

### Visual Indicators
- 🟢 Green badge = Published
- 🔵 Gray badge = Draft
- 🎥 Video icon = Video lesson
- 📄 File icon = Text lesson
- 🕐 Clock icon = Estimated time
- 🎯 Quiz badge = Has quiz questions
- 📦 Resource badge = Has downloadable resources

### Collapsible Sections
- Click chevron (▶/▼) to expand/collapse sections
- All sections expanded by default
- Shows lesson count in section badge

### Status Tracking
- Enrolled count displayed
- Total sections and lessons shown
- Real-time updates after changes

## 📊 API Integration

### Backend Requirements
Ensure your backend API supports:

**Admin Endpoints:**
1. `POST /courses/admin` - Create course
2. `PUT /courses/admin` - Update course
3. `GET /courses/admin` - Get course
4. `POST /courses/admin/section` - Add section
5. `PUT /courses/admin/section/:sectionIndex` - Update section
6. `DELETE /courses/admin/section/:sectionIndex` - Delete section
7. `POST /courses/admin/section/:sectionIndex/lesson` - Add lesson (multipart/form-data)
8. `PUT /courses/admin/section/:sectionIndex/lesson/:lessonIndex` - Update lesson (multipart/form-data)
9. `DELETE /courses/admin/section/:sectionIndex/lesson/:lessonIndex` - Delete lesson

**User Endpoints (Ready for implementation):**
10. `GET /courses` - Get published course
11. `POST /courses/enroll` - Enroll
12. `GET /courses/my-progress` - Get progress
13. `PUT /courses/progress` - Update progress
14. `POST /courses/quiz/submit` - Submit quiz

### Environment Setup
Create/update `.env`:
```
VITE_API_URL=http://localhost:3000
```

## 🔧 Customization

### Theme Colors
The UI uses Tailwind CSS with a consistent color scheme:
- Primary: Blue (600)
- Success: Green (500)
- Warning: Yellow (500)
- Danger: Red (600)
- Neutral: Slate (50-900)

### Modify in Components
All components use Tailwind classes - easy to customize:
```tsx
// Example: Change button color
<Button className="bg-purple-600 hover:bg-purple-700">
```

## 🐛 Troubleshooting

### Course not loading?
- Check browser console for errors
- Verify API URL in environment variables
- Ensure backend is running
- Check if course exists (404 is normal if none created)

### File uploads failing?
- Verify backend accepts multipart/form-data
- Check file size limits
- Ensure proper file types (.md, .mp4, .pdf, etc.)

### Changes not saving?
- Check network tab for failed requests
- Verify authentication token is valid
- Check backend validation rules

## ✨ Best Practices

1. **Always test publish status** before making course public
2. **Use descriptive titles** for sections and lessons
3. **Add estimated times** to help students plan
4. **Include quiz questions** to reinforce learning
5. **Upload resources** to supplement lessons
6. **Write clear explanations** for quiz answers

## 📝 Development Notes

### State Management
- Uses React hooks (useState, useEffect)
- No external state library needed
- All state managed locally in components

### Form Handling
- Uses FormData for file uploads
- Native form validation
- Controlled components for inputs

### Error Handling
- Try-catch blocks for API calls
- User-friendly error messages
- Confirmation dialogs for destructive actions

## 🎯 Next Steps

After setting up courses, you can:
1. Add user enrollment functionality
2. Build progress tracking interface
3. Create quiz results dashboard
4. Implement certificate generation
5. Add course analytics
6. Build student-facing course viewer

---

**Everything is ready to go! Just start your dev server and navigate to the course page.** 🚀
