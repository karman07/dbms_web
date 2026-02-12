# Push Notifications API Documentation

## Overview

This module implements Firebase Cloud Messaging (FCM) push notifications with Redis queue management for bulk notifications. The system supports both targeted notifications to specific users and bulk notifications to all users.

## Features

- **Firebase Cloud Messaging (FCM)** integration
- **Redis-based queue system** for handling bulk notifications
- **Automatic batch processing** (500 tokens per FCM request)
- **Invalid token cleanup** - automatically removes failed tokens
- **Admin bulk notifications** - send to all users or specific groups
- **Notification history and statistics**
- **Background queue processing** - processes notifications every 5 seconds
- **Guaranteed persistence** - all notifications are stored in database, even if sending fails
- **User-centric retrieval** - users can see all notifications sent to them (targeted + bulk)

## Environment Configuration

Add these variables to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Data Models

### Notification Types

- `course_update` - Course content updates
- `new_content` - New learning material
- `assignment_due` - Assignment deadline reminders
- `quiz_available` - Quiz availability
- `announcement` - General announcements
- `promotion` - Promotional content
- `system` - System messages

### Notification Priority

- `low` - Non-urgent notifications
- `normal` - Standard notifications (default)
- `high` - Urgent notifications

### Notification Status

- `pending` - Queued for sending
- `processing` - Currently being sent
- `sent` - Successfully sent to all recipients
- `failed` - Failed to send
- `partially_sent` - Sent to some but not all recipients

## User Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Register FCM Token

Register a device token for receiving push notifications.

**Endpoint:** `POST /notifications/register-token`

**Request Body:**
```json
{
  "fcmToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token registered successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/notifications/register-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "eXampleFCMToken123..."
  }'
```

---

### 2. Remove FCM Token

Remove a device token (e.g., on logout).

**Endpoint:** `DELETE /notifications/remove-token`

**Request Body:**
```json
{
  "fcmToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token removed successfully"
}
```

---

### 3. Toggle Notifications

Enable or disable notifications for the user.

**Endpoint:** `POST /notifications/toggle`

**Request Body:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications enabled successfully"
}
```

---

### 4. Get Notification History

Get notifications sent **to** the current user. This includes:
- Targeted notifications where user is in recipients list
- Bulk notifications sent to all users
- Both successfully delivered and failed notifications (all are stored)

**Endpoint:** `GET /notifications/history?page=1&limit=20`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "notifications": [
    {
      "_id": "notification_id",
      "title": "New Course Available",
      "body": "Check out our new DBMS course",
      "type": "new_content",
      "priority": "normal",
      "status": "sent",
      "isBulk": true,
      "sentBy": {
        "_id": "admin_id",
        "firstName": "Admin",
        "lastName": "User"
      },
      "totalRecipients": 150,
      "successCount": 145,
      "failureCount": 5,
      "sentAt": "2026-02-11T10:00:00.000Z",
      "createdAt": "2026-02-11T09:55:00.000Z"
    }
  ],
  "total": 50,
  "unreadCount": 5
}
```

**Note:** 
- All notifications are stored in database, even if sending fails
- `unreadCount` shows notifications from the last 7 days
- Failed notifications will have `status: "failed"` but are still visible
- `failedTokens` array is hidden from users for privacy

---

## Admin Endpoints

All admin endpoints require JWT authentication and admin role.

### 1. Send Notification to Specific Users

Send notification to specific users by user IDs or FCM tokens.

**Endpoint:** `POST /admin/notifications/send`

**Request Body:**
```json
{
  "title": "string",
  "body": "string",
  "type": "course_update | new_content | assignment_due | quiz_available | announcement | promotion | system",
  "priority": "low | normal | high",
  "data": {
    "courseId": "123",
    "customKey": "customValue"
  },
  "imageUrl": "https://example.com/image.jpg",
  "userIds": ["userId1", "userId2"],
  "fcmTokens": ["token1", "token2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification queued successfully",
  "data": {
    "notificationId": "notification_id",
    "totalRecipients": 150,
    "status": "pending"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/admin/notifications/send \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Assignment",
    "body": "A new assignment has been posted in DBMS course",
    "type": "assignment_due",
    "priority": "high",
    "data": {
      "courseId": "65abc123",
      "assignmentId": "65def456"
    },
    "userIds": ["user1", "user2", "user3"]
  }'
```

