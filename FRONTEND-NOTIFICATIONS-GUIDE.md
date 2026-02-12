# Push Notifications - Frontend Implementation Guide

## Overview

This guide explains how to integrate push notifications in your frontend applications (Web, iOS, Android) with the DBMS backend API.

## Table of Contents

1. [Web (React/Vue/Angular)](#web-implementation)
2. [Android (Kotlin/Java)](#android-implementation)
3. [iOS (Swift)](#ios-implementation)
4. [React Native](#react-native-implementation)
5. [API Integration](#api-integration)
6. [UI Components](#ui-components)
7. [Best Practices](#best-practices)

---

## Web Implementation

### 1. Setup Firebase for Web

#### Install Firebase SDK

```bash
npm install firebase
```

#### Initialize Firebase

Create `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "dbms-website-ec1e6.firebaseapp.com",
  projectId: "dbms-website-ec1e6",
  storageBucket: "dbms-website-ec1e6.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

### 2. Request Permission and Get Token

Create `src/services/notificationService.js`:

```javascript
import { messaging, getToken, onMessage } from '../config/firebase';
import axios from 'axios';

const VAPID_KEY = 'YOUR_VAPID_KEY'; // Get from Firebase Console
const API_BASE_URL = 'http://localhost:3000';

class NotificationService {
  constructor() {
    this.token = null;
  }

  // Request permission and register token
  async requestPermission() {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        
        if (token) {
          console.log('FCM Token:', token);
          this.token = token;
          
          // Register token with backend
          await this.registerToken(token);
          
          return token;
        } else {
          console.log('No registration token available');
          return null;
        }
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      throw error;
    }
  }

  // Register token with backend
  async registerToken(token) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notifications/register-token`,
        { fcmToken: token },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Token registered with backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error registering token:', error);
      throw error;
    }
  }

  // Remove token from backend (on logout)
  async removeToken(token) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/notifications/remove-token`,
        {
          data: { fcmToken: token },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Token removed from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  // Enable/disable notifications
  async toggleNotifications(enabled) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notifications/toggle`,
        { enabled },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Notifications toggled:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      throw error;
    }
  }

  // Listen for foreground messages
  setupForegroundListener(callback) {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show notification
      this.showNotification(payload);
      
      // Call callback if provided
      if (callback) {
        callback(payload);
      }
    });
  }

  // Show browser notification
  showNotification(payload) {
    const { title, body, image } = payload.notification || {};
    const data = payload.data || {};
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: image || '/logo192.png',
        badge: '/badge-icon.png',
        tag: data.notificationId || 'default',
        requireInteraction: false,
        data: data
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Handle deep linking
        if (data.action === 'view_course' && data.courseId) {
          window.location.href = `/courses/${data.courseId}`;
        } else if (data.deepLink) {
          window.location.href = data.deepLink;
        }
        
        notification.close();
      };
    }
  }

  // Get notification history
  async getNotificationHistory(page = 1, limit = 20) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/history`,
        {
          params: { page, limit },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching notification history:', error);
      throw error;
    }
  }
}

export default new NotificationService();
```

### 3. Service Worker (for background notifications)

Create `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "dbms-website-ec1e6.firebaseapp.com",
  projectId: "dbms-website-ec1e6",
  storageBucket: "dbms-website-ec1e6.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/logo192.png',
    badge: '/badge-icon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click in background
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data;
  let urlToOpen = '/';
  
  // Handle deep linking
  if (data.action === 'view_course' && data.courseId) {
    urlToOpen = `/courses/${data.courseId}`;
  } else if (data.deepLink) {
    urlToOpen = data.deepLink;
  }
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
```

### 4. React Hook for Notifications

Create `src/hooks/useNotifications.js`:

```javascript
import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

export const useNotifications = () => {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);
  const [latestNotification, setLatestNotification] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const jwtToken = localStorage.getItem('jwt_token');
    if (!jwtToken) return;

    // Request permission and setup
    const initializeNotifications = async () => {
      try {
        const fcmToken = await notificationService.requestPermission();
        setToken(fcmToken);
        setPermission(Notification.permission);
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Setup foreground listener
    notificationService.setupForegroundListener((payload) => {
      setLatestNotification(payload);
    });
  }, []);

  const requestPermission = async () => {
    const fcmToken = await notificationService.requestPermission();
    setToken(fcmToken);
    setPermission(Notification.permission);
    return fcmToken;
  };

  const toggleNotifications = async (enabled) => {
    await notificationService.toggleNotifications(enabled);
    setIsEnabled(enabled);
  };

  const removeToken = async () => {
    if (token) {
      await notificationService.removeToken(token);
      setToken(null);
    }
  };

  return {
    token,
    permission,
    latestNotification,
    isEnabled,
    requestPermission,
    toggleNotifications,
    removeToken
  };
};
```

### 5. React Component Example

```javascript
import React, { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import notificationService from '../services/notificationService';

function NotificationSettings() {
  const { 
    permission, 
    isEnabled, 
    requestPermission, 
    toggleNotifications 
  } = useNotifications();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotificationHistory();
      setHistory(data.data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (permission !== 'granted') {
      await requestPermission();
    } else {
      await toggleNotifications(true);
    }
  };

  const handleDisableNotifications = async () => {
    await toggleNotifications(false);
  };

  return (
    <div className="notification-settings">
      <h2>Notification Settings</h2>
      
      <div className="permission-status">
        <p>Permission Status: <strong>{permission}</strong></p>
        {permission !== 'granted' && (
          <button onClick={requestPermission}>
            Request Permission
          </button>
        )}
      </div>

      <div className="toggle-notifications">
        <label>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => 
              e.target.checked 
                ? handleEnableNotifications() 
                : handleDisableNotifications()
            }
          />
          Enable Push Notifications
        </label>
      </div>

      <div className="notification-history">
        <h3>Notification History</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {history.map((notification) => (
              <li key={notification._id}>
                <h4>{notification.title}</h4>
                <p>{notification.body}</p>
                <small>{new Date(notification.sentAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NotificationSettings;
```

---

## Android Implementation

### 1. Setup Firebase for Android

#### Add Dependencies

In `app/build.gradle`:

```gradle
dependencies {
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
    implementation 'com.google.firebase:firebase-messaging-ktx'
    
    // Retrofit for API calls
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
}
```

### 2. Create Notification Service

Create `services/NotificationApiService.kt`:

```kotlin
import retrofit2.Response
import retrofit2.http.*

data class RegisterTokenRequest(val fcmToken: String)
data class ToggleNotificationsRequest(val enabled: Boolean)
data class ApiResponse(val success: Boolean, val message: String)

interface NotificationApiService {
    @POST("notifications/register-token")
    suspend fun registerToken(
        @Header("Authorization") token: String,
        @Body request: RegisterTokenRequest
    ): Response<ApiResponse>

    @HTTP(method = "DELETE", path = "notifications/remove-token", hasBody = true)
    suspend fun removeToken(
        @Header("Authorization") token: String,
        @Body request: RegisterTokenRequest
    ): Response<ApiResponse>

    @POST("notifications/toggle")
    suspend fun toggleNotifications(
        @Header("Authorization") token: String,
        @Body request: ToggleNotificationsRequest
    ): Response<ApiResponse>
}
```

### 3. Firebase Messaging Service

Create `services/MyFirebaseMessagingService.kt`:

```kotlin
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        
        // Send token to backend
        CoroutineScope(Dispatchers.IO).launch {
            registerTokenWithBackend(token)
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        
        // Handle notification
        message.notification?.let { notification ->
            showNotification(
                title = notification.title ?: "New Notification",
                body = notification.body ?: "",
                data = message.data
            )
        }
    }

    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "default_channel"

        // Create notification channel (Android 8.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Default Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Push notifications from DBMS platform"
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Create intent for notification click
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            
            // Handle deep linking
            when (data["action"]) {
                "view_course" -> {
                    putExtra("courseId", data["courseId"])
                    putExtra("screen", "course_detail")
                }
                "view_assignment" -> {
                    putExtra("assignmentId", data["assignmentId"])
                    putExtra("screen", "assignment_detail")
                }
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Build notification
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.drawable.ic_notification)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun registerTokenWithBackend(token: String) {
        // Implement API call to register token
        // Use the NotificationApiService
    }
}
```

### 4. Register Service in AndroidManifest.xml

```xml
<service
    android:name=".services.MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

### 5. MainActivity Integration

```kotlin
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await

class MainActivity : AppCompatActivity() {

    private lateinit var notificationApi: NotificationApiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize API
        notificationApi = RetrofitClient.createService(NotificationApiService::class.java)
        
        // Get and register FCM token
        registerFCMToken()
        
        // Handle notification intent
        handleNotificationIntent(intent)
    }

    private fun registerFCMToken() {
        lifecycleScope.launch {
            try {
                val token = FirebaseMessaging.getInstance().token.await()
                Log.d("FCM", "Token: $token")
                
                // Register with backend
                val jwtToken = getJwtToken() // Get from SharedPreferences
                val response = notificationApi.registerToken(
                    "Bearer $jwtToken",
                    RegisterTokenRequest(token)
                )
                
                if (response.isSuccessful) {
                    Log.d("FCM", "Token registered successfully")
                } else {
                    Log.e("FCM", "Failed to register token")
                }
            } catch (e: Exception) {
                Log.e("FCM", "Error getting token", e)
            }
        }
    }

    private fun handleNotificationIntent(intent: Intent) {
        when (intent.getStringExtra("screen")) {
            "course_detail" -> {
                val courseId = intent.getStringExtra("courseId")
                // Navigate to course detail
            }
            "assignment_detail" -> {
                val assignmentId = intent.getStringExtra("assignmentId")
                // Navigate to assignment detail
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { handleNotificationIntent(it) }
    }
}
```

---

## iOS Implementation

### 1. Setup Firebase for iOS

#### Install Firebase via CocoaPods

In `Podfile`:

```ruby
pod 'Firebase/Messaging'
```

Run:
```bash
pod install
```

### 2. Configure AppDelegate

```swift
import UIKit
import Firebase
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Configure Firebase
        FirebaseApp.configure()
        
        // Set messaging delegate
        Messaging.messaging().delegate = self
        
        // Request notification permission
        UNUserNotificationCenter.current().delegate = self
        
        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
        UNUserNotificationCenter.current().requestAuthorization(
            options: authOptions,
            completionHandler: { granted, error in
                if granted {
                    print("Notification permission granted")
                }
            }
        )
        
        application.registerForRemoteNotifications()
        
        return true
    }

    // Called when FCM token is updated
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let fcmToken = fcmToken else { return }
        
        print("Firebase token: \(fcmToken)")
        
        // Register with backend
        registerTokenWithBackend(fcmToken)
    }

    // Handle notifications in foreground
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        
        let userInfo = notification.request.content.userInfo
        print("Foreground notification: \(userInfo)")
        
        // Show notification even in foreground
        completionHandler([[.banner, .sound, .badge]])
    }

    // Handle notification tap
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        
        let userInfo = response.notification.request.content.userInfo
        
        // Handle deep linking
        if let action = userInfo["action"] as? String {
            switch action {
            case "view_course":
                if let courseId = userInfo["courseId"] as? String {
                    navigateToCourse(courseId)
                }
            case "view_assignment":
                if let assignmentId = userInfo["assignmentId"] as? String {
                    navigateToAssignment(assignmentId)
                }
            default:
                break
            }
        }
        
        completionHandler()
    }

    private func registerTokenWithBackend(_ token: String) {
        guard let jwtToken = UserDefaults.standard.string(forKey: "jwt_token") else { return }
        
        let url = URL(string: "http://localhost:3000/notifications/register-token")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(jwtToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["fcmToken": token]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error registering token: \(error)")
                return
            }
            print("Token registered successfully")
        }.resume()
    }

    private func navigateToCourse(_ courseId: String) {
        // Implement navigation
    }

    private func navigateToAssignment(_ assignmentId: String) {
        // Implement navigation
    }
}
```

### 3. SwiftUI View for Notification Settings

```swift
import SwiftUI

struct NotificationSettingsView: View {
    @State private var notificationsEnabled = true
    @State private var notifications: [NotificationItem] = []
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Settings")) {
                    Toggle("Push Notifications", isOn: $notificationsEnabled)
                        .onChange(of: notificationsEnabled) { value in
                            toggleNotifications(enabled: value)
                        }
                }
                
                Section(header: Text("History")) {
                    if isLoading {
                        ProgressView()
                    } else {
                        ForEach(notifications) { notification in
                            VStack(alignment: .leading, spacing: 8) {
                                Text(notification.title)
                                    .font(.headline)
                                Text(notification.body)
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                                Text(notification.sentAt, style: .relative)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .navigationTitle("Notifications")
            .onAppear {
                loadNotificationHistory()
            }
        }
    }
    
    func toggleNotifications(enabled: Bool) {
        guard let jwtToken = UserDefaults.standard.string(forKey: "jwt_token") else { return }
        
        let url = URL(string: "http://localhost:3000/notifications/toggle")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(jwtToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["enabled": enabled]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request).resume()
    }
    
    func loadNotificationHistory() {
        isLoading = true
        // Implement API call to fetch history
        // Parse and set notifications array
        isLoading = false
    }
}

struct NotificationItem: Identifiable {
    let id: String
    let title: String
    let body: String
    let sentAt: Date
}
```

---

## React Native Implementation

### 1. Install Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install @react-native-async-storage/async-storage axios
```

### 2. Request Permission and Register Token

```javascript
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Register with backend
      await registerToken(token);
      
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
    throw error;
  }
};

export const registerToken = async (fcmToken) => {
  try {
    const jwtToken = await AsyncStorage.getItem('jwt_token');
    
    const response = await axios.post(
      `${API_BASE_URL}/notifications/register-token`,
      { fcmToken },
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Token registered:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering token:', error);
    throw error;
  }
};

export const setupNotificationListeners = (navigation) => {
  // Foreground messages
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage);
    
    // Show alert or custom notification
    Alert.alert(
      remoteMessage.notification?.title,
      remoteMessage.notification?.body
    );
  });

  // Background/Quit state messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background notification:', remoteMessage);
  });

  // Notification opened app
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app:', remoteMessage);
    handleNotification(remoteMessage, navigation);
  });

  // Check if app was opened from notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from notification:', remoteMessage);
        handleNotification(remoteMessage, navigation);
      }
    });

  return unsubscribe;
};

