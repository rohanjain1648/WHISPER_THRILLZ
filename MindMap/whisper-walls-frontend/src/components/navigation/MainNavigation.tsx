import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { DreamyInteraction, EmotionalPulse } from '../animations';

interface MainNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  currentView,
  onViewChange,
  className = ''
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      description: 'Welcome & Overview'
    },
    {
      id: 'mood-dashboard',
      label: 'Mood Journey',
      icon: '💝',
      description: 'Your Emotional Timeline'
    },
    {
      id: 'whisper-map',
      label: 'Whisper Map',
      icon: '🗺️',
      description: 'Discover Messages'
    },
    {
      id: 'create-whisper',
      label: 'Create Whisper',
      icon: '✨',
      description: 'Leave a Message'
    },
    {
      id: 'couple-mode',
      label: 'Couple Mode',
      icon: '💕',
      description: 'Shared Journey'
    },
    {
      id: 'playlists',
      label: 'Mood Playlists',
      icon: '🎵',
      description: 'Music for Your Soul'
    }
  ];

  return (
    <div className={`main-navigation ${className}`}>
      {/* Top Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <DreamyInteraction>
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => onViewChange('home')}
              >
                <div className="text-2xl">💌</div>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Whisper Walls
                </div>
              </div>
            </DreamyInteraction>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <DreamyInteraction key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                    title={item.description}
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="hidden lg:inline">{item.label}</span>
                    </span>
                    
                    {/* Active indicator */}
                    {currentView === item.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                </DreamyInteraction>
              ))}
            </div>

            {/* User Menu */}
            <div className="relative">
              <DreamyInteraction>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.profile.displayName?.[0] || user?.email[0] || '?'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-800">
                      {user?.profile.displayName || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
              </DreamyInteraction>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-800">
                        {user?.profile.displayName || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <DreamyInteraction>
                        <button
                          onClick={() => {
                            onViewChange('profile');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                        >
                          <span>⚙️</span>
                          <span>Profile Settings</span>
                        </button>
                      </DreamyInteraction>
                      
                      <DreamyInteraction>
                        <button
                          onClick={() => {
                            onViewChange('preferences');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                        >
                          <span>🎨</span>
                          <span>Preferences</span>
                        </button>
                      </DreamyInteraction>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <DreamyInteraction>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
                        >
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </DreamyInteraction>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2">
            <div className="flex space-x-1 overflow-x-auto">
              {navigationItems.slice(0, 4).map((item) => (
                <DreamyInteraction key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs">{item.label.split(' ')[0]}</span>
                    </div>
                  </button>
                </DreamyInteraction>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};