---

### 2. Send Bulk Notification

Send notification to all users or a large group.

**Endpoint:** `POST /admin/notifications/send-bulk`

**Request Body:**
```json
{
  "title": "string",
  "body": "string",
  "type": "announcement | promotion | system",
  "priority": "low | normal | high",
  "data": {
    "key": "value"
  },
  "imageUrl": "https://example.com/image.jpg",
  "sendToAll": true,
  "userIds": ["userId1", "userId2"],
  "scheduledAt": "2026-02-15T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk notification queued successfully",
  "data": {
    "notificationId": "notification_id",
    "totalRecipients": 5000,
    "isBulk": true,
    "status": "pending",
    "scheduledAt": null
  }
}
```

**Example - Send to All Users:**
```bash
curl -X POST http://localhost:3000/admin/notifications/send-bulk \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Platform Maintenance",
    "body": "The platform will be under maintenance on Sunday",
    "type": "system",
    "priority": "high",
    "sendToAll": true,
    "data": {
      "maintenanceDate": "2026-02-16"
    }
  }'
```

**Example - Send to Specific Users:**
```bash
curl -X POST http://localhost:3000/admin/notifications/send-bulk \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Course Completion",
    "body": "Congratulations on completing the course!",
    "type": "announcement",
    "priority": "normal",
    "sendToAll": false,
    "userIds": ["user1", "user2", "user3"]
  }'
```

---

### 3. Get All Notifications History

Get all notifications with filtering (admin view).

**Endpoint:** `GET /admin/notifications/history?page=1&limit=20&status=sent&type=announcement`

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `status` (optional) - Filter by status
- `type` (optional) - Filter by type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notification_id",
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
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "sentAt": "2026-02-11T10:00:00.000Z",
      "createdAt": "2026-02-11T09:55:00.000Z"
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

Get detailed information about a specific notification.

**Endpoint:** `GET /admin/notifications/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "notification_id",
    "title": "Platform Update",
    "body": "We've released new features",
    "type": "announcement",
    "priority": "normal",
    "status": "sent",
    "isBulk": true,
    "totalRecipients": 5000,
    "successCount": 4950,
    "failureCount": 50,
    "failedTokens": ["token1", "token2"],
    "sentBy": {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    },
    "sentAt": "2026-02-11T10:00:00.000Z",
    "completedAt": "2026-02-11T10:05:00.000Z",
    "createdAt": "2026-02-11T09:55:00.000Z"
  }
}
```

---

### 5. Get Notification Statistics

Get overview statistics of notifications.

**Endpoint:** `GET /admin/notifications/stats/overview?sentBy=admin_user_id`

**Query Parameters:**
- `sentBy` (optional) - Filter stats by sender

**Response:**
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

Get notifications sent by the current admin.

**Endpoint:** `GET /admin/notifications/my/sent?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notification_id",
      "title": "Course Update",
      "body": "New content added",
      "type": "course_update",
      "status": "sent",
      "totalRecipients": 100,
      "successCount": 98,
      "failureCount": 2,
      "createdAt": "2026-02-11T09:00:00.000Z"
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

## How It Works

### Queue Processing

1. When a notification is created, it's added to Redis queue
2. Background processor runs every 5 seconds
3. Processes jobs in batches of 500 tokens (FCM limit)
4. Updates notification status in MongoDB
5. Removes invalid tokens from user records

### Token Management

- Users can have multiple FCM tokens (multiple devices)
- Invalid tokens are automatically removed on failure
- Users can enable/disable notifications globally

### Bulk Notifications

- Automatically split into batches of 500 tokens
- Each batch is queued separately
- Processed sequentially to avoid rate limiting
- Progress tracked per notification ID

### Notification Data

The `data` field can contain any custom data you want to send with the notification. All values will be converted to strings automatically.

```json
{
  "data": {
    "courseId": "123",
    "moduleId": "456",
    "action": "view_course",
    "deepLink": "dbms://course/123"
  }
}
```

---

## Client-Side Integration

### Android (Kotlin/Java)

```kotlin
// Get FCM token and register
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        // Send to backend
        registerToken(token)
    }
}

