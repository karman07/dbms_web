import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2, Check, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import notificationService, { NotificationHistoryItem } from '@/services/notification.service';

const NotificationSettingsPage: React.FC = () => {
  const {
    permission,
    isEnabled,
    isLoading,
    isSupported,
    requestPermission,
    toggleNotifications,
  } = useNotifications();

  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotificationHistory(currentPage, 10);
      setHistory(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load notification history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      if (permission !== 'granted') {
        await requestPermission();
      }
      await toggleNotifications(true);
    } catch (err) {
      console.error('Error enabling notifications:', err);
      setError('Failed to enable notifications');
    }
  };

  const handleDisableNotifications = async () => {
    try {
      await toggleNotifications(false);
    } catch (err) {
      console.error('Error disabling notifications:', err);
      setError('Failed to disable notifications');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setHistory((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, readAt: new Date().toISOString() } : notif
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Refresh history
      await loadHistory();
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all as read');
    }
  };

  const getPermissionStatusColor = () => {
    switch (permission) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getPermissionStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      default:
        return 'Not Set';
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <BellOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Notifications Not Supported
            </h2>
            <p className="text-gray-600">
              Your browser doesn't support push notifications. Please use a modern browser like
              Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Notification Settings
          </h1>
          <p className="text-gray-600">Manage your push notification preferences</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <X className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-3"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Permission Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Permission Status</h2>
              <p className="text-gray-600">Current notification permission state</p>
            </div>
            <Bell className="w-8 h-8 text-blue-600" />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
            <span className="font-medium text-gray-700">Browser Permission:</span>
            <span className={`font-bold ${getPermissionStatusColor()}`}>
              {getPermissionStatusText()}
            </span>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Requesting Permission...
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5 mr-2" />
                  Request Permission
                </>
              )}
            </button>
          )}
        </div>

        {/* Toggle Notifications Card */}
        {permission === 'granted' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification Controls</h2>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {isEnabled ? (
                  <Bell className="w-6 h-6 text-blue-600 mr-3" />
                ) : (
                  <BellOff className="w-6 h-6 text-gray-400 mr-3" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">Push Notifications</p>
                  <p className="text-sm text-gray-600">
                    {isEnabled ? 'Currently enabled' : 'Currently disabled'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) =>
                    e.target.checked ? handleEnableNotifications() : handleDisableNotifications()
                  }
                  disabled={isLoading}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Notification History Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Notification History</h2>
              <p className="text-gray-600 text-sm">View your recent notifications</p>
            </div>
            {history.some((n) => !n.readAt) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-gray-400 text-sm">
                You'll see your notifications here when you receive them
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border-2 transition-all ${notification.readAt
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 mb-1">{notification.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{notification.body}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(notification.sentAt || notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.readAt && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="ml-3 text-blue-600 hover:text-blue-700 flex-shrink-0"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
