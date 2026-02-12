import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { BUTTON_STYLES } from "../constants";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import { auth } from "@/lib/firebase";
import { sendEmailVerification, reload } from "firebase/auth";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  userEmail: string;
}

export function EmailVerificationDialog({ isOpen, onClose, onBackToLogin, userEmail }: EmailVerificationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [nextAttemptTime, setNextAttemptTime] = useState<Date | null>(null);
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const notification = useNotification();

  // Start countdown when email is sent
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) {
      notification.error('Error', 'No user found. Please try signing up again.');
      return;
    }

    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + '/login', // Redirect URL after verification
        handleCodeInApp: false,
      });

      console.log("Verification email sent to:", auth.currentUser.email);
      setEmailSent(true);
      setRateLimited(false);
      setNextAttemptTime(null);
      setCountdown(120); // 2 minute cooldown to prevent rate limiting
      notification.success('Email sent!', 'Please check your inbox and spam folder.');
    } catch (err: any) {
      console.error('Email verification error:', err);

      // Handle specific Firebase errors
      if (err.code === 'auth/too-many-requests' || err.message?.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
        setRateLimited(true);
        const waitTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        setNextAttemptTime(waitTime);
        setCountdown(15 * 60); // 15 minute countdown
        notification.error(
          'Too many attempts',
          'Please wait 15 minutes before requesting another verification email.'
        );
      } else if (err.code === 'auth/invalid-email') {
        notification.error('Invalid email', 'Please check your email address and try again.');
      } else if (err.code === 'auth/user-not-found') {
        notification.error('User not found', 'Please try signing up again.');
      } else {
        notification.error('Failed to send email', err.message || 'Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) {
      notification.error('Error', 'No user found. Please try signing up again.');
      return;
    }

    setCheckingVerification(true);
    try {
      // Reload user to get latest verification status
      await reload(auth.currentUser);

      if (auth.currentUser.emailVerified) {
        notification.success('Email verified!', 'You can now log in to your account.');
        setTimeout(() => {
          onClose();
          onBackToLogin();
        }, 1500);
      } else {
        notification.warning('Not verified yet', 'Please check your email and click the verification link.');
      }
    } catch (err: any) {
      console.error('Verification check error:', err);
      notification.error('Failed to check verification', 'Please try again.');
    } finally {
      setCheckingVerification(false);
    }
  };

  // Auto-send email when dialog opens (but only once and not if rate limited)
  useEffect(() => {
    if (isOpen && !hasAutoSent && !emailSent && !rateLimited && auth.currentUser) {
      setHasAutoSent(true);
      handleSendVerificationEmail();
    }

    // Reset flags only when explicitly needed, but keep hasAutoSent true to honor "one mail only"
    if (!isOpen) {
      setCountdown(0);
    }
  }, [isOpen, hasAutoSent, emailSent, rateLimited]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Verify Your Email
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mt-6"
        >
          {/* Email Icon Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                animate={{
                  rotate: emailSent ? 0 : 360,
                  scale: emailSent ? 1.1 : 1
                }}
                transition={{
                  duration: emailSent ? 0.5 : 2,
                  repeat: emailSent ? 0 : Infinity,
                  ease: "linear"
                }}
                className={`w-20 h-20 rounded-full flex items-center justify-center ${emailSent
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600'
                  }`}
              >
                {emailSent ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <Mail className="w-10 h-10 text-white" />
                )}
              </motion.div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center space-y-3">
            {emailSent ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Verification Email Sent! ✉️
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a verification link to:
                </p>
                <p className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                  {userEmail}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click the link in the email to verify your account. Check your spam folder if you don't see it.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sending Verification Email...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we send a verification link to {userEmail}
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {emailSent && (
            <div className="space-y-4">
              {/* Check Verification Status */}
              <Button
                onClick={handleCheckVerification}
                disabled={checkingVerification}
                className={`w-full ${BUTTON_STYLES.gradient} rounded-lg font-semibold`}
              >
                {checkingVerification ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Checking...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    I've Verified My Email
                  </>
                )}
              </Button>

              {/* Resend Email - Disabled as per requirement for only one mail */}
              {/* 
              <Button
                onClick={handleSendVerificationEmail}
                disabled={loading || countdown > 0 || rateLimited}
                variant="outline"
                className="w-full rounded-lg"
              >
                {rateLimited ? (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Rate limited - Try again in {Math.floor(countdown / 60)}m {countdown % 60}s
                  </div>
                ) : countdown > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Resend in {countdown > 60 ? `${Math.floor(countdown / 60)}m ` : ''}{countdown % 60}s
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Resend Email
                  </div>
                )}
              </Button>
              */}

              {/* Back to Login */}
              <Button
                onClick={onBackToLogin}
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          )}

          {/* Help Text */}
          <div className={`p-4 rounded-lg ${rateLimited
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
            {rateLimited ? (
              <>
                <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  ⚠️ Rate Limited
                </h4>
                <p className="text-xs text-red-800 dark:text-red-200 mb-2">
                  Too many verification emails were requested. Please wait before trying again.
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Next attempt available: {nextAttemptTime?.toLocaleTimeString()}
                </p>
              </>
            ) : (
              <>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  📧 Email not arriving?
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure {userEmail} is correct</li>
                  <li>• Try resending after the cooldown</li>
                  <li>• Contact support if issues persist</li>
                </ul>
              </>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}