// Handle notifications
override fun onMessageReceived(remoteMessage: RemoteMessage) {
    val title = remoteMessage.notification?.title
    val body = remoteMessage.notification?.body
    val data = remoteMessage.data
    
    // Show notification
    showNotification(title, body, data)
}
```

### iOS (Swift)

```swift
// Get FCM token and register
Messaging.messaging().token { token, error in
    if let token = token {
        // Send to backend
        registerToken(token)
    }
}

// Handle notifications
func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    guard let fcmToken = fcmToken else { return }
    registerToken(fcmToken)
}
```

### Web (JavaScript)

```javascript
// Request permission and get token
const messaging = firebase.messaging();

messaging.requestPermission()
  .then(() => messaging.getToken())
  .then(token => {
    // Send to backend
    registerToken(token);
  });

// Handle foreground messages
messaging.onMessage(payload => {
  console.log('Message received:', payload);
  // Display notification
});
```

---

## Error Handling

### Common Error Codes

- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - Not an admin user
- **404 Not Found** - Notification not found
- **500 Internal Server Error** - Server error

### Failed Token Handling

The system automatically:
1. Detects invalid/unregistered tokens
2. Marks them in the notification record
3. Removes them from user documents
4. Returns failed tokens in the response

---

## Best Practices

1. **Register tokens early** - Register FCM tokens as soon as app starts
2. **Handle token refresh** - Re-register when FCM token changes
3. **Use appropriate types** - Use correct notification type for context
4. **Set proper priority** - Reserve 'high' for urgent notifications only
5. **Include useful data** - Add context data for deep linking
6. **Monitor statistics** - Check success rates regularly
7. **Clean up on logout** - Remove tokens when user logs out
8. **Test with small groups** - Test bulk notifications with small user groups first
9. **Schedule wisely** - Use scheduledAt for time-zone friendly delivery
10. **Use images sparingly** - Large images can slow down delivery

---

## Redis Setup (macOS)

If you don't have Redis installed:

```bash
# Install Redis using Homebrew
brew install redis

# Start Redis
brew services start redis

# Or run Redis in foreground
redis-server
```

---

## Testing

### Test Single Notification

```bash
curl -X POST http://localhost:3000/admin/notifications/send \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test",
    "type": "system",
    "fcmTokens": ["YOUR_TEST_FCM_TOKEN"]
  }'
```

### Test Bulk Notification

```bash
curl -X POST http://localhost:3000/admin/notifications/send-bulk \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bulk",
    "body": "Testing bulk notification",
    "type": "announcement",
    "sendToAll": true
  }'
```

---

## Monitoring

### Check Queue Length

You can monitor the Redis queue programmatically or using Redis CLI:

```bash
redis-cli LLEN notifications:queue
```

### Check Processing Status

Monitor the application logs for queue processing:

```
[NotificationsService] Processing queue: 10 jobs pending
[NotificationsService] Processing job 507f1f77bcf86cd799439011 with 500 tokens
[NotificationsService] Job completed: 498 success, 2 failed
```

---

## Performance Considerations

- **Batch Size**: 500 tokens per FCM request (max allowed)
- **Processing Interval**: 5 seconds between queue checks
- **Rate Limiting**: Small delay (100ms) between batches
- **Token Cleanup**: Invalid tokens removed automatically
- **Queue Persistence**: Redis ensures queue survives restarts

---

## Future Enhancements

- Scheduled notifications (specific date/time)
- Topic-based subscriptions
- Rich media notifications
- Action buttons in notifications
- Notification templates
- A/B testing for notifications
- Analytics and click-through tracking
- User notification preferences per category
