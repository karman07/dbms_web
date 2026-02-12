# Push Notifications - Quick Start Guide

## Prerequisites

1. **Redis Server** - Must be running
2. **Firebase Admin SDK** - Already configured in your .env
3. **Admin User** - For testing admin endpoints

## Step 1: Start Redis

```bash
# Install Redis (if not installed)
brew install redis

# Start Redis service
brew services start redis

# Or run in foreground
redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

## Step 2: Start Your Application

```bash
cd /Users/karmansingh/Desktop/work/dbms_simplified/backend

# Install dependencies (if needed)
npm install

# Start the server
npm run start:dev
```

## Step 3: Test the Implementation

### A. User Flow Testing

#### 1. Register FCM Token

```bash
curl -X POST http://localhost:3000/notifications/register-token \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "YOUR_FCM_TOKEN_FROM_MOBILE_APP"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "FCM token registered successfully"
}
```

#### 2. Check Your Token Was Saved

```bash
# Open MongoDB and check your user document
# fcmTokens array should contain your token
```

### B. Admin Flow Testing

#### 1. Send Test Notification to Specific User

```bash
curl -X POST http://localhost:3000/admin/notifications/send \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test notification",
    "type": "system",
    "priority": "normal",
    "userIds": ["YOUR_USER_ID"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification queued successfully",
  "data": {
    "notificationId": "65abc123...",
    "totalRecipients": 1,
    "status": "pending"
  }
}
```

#### 2. Send Bulk Notification to All Users

```bash
curl -X POST http://localhost:3000/admin/notifications/send-bulk \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to DBMS Platform",
    "body": "Start your learning journey today!",
    "type": "announcement",
    "priority": "normal",
    "sendToAll": true
  }'
```

#### 3. Check Notification Status

```bash
# Wait 5-10 seconds for processing
curl -X GET "http://localhost:3000/admin/notifications/NOTIFICATION_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Look for:**
- `status`: Should be "sent" or "partially_sent"
- `successCount`: Number of successful deliveries
- `failureCount`: Number of failed deliveries

#### 4. Get Notification Statistics

```bash
curl -X GET "http://localhost:3000/admin/notifications/stats/overview" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "sent": 9,
    "failed": 0,
    "pending": 1,
    "successRate": "90.00%"
  }
}
```

## Step 4: Monitor Queue Processing

### Check Server Logs

You should see logs like:
```
[NotificationsService] Starting notification queue processor
[RedisQueueService] Redis client connected
[NotificationsService] Processing queue: 5 jobs pending
[NotificationsService] Processing job 65abc123... with 100 tokens
[FcmService] Successfully sent 98 messages, 2 failed
[NotificationsService] Job completed: 98 success, 2 failed
```

### Monitor Redis Queue

```bash
# Check queue length
redis-cli LLEN notifications:queue

# Watch queue in real-time
watch -n 1 'redis-cli LLEN notifications:queue'
```

## Step 5: Test on Mobile App

### Android (Kotlin)

```kotlin
// 1. Get FCM token
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        Log.d("FCM", "Token: $token")
        
        // 2. Register with backend
        registerToken(token)
    }
}

// 3. Handle incoming notifications
override fun onMessageReceived(message: RemoteMessage) {
    Log.d("FCM", "From: ${message.from}")
    
    message.notification?.let {
        Log.d("FCM", "Title: ${it.title}")
        Log.d("FCM", "Body: ${it.body}")
    }
    
    message.data.isNotEmpty().let {
        Log.d("FCM", "Data: ${message.data}")
    }
    
    showNotification(message)
}
```

### iOS (Swift)

```swift
// 1. Get FCM token
Messaging.messaging().token { token, error in
    if let error = error {
        print("Error fetching FCM token: \(error)")
    } else if let token = token {
        print("FCM token: \(token)")
        
        // 2. Register with backend
        registerToken(token)
    }
}

// 3. Handle token refresh
func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    guard let fcmToken = fcmToken else { return }
    print("Firebase token: \(fcmToken)")
    registerToken(fcmToken)
}
```

### Web (React)

