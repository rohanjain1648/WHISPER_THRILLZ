import React, { useState, useEffect } from 'react';
import { MapPin, Heart, Smile, RefreshCw, Filter, Clock, Users } from 'lucide-react';
import { useNearbyMessages, useLocationContext } from '../../contexts/LocationContext';
import { WhisperNote } from '../../types';
import LocationService from '../../services/locationService';

interface NearbyMessagesProps {
  radius?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showFilters?: boolean;
  onMessageSelect?: (message: WhisperNote) => void;
  className?: string;
}

export function NearbyMessages({
  radius = 1000,
  limit = 50,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  showFilters = true,
  onMessageSelect,
  className = ''
}: NearbyMessagesProps) {
  const { location, accuracy, isAccurate } = useLocationContext();
  const [filters, setFilters] = useState({
    includeExpired: false,
    moodFilter: {
      minSentiment: -1,
      maxSentiment: 1,
      emotions: [] as string[]
    }
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const { messages, loading, error, reload, clearError } = useNearbyMessages({
    radius,
    limit,
    ...filters
  });

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !location) return;

    const interval = setInterval(() => {
      reload();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, location, reload]);

  const handleMessageClick = async (message: WhisperNote) => {
    try {
      // Mark as discovered
      await LocationService.markMessageDiscovered(message.id);
      
      if (onMessageSelect) {
        onMessageSelect(message);
      }
    } catch (error) {
      console.error('Failed to mark message as discovered:', error);
      // Still allow selection even if marking fails
      if (onMessageSelect) {
        onMessageSelect(message);
      }
    }
  };

  const handleReaction = async (messageId: string, reactionType: 'heart' | 'hug' | 'smile' | 'tear') => {
    try {
      await LocationService.addReaction(messageId, reactionType);
      // Reload messages to show updated reactions
      reload();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getMoodColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600 bg-green-100';
    if (sentiment < -0.3) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getMoodEmoji = (moodEmbedding: any) => {
    const emotions = moodEmbedding.emotions;
    const maxEmotion = Object.entries(emotions).reduce((a, b) => 
      emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b
    );

    const emojiMap: { [key: string]: string } = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😰',
      surprise: '😲',
      disgust: '🤢',
      trust: '🤗',
      anticipation: '🤔'
    };

    return emojiMap[maxEmotion[0]] || '😐';
  };

  if (!location) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Location access required to discover nearby whispers</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nearby Whispers
          </h2>
          <p className="text-sm text-gray-600">
            Within {radius}m • Accuracy: {accuracy} ({Math.round(location.accuracy)}m)
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`p-2 rounded-md transition-colors ${
                showFilterPanel 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={reload}
            disabled={loading}
            className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Accuracy Warning */}
      {!isAccurate && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-700">
            <MapPin className="h-4 w-4 inline mr-1" />
            Location accuracy is low. Some nearby whispers might not be shown.
          </p>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeExpired}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  includeExpired: e.target.checked
                }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include expired messages</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sentiment Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={filters.moodFilter.minSentiment}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    moodFilter: {
                      ...prev.moodFilter,
                      minSentiment: parseFloat(e.target.value)
                    }
                  }))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {filters.moodFilter.minSentiment.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-700 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && messages.length === 0 && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Discovering nearby whispers...</p>
        </div>
      )}

      {/* Messages List */}
      {messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getMoodEmoji(message.moodEmbedding)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(message.moodEmbedding.sentiment)}`}>
                    {message.moodEmbedding.sentiment > 0 ? 'Positive' : 
                     message.moodEmbedding.sentiment < 0 ? 'Negative' : 'Neutral'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(message.timestamp)}</span>
                </div>
              </div>

              <p className="text-gray-800 mb-3 leading-relaxed">
                {message.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>{message.discoveredBy.length} discovered</span>
                </div>

                <div className="flex items-center space-x-2">
                  {message.reactions.map((reaction, index) => (
                    <span key={index} className="text-xs">
                      {reaction.type === 'heart' && '❤️'}
                      {reaction.type === 'hug' && '🤗'}
                      {reaction.type === 'smile' && '😊'}
                      {reaction.type === 'tear' && '😢'}
                    </span>
                  ))}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(message.id, 'heart');
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(message.id, 'smile');
                    }}
                    className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No whispers found nearby</p>
          <p className="text-sm text-gray-500">
            Be the first to leave a heartfelt message in this area!
          </p>
        </div>
      )}

      {/* Load More */}
      {messages.length >= limit && (
        <div className="text-center">
          <button
            onClick={() => {
              // Could implement pagination here
              reload();
            }}
            className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            Load more whispers
          </button>
        </div>
      )}
    </div>
  );
}

export default NearbyMessages;