import { messaging, getToken, onMessage } from '@/lib/firebase';
import axiosInstance from '@/lib/axios';

// VAPID Key - Get this from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
//const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BBHqca9yH9z9fgHuaVapELGuA2p7WhHX9LMSi0L3N7E3SkQG_51IjJ8wdxjZ-EAIoNmyd-2gj97UU4xVMwWMsqnE';

export interface NotificationPayload {
  notification?: {
    title: string;
    body: string;
    image?: string;
  };
  data?: {
    [key: string]: string;
  };
}

export interface NotificationHistoryItem {
  _id: string;
  title: string;
  body: string;
  sentAt: string;
  readAt?: string;
  data?: {
    action?: string;
    courseId?: string;
    assignmentId?: string;
    quizId?: string;
    deepLink?: string;
    [key: string]: string | undefined;
  };
}

export interface NotificationHistoryResponse {
  success: boolean;
  data: NotificationHistoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    limit: number;
  };
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

class NotificationService {
  private token: string | null = null;
  private foregroundListeners: Array<(payload: NotificationPayload) => void> = [];
  private readonly READ_NOTIFICATIONS_KEY = 'read_notification_ids';

  /**
   * Request notification permission and get FCM token
   */
  async requestPermission(): Promise<string | null> {
    try {
      if (!messaging) {
        console.warn('Firebase Messaging not supported');
        return null;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Notification permission granted');

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        if (token) {
          console.log('FCM Token obtained:', token);
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

  /**
   * Register FCM token with backend
   */
  async registerToken(fcmToken: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        '/notifications/register-token',
        { fcmToken }
      );

      console.log('Token registered with backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error registering token:', error);
      throw error;
    }
  }

  /**
   * Remove FCM token from backend (on logout)
   */
  async removeToken(fcmToken?: string): Promise<ApiResponse> {
    try {
      const tokenToRemove = fcmToken || this.token;
      if (!tokenToRemove) {
        throw new Error('No token to remove');
      }

      const response = await axiosInstance.delete<ApiResponse>(
        '/notifications/remove-token',
        { data: { fcmToken: tokenToRemove } }
      );

      console.log('Token removed from backend:', response.data);
      this.token = null;
      return response.data;
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  /**
   * Enable/disable notifications
   */
  async toggleNotifications(enabled: boolean): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        '/notifications/toggle',
        { enabled }
      );

      console.log('Notifications toggled:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      throw error;
    }
  }

  /**
   * Setup listener for foreground messages
   */
  setupForegroundListener(callback: (payload: NotificationPayload) => void): (() => void) {
    if (!messaging) {
      console.warn('Firebase Messaging not supported');
      return () => { };
    }

    // Add callback to listeners
    this.foregroundListeners.push(callback);

    // Setup Firebase onMessage listener
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);

      // Show notification
      this.showNotification(payload as NotificationPayload);

      // Call all registered callbacks
      this.foregroundListeners.forEach((listener) => {
        listener(payload as NotificationPayload);
      });
    });

    // Return unsubscribe function
    return () => {
      const index = this.foregroundListeners.indexOf(callback);
      if (index > -1) {
        this.foregroundListeners.splice(index, 1);
      }
      unsubscribe();
    };
  }

  /**
   * Show browser notification
   */
  showNotification(payload: NotificationPayload): void {
    const { title = 'New Notification', body = '', image } = payload.notification || {};
    const data = payload.data || {};

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: image || '/logo.png',
        badge: '/logo.png',
        tag: data.notificationId || 'default',
        requireInteraction: false,
        data: data,
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Handle deep linking
        if (data.action === 'view_course' && data.courseId) {
          window.location.href = `/course/${data.courseId}`;
        } else if (data.action === 'view_assignment' && data.assignmentId) {
          window.location.href = `/assignments/${data.assignmentId}`;
        } else if (data.action === 'view_quiz' && data.quizId) {
          window.location.href = `/quizzes/${data.quizId}`;
        } else if (data.deepLink) {
          window.location.href = data.deepLink;
        }

        notification.close();
      };
    }
  }

  /**
   * Get notification history (with local read status merge)
   */
  async getNotificationHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationHistoryResponse> {
    try {
      const response = await axiosInstance.get<NotificationHistoryResponse>(
        '/notifications/history',
        {
          params: { page, limit },
        }
      );

      // Merge with local read status
      const readIds = this.getReadNotificationsLocal();
      const mergedData = response.data.data.map(notif => {
        if (readIds.includes(notif._id)) {
          return { ...notif, readAt: notif.readAt || new Date().toISOString() };
        }
        return notif;
      });

      return {
        ...response.data,
        data: mergedData
      };
    } catch (error) {
      console.error('Error fetching notification history:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read (Updates both local and remote)
   */
  async markAsRead(notificationId: string): Promise<ApiResponse> {
    // Update local first for immediate UI response
    this.markAsReadLocal(notificationId);

    try {
      const response = await axiosInstance.patch<ApiResponse>(
        `/notifications/${notificationId}/read`
      );

      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // We don't throw here to allow local-only fallback
      return { success: true, message: 'Marked as read locally' };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse> {
    try {
      // Get all current notifications to mark them as read locally
      const response = await axiosInstance.get<NotificationHistoryResponse>(
        '/notifications/history',
        { params: { page: 1, limit: 100 } }
      );

      if (response.data.success) {
        const ids = response.data.data.map(n => n._id);
        this.markAllAsReadLocal(ids);
      }

      const patchResponse = await axiosInstance.patch<ApiResponse>(
        '/notifications/read-all'
      );

      return patchResponse.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Fallback to local only for current notifications isn't perfect but better than nothing
      return { success: true, message: 'Marked all as read locally' };
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return !!messaging && 'Notification' in window;
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // --- Local Read Status Management ---

  private getReadNotificationsLocal(): string[] {
    try {
      const stored = localStorage.getItem(this.READ_NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private markAsReadLocal(id: string): void {
    const readIds = this.getReadNotificationsLocal();
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(this.READ_NOTIFICATIONS_KEY, JSON.stringify(readIds));
    }
  }

  private markAllAsReadLocal(ids: string[]): void {
    const readIds = this.getReadNotificationsLocal();
    const newReadIds = Array.from(new Set([...readIds, ...ids]));
    localStorage.setItem(this.READ_NOTIFICATIONS_KEY, JSON.stringify(newReadIds));
  }
}

export default new NotificationService();