const handleNotification = (message, navigation) => {
  const data = message.data;
  
  if (data.action === 'view_course' && data.courseId) {
    navigation.navigate('CourseDetail', { courseId: data.courseId });
  } else if (data.action === 'view_assignment' && data.assignmentId) {
    navigation.navigate('AssignmentDetail', { assignmentId: data.assignmentId });
  }
};
```

### 3. React Native Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, FlatList, StyleSheet } from 'react-native';
import { requestNotificationPermission } from '../services/notificationService';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationSettings = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeNotifications();
    loadHistory();
  }, []);

  const initializeNotifications = async () => {
    await requestNotificationPermission();
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const jwtToken = await AsyncStorage.getItem('jwt_token');
      const response = await axios.get(
        'http://localhost:3000/notifications/history',
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        }
      );
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (value) => {
    try {
      const jwtToken = await AsyncStorage.getItem('jwt_token');
      await axios.post(
        'http://localhost:3000/notifications/toggle',
        { enabled: value },
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setIsEnabled(value);
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.date}>
        {new Date(item.sentAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.toggleRow}>
          <Text>Push Notifications</Text>
          <Switch value={isEnabled} onValueChange={toggleNotifications} />
        </View>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Notification History</Text>
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={loadHistory}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  settingsSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  historySection: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default NotificationSettings;
```

