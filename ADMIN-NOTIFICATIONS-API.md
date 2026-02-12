# Admin Notifications API - Complete Reference

## Overview

This document provides complete API documentation for admin notification routes, including database schemas and detailed examples.

**Base URL:** `http://localhost:3000`  
**Authentication:** Required - Admin JWT token  
**Role Required:** `ADMIN`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Schema](#user-schema)
3. [Notification Schema](#notification-schema)
4. [Admin API Endpoints](#admin-api-endpoints)
5. [Request/Response Examples](#request-response-examples)
6. [Error Handling](#error-handling)

---

## Authentication

All admin endpoints require:
- Valid JWT token in Authorization header
- User role must be `ADMIN`

```bash
Authorization: Bearer <admin_jwt_token>
```

If user is not an admin, API will return:
```json
{
  "statusCode": 400,
  "message": "Only admins can perform this action",
  "error": "Bad Request"
}
```

---

## User Schema

### User Model Structure

```typescript
{
  _id: ObjectId,                    // MongoDB ObjectId (24 char hex)
  
  // Basic Information
  email: string,                    // Required, unique
  firstName: string,                // Required
  lastName: string,                 // Required
  password: string,                 // Optional (for Google signup)
  phoneNumber: string,              // Optional
  
  // Profile Information
  age: number,
  gender: "male" | "female" | "other",
  currentPosition: string,
  company: string,
  city: string,
  state: string,
  country: string,
  profilePicture: string,           // URL
  bio: string,
  
  // Verification Status
  isEmailVerified: boolean,         // Default: false
  isPhoneVerified: boolean,         // Default: false
  
  // Role & Authentication
  role: "user" | "admin",           // Default: "user"
  firebaseUid: string,
  isGoogleSignup: boolean,          // Default: false
  
  // Additional Info
  referralSource: string,
  dateOfBirth: Date,
  linkedinProfile: string,
  githubProfile: string,
  website: string,
  visitorType: "student" | "teacher",
  
  // Student-specific fields
  university: string,
  degree: string,
  major: string,
  graduationYear: number,
  
  // Teacher-specific fields
  department: string,
  designation: string,
  teachingExperience: number,
  specialization: string[],
  
  // Status
  isActive: boolean,                // Default: true
  lastLoginAt: Date,
  
  // Push Notifications
  fcmTokens: string[],              // Array of FCM device tokens
  notificationsEnabled: boolean,    // Default: true
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema Indexes

```typescript
- { email: 1 }
- { firebaseUid: 1 }
- { visitorType: 1 }
```

### User Roles

```typescript
enum UserRole {
  USER = 'user',    // Regular user (default)
  ADMIN = 'admin'   // Admin user with special privileges
}
```

### User Example Document

```json
{
  "_id": "65abc123def456789012abcd",
  "email": "admin@dbms.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "isEmailVerified": true,
  "isActive": true,
  "fcmTokens": [
    "eXampleFCMToken123...",
    "anotherDeviceToken456..."
  ],
  "notificationsEnabled": true,
  "visitorType": "teacher",
  "department": "Computer Science",
  "designation": "Professor",
  "teachingExperience": 10,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-02-12T08:30:00.000Z"
}
```

---

## Notification Schema

### Notification Model Structure

```typescript
{
  _id: ObjectId,
  
  // Notification Content
  title: string,                    // Required
  body: string,                     // Required
  data: Object,                     // Custom key-value pairs
  imageUrl: string,                 // Optional image URL
  
  // Classification
  type: NotificationType,           // Required
  priority: NotificationPriority,   // Default: "normal"
  
  // Delivery Status
  status: NotificationStatus,       // Default: "pending"
  
  // Recipients
  recipients: ObjectId[],           // Array of User IDs (for targeted)
  isBulk: boolean,                  // Default: false
  
  // Sender
  sentBy: ObjectId,                 // Admin User ID
  
  // Statistics
  totalRecipients: number,          // Default: 0
  successCount: number,             // Default: 0
  failureCount: number,             // Default: 0
  failedTokens: string[],           // Invalid FCM tokens
  
  // Scheduling
  scheduledAt: Date,                // Optional future delivery
  sentAt: Date,                     // When notification started sending
  completedAt: Date,                // When notification finished
  
  // Error Tracking
  error: string,                    // Error message if failed
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Enums

#### NotificationType
```typescript
enum NotificationType {
  COURSE_UPDATE = 'course_update',
  NEW_CONTENT = 'new_content',
  ASSIGNMENT_DUE = 'assignment_due',
  QUIZ_AVAILABLE = 'quiz_available',
  ANNOUNCEMENT = 'announcement',
  PROMOTION = 'promotion',
  SYSTEM = 'system'
}
```

#### NotificationPriority
```typescript
enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high'
}
```

#### NotificationStatus
```typescript
enum NotificationStatus {
  PENDING = 'pending',           // Queued, not yet sent
  PROCESSING = 'processing',     // Currently being sent
  SENT = 'sent',                 // Successfully sent to all
  FAILED = 'failed',             // Failed to send
  PARTIALLY_SENT = 'partially_sent'  // Sent to some recipients
}
```

### Notification Schema Indexes

```typescript
- { status: 1 }
- { type: 1 }
- { sentBy: 1 }
- { createdAt: -1 }
```

### Notification Example Document

```json
{
  "_id": "65def456abc789012345bcde",
  "title": "New Course Available",
  "body": "Check out our new Advanced DBMS course",
  "type": "new_content",
  "priority": "normal",
  "status": "sent",
  "data": {
    "courseId": "65xyz789",
    "action": "view_course",
    "deepLink": "/courses/65xyz789"
  },
  "imageUrl": "https://example.com/course-banner.jpg",
  "isBulk": true,
  "sentBy": "65abc123def456789012abcd",
  "totalRecipients": 5000,
  "successCount": 4950,
  "failureCount": 50,
  "failedTokens": ["invalidToken1", "invalidToken2"],
  "sentAt": "2026-02-12T10:00:00.000Z",
  "completedAt": "2026-02-12T10:05:00.000Z",
  "createdAt": "2026-02-12T09:55:00.000Z",
  "updatedAt": "2026-02-12T10:05:00.000Z"
}
```

---

## Admin API Endpoints

### Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/notifications/send` | Send notification to specific users |
| POST | `/admin/notifications/send-bulk` | Send bulk notification to all/many users |
| GET | `/admin/notifications/history` | Get all notifications (with filters) |
| GET | `/admin/notifications/:id` | Get notification by ID |
| GET | `/admin/notifications/stats/overview` | Get notification statistics |
| GET | `/admin/notifications/my/sent` | Get current admin's sent notifications |

---

## Request/Response Examples

### 1. Send Notification to Specific Users

Send targeted notification to specific users by their MongoDB ObjectIds.

**Endpoint:** `POST /admin/notifications/send`

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Assignment Posted",
  "body": "A new assignment has been posted in DBMS course",
  "type": "assignment_due",
  "priority": "high",
  "data": {
    "courseId": "65abc123def456789012abcd",
    "assignmentId": "65def456abc789012345bcde",
    "action": "view_assignment",
    "dueDate": "2026-02-20T23:59:59Z"
  },
  "imageUrl": "https://example.com/assignment-icon.png",
  "userIds": [
    "65user1abc123def456789012",
    "65user2def456abc789012345",
    "65user3xyz789abc123def456"
  ]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification queued successfully",
  "data": {
    "notificationId": "65notif123abc456def78901",
    "totalRecipients": 3,
    "status": "pending"
  }
}
```

**Error Response - Invalid ObjectId (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "No valid user IDs provided. User IDs must be valid MongoDB ObjectIds (24 character hex strings)",
  "error": "Bad Request"
}
```

**Example with FCM Tokens:**
```json
{
  "title": "Test Notification",
  "body": "Testing direct FCM token notification",
  "type": "system",
  "priority": "normal",
  "fcmTokens": [
    "eXampleFCMToken123...",
    "anotherToken456..."
  ]
}
```

---

### 2. Send Bulk Notification to All Users

Send notification to all users or a large group.

**Endpoint:** `POST /admin/notifications/send-bulk`

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body (Send to All):**
```json
{
  "title": "Platform Maintenance Alert",
  "body": "The platform will undergo scheduled maintenance this Sunday from 2 AM to 6 AM",
  "type": "system",
  "priority": "high",
  "data": {
    "maintenanceDate": "2026-02-16",
    "startTime": "02:00",
    "endTime": "06:00",
    "affectedServices": ["courses", "quizzes", "assignments"]
  },
  "imageUrl": "https://example.com/maintenance-banner.png",
  "sendToAll": true
}
```

**Request Body (Send to Specific Users):**
```json
{
  "title": "Course Completion Certificate",
  "body": "Congratulations! Your course completion certificate is ready",
  "type": "announcement",
  "priority": "normal",
  "data": {
    "courseId": "65abc123def456789012abcd",
    "certificateUrl": "https://example.com/certs/12345",
    "completionDate": "2026-02-12"
  },
  "sendToAll": false,
  "userIds": [
    "65user1abc123def456789012",
    "65user2def456abc789012345"
  ]
}
```

**Request Body (Scheduled Notification):**
```json
{
  "title": "Webinar Starting Soon",
  "body": "Your webinar starts in 1 hour",
  "type": "announcement",
  "priority": "high",
  "data": {
    "webinarId": "webinar123",
    "link": "https://meet.example.com/webinar"
  },
  "sendToAll": false,
  "userIds": ["65user1abc123def456789012"],
  "scheduledAt": "2026-02-15T14:00:00Z"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk notification queued successfully",
  "data": {
    "notificationId": "65notif456def789abc12345",
    "totalRecipients": 5000,
    "isBulk": true,
    "status": "pending",
    "scheduledAt": null
  }
}
```

**Error Response - Invalid User IDs (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "No valid user IDs provided. User IDs must be valid MongoDB ObjectIds (24 character hex strings). Example: \"65abc123def456789012abcd\"",
  "error": "Bad Request"
}
```

---

### 3. Get All Notifications History

Retrieve all notifications with optional filtering and pagination.

**Endpoint:** `GET /admin/notifications/history`

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)
- `status` (string, optional) - Filter by status: `pending`, `processing`, `sent`, `failed`, `partially_sent`
- `type` (string, optional) - Filter by type: `course_update`, `new_content`, `assignment_due`, `quiz_available`, `announcement`, `promotion`, `system`

**Example Requests:**

```bash
# Get all notifications (page 1, 20 items)
GET /admin/notifications/history

# Get sent notifications only
GET /admin/notifications/history?status=sent

# Get announcements
GET /admin/notifications/history?type=announcement

# Get page 2 with 50 items
GET /admin/notifications/history?page=2&limit=50

# Get sent announcements
GET /admin/notifications/history?status=sent&type=announcement
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65notif123abc456def78901",
      "title": "Platform Update",
      "body": "We've released new features",
      "type": "announcement",
      "priority": "normal",
      "status": "sent",
      "isBulk": true,
      "totalRecipients": 5000,
      "successCount": 4950,
      "failureCount": 50,
      "sentBy": {
        "_id": "65admin123abc456def78901",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@dbms.com"
      },
      "sentAt": "2026-02-12T10:00:00.000Z",
      "completedAt": "2026-02-12T10:05:00.000Z",
      "createdAt": "2026-02-12T09:55:00.000Z",
      "updatedAt": "2026-02-12T10:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 4. Get Notification by ID

Retrieve detailed information about a specific notification.

**Endpoint:** `GET /admin/notifications/:id`

**Path Parameters:**
- `id` (string, required) - Notification MongoDB ObjectId

**Example Request:**
```bash
GET /admin/notifications/65notif123abc456def78901
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65notif123abc456def78901",
    "title": "Course Enrollment Confirmation",
    "body": "You have been enrolled in Advanced DBMS",
    "type": "course_update",
    "priority": "normal",
    "status": "sent",
    "data": {
      "courseId": "65course123abc456",
      "action": "view_course"
    },
    "imageUrl": "https://example.com/course.jpg",
    "isBulk": false,
    "recipients": [
      "65user1abc123def456789012",
      "65user2def456abc789012345"
    ],
    "sentBy": {
      "_id": "65admin123abc456def78901",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@dbms.com"
    },
    "totalRecipients": 2,
    "successCount": 2,
    "failureCount": 0,
    "failedTokens": [],
    "sentAt": "2026-02-12T08:00:00.000Z",
    "completedAt": "2026-02-12T08:00:15.000Z",
    "createdAt": "2026-02-12T07:59:45.000Z",
    "updatedAt": "2026-02-12T08:00:15.000Z"
  }
}
```

**Error Response - Not Found (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Notification not found",
  "error": "Bad Request"
}
```

---

### 5. Get Notification Statistics

Get overview statistics of all notifications or filter by sender.

**Endpoint:** `GET /admin/notifications/stats/overview`

**Query Parameters:**
- `sentBy` (string, optional) - Filter by admin user ID

**Example Requests:**

```bash
# Get all statistics
GET /admin/notifications/stats/overview

# Get statistics for specific admin
GET /admin/notifications/stats/overview?sentBy=65admin123abc456def78901
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 1000,
    "sent": 950,
    "failed": 30,
    "pending": 20,
    "successRate": "95.00%"
  }
}
```

---

### 6. Get My Sent Notifications

Retrieve notifications sent by the current admin user.

**Endpoint:** `GET /admin/notifications/my/sent`

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Example Requests:**

```bash
# Get my sent notifications
GET /admin/notifications/my/sent

# Get page 2
GET /admin/notifications/my/sent?page=2&limit=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65notif789xyz123abc45678",
      "title": "Welcome to DBMS Platform",
      "body": "Start your learning journey today",
      "type": "announcement",
      "priority": "normal",
      "status": "sent",
      "isBulk": true,
      "totalRecipients": 100,
      "successCount": 98,
      "failureCount": 2,
      "sentAt": "2026-02-11T15:00:00.000Z",
      "createdAt": "2026-02-11T14:55:00.000Z",
      "updatedAt": "2026-02-11T15:02:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
Missing or invalid JWT token.

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 400 Bad Request - Not Admin
User is not an admin.

```json
{
  "statusCode": 400,
  "message": "Only admins can perform this action",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Invalid User IDs
Provided user IDs are not valid MongoDB ObjectIds.

```json
{
  "statusCode": 400,
  "message": "No valid user IDs provided. User IDs must be valid MongoDB ObjectIds (24 character hex strings)",
  "error": "Bad Request"
}
```

#### 400 Bad Request - Missing Required Fields
```json
{
  "statusCode": 400,
  "message": "Either userIds or fcmTokens must be provided",
  "error": "Bad Request"
}
```

#### 500 Internal Server Error
Server error occurred.

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## User ID Validation

### Important Notes

⚠️ **User IDs must be valid MongoDB ObjectIds**

- **Format:** 24 character hexadecimal string
- **Example:** `"65abc123def456789012abcd"`
- **Invalid Examples:**
  - `"user1"` ❌ (not a valid ObjectId)
  - `"123"` ❌ (too short)
  - `"invalid-id"` ❌ (contains invalid characters)

### How to Get Valid User IDs

1. **From Database:**
   ```javascript
   db.users.find({}, { _id: 1 }).limit(5)
   ```

2. **From User API:**
   ```bash
   GET /users
   ```

3. **From User Profile:**
   ```bash
   GET /users/:id
   ```

### Validation Behavior

The API automatically:
- ✅ Validates all user IDs before querying
- ✅ Filters out invalid IDs
- ✅ Logs warnings for invalid IDs
- ✅ Proceeds with valid IDs only
- ❌ Throws error if NO valid IDs remain

---

## Complete cURL Examples

### Send Notification to Specific Users

```bash
curl -X POST http://localhost:3000/admin/notifications/send \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Assignment",
    "body": "DBMS assignment due soon",
    "type": "assignment_due",
    "priority": "high",
    "data": {
      "courseId": "65abc123def456789012abcd",
      "assignmentId": "65def456abc789012345bcde"
    },
    "userIds": ["65user1abc123def456789012"]
  }'
```

### Send Bulk Notification to All

```bash
curl -X POST http://localhost:3000/admin/notifications/send-bulk \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Platform Update",
    "body": "New features released!",
    "type": "announcement",
    "priority": "normal",
    "sendToAll": true
  }'
```

### Get Notification History

```bash
curl -X GET "http://localhost:3000/admin/notifications/history?page=1&limit=20&status=sent" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Notification Statistics

```bash
curl -X GET http://localhost:3000/admin/notifications/stats/overview \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Notification Types & Use Cases

| Type | Use Case | Priority Suggestion |
|------|----------|---------------------|
| `course_update` | Course content changes | normal |
| `new_content` | New lectures/materials added | normal |
| `assignment_due` | Assignment deadline approaching | high |
| `quiz_available` | New quiz ready | normal |
| `announcement` | General platform announcements | normal |
| `promotion` | Marketing/promotional content | low |
| `system` | System messages, maintenance | high |

---

## Best Practices

### 1. User ID Management
- Always use valid MongoDB ObjectIds
- Get IDs from database or user endpoints
- Test with small groups before bulk sending

### 2. Notification Content
- Keep titles under 50 characters
- Keep body under 200 characters for mobile
- Use data field for deep linking and context

### 3. Testing
- Test with small user groups first
- Use `fcmTokens` for direct device testing
- Monitor notification statistics

### 4. Performance
- Use bulk endpoint for >10 users
- Avoid sending duplicate notifications
- Check notification history before resending

### 5. Monitoring
- Check `stats/overview` regularly
- Review failed notifications
- Monitor success rates

---

## Quick Reference

### Get Sample User IDs (Development)

```bash
# Login as admin
POST /auth/login
{
  "email": "admin@dbms.com",
  "password": "your_password"
}

# Get list of users
GET /users
# Response contains user IDs
```

### Notification Flow

```
1. Admin creates notification → 2. Validates user IDs
                              ↓
3. Creates notification record → 4. Queries users for FCM tokens
                              ↓
5. Adds to Redis queue → 6. Background processor picks job
                              ↓
7. Sends via FCM (batches of 500) → 8. Updates status in MongoDB
                              ↓
9. Removes invalid tokens → 10. Notification complete
```

---

## Support & Troubleshooting

### Common Issues

**Issue:** "No valid user IDs provided"
- **Solution:** Ensure user IDs are valid MongoDB ObjectIds (24 chars)

**Issue:** No users receiving notifications
- **Solution:** Check users have `notificationsEnabled: true` and valid FCM tokens

**Issue:** Low success rate
- **Solution:** Review failed tokens, users may need to re-register devices

### Getting Help

- Check server logs for detailed errors
- Verify user schema has FCM tokens
- Test with direct FCM tokens first
- Review notification statistics

---

## Version History

- **v1.0** (2026-02-12) - Initial release with all admin endpoints
- Added ObjectId validation
- Added error handling for invalid user IDs
- Added comprehensive documentation

---

## Related Documentation

- [Push Notifications API](./PUSH-NOTIFICATIONS-API.md) - Complete API reference
- [Frontend Implementation Guide](./FRONTEND-NOTIFICATIONS-GUIDE.md) - Client integration
- [Quick Start Guide](./NOTIFICATIONS-QUICK-START.md) - Setup instructions
