import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Search,
    ArrowLeft,
    Clock,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService, { NotificationHistoryItem } from '@/services/notification.service';

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotificationHistory(1, 50);
            setNotifications(data.data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, readAt: new Date().toISOString() } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'unread' && !n.readAt) ||
            (filter === 'read' && n.readAt);

        const matchesSearch =
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.body.toLowerCase().includes(search.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getActionLink = (n: NotificationHistoryItem) => {
        if (!n.data) return null;
        if (n.data.action === 'view_course' && n.data.courseId) return `/course/${n.data.courseId}`;
        if (n.data.action === 'view_assignment' && n.data.assignmentId) return `/assignments/${n.data.assignmentId}`;
        if (n.data.action === 'view_quiz' && n.data.quizId) return `/quizzes/${n.data.quizId}`;
        if (n.data.deepLink) return n.data.deepLink;
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Updates</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                        >
                            Mark all read
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        />
                    </div>
                    <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-2xl">
                        {(['all', 'unread', 'read'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === t
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-3xl animate-pulse shadow-sm border border-gray-100 dark:border-gray-800" />
                            ))
                        ) : filteredNotifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-800"
                            >
                                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-full w-fit mx-auto mb-6">
                                    <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nothing to see here</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">No notifications found matching your criteria</p>
                            </motion.div>
                        ) : (
                            filteredNotifications.map((n) => (
                                <motion.div
                                    layout
                                    key={n._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group relative bg-white dark:bg-gray-900 p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${!n.readAt
                                        ? 'border-blue-100 dark:border-blue-900/30 ring-4 ring-blue-50 dark:ring-blue-900/10'
                                        : 'border-transparent dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'
                                        }`}
                                    onClick={() => !n.readAt && handleMarkAsRead(n._id)}
                                >
                                    <div className="flex gap-4">
                                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${!n.readAt ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                            }`}>
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h4 className={`text-lg leading-tight tracking-tight ${!n.readAt ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-600 dark:text-gray-400'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(n.sentAt || n.createdAt).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{new Date(n.sentAt || n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                {!n.readAt && (
                                                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.6)] shrink-0" />
                                                )}
                                            </div>
                                            <p className={`text-sm leading-relaxed ${!n.readAt ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-500'}`}>
                                                {n.body}
                                            </p>

                                            {getActionLink(n) && (
                                                <div className="mt-4 flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(getActionLink(n)!);
                                                        }}
                                                        className="text-xs font-black text-white bg-gray-900 dark:bg-white dark:text-black px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Take Action
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
