import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spotifyService, type SpotifyUser } from '../../services/spotifyService';
import { 
  DreamyInteraction, 
  EmotionalPulse, 
  SparkleEffect,
  MagicalShimmer 
} from '../animations';

interface SpotifyAuthProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
}

export const SpotifyAuth: React.FC<SpotifyAuthProps> = ({
  onConnectionChange,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const connected = await spotifyService.isConnected();
      setIsConnected(connected);
      
      if (connected) {
        const userProfile = await spotifyService.getCurrentUser();
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
      setError('Failed to check Spotify connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Redirect to Spotify authorization
      const authUrl = spotifyService.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      setError('Failed to connect to Spotify');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await spotifyService.disconnect();
      setIsConnected(false);
      setUser(null);
    } catch (error) {
      console.error('Error disconnecting from Spotify:', error);
      setError('Failed to disconnect from Spotify');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`spotify-auth ${className}`}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-gray-600">Checking Spotify connection...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`spotify-auth ${className}`}>
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
              <SparkleEffect count={3} intensity="subtle" color="green" />
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Connect to Spotify
                  </h3>
                  
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Link your Spotify account to generate personalized playlists based on your mood and emotions.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-2xl mb-2">🎵</div>
                      <div className="text-sm font-medium text-gray-800">Mood Playlists</div>
                      <div className="text-xs text-gray-600">AI-curated music</div>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                      <div className="text-2xl mb-2">💕</div>
                      <div className="text-sm font-medium text-gray-800">Couple Playlists</div>
                      <div className="text-xs text-gray-600">Shared music experiences</div>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-sm font-medium text-gray-800">Smart Recommendations</div>
                      <div className="text-xs text-gray-600">Emotion-based discovery</div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-red-500">⚠️</div>
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="text-center">
                    <DreamyInteraction>
                      <motion.button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isConnecting ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Connecting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            <span>Connect with Spotify</span>
                          </div>
                        )}
                      </motion.button>
                    </DreamyInteraction>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      We'll redirect you to Spotify to authorize access to your music library
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <MagicalShimmer intensity="subtle" color="green" trigger={true}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
                <SparkleEffect count={4} intensity="magical" color="green" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {user?.images?.[0]?.url ? (
                          <img
                            src={user.images[0].url}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full border-2 border-green-500"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user?.displayName?.[0] || 'U'}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Connected to Spotify
                        </h3>
                        <p className="text-sm text-gray-600">
                          {user?.displayName || 'Spotify User'}
                        </p>
                      </div>
                    </div>
                    
                    <EmotionalPulse emotion="joy" intensity={0.8}>
                      <div className="text-green-500 text-2xl">✅</div>
                    </EmotionalPulse>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {user?.followers?.total || 0}
                      </div>
                      <div className="text-xs text-gray-600">Followers</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {user?.product || 'Free'}
                      </div>
                      <div className="text-xs text-gray-600">Plan</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <div className="text-lg font-semibold text-purple-600">
                        {user?.country || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-600">Country</div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-red-500">⚠️</div>
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-center space-x-3">
                    <DreamyInteraction>
                      <button
                        onClick={() => window.open(user?.external_urls?.spotify || 'https://open.spotify.com', '_blank')}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300"
                      >
                        Open Spotify
                      </button>
                    </DreamyInteraction>
                    
                    <DreamyInteraction>
                      <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300"
                      >
                        Disconnect
                      </button>
                    </DreamyInteraction>
                  </div>
                </div>
              </div>
            </MagicalShimmer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};