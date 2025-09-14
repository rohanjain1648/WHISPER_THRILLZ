import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AuthPage } from './AuthPage';

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerification?: boolean;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireEmailVerification = false,
  fallback
}) => {
  const { isAuthenticated, isLoading, isEmailVerified, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen romantic-gradient flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-love-200 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-love-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <motion.p
            className="mt-4 text-gray-600 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Loading your emotional journey...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Show authentication page if not authenticated
  if (!isAuthenticated) {
    return fallback || <AuthPage onSuccess={() => window.location.reload()} />;
  }

  // Show email verification notice if required and not verified
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <div className="min-h-screen romantic-gradient flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="whisper-card max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-16 h-16 bg-hope-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-2xl font-bold emotional-text mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              We've sent a verification link to <strong>{user?.email}</strong>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-500">
              Please check your email and click the verification link to continue your emotional journey.
            </p>
            
            <button
              className="mood-button bg-gradient-to-r from-hope-500 to-joy-500 text-white font-semibold"
              onClick={() => {
                // TODO: Implement resend verification
                console.log('Resend verification email');
              }}
            >
              Resend Verification Email
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;