// Notification Types for Backend Implementation

/**
 * This file contains TypeScript interfaces for notification payloads
 * Use these as reference when implementing notification sending on the backend
 */

// Base Notification Interface
export interface NotificationPayload {
  notification: {
    title: string;
    body: string;
    image?: string;
  };
  data?: NotificationData;
}

// Notification Data (for deep linking)
export interface NotificationData {
  action?: 'view_course' | 'view_assignment' | 'view_quiz' | 'view_lesson' | 'general';
  courseId?: string;
  assignmentId?: string;
  quizId?: string;
  lessonId?: string;
  deepLink?: string;
  notificationId?: string;
  [key: string]: string | undefined;
}

// Database Notification Model (backend)
export interface NotificationDocument {
  _id: string;
  userId: string;
  title: string;
  body: string;
  data?: NotificationData;
  sentAt: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response for Notification History
export interface NotificationHistoryResponse {
  success: boolean;
  data: NotificationDocument[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    limit: number;
  };
}

// Examples of notification payloads to send from backend:

/**
 * Example 1: New Course Lesson Available
 */
const newLessonNotification: NotificationPayload = {
  notification: {
    title: "New Lesson Available!",
    body: "Introduction to Database Normalization is now available",
    image: "https://example.com/course-thumbnail.jpg"
  },
  data: {
    action: "view_course",
    courseId: "123",
    lessonId: "456",
    deepLink: "/course/123"
  }
};

/**
 * Example 2: Assignment Due Soon
 */
const assignmentDueNotification: NotificationPayload = {
  notification: {
    title: "Assignment Due Tomorrow",
    body: "Database Design Assignment is due tomorrow at 11:59 PM",
  },
  data: {
    action: "view_assignment",
    assignmentId: "789",
    deepLink: "/assignments/789"
  }
};

/**
 * Example 3: Quiz Results Available
 */
const quizResultsNotification: NotificationPayload = {
  notification: {
    title: "Quiz Results Available",
    body: "Your results for SQL Basics Quiz are now available",
  },
  data: {
    action: "view_quiz",
    quizId: "101",
    deepLink: "/quizzes/101"
  }
};

/**
 * Example 4: General Announcement
 */
const announcementNotification: NotificationPayload = {
  notification: {
    title: "Important Announcement",
    body: "Office hours have been rescheduled to 3 PM today",
  },
  data: {
    action: "general",
    deepLink: "/dashboard"
  }
};

/**
 * Backend Implementation Example (Node.js/Express)
 * 
 * This is how you would send notifications from your backend:
 */

/*
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// Send notification to a specific user
async function sendNotificationToUser(userId: string, notification: NotificationPayload) {
  try {
    // Get user's FCM tokens from database
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('No FCM tokens found for user');
      return;
    }

    // Send to all user's devices
    const promises = user.fcmTokens.map(token => {
      return admin.messaging().send({
        token: token,
        notification: notification.notification,
        data: notification.data,
        webpush: {
          fcmOptions: {
            link: notification.data?.deepLink || '/'
          }
        }
      });
    });

    const results = await Promise.allSettled(promises);
    console.log('Notifications sent:', results);

    // Save notification to database
    await Notification.create({
      userId: userId,
      title: notification.notification.title,
      body: notification.notification.body,
      data: notification.data,
      sentAt: new Date()
    });

  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Send notification to multiple users
async function sendNotificationToMultipleUsers(userIds: string[], notification: NotificationPayload) {
  const promises = userIds.map(userId => sendNotificationToUser(userId, notification));
  await Promise.allSettled(promises);
}

// Send notification to all users (broadcast)
async function broadcastNotification(notification: NotificationPayload) {
  try {
    const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } });
    const userIds = users.map(user => user._id.toString());
    await sendNotificationToMultipleUsers(userIds, notification);
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
}
*/

export {
  newLessonNotification,
  assignmentDueNotification,
  quizResultsNotification,
  announcementNotification
};
