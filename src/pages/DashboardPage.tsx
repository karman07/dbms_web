import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Activity,
  GraduationCap,
  FileText,
  BookMarked,
  ClipboardList,
  HelpCircle,
  User,
  Sun,
  Moon,
  Bell
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationBell from "@/components/NotificationBell";
import notificationService from "@/services/notification.service";
import { NotificationPromptDialog } from "@/components/NotificationPromptDialog";

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user && notificationService.isSupported()) {
      const hasRegisteredFCM = sessionStorage.getItem('fcm_registered');
      const permission = notificationService.getPermissionStatus();

      console.log('Notification Status Check:', {
        hasRegisteredFCM,
        permission,
        isSupported: notificationService.isSupported()
      });

      // If they declined in a previous visit but we're debugging, 
      // or if it's the first time and permission is default, show it.
      if (permission === 'default' && (!hasRegisteredFCM || hasRegisteredFCM === 'declined')) {
        console.log('Showing Notification Prompt...');
        setShowNotificationPrompt(true);
      } else if (permission === 'granted' && hasRegisteredFCM !== 'true') {
        console.log('Permission already granted, registering FCM...');
        registerFCM();
      }

      if (hasRegisteredFCM === 'declined') {
        console.info('💡 Tip: You previously clicked "Maybe Later". To fully reset and see the prompt again with fresh state, run: sessionStorage.removeItem("fcm_registered"); location.reload();');
      }
    } else if (user) {
      console.warn('Notification service not supported or messaging not initialized');
    }
  }, [user]);

  const registerFCM = async () => {
    // Hide dialog immediately as requested
    setShowNotificationPrompt(false);

    // Perform transaction in background
    try {
      setIsRegistering(true);
      const token = await notificationService.requestPermission();
      if (token) {
        sessionStorage.setItem('fcm_registered', 'true');
      }
    } catch (error: any) {
      console.error('Background FCM Registration failed:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeclineNotifications = () => {
    setShowNotificationPrompt(false);
    sessionStorage.setItem('fcm_registered', 'declined');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const dashboardItems = [
    {
      id: 'docs',
      title: 'Documentation',
      description: 'Access comprehensive guides and API references',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'activities',
      title: 'Activities',
      description: 'Track your progress and recent actions',
      icon: Activity,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'course',
      title: 'Courses',
      description: 'Explore learning paths and tutorials',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'Complete and submit your assignments',
      icon: ClipboardList,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'quizzes',
      title: 'Quizzes',
      description: 'Test your knowledge with interactive quizzes',
      icon: HelpCircle,
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'study-material',
      title: 'Study Material',
      description: 'Access curated study resources and materials',
      icon: BookMarked,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Manage your personal notes and bookmarks',
      icon: FileText,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View your personal notification history and updates',
      icon: Bell,
      color: 'from-pink-500 to-pink-600'
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                Welcome back, {user?.displayName || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Choose what you'd like to explore
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationBell />
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/${item.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer group"
              >
                <motion.div
                  className={`bg-gradient-to-r ${item.color} p-4 rounded-lg mb-6 w-fit`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <NotificationPromptDialog
        isOpen={showNotificationPrompt}
        onClose={handleDeclineNotifications}
        onConfirm={registerFCM}
        loading={isRegistering}
      />
    </div>
  );
};

export default DashboardPage;