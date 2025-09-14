import React, { useState } from 'react';
import { messageService, WhisperMessage } from '../../services/messageService';
import { ReportMessage } from '../moderation/ReportMessage';
import type { GeoLocation } from '../../types';

interface MessageCardProps {
  message: WhisperMessage;
  userLocation?: GeoLocation | null;
  onReaction?: (messageId: string, reactionType: 'heart' | 'hug' | 'smile' | 'tear') => void;
  onDiscovered?: (messageId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  userLocation,
  onReaction,
  onDiscovered,
  onError,
  className = ''
}) => {
  const [isReacting, setIsReacting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isExpired = messageService.isMessageExpired(message);
  const distance = userLocation 
    ? messageService.getDistance(
        userLocation.latitude,
        userLocation.longitude,
        message.location.coordinates[1], // latitude
        message.location.coordinates[0]  // longitude
      )
    : null;

  const handleReaction = async (reactionType: 'heart' | 'hug' | 'smile' | 'tear') => {
    if (isReacting || isExpired) return;

    try {
      setIsReacting(true);
      if (onReaction) {
        await onReaction(message._id, reactionType);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add reaction';
      if (onError) onError(errorMessage);
    } finally {
      setIsReacting(false);
    }
  };

  const handleDiscovered = async () => {
    if (isExpired) return;

    try {
      if (onDiscovered) {
        await onDiscovered(message._id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark as discovered';
      if (onError) onError(errorMessage);
    }
  };

  const getMoodColor = (sentiment: number): string => {
    if (sentiment > 0.3) return 'border-green-300 bg-green-50';
    if (sentiment < -0.3) return 'border-red-300 bg-red-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getDominantEmotion = () => {
    const emotions = message.moodEmbedding.emotions;
    return Object.entries(emotions).reduce((a, b) => 
      emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b
    )[0];
  };

  const getEmotionEmoji = (emotion: string): string => {
    const emojis: Record<string, string> = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      surprise: '😲',
      disgust: '🤢',
      trust: '🤝',
      anticipation: '🤔'
    };
    return emojis[emotion] || '💭';
  };

  const reactionCounts = message.reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contentPreview = message.content.length > 150 
    ? message.content.substring(0, 150) + '...'
    : message.content;

  return (
    <div className={`message-card ${className}`}>
      <div className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
        isExpired ? 'opacity-60 border-gray-200' : getMoodColor(message.moodEmbedding.sentiment)
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getEmotionEmoji(getDominantEmotion())}</span>
              <div>
                <div className="text-sm font-medium text-gray-700 capitalize">
                  {getDominantEmotion()} • {message.isAnonymous ? 'Anonymous' : 'Known'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString()} • {distance ? messageService.formatDistance(distance) : 'Unknown distance'}
                </div>
              </div>
            </div>
            
            {message.isEphemeral && message.expiresAt && !isExpired && (
              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                {messageService.getTimeRemaining(message.expiresAt)}
              </div>
            )}
            
            {isExpired && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Expired
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-800 leading-relaxed">
            {showFullContent ? message.content : contentPreview}
          </p>
          
          {message.content.length > 150 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2"
            >
              {showFullContent ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Mood Indicator */}
        <div className="px-4 pb-2">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                message.moodEmbedding.sentiment > 0.3 ? 'bg-green-400' :
                message.moodEmbedding.sentiment < -0.3 ? 'bg-red-400' : 'bg-gray-400'
              }`}></div>
              <span>
                {message.moodEmbedding.sentiment > 0.3 ? 'Positive' :
                 message.moodEmbedding.sentiment < -0.3 ? 'Negative' : 'Neutral'}
              </span>
            </div>
            <div>
              Intensity: {Math.round(message.moodEmbedding.intensity * 100)}%
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isExpired && (
          <div className="p-4 border-t border-gray-100">
            {/* Reactions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {(['heart', 'hug', 'smile', 'tear'] as const).map((reactionType) => (
                  <button
                    key={reactionType}
                    onClick={() => handleReaction(reactionType)}
                    disabled={isReacting}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors disabled:opacity-50"
                  >
                    <span>{messageService.getReactionEmoji(reactionType)}</span>
                    {reactionCounts[reactionType] && (
                      <span className="text-xs text-gray-600">{reactionCounts[reactionType]}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDiscovered}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Mark as discovered
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Report
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{message.discoveredBy.length} discoveries</span>
              <span>{message.reactions.length} reactions</span>
            </div>
          </div>
        )}

        {/* Expired State */}
        {isExpired && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="text-center text-sm text-gray-500">
              <svg className="w-5 h-5 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              This whisper has faded away...
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <ReportMessage
              messageId={message._id}
              onReportSubmitted={() => {
                setShowReportModal(false);
                if (onError) {
                  // Show success message instead of error
                  onError('Report submitted successfully. Thank you for helping keep our community safe.');
                }
              }}
              onCancel={() => setShowReportModal(false)}
              onError={(error) => {
                setShowReportModal(false);
                if (onError) onError(error);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};