---

## API Integration

### Common API Endpoints

```javascript
const API_BASE_URL = 'http://localhost:3000';

// Register FCM Token
POST /notifications/register-token
Headers: { Authorization: "Bearer JWT_TOKEN" }
Body: { "fcmToken": "string" }

// Remove FCM Token
DELETE /notifications/remove-token
Headers: { Authorization: "Bearer JWT_TOKEN" }
Body: { "fcmToken": "string" }

// Toggle Notifications
POST /notifications/toggle
Headers: { Authorization: "Bearer JWT_TOKEN" }
Body: { "enabled": true/false }

// Get Notification History
GET /notifications/history?page=1&limit=20
Headers: { Authorization: "Bearer JWT_TOKEN" }
```

---

## UI Components

### Notification Bell Component (React)

```javascript
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import notificationService from '../services/notificationService';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
    
    // Setup listener for new notifications
    notificationService.setupForegroundListener((payload) => {
      setUnreadCount(prev => prev + 1);
      loadNotifications();
    });
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotificationHistory(1, 5);
      setNotifications(data.data);
      // Calculate unread count based on your logic
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  return (
    <div className="notification-bell">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
          </div>
          <div className="dropdown-body">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="notification-item">
                  <h4>{notification.title}</h4>
                  <p>{notification.body}</p>
                  <small>{new Date(notification.sentAt).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
```

