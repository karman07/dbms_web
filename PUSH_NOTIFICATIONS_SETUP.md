# Push Notifications - Frontend Setup Guide

## Overview

This guide explains how to set up and use push notifications in the DBMS Course Hub application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing Notifications](#testing-notifications)
5. [Components Overview](#components-overview)
6. [API Integration](#api-integration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 16+ installed
- Firebase project created (already configured in this project)
- Backend API running with notification endpoints
- HTTPS connection (required for service workers in production)

---

## Firebase Setup

### 1. Get Your VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dbms-website-ec1e6`
3. Navigate to **Project Settings** (gear icon) → **Cloud Messaging**
4. Scroll down to **Web Push certificates**
5. If no key pair exists, click **Generate key pair**
6. Copy the **Key pair** value (this is your VAPID key)

### 2. Update Environment Variables

Open your `.env` file and add the VAPID key:

```env
VITE_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

Replace `YOUR_VAPID_KEY_HERE` with the key you copied from Firebase Console.

---

## Environment Configuration

### Required Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=dbms-website-ec1e6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dbms-website-ec1e6
VITE_FIREBASE_STORAGE_BUCKET=dbms-website-ec1e6.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Cloud Messaging VAPID Key (CRITICAL!)
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### Get Firebase Credentials

All Firebase credentials can be found in:
**Firebase Console** → **Project Settings** → **General** → **Your apps** → **Web app**

---

## Installation

No additional packages needed! Firebase is already installed in this project.

If you need to verify, these packages should be in `package.json`:
- `firebase` (version 10+)

---

## Testing Notifications

### 1. Start the Application

```bash
npm run dev
```

### 2. Login to Your Account

- Navigate to the homepage
- Click "Sign In" and login with your credentials
- You must be logged in to receive notifications

### 3. Grant Notification Permission

**Option A: Automatic (on login)**
- Notifications will auto-request permission when you login (if permission not already granted)

**Option B: Manual**
- Click the notification bell icon in the header
- Or navigate to `/notification-settings`
- Click "Request Permission" button

### 4. Test Sending Notifications

Use the backend API to send a test notification:

```bash
curl -X POST http://localhost:3000/notifications/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test push notification!",
    "data": {
      "action": "view_course",
      "courseId": "123"
    }
  }'
```

### 5. Expected Behavior

**When app is open (foreground):**
- Browser notification appears
- Notification bell badge updates
- Notification appears in dropdown

**When app is in background/closed:**
- Browser notification appears
- Clicking notification opens the app
- Deep linking works (e.g., opens specific course)

---

## Components Overview

### 1. **NotificationBell Component**
Location: `src/components/NotificationBell.tsx`

**Features:**
- Shows unread notification count
- Dropdown with recent notifications
- Mark as read functionality
- Deep linking to relevant pages

**Usage:**
```tsx
import NotificationBell from '@/components/NotificationBell';

<NotificationBell />
```

Already integrated in `Header.tsx` for logged-in users.

### 2. **NotificationSettingsPage**
Location: `src/pages/NotificationSettingsPage.tsx`

**Features:**
- Permission status display
- Toggle notifications on/off
- Notification history view
- Pagination support
- Mark all as read

**Route:** `/notification-settings`

### 3. **useNotifications Hook**
Location: `src/hooks/useNotifications.ts`

**Features:**
- Request permission
- Toggle notifications
- Remove token (on logout)
- Listen for new notifications

**Usage:**
```tsx
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { 
    permission, 
    isEnabled, 
    requestPermission, 
    toggleNotifications 
  } = useNotifications();
  
  // Use the hook methods...
}
```

### 4. **NotificationService**
Location: `src/services/notification.service.ts`

**API Methods:**
- `requestPermission()` - Request notification permission and get FCM token
- `registerToken(token)` - Register FCM token with backend
- `removeToken(token)` - Remove token on logout
- `toggleNotifications(enabled)` - Enable/disable notifications
- `getNotificationHistory(page, limit)` - Get notification history
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `setupForegroundListener(callback)` - Listen for foreground notifications

---

## API Integration

### Backend Endpoints Required

Your backend must implement these endpoints:

```typescript
// Register FCM token
POST /notifications/register-token
Body: { fcmToken: string }
Headers: { Authorization: "Bearer JWT_TOKEN" }

// Remove FCM token (on logout)
DELETE /notifications/remove-token
Body: { fcmToken: string }
Headers: { Authorization: "Bearer JWT_TOKEN" }

// Toggle notifications
POST /notifications/toggle
Body: { enabled: boolean }
Headers: { Authorization: "Bearer JWT_TOKEN" }

// Get notification history
GET /notifications/history?page=1&limit=20
Headers: { Authorization: "Bearer JWT_TOKEN" }

// Mark as read
PATCH /notifications/:notificationId/read
Headers: { Authorization: "Bearer JWT_TOKEN" }

// Mark all as read
PATCH /notifications/read-all
Headers: { Authorization: "Bearer JWT_TOKEN" }
```

### Notification Payload Format

```typescript
{
  notification: {
    title: "Course Update",
    body: "New lesson available in DBMS course",
    image?: "https://example.com/image.jpg"
  },
  data: {
    action: "view_course",  // or "view_assignment", "view_quiz"
    courseId: "123",
    deepLink?: "/course/123"
  }
}
```

---

## Deep Linking

The application supports deep linking from notifications:

### Supported Actions

1. **View Course**
```json
{
  "action": "view_course",
  "courseId": "123"
}
// Redirects to: /course/123
```

2. **View Assignment**
```json
{
  "action": "view_assignment",
  "assignmentId": "456"
}
// Redirects to: /assignments/456
```

3. **View Quiz**
```json
{
  "action": "view_quiz",
  "quizId": "789"
}
// Redirects to: /quizzes/789
```

4. **Custom Deep Link**
```json
{
  "deepLink": "/custom/path"
}
// Redirects to: /custom/path
```

---

## Service Worker

Location: `public/firebase-messaging-sw.js`

**Handles:**
- Background notifications (when app is closed/minimized)
- Notification clicks
- Deep linking from background state

**Important:** 
- Must be in `public/` folder
- Must be named `firebase-messaging-sw.js`
- Automatically registered by Firebase SDK

---

## Troubleshooting

### Notifications Not Appearing

**1. Check Browser Permissions**
- Open browser settings
- Check that notifications are allowed for your site
- Try in incognito mode to test fresh permissions

**2. Check Console for Errors**
- Open browser DevTools (F12)
- Look for Firebase or notification-related errors
- Common error: "Missing VAPID key"

**3. Verify Service Worker**
- Open DevTools → Application → Service Workers
- Verify `firebase-messaging-sw.js` is registered
- Check for service worker errors

**4. Check HTTPS**
- Service workers require HTTPS (except localhost)
- In production, ensure your site uses HTTPS

### Token Not Registering

**1. Check Authentication**
- Ensure user is logged in
- Verify JWT token exists in localStorage
- Check backend API is running

**2. Check Network Requests**
- Open DevTools → Network tab
- Look for `/notifications/register-token` request
- Check for 401 or 403 errors

**3. Check VAPID Key**
- Verify `VITE_FIREBASE_VAPID_KEY` is set
- Ensure key matches Firebase Console
- Restart dev server after changing .env

### Notifications Work in Dev but Not Production

**1. HTTPS Required**
- Production must use HTTPS
- Service workers don't work on HTTP (except localhost)

**2. Check Environment Variables**
- Verify all VITE_* variables are set in production
- Check build process includes .env variables

**3. Rebuild Application**
```bash
npm run build
```

### Testing in Different Browsers

**Chrome/Edge:**
- Full support ✅
- Best for testing

**Firefox:**
- Full support ✅

**Safari (macOS 13+):**
- Limited support ⚠️
- May require additional configuration

**Safari (iOS):**
- No support for web push ❌
- Use native iOS app instead

---

## Best Practices

### 1. Request Permission Appropriately
- Don't request permission immediately on load
- Show value proposition first
- Request after user action (login, settings)

### 2. Handle Errors Gracefully
```typescript
try {
  await notificationService.requestPermission();
} catch (error) {
  // Show user-friendly error message
  console.error('Failed to setup notifications:', error);
}
```

### 3. Clean Up on Logout
```typescript
const handleLogout = async () => {
  await notificationService.removeToken();
  // ... rest of logout logic
};
```

### 4. Test All States
- Foreground (app open)
- Background (app minimized)
- Closed (app not running)
- Different browsers

---

## Security Considerations

1. **Never expose sensitive data in notifications**
   - Don't include passwords, tokens, or private info
   - Use generic messages with deep links

2. **Validate on Backend**
   - Always validate JWT tokens
   - Verify user permissions before sending
   - Rate limit notification endpoints

3. **HTTPS Only in Production**
   - Never deploy without HTTPS
   - Service workers require secure context

---

## Additional Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## Support

For backend notification API documentation, see:
- Backend API `/notifications` endpoints
- Backend notification service implementation

For issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test in different browsers
4. Check Firebase Console for delivery logs

---

## Quick Start Checklist

- [ ] Get VAPID key from Firebase Console
- [ ] Update `.env` with VAPID key
- [ ] Restart development server
- [ ] Login to application
- [ ] Grant notification permission
- [ ] Send test notification from backend
- [ ] Verify notification appears
- [ ] Test notification click (deep linking)
- [ ] Test mark as read functionality
- [ ] Test notification settings page

---

**Last Updated:** February 2026
**Version:** 1.0.0
