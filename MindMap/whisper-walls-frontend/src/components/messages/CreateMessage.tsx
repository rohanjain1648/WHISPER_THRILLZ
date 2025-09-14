import React, { useState, useEffect } from 'react';
import { messageService, CreateMessageRequest } from '../../services/messageService';
import { moodService } from '../../services/moodService';
import { useLocation } from '../../hooks/useLocation';
import { MoodVisualization } from '../mood/MoodVisualization';
import type { MoodEmbedding } from '../../types';

interface CreateMessageProps {
  onMessageCreated?: (message: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const CreateMessage: React.FC<CreateMessageProps> = ({
  onMessageCreated,
  onError,
  className = ''
}) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isEphemeral, setIsEphemeral] = useState(true);
  const [expirationHours, setExpirationHours] = useState(24);
  const [isCreating, setIsCreating] = useState(false);
  const [moodPreview, setMoodPreview] = useState<MoodEmbedding | null>(null);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);

  const { location, error: locationError, requestLocation } = useLocation();

  const maxChars = 1000;
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Analyze mood as user types (debounced)
  useEffect(() => {
    if (content.trim().length < 10) {
      setMoodPreview(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsAnalyzingMood(true);
        const result = await moodService.analyzeTextMood(content.trim(), 'message_preview');
        setMoodPreview(result.moodEmbedding);
      } catch (error) {
        console.warn('Failed to analyze mood preview:', error);
      } finally {
        setIsAnalyzingMood(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      if (onError) onError('Please enter a message');
      return;
    }

    if (!location) {
      if (onError) onError('Location is required to create a message');
      return;
    }

    try {
      setIsCreating(true);

      const request: CreateMessageRequest = {
        content: content.trim(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        isAnonymous,
        isEphemeral,
        expirationHours: isEphemeral ? expirationHours : undefined
      };

      const message = await messageService.createMessage(request);

      if (onMessageCreated) {
        onMessageCreated(message);
      }

      // Reset form
      setContent('');
      setMoodPreview(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create message';
      if (onError) onError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const getMoodColor = (sentiment: number): string => {
    if (sentiment > 0.3) return 'border-green-300 bg-green-50';
    if (sentiment < -0.3) return 'border-red-300 bg-red-50';
    return 'border-gray-300 bg-gray-50';
  };

  return (
    <div className={`create-message ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Leave a Whisper</h2>
          <p className="text-purple-100">
            Share your heart with someone who might need to hear it
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Location Status */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-700 font-medium">
                {location ? 'Location captured' : 'Location required'}
              </span>
            </div>
            {!location && (
              <button
                type="button"
                onClick={requestLocation}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Get Location
              </button>
            )}
          </div>

          {locationError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{locationError}</p>
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Your Message
            </label>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's in your heart? Share something beautiful, encouraging, or meaningful..."
                maxLength={maxChars}
                rows={4}
                className={`w-full p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  moodPreview ? getMoodColor(moodPreview.sentiment) : 'border-gray-300'
                }`}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {content.length}/{maxChars}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{wordCount} words</span>
              {isAnalyzingMood && (
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing mood...</span>
                </span>
              )}
            </div>
          </div>

          {/* Mood Preview */}
          {moodPreview && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Emotional Tone Preview</h3>
              <MoodVisualization
                moodEmbedding={moodPreview}
                className="h-32"
              />
            </div>
          )}

          {/* Message Settings */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700">Message Settings</h3>
            
            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Anonymous</label>
                <p className="text-xs text-gray-500">Hide your identity from other users</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnonymous ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnonymous ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Ephemeral Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Ephemeral</label>
                <p className="text-xs text-gray-500">Message will disappear after some time</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEphemeral(!isEphemeral)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEphemeral ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEphemeral ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Expiration Time */}
            {isEphemeral && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires in {expirationHours} hours
                </label>
                <input
                  type="range"
                  min="1"
                  max="168"
                  value={expirationHours}
                  onChange={(e) => setExpirationHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1h</span>
                  <span>1 week</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!content.trim() || !location || isCreating}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating your whisper...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span>Send Whisper</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};