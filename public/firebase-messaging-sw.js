/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyC1s2QuO---O0TYz9_BbqBZO-_gAbEhXMM",
  authDomain: "dbms-website-ec1e6.firebaseapp.com",
  projectId: "dbms-website-ec1e6",
  storageBucket: "dbms-website-ec1e6.firebasestorage.app",
  messagingSenderId: "256129501755",
  appId: "1:256129501755:web:38bdf6897368275dbaea1e",
  measurementId: "G-8EHKRQWFT6"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.image || '/logo.png',
    badge: '/logo.png',
    data: payload.data || {},
    tag: payload.data?.notificationId || 'default',
    requireInteraction: false,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click in background/closed state
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  const data = event.notification.data;
  let urlToOpen = '/';

  // Handle deep linking based on action type
  if (data.action === 'view_course' && data.courseId) {
    urlToOpen = `/course/${data.courseId}`;
  } else if (data.action === 'view_assignment' && data.assignmentId) {
    urlToOpen = `/assignments/${data.assignmentId}`;
  } else if (data.action === 'view_quiz' && data.quizId) {
    urlToOpen = `/quizzes/${data.quizId}`;
  } else if (data.deepLink) {
    urlToOpen = data.deepLink;
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Optional: Handle push event
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
});
