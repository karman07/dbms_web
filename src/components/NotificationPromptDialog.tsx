import { motion } from 'framer-motion';
import { Bell, X, ShieldCheck, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';

interface NotificationPromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading?: boolean;
}

export function NotificationPromptDialog({
    isOpen,
    onClose,
    onConfirm,
    loading = false
}: NotificationPromptDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-2xl">
                <div className="relative">
                    {/* Top decorative element */}
                    <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />

                    <div className="p-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="bg-blue-100 dark:bg-blue-900/30 p-5 rounded-full"
                                >
                                    <Bell className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                </motion.div>
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-900">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-3 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Stay in the Loop!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Enable notifications to get real-time updates on:
                            </p>

                            <div className="grid grid-cols-1 gap-3 mt-4 text-left">
                                {[
                                    { icon: Zap, text: 'Instant class announcements' },
                                    { icon: Zap, text: 'New course materials' },
                                    { icon: Zap, text: 'Assignment reminders' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <item.icon className="w-4 h-4 text-blue-500" />
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={onConfirm}
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                        Enabling...
                                    </div>
                                ) : (
                                    'Enable Notifications'
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                disabled={loading}
                                className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                Maybe Later
                            </Button>
                        </div>

                        <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-6">
                            You can disable these at any time in your browser settings.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
