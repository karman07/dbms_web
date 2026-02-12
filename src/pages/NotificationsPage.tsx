import React, { useState, useEffect } from 'react';
import {
    Bell,
    BarChart3,
    Filter,
    Search,
    Plus,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    RefreshCcw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { notificationAPI } from '../utils/api';
import {
    Notification,
    NotificationStatus,
    NotificationType,
    NotificationStats
} from '../types/notification';
import SendNotificationDialog from '../components/notifications/SendNotificationDialog';
import NotificationDetailDialog from '../components/notifications/NotificationDetailDialog';

const NotificationsPage: React.FC = () => {
    const [history, setHistory] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit: 10 };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.type = typeFilter;

            const response = await notificationAPI.getHistory(params);
            if (response.success) {
                setHistory(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch notification history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await notificationAPI.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch notification stats:', error);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchStats();
    }, [page, statusFilter, typeFilter]);

    const getStatusIcon = (status: NotificationStatus) => {
        switch (status) {
            case NotificationStatus.SENT:
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case NotificationStatus.FAILED:
                return <XCircle className="w-4 h-4 text-red-500" />;
            case NotificationStatus.PENDING:
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case NotificationStatus.PROCESSING:
                return <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />;
            case NotificationStatus.PARTIALLY_SENT:
                return <AlertCircle className="w-4 h-4 text-orange-500" />;
            default:
                return null;
        }
    };

    const getTypeColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.SYSTEM: return 'bg-slate-100 text-slate-700 border-slate-200';
            case NotificationType.COURSE_UPDATE: return 'bg-blue-100 text-blue-700 border-blue-200';
            case NotificationType.NEW_CONTENT: return 'bg-green-100 text-green-700 border-green-200';
            case NotificationType.ASSIGNMENT_DUE: return 'bg-red-100 text-red-700 border-red-200';
            case NotificationType.QUIZ_AVAILABLE: return 'bg-purple-100 text-purple-700 border-purple-200';
            case NotificationType.ANNOUNCEMENT: return 'bg-orange-100 text-orange-700 border-orange-200';
            case NotificationType.PROMOTION: return 'bg-pink-100 text-pink-700 border-pink-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
                    <p className="text-slate-500 mt-1">Manage, send and track system-wide notifications</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowSendDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6 py-6 rounded-2xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold">Compose New</span>
                    </Button>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Sent', value: stats?.total || 0, icon: Bell, color: 'blue' },
                    { label: 'Success Rate', value: stats?.successRate || '0%', icon: CheckCircle2, color: 'green' },
                    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'yellow' },
                    { label: 'Failed', value: stats?.failed || 0, icon: AlertCircle, color: 'red' },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 bg-${item.color}-50 rounded-2xl`}>
                                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
                            {/* Optional: Add percentage trend here */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center gap-8 px-8 pt-6 border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-4 text-sm font-semibold tracking-wide transition-all relative ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        History
                        {activeTab === 'history' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`pb-4 text-sm font-semibold tracking-wide transition-all relative ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Analytics
                        {activeTab === 'stats' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                </div>

                {activeTab === 'history' ? (
                    <div className="p-8">
                        {/* Filters Row */}
                        <div className="flex flex-col lg:flex-row gap-4 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by title or content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl">
                                    <Filter className="w-4 h-4 text-slate-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-transparent border-none text-sm font-medium text-slate-600 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="sent">Sent</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl">
                                    <Bell className="w-4 h-4 text-slate-400" />
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="bg-transparent border-none text-sm font-medium text-slate-600 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="announcement">Announcements</option>
                                        <option value="system">System</option>
                                        <option value="course_update">Updates</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-slate-100">
                                        <th className="pb-4 font-semibold text-slate-400 text-xs uppercase tracking-widest px-4">Notification</th>
                                        <th className="pb-4 font-semibold text-slate-400 text-xs uppercase tracking-widest px-4">Type</th>
                                        <th className="pb-4 font-semibold text-slate-400 text-xs uppercase tracking-widest px-4">Recipients</th>
                                        <th className="pb-4 font-semibold text-slate-400 text-xs uppercase tracking-widest px-4">Status</th>
                                        <th className="pb-4 font-semibold text-slate-400 text-xs uppercase tracking-widest px-4 text-right">Date</th>
                                        <th className="pb-4 font-semibold text-slate-400 text-xs uppercase tracking-widest px-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="py-8 px-4"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>
                                            </tr>
                                        ))
                                    ) : history.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-slate-50 rounded-full">
                                                        <Bell className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-400 font-medium">No notifications found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : history.map((notif) => (
                                        <tr
                                            key={notif._id}
                                            className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                            onClick={() => setSelectedNotification(notif)}
                                        >
                                            <td className="py-5 px-4">
                                                <div>
                                                    <p className="font-bold text-slate-900 line-clamp-1">{notif.title}</p>
                                                    <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{notif.body}</p>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(notif.type)}`}>
                                                    {notif.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-700">{notif.totalRecipients || 0}</span>
                                                    <span className="text-xs text-slate-400 font-medium">Users</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(notif.status)}
                                                    <span className="text-sm font-medium text-slate-600 capitalize">{notif.status}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-right">
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-slate-100">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-100">
                                <p className="text-sm text-slate-400 font-medium">
                                    Showing page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{pagination.totalPages}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                        className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        disabled={page === pagination.totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                            <div className="p-6 bg-blue-50 rounded-[2rem]">
                                <BarChart3 className="w-12 h-12 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Advanced Analytics</h2>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Detailed reporting and delivery performance tracking will be available soon.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <SendNotificationDialog
                isOpen={showSendDialog}
                onClose={() => setShowSendDialog(false)}
                onSuccess={() => {
                    setShowSendDialog(false);
                    fetchHistory();
                    fetchStats();
                }}
            />

            {selectedNotification && (
                <NotificationDetailDialog
                    notification={selectedNotification}
                    isOpen={!!selectedNotification}
                    onClose={() => setSelectedNotification(null)}
                />
            )}
        </div>
    );
};

export default NotificationsPage;
