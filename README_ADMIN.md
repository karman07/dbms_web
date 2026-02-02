# Admin Dashboard

A beautiful, responsive admin dashboard built with React, TypeScript, Tailwind CSS, and integrated with a comprehensive API for user management, course administration, assignment/activity tracking, and system monitoring.

## Features

### 🎨 Beautiful UI
- Modern, clean design with Tailwind CSS
- Responsive layout that works on all devices
- Dark/light theme support
- Smooth animations and transitions

### 📊 Comprehensive Dashboard
- Real-time statistics and metrics
- Interactive charts and graphs (Recharts)
- User activity monitoring
- System health indicators

### 👥 User Management
- View, edit, and delete users
- Role management (USER/ADMIN)
- Email verification controls
- Advanced search and filtering
- Pagination support

### 📚 Course Management
- Complete course administration
- Section and lesson management
- File upload support
- Student progress tracking
- Content publishing controls

### 📋 Assignment & Activity Management (NEW)
- **Assignments**: Create, manage, and grade assignments
- **Class Activities**: Discussion, group work, presentations, labs
- **Submissions**: Track and grade student submissions
- **Dropdowns**: Easy selection of lessons and sections
- **Status Tracking**: Monitor submission status (pending/graded/late)
- **Grading Interface**: Provide grades and detailed feedback

### 🎯 Quiz Management (NEW)
- Create and manage quizzes
- Link quizzes to specific lessons
- Multiple choice questions with explanations
- Automatic grading
- Quiz analytics and results

### 📈 Analytics & Reports
- User engagement metrics
- Course completion statistics
- Assignment and activity analytics
- System performance monitoring
- Exportable reports (CSV, JSON, PDF)

### 🔧 System Administration
- System health monitoring
- Database backup management
- Activity logs
- Settings configuration

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite

## API Integration

The dashboard integrates with a comprehensive REST API that includes:

### Authentication
- Admin login/logout
- JWT token management
- Role-based access control

### User Management
- GET `/users/admin/all` - Get all users with pagination
- PUT `/users/admin/:id` - Update user
- DELETE `/users/admin/:id` - Delete user
- POST `/users/admin/:id/verify-email` - Verify user email
- PUT `/users/admin/:id/role` - Change user role

### Course Management
- GET `/courses/admin` - Get course details
- POST `/courses/admin` - Create course
- PUT `/courses/admin` - Update course
- POST `/courses/admin/section` - Add section
- POST `/courses/admin/section/:index/lesson` - Add lesson

### System Administration
- GET `/admin/stats` - System statistics
- GET `/admin/health` - System health check
- GET `/admin/activity-logs` - Activity logs
- POST `/admin/backup` - Create backup
- GET `/admin/export/users` - Export user data
- GET `/admin/export/progress` - Export progress data

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` and set your API URL:
```
REACT_APP_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Configuration

### API Configuration
Update the `REACT_APP_API_URL` in your `.env` file to point to your backend API.

### Authentication
The app expects the API to return JWT tokens in the following format:
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "isEmailVerified": true
  }
}
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, Layout)
│   └── charts/          # Chart components
├── context/             # React context (Auth)
├── pages/               # Page components
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and API client
└── App.tsx              # Main app component
```

## Key Components

### Dashboard
- Real-time statistics cards
- Interactive charts showing user growth, course progress
- Recent activity feed
- System health indicators

### User Management
- Searchable and filterable user table
- Inline role editing
- Email verification controls
- User statistics cards

### Course Management
- Course overview with statistics
- Tabbed interface for content management
- Section and lesson management
- Student progress tracking

### Analytics
- Comprehensive charts and metrics
- User engagement tracking
- Device usage statistics
- Performance indicators

### Reports
- Generate and download reports
- Export data in multiple formats
- Recent downloads tracking
- Scheduled reports management

### System Monitor
- Real-time system metrics
- Service status monitoring
- System logs viewer
- Performance charts

## Customization

### Styling
The app uses Tailwind CSS for styling. You can customize the theme by editing `tailwind.config.js`.

### API Endpoints
Update the API endpoints in `src/utils/api.ts` to match your backend implementation.

### Charts
Chart configurations can be modified in `src/components/charts/Charts.tsx`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.