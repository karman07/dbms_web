import { useState, useEffect, useCallback } from 'react';
import notificationService, { NotificationPayload } from '@/services/notification.service';

export const useNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.isSupported() ? Notification.permission : 'denied'
  );
  const [latestNotification, setLatestNotification] = useState<NotificationPayload | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if messaging is supported
    if (!notificationService.isSupported()) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    // Check if user is logged in
    const jwtToken = localStorage.getItem('token');
    if (!jwtToken) {
      console.log('User not logged in, skipping notification setup');
      return;
    }

    // Initialize notifications state
    const initializeNotifications = async () => {
      setPermission(Notification.permission);
    };

    initializeNotifications();

    // Setup foreground listener
    const unsubscribe = notificationService.setupForegroundListener((payload) => {
      setLatestNotification(payload);
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async () => {
    if (!notificationService.isSupported()) {
      throw new Error('Notifications not supported in this browser');
    }

    try {
      setIsLoading(true);
      const fcmToken = await notificationService.requestPermission();
      setToken(fcmToken);
      setPermission(Notification.permission);
      return fcmToken;
    } catch (error) {
      console.error('Error requesting permission:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Toggle notifications on/off
   */
  const toggleNotifications = useCallback(async (enabled: boolean) => {
    try {
      setIsLoading(true);
      await notificationService.toggleNotifications(enabled);
      setIsEnabled(enabled);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove token (on logout)
   */
  const removeToken = useCallback(async () => {
    if (token) {
      try {
        setIsLoading(true);
        await notificationService.removeToken(token);
        setToken(null);
      } catch (error) {
        console.error('Error removing token:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  }, [token]);

  /**
   * Clear latest notification
   */
  const clearLatestNotification = useCallback(() => {
    setLatestNotification(null);
  }, []);

  return {
    token,
    permission,
    latestNotification,
    isEnabled,
    isLoading,
    isSupported: notificationService.isSupported(),
    requestPermission,
    toggleNotifications,
    removeToken,
    clearLatestNotification,
  };
};
