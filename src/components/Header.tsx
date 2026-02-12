import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthDialog } from "@/components/AuthDialog";
import { User } from "@/types/user";
import userService from "@/services/user.service";

import { BUTTON_STYLES } from "@/constants";
import {
  List,
  Moon,
  Sun,
  Menu,
  X,
  User as UserIcon,
  LogOut,
} from "lucide-react";

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get the image URL with proper base URL handling
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`;

    // If it's already a full URL, use it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it's a relative path, construct the full URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${imagePath}`;
  };

  useEffect(() => {
    // Load user profile from API if authenticated
    const loadUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await userService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // If API fails, fall back to token validation by clearing invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    loadUserProfile();

    // Listen for login events
    const handleLoginSuccess = (event: CustomEvent) => {
      if (event.detail?.user) {
        setUser(event.detail.user);
      }
    };

    // Listen for auth dialog open requests
    const handleOpenAuth = (event: CustomEvent) => {
      if (event.detail?.mode) {
        setAuthDialog({ isOpen: true, mode: event.detail.mode });
      }
    };

    window.addEventListener('loginSuccess' as any, handleLoginSuccess);
    window.addEventListener('openAuth' as any, handleOpenAuth);

    return () => {
      window.removeEventListener('loginSuccess' as any, handleLoginSuccess);
      window.removeEventListener('openAuth' as any, handleOpenAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
    window.location.reload();
  };


  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <List className="h-5 w-5 text-white" />
              </div>
              <span className={`text-xl font-bold text-slate-900 dark:text-white`}>
                DBMastery
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/#hero"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Overview
              </a>
              <a
                href="/#curriculum"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Curriculum
              </a>
              <a
                href="/#stats" // Assuming stats/resources are here or similar
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Resources
              </a>
              <a
                href="/#instructor"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Instructor
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="hidden sm:flex"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              {user ? (
                <div className="hidden md:flex items-center space-x-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
                    >
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {user.firstName}
                      </span>
                      <div className="relative">
                        {user.profilePicture ? (
                          <img
                            src={getImageUrl(user.profilePicture)}
                            alt={`${user.firstName}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                      </div>
                    </button>

                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <UserIcon className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => setAuthDialog({ isOpen: true, mode: 'login' })}
                    className="text-sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    className={BUTTON_STYLES.gradient + " rounded-xl text-sm px-6 py-2.5 font-bold tracking-wide"}
                    onClick={() => setAuthDialog({ isOpen: true, mode: 'signup' })}
                  >
                    Enroll Now
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
            >
              <div className="flex flex-col space-y-4">
                <a
                  href="/#hero"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Overview
                </a>
                <a
                  href="/#curriculum"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Curriculum
                </a>
                <a
                  href="/#stats"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Resources
                </a>
                <a
                  href="/#instructor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Instructor
                </a>
                <div className="flex items-center justify-between px-4 py-2">
                  {user ? (
                    <Button
                      variant="ghost"
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="text-sm text-red-600"
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => { setAuthDialog({ isOpen: true, mode: 'login' }); setMobileMenuOpen(false); }}
                      className="text-sm"
                    >
                      Sign In
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </Button>
                </div>
                {!user && (
                  <div className="px-4">
                    <Button
                      className={BUTTON_STYLES.gradient + " rounded-xl text-sm w-full py-3 font-bold"}
                      onClick={() => { setAuthDialog({ isOpen: true, mode: 'signup' }); setMobileMenuOpen(false); }}
                    >
                      Enroll Now
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={() => setAuthDialog({ ...authDialog, isOpen: false })}
        mode={authDialog.mode}
        onModeChange={(mode) => setAuthDialog({ ...authDialog, mode })}
      />
    </>
  );
}
