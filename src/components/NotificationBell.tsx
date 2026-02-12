import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import notificationService, { NotificationHistoryItem } from '@/services/notification.service';
import { Link } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const { latestNotification, clearLatestNotification } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Update when new notification arrives
  useEffect(() => {
    if (latestNotification) {
      setUnreadCount((prev) => prev + 1);
      loadNotifications();
      clearLatestNotification();
    }
  }, [latestNotification, clearLatestNotification]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const data = await notificationService.getNotificationHistory(1, 5);
      setNotifications(data.data);

      // Calculate unread count
      const unread = data.data.filter((n) => !n.readAt).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, readAt: new Date().toISOString() } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, readAt: notif.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationLink = (notification: NotificationHistoryItem): string => {
    const data = notification.data;

    if (!data) return '#';

    if (data.action === 'view_course' && data.courseId) {
      return `/course/${data.courseId}`;
    } else if (data.action === 'view_assignment' && data.assignmentId) {
      return `/assignments/${data.assignmentId}`;
    } else if (data.action === 'view_quiz' && data.quizId) {
      return `/quizzes/${data.quizId}`;
    } else if (data.deepLink) {
      return data.deepLink;
    }

    return '#';
  };

  const handleNotificationClick = (notification: NotificationHistoryItem) => {
    if (!notification.readAt) {
      handleMarkAsRead(notification._id);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  No notifications
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const isUnread = !notification.readAt;

                  const notificationContent = (
                    <div
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${isUnread ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isUnread && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                            <h4
                              className={`text-sm font-semibold text-gray-800 dark:text-white truncate ${isUnread ? 'font-bold' : ''
                                }`}
                            >
                              {notification.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(notification.sentAt || notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {isUnread && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0 p-1"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );

                  return link && link !== '#' ? (
                    <Link key={notification._id} to={link}>
                      {notificationContent}
                    </Link>
                  ) : (
                    <div key={notification._id}>{notificationContent}</div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/notifications"
                onClick={() => setShowDropdown(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                View all notifications
              </Link>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
