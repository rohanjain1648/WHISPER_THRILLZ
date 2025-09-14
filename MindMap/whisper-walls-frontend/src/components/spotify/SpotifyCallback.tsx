import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { spotifyService } from '../../services/spotifyService';
import { ParticleSystem, SparkleEffect } from '../animations';

interface SpotifyCallbackProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SpotifyCallback: React.FC<SpotifyCallbackProps> = ({
  onSuccess,
  onError
}) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting to Spotify...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get authorization code and state from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        throw new Error(`Spotify authorization error: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state parameter');
      }

      setMessage('Exchanging authorization code...');

      // Exchange code for tokens
      await spotifyService.exchangeCodeForTokens(code, state);

      setMessage('Successfully connected to Spotify!');
      setStatus('success');

      // Redirect back to the main app after a short delay
      setTimeout(() => {
        onSuccess?.();
        // Remove the callback parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);

    } catch (error) {
      console.error('Spotify callback error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Spotify';
      setMessage(errorMessage);
      setStatus('error');
      onError?.(errorMessage);

      // Redirect back after showing error
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <ParticleSystem 
        type="stardust" 
        count={8} 
        intensity="low" 
        direction="random" 
        speed="slow"
        className="opacity-30"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-md w-full text-center relative overflow-hidden"
      >
        {status === 'success' && (
          <SparkleEffect count={6} intensity="magical" color="green" />
        )}
        
        <div className="relative z-10">
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'processing' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.3 }}
                  className="text-white text-2xl"
                >
                  ✓
                </motion.div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="w-16 h-16 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.3 }}
                  className="text-white text-2xl"
                >
                  ✕
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Status Message */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`text-2xl font-bold mb-4 ${
              status === 'success' ? 'text-green-600' :
              status === 'error' ? 'text-red-600' :
              'text-gray-800'
            }`}
          >
            {status === 'processing' && 'Connecting...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Connection Failed'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-600 mb-6"
          >
            {message}
          </motion.p>

          {/* Progress Indicator */}
          {status === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="w-full bg-gray-200 rounded-full h-2 mb-4"
            >
              <motion.div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          )}

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-sm text-gray-500"
          >
            {status === 'processing' && 'Please wait while we set up your music connection...'}
            {status === 'success' && 'Redirecting you back to Whisper Walls...'}
            {status === 'error' && 'You will be redirected back shortly.'}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};