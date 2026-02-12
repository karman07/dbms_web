import React, { useState, useEffect } from 'react';
import {
    X,
    Send,
    Users,
    Globe,
    Image as ImageIcon,
    Link as LinkIcon,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import { notificationAPI, userAPI } from '../../utils/api';
import {
    NotificationType,
    NotificationPriority
} from '../../types/notification';
import { User } from '../../types';

interface SendNotificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SendNotificationDialog: React.FC<SendNotificationDialogProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [sendType, setSendType] = useState<'individual' | 'bulk'>('bulk');
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        type: NotificationType.SYSTEM,
        priority: NotificationPriority.NORMAL,
        imageUrl: '',
        action: '',
        deepLink: '',
        userIds: [] as string[],
        sendToAll: true,
        scheduledAt: ''
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await userAPI.getAllUsers();
                setAllUsers(users || []);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            }
        };
        if (isOpen && sendType === 'individual') {
            fetchUsers();
        }
    }, [isOpen, sendType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response;
            const payload: any = {
                title: formData.title,
                body: formData.body,
                type: formData.type,
                priority: formData.priority,
                data: {
                    action: formData.action,
                    deepLink: formData.deepLink
                }
            };

            if (formData.imageUrl) payload.imageUrl = formData.imageUrl;

            if (sendType === 'bulk') {
                payload.sendToAll = formData.sendToAll;
                if (formData.scheduledAt) payload.scheduledAt = formData.scheduledAt;
                response = await notificationAPI.sendBulkNotification(payload);
            } else {
                payload.userIds = formData.userIds;
                response = await notificationAPI.sendNotification(payload);
            }

            if (response.success) {
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
            alert('Failed to send notification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Compose Notification</h2>
                            <p className="text-sm text-slate-500 font-medium">Reach your users instantly</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Send Type Selector */}
                    <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setSendType('bulk')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${sendType === 'bulk'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            Bulk Broadcast
                        </button>
                        <button
                            type="button"
                            onClick={() => setSendType('individual')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${sendType === 'individual'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Targeted Users
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Content */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. New Content Available"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Message Body</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="What would you like to say?"
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Image URL (Optional)</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="url"
                                        placeholder="https://example.com/banner.jpg"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationType })}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 text-sm"
                                    >
                                        {Object.values(NotificationType).map(t => (
                                            <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as NotificationPriority })}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 text-sm"
                                    >
                                        {Object.values(NotificationPriority).map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Interaction (JSON data)</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Deep Link Path (e.g. /courses/123)"
                                            value={formData.deepLink}
                                            onChange={(e) => setFormData({ ...formData, deepLink: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 text-sm"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Action Button Text (e.g. View now)"
                                        value={formData.action}
                                        onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            {sendType === 'individual' ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Recipients</label>
                                    <div className="max-h-40 overflow-y-auto bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                                        {allUsers.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-4">No users found</p>
                                        ) : allUsers.map(user => (
                                            <label key={user._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.userIds.includes(user._id)}
                                                    onChange={(e) => {
                                                        const ids = e.target.checked
                                                            ? [...formData.userIds, user._id]
                                                            : formData.userIds.filter(id => id !== user._id);
                                                        setFormData({ ...formData, userIds: ids });
                                                    }}
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 leading-tight">{user.firstName} {user.lastName}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium uppercase">{user.email}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Scheduling (Optional)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="datetime-local"
                                            value={formData.scheduledAt}
                                            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 text-sm cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-xs font-medium">This will be sent to {sendType === 'bulk' ? 'all eligible users' : `${formData.userIds.length} users`}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="rounded-2xl border-slate-200 px-6 font-bold"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !formData.title || !formData.body || (sendType === 'individual' && formData.userIds.length === 0)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-4 h-auto shadow-lg shadow-blue-600/20 font-bold flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Blast
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendNotificationDialog;