```javascript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// 1. Request permission and get token
const messaging = getMessaging();

const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      });
      console.log('FCM Token:', token);
      
      // 2. Register with backend
      await registerToken(token);
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
};

// 3. Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received:', payload);
  // Display notification
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.image
  });
});
```

## Step 6: Common Testing Scenarios

### Scenario 1: Course Content Update

```bash
curl -X POST http://localhost:3000/admin/notifications/send \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Lecture Added",
    "body": "Check out the new lecture on SQL Joins",
    "type": "new_content",
    "priority": "normal",
    "data": {
      "courseId": "65abc123",
      "lectureId": "65def456",
      "action": "open_lecture"
    },
    "userIds": ["enrolled_user_1", "enrolled_user_2"]
  }'
```

### Scenario 2: Assignment Deadline Reminder

```bash
curl -X POST http://localhost:3000/admin/notifications/send \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Assignment Due Soon",
    "body": "Your DBMS assignment is due in 24 hours",
    "type": "assignment_due",
    "priority": "high",
    "data": {
      "assignmentId": "65xyz789",
      "dueDate": "2026-02-12T23:59:59Z"
    },
    "userIds": ["student_1", "student_2"]
  }'
```

### Scenario 3: Platform-Wide Announcement

```bash
curl -X POST http://localhost:3000/admin/notifications/send-bulk \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Feature Launched",
    "body": "Check out our new interactive quiz feature!",
    "type": "announcement",
    "priority": "normal",
    "data": {
      "feature": "interactive_quiz",
      "link": "/features/quiz"
    },
    "imageUrl": "https://example.com/quiz-banner.png",
    "sendToAll": true
  }'
```

## Troubleshooting

### Issue: Notifications not sending

**Check:**
1. Redis is running: `redis-cli ping`
2. Firebase credentials are correct in .env
3. User has FCM tokens registered
4. User has `notificationsEnabled: true`
5. Check server logs for errors

### Issue: Queue not processing

**Check:**
1. Server is running
2. Redis connection is established
3. Check queue length: `redis-cli LLEN notifications:queue`
4. Check server logs for processor errors

### Issue: Invalid tokens

**Solution:**
- System automatically removes invalid tokens
- Check `failedTokens` in notification document
- Users need to re-register their tokens

### Issue: Slow delivery

**Check:**
1. Queue length - large queues take time
2. Batch size - 500 tokens per batch
3. Processing interval - 5 seconds between jobs
4. Network latency to FCM servers

## Performance Monitoring

### Check Queue Status

```bash
# Queue length
redis-cli LLEN notifications:queue

# All keys
redis-cli KEYS "notifications:*"
```

### Check Database

```javascript
// MongoDB shell
use your_database

// Recent notifications
db.notifications.find().sort({createdAt: -1}).limit(10)

// Success rate
db.notifications.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
])

// Users with most tokens
db.users.aggregate([
  {
    $project: {
      email: 1,
      tokenCount: { $size: { $ifNull: ["$fcmTokens", []] } }
    }
  },
  { $sort: { tokenCount: -1 } },
  { $limit: 10 }
])
```

## Next Steps

1. **Integrate with your mobile app** - Add FCM to your Android/iOS app
2. **Test on real devices** - Send test notifications to your phone
3. **Set up monitoring** - Monitor queue and delivery rates
4. **Create notification templates** - Standardize your messages
5. **Schedule notifications** - Use scheduledAt for timed delivery
6. **Add analytics** - Track open rates and engagement

## Support

If you encounter issues:
1. Check server logs
2. Verify Redis is running
3. Check Firebase console for errors
4. Review MongoDB for notification status
5. Test with a small number of users first

## Production Checklist

- [ ] Redis is configured with persistence
- [ ] Firebase credentials are secure
- [ ] Rate limiting is in place
- [ ] Monitoring and alerts are set up
- [ ] Backup strategy for queue
- [ ] Error handling for failed notifications
- [ ] User preferences for notification types
- [ ] Compliance with notification policies
- [ ] Testing on all platforms (iOS, Android, Web)
- [ ] Documentation for your team
