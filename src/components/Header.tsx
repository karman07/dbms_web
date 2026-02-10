import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { User } from "@/types/user";
import userService from "@/services/user.service";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  List
} from "lucide-react";

export function Navigation() {
  const navigate = useNavigate();
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${imagePath}`;
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await userService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    loadUserProfile();

    const handleLoginSuccess = (event: CustomEvent) => {
      if (event.detail?.user) setUser(event.detail.user);
    };

    const handleOpenAuth = (event: CustomEvent) => {
      if (event.detail?.mode) setAuthDialog({ isOpen: true, mode: event.detail.mode });
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

  // Helper to scroll to sections if on homepage, else navigate
  const handleNavClick = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Overview", action: () => handleNavClick("hero") },
    { name: "Curriculum", action: () => handleNavClick("curriculum") },
    { name: "Resources", action: () => handleNavClick("stats") },
    { name: "Instructor", action: () => handleNavClick("instructor") },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-blue-600 rounded-lg p-1.5 transition-transform group-hover:scale-105">
                <List className="h-6 w-6 text-white" strokeWidth={3} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                DB<span className="text-blue-600">Mastery</span>
              </span>
            </Link>

            {/* Center Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Right Side Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-2">
                      {user.firstName}
                    </span>
                    <img
                      src={getImageUrl(user.profilePicture)}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                    />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600"
                        >
                          <UserIcon className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setAuthDialog({ isOpen: true, mode: 'login' })}
                    className="text-sm font-bold text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
                  >
                    Login
                  </button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6 py-2.5 text-sm shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                    onClick={() => setAuthDialog({ isOpen: true, mode: 'signup' })}
                  >
                    Start Learning
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              {user && (
                <img
                  src={getImageUrl(user.profilePicture)}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                />
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-100 dark:border-gray-800 py-4 bg-white dark:bg-gray-900 overflow-hidden shadow-xl rounded-b-2xl mb-4"
              >
                <div className="flex flex-col space-y-2 px-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={link.action}
                      className="text-left px-4 py-3 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                    </button>
                  ))}

                  <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2 flex flex-col gap-2 px-2">
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-left px-4 py-3 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4" /> My Profile
                        </Link>
                        <button
                          onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                          className="text-left px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setAuthDialog({ isOpen: true, mode: 'login' }); setMobileMenuOpen(false); }}
                          className="text-left px-4 py-3 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Login
                        </button>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-3"
                          onClick={() => { setAuthDialog({ isOpen: true, mode: 'signup' }); setMobileMenuOpen(false); }}
                        >
                          Start Learning
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
