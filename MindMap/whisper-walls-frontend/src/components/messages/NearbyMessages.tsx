import React, { useState, useEffect, useCallback } from 'react';
import { messageService, WhisperMessage } from '../../services/messageService';
import { useLocation } from '../../hooks/useLocation';
import { MessageCard } from './MessageCard';

interface NearbyMessagesProps {
  onError?: (error: string) => void;
  className?: string;
  refreshTrigger?: number;
}

export const NearbyMessages: React.FC<NearbyMessagesProps> = ({
  onError,
  className = '',
  refreshTrigger
}) => {
  const [messages, setMessages] = useState<WhisperMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [radius, setRadius] = useState(1000); // Default 1km
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const { location, error: locationError, requestLocation } = useLocation();

  const loadNearbyMessages = useCallback(async () => {
    if (!location) return;

    try {
      setIsLoading(true);
      const nearbyMessages = await messageService.findNearbyMessages({
        latitude: location.latitude,
        longitude: location.longitude,
        radius,
        limit: 50
      });

      setMessages(nearbyMessages);
      setLastRefresh(new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load nearby messages';
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [location, radius, onError]);

  // Load messages when location is available or radius changes
  useEffect(() => {
    loadNearbyMessages();
  }, [loadNearbyMessages]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      loadNearbyMessages();
    }
  }, [refreshTrigger, loadNearbyMessages]);

  const handleMessageReaction = async (messageId: string, reactionType: 'heart' | 'hug' | 'smile' | 'tear') => {
    try {
      const updatedMessage = await messageService.addReaction(messageId, reactionType);
      
      // Update the message in the list
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? updatedMessage : msg
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add reaction';
      if (onError) onError(errorMessage);
    }
  };

  const handleMessageDiscovered = async (messageId: string) => {
    try {
      const updatedMessage = await messageService.markMessageDiscovered(messageId);
      
      // Update the message in the list
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? updatedMessage : msg
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark as discovered';
      if (onError) onError(errorMessage);
    }
  };

  const formatRadius = (radiusInMeters: number): string => {
    if (radiusInMeters < 1000) {
      return `${radiusInMeters}m`;
    } else {
      return `${(radiusInMeters / 1000).toFixed(1)}km`;
    }
  };

  if (locationError) {
    return (
      <div className={`nearby-messages ${className}`}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Location Required</h3>
            <p className="text-gray-600 mb-4">{locationError}</p>
            <button
              onClick={requestLocation}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              Enable Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`nearby-messages ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Nearby Whispers</h2>
              <p className="text-gray-600">
                {messages.length} messages within {formatRadius(radius)}
              </p>
            </div>
            <button
              onClick={loadNearbyMessages}
              disabled={isLoading}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Radius Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search Radius: {formatRadius(radius)}
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>100m</span>
              <span>5km</span>
            </div>
          </div>

          {lastRefresh && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Discovering nearby whispers...</span>
            </div>
          </div>
        )}

        {/* Messages List */}
        {!isLoading && messages.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No whispers found</h3>
              <p className="text-gray-600">
                Be the first to leave a message in this area, or try expanding your search radius.
              </p>
            </div>
          </div>
        )}

        {/* Messages Grid */}
        {!isLoading && messages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map((message) => (
              <MessageCard
                key={message._id}
                message={message}
                userLocation={location}
                onReaction={handleMessageReaction}
                onDiscovered={handleMessageDiscovered}
                onError={onError}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};