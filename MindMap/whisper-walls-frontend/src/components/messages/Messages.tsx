import React, { useState, useCallback } from 'react';
import { CreateMessage } from './CreateMessage';
import { NearbyMessages } from './NearbyMessages';

interface MessagesProps {
  className?: string;
}

export const Messages: React.FC<MessagesProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'create'>('discover');
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleMessageCreated = useCallback(() => {
    // Switch to discover tab and refresh messages
    setActiveTab('discover');
    setRefreshTrigger(prev => prev + 1);
    setError(null);
  }, []);

  const clearError = () => setError(null);

  return (
    <div className={`messages ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Whisper Walls
          </h1>
          <p className="text-gray-600 text-lg">
            Leave anonymous messages for others to discover, or find heartfelt notes left by strangers
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'discover'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>Discover</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span>Create</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500">
          {activeTab === 'discover' ? (
            <NearbyMessages
              onError={handleError}
              refreshTrigger={refreshTrigger}
              className="w-full"
            />
          ) : (
            <CreateMessage
              onMessageCreated={handleMessageCreated}
              onError={handleError}
              className="w-full max-w-2xl mx-auto"
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>
            Messages are ephemeral and will fade away over time, just like whispers in the wind.
          </p>
          <p>
            Be kind, be genuine, and spread positivity in the world. 💜
          </p>
        </div>
      </div>
    </div>
  );
};