import { useState, useEffect } from "react";
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
  Bell,
  ChevronRight
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
      if (permission === 'default' && (!hasRegisteredFCM || hasRegisteredFCM === 'declined')) {
        setShowNotificationPrompt(true);
      } else if (permission === 'granted' && hasRegisteredFCM !== 'true') {
        registerFCM();
      }
    }
  }, [user]);

  const registerFCM = async () => {
    setShowNotificationPrompt(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const dashboardItems = [
    {
      id: 'docs',
      title: 'Documentation',
      description: 'Access comprehensive guides and references',
      icon: BookOpen,
    },
    {
      id: 'activities',
      title: 'Activities',
      description: 'Track your progress and recent actions',
      icon: Activity,
    },
    {
      id: 'course',
      title: 'Courses',
      description: 'Explore learning paths and tutorials',
      icon: GraduationCap,
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'Complete and submit your assignments',
      icon: ClipboardList,
    },
    {
      id: 'quizzes',
      title: 'Quizzes',
      description: 'Test your knowledge with interactive quizzes',
      icon: HelpCircle,
    },
    {
      id: 'study-material',
      title: 'Study Material',
      description: 'Access curated study resources and materials',
      icon: BookMarked,
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Manage your personal notes and bookmarks',
      icon: FileText,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View your notification history and updates',
      icon: Bell,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Choose what you'd like to explore
              </p>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors mt-1" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </button>
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
