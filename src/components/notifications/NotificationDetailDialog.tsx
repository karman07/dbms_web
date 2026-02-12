import React from 'react';
import {
    X,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCcw,
    AlertCircle,
    Users,
    Layers,
    BarChart,
    Tag
} from 'lucide-react';
import { Button } from '../ui/button';
import {
    Notification,
    NotificationStatus
} from '../../types/notification';

interface NotificationDetailDialogProps {
    notification: Notification;
    isOpen: boolean;
    onClose: () => void;
}

const NotificationDetailDialog: React.FC<NotificationDetailDialogProps> = ({ notification, isOpen, onClose }) => {
    if (!isOpen) return null;

    const getStatusDisplay = (status: NotificationStatus) => {
        switch (status) {
            case NotificationStatus.SENT:
                return { icon: CheckCircle2, text: 'Delivered', color: 'text-green-600', bg: 'bg-green-50' };
            case NotificationStatus.FAILED:
                return { icon: XCircle, text: 'Failed', color: 'text-red-600', bg: 'bg-red-50' };
            case NotificationStatus.PENDING:
                return { icon: Clock, text: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50' };
            case NotificationStatus.PROCESSING:
                return { icon: RefreshCcw, text: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50', animate: true };
            default:
                return { icon: AlertCircle, text: 'Partial', color: 'text-orange-600', bg: 'bg-orange-50' };
        }
    };

    const status = getStatusDisplay(notification.status);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Banner with Image or Title */}
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                    {notification.imageUrl ? (
                        <img
                            src={notification.imageUrl}
                            alt={notification.title}
                            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 opacity-80" />
                    )}
                    <div className="absolute inset-x-8 bottom-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/20 mb-3 inline-block`}>
                            {notification.type.replace('_', ' ')}
                        </span>
                        <h2 className="text-2xl font-black text-white leading-tight drop-shadow-sm line-clamp-2">
                            {notification.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md rounded-2xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Status & Timing Bar */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 ${status.bg} rounded-xl`}>
                                <status.icon className={`w-5 h-5 ${status.color} ${status.animate ? 'animate-spin' : ''}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                                <p className={`text-sm font-bold ${status.color}`}>{status.text}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created On</p>
                            <p className="text-sm font-black text-slate-700">
                                {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Body Message */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Tag className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Message Content</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-3xl border border-slate-100 italic">
                            "{notification.body}"
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reach</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{notification.totalRecipients || 0}</p>
                            <p className="text-xs text-slate-500 font-medium">Total Recipients</p>
                        </div>
                        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <BarChart className="w-4 h-4 text-green-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{notification.successCount || 0}</p>
                            <p className="text-xs text-slate-500 font-medium">Delivered Successfully</p>
                        </div>
                    </div>

                    {/* Error Message if failed */}
                    {notification.error && (
                        <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex gap-4">
                            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-1">Error Information</p>
                                <p className="text-sm text-red-600 font-medium">{notification.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Data Fields */}
                    {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Layers className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Attached Metadata</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.entries(notification.data).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-xs font-bold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                        <span className="text-xs font-black text-slate-700 truncate max-w-[200px]">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign ID</span>
                        <span className="text-xs font-medium text-slate-500 font-mono">#{notification._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <Button
                        variant="default"
                        onClick={onClose}
                        className="rounded-2xl bg-slate-900 hover:bg-black text-white px-8 font-bold"
                    >
                        Dismiss View
                    </Button>
                </div>
            </div>
        </div >
    );
};

export default NotificationDetailDialog;