---

## Best Practices

### 1. Token Management

- ✅ Register token on app launch and after login
- ✅ Remove token on logout
- ✅ Handle token refresh automatically
- ✅ Store token status locally

### 2. Permission Handling

- ✅ Request permission at appropriate time (not immediately on launch)
- ✅ Explain why notifications are useful before requesting
- ✅ Provide UI to enable/disable notifications
- ✅ Handle permission denial gracefully

### 3. User Experience

- ✅ Show notifications even when app is in foreground
- ✅ Handle notification clicks with deep linking
- ✅ Group similar notifications
- ✅ Provide notification history
- ✅ Allow users to control notification preferences

### 4. Error Handling

```javascript
try {
  await notificationService.registerToken(token);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired, redirect to login
  } else if (error.response?.status === 403) {
    // Permission denied
  } else {
    // Show user-friendly error message
    console.error('Failed to register token:', error);
  }
}
```

### 5. Testing

- Test on physical devices (emulators may not receive notifications)
- Test foreground, background, and killed app states
- Test deep linking from notifications
- Test token refresh scenarios
- Test permission flow

### 6. Security

- ✅ Always use HTTPS in production
- ✅ Never expose FCM tokens in logs
- ✅ Validate JWT tokens on backend
- ✅ Implement rate limiting
- ✅ Sanitize notification data on frontend

---

## Troubleshooting

### Notifications not received

1. Check notification permission is granted
2. Verify token is registered with backend
3. Check device/browser notification settings
4. Verify Firebase configuration
5. Check service worker is registered (Web)

### Token registration fails

1. Check JWT token is valid
2. Verify network connection
3. Check API endpoint URL
4. Review backend logs
5. Verify Firebase credentials

### Deep linking not working

1. Check data payload structure
2. Verify navigation logic
3. Test with different app states
4. Check intent filters (Android)
5. Verify URL scheme (iOS)

---

## Next Steps

1. **Implement basic integration** - Start with token registration
2. **Test notifications** - Send test notifications from backend
3. **Add UI components** - Notification bell, settings page
4. **Implement deep linking** - Navigate to specific screens
5. **Add preferences** - Let users control notification types
6. **Test on devices** - Test on real iOS/Android devices
7. **Monitor and optimize** - Track delivery rates and engagement

---

## Support

For backend API documentation, see:
- `PUSH-NOTIFICATIONS-API.md`
- `NOTIFICATIONS-QUICK-START.md`

For issues, check:
- Firebase Console for delivery logs
- Backend server logs
- Browser/app console logs
- Network requests in DevTools
