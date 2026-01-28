import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CompleteProfileDialog } from "./CompleteProfileDialog";
import { EmailVerificationDialog } from "./EmailVerificationDialog";
import { BUTTON_STYLES } from "../constants";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import authService from "@/services/auth.service";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
}

export function AuthDialog({ isOpen, onClose, mode, onModeChange }: AuthDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmailForVerification, setUserEmailForVerification] = useState('');
  const notification = useNotification();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    referralSource: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Register new user with Firebase first (email/password signup only)
        const firebaseUser = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Send verification email via Firebase for email/password signups
        await sendEmailVerification(firebaseUser.user, {
          url: window.location.origin + '/login',
          handleCodeInApp: false,
        });

        // Register user in backend
        await authService.register({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          referralSource: formData.referralSource || undefined,
        });

        // Show verification dialog for email/password signups (Google signups skip this)
        setUserEmailForVerification(formData.email);
        onClose();
        setTimeout(() => {
          setShowEmailVerification(true);
          resetForm();
        }, 500);
      } else {
        // Login existing user
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        // Check if email is verified
        if (!response.user.isEmailVerified) {
          notification.warning('Email not verified', 'Please verify your email before accessing your account. Check your inbox for the verification link.');
          onClose();
          resetForm();
          return;
        }

        notification.success('Login successful!', `Welcome back, ${response.user.firstName}!`);

        // Dispatch login success event
        const event = new CustomEvent('loginSuccess', { detail: { user: response.user } });
        window.dispatchEvent(event);

        // Check if profile is incomplete for verified users
        const isProfileIncomplete = !response.user.phoneNumber || 
                                    !response.user.currentPosition || 
                                    !response.user.city || 
                                    !response.user.bio;

        // Close dialog and show complete profile if needed
        onClose();
        setTimeout(() => {
          if (isProfileIncomplete) {
            setShowCompleteProfile(true);
          } else {
            // Reload page after successful login if profile is complete
            window.location.reload();
          }
          resetForm();
        }, isProfileIncomplete ? 500 : 1000);
      }
    } catch (err: any) {
      notification.error('Authentication failed', err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);

    try {
      // Sign in with Google via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();

      // Send Firebase token to backend
      const response = await authService.firebaseLogin({
        firebaseToken,
        isGoogleSignup: mode === 'signup',
      });

      // Google users are typically auto-verified, so skip email verification
      notification.success('Google authentication successful!', `Welcome, ${response.user.firstName}!`);

      // Dispatch login success event
      const event = new CustomEvent('loginSuccess', { detail: { user: response.user } });
      window.dispatchEvent(event);

      // For Google signup, always show complete profile dialog
      // For Google login, only show if profile is incomplete
      const isProfileIncomplete = !response.user.phoneNumber || 
                                  !response.user.currentPosition || 
                                  !response.user.city || 
                                  !response.user.bio;

      // Close dialog and show complete profile if it's a signup or profile is incomplete
      onClose();
      setTimeout(() => {
        if (mode === 'signup' || isProfileIncomplete) {
          setShowCompleteProfile(true);
        } else {
          // Reload page after successful Google login if profile is complete
          window.location.reload();
        }
        resetForm();
      }, 500);
    } catch (err: any) {
      notification.error('Google authentication failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      referralSource: ''
    });
  };

  const handleEmailVerificationClose = () => {
    setShowEmailVerification(false);
    setUserEmailForVerification('');
  };

  const handleBackToLogin = () => {
    setShowEmailVerification(false);
    setUserEmailForVerification('');
    onModeChange('login');
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {mode === 'login' 
              ? 'Sign in to continue your learning journey' 
              : 'Join thousands of students mastering databases'
            }
          </p>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mt-6"
        >
          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            variant="outline"
            className="w-full py-4 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Processing...' : 'Continue with Google'}
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400 font-medium">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      className="pl-12 py-3 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      minLength={2}
                      maxLength={50}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      className="pl-12 py-3 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      minLength={2}
                      maxLength={50}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-12 py-3 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-12 pr-12 py-3 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="referralSource">How did you hear about us? (Optional)</Label>
                <Input
                  id="referralSource"
                  type="text"
                  placeholder="e.g., Google, Friend, Social Media"
                  className="py-3 rounded-xl border-2 focus:border-blue-500 transition-all duration-200"
                  value={formData.referralSource}
                  onChange={(e) => setFormData({...formData, referralSource: e.target.value})}
                />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className={`w-full ${BUTTON_STYLES.gradient} py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center text-sm mt-6">
            <span className="text-gray-600 dark:text-gray-400">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-semibold transition-colors duration-200"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>

    {/* Email Verification Dialog */}
    <EmailVerificationDialog
      isOpen={showEmailVerification}
      onClose={handleEmailVerificationClose}
      onBackToLogin={handleBackToLogin}
      userEmail={userEmailForVerification}
    />

    {/* Complete Profile Dialog */}
    <CompleteProfileDialog
      isOpen={showCompleteProfile}
      onClose={() => setShowCompleteProfile(false)}
      onSkip={() => setShowCompleteProfile(false)}
    />
    </>
  );
}