import React, { useState, useCallback } from 'react';
import { TextMoodAnalyzer } from './TextMoodAnalyzer';
import { VoiceMoodAnalyzer } from './VoiceMoodAnalyzer';
import { MoodVisualization } from './MoodVisualization';
import type { MoodEmbedding } from '../../types';

interface MoodAnalyzerProps {
  onMoodAnalyzed?: (mood: MoodEmbedding) => void;
  onError?: (error: string) => void;
  className?: string;
  context?: string;
  defaultMode?: 'text' | 'voice';
}

export const MoodAnalyzer: React.FC<MoodAnalyzerProps> = ({
  onMoodAnalyzed,
  onError,
  className = '',
  context = 'general_mood_analysis',
  defaultMode = 'text'
}) => {
  const [activeMode, setActiveMode] = useState<'text' | 'voice'>(defaultMode);
  const [moodHistory, setMoodHistory] = useState<MoodEmbedding[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleMoodAnalyzed = useCallback((mood: MoodEmbedding) => {
    setMoodHistory(prev => [...prev, mood]);
    if (onMoodAnalyzed) {
      onMoodAnalyzed(mood);
    }
  }, [onMoodAnalyzed]);

  const handleError = useCallback((error: string) => {
    if (onError) {
      onError(error);
    }
  }, [onError]);

  const clearHistory = useCallback(() => {
    setMoodHistory([]);
  }, []);

  const getAverageMood = useCallback((): MoodEmbedding | null => {
    if (moodHistory.length === 0) return null;

    const avgEmotions = {
      joy: 0, sadness: 0, anger: 0, fear: 0,
      surprise: 0, disgust: 0, trust: 0, anticipation: 0
    };

    let avgSentiment = 0;
    let avgIntensity = 0;

    moodHistory.forEach(mood => {
      Object.keys(avgEmotions).forEach(emotion => {
        avgEmotions[emotion as keyof typeof avgEmotions] += 
          mood.emotions[emotion as keyof typeof mood.emotions];
      });
      avgSentiment += mood.sentiment;
      avgIntensity += mood.intensity;
    });

    const count = moodHistory.length;
    Object.keys(avgEmotions).forEach(emotion => {
      avgEmotions[emotion as keyof typeof avgEmotions] /= count;
    });

    return {
      emotions: avgEmotions,
      sentiment: avgSentiment / count,
      intensity: avgIntensity / count,
      timestamp: new Date()
    };
  }, [moodHistory]);

  return (
    <div className={`mood-analyzer ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mood Analysis
          </h1>
          <p className="text-gray-600">
            Discover your emotional landscape through text or voice
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setActiveMode('text')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeMode === 'text'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                <span>Text</span>
              </div>
            </button>
            <button
              onClick={() => setActiveMode('voice')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeMode === 'voice'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span>Voice</span>
              </div>
            </button>
          </div>
        </div>

        {/* Analysis Interface */}
        <div className="transition-all duration-500">
          {activeMode === 'text' ? (
            <TextMoodAnalyzer
              onMoodAnalyzed={handleMoodAnalyzed}
              onError={handleError}
              context={context}
              className="w-full"
            />
          ) : (
            <VoiceMoodAnalyzer
              onMoodAnalyzed={handleMoodAnalyzed}
              onError={handleError}
              context={context}
              className="w-full"
            />
          )}
        </div>

        {/* Mood History */}
        {moodHistory.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                Your Emotional Journey
              </h3>
              <button
                onClick={clearHistory}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear History
              </button>
            </div>

            {/* Average Mood Summary */}
            {moodHistory.length > 1 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Overall Emotional Pattern ({moodHistory.length} analyses)
                </h4>
                
                {getAverageMood() && (
                  <MoodVisualization
                    moodData={[getAverageMood()!]}
                    type="radar"
                    className="h-48"
                  />
                )}
              </div>
            )}

            {/* Recent Mood Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mood Timeline
              </h4>
              
              <MoodVisualization
                moodData={moodHistory}
                type="line"
                className="h-64"
              />
            </div>

            {/* Individual Mood Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moodHistory.slice(-6).reverse().map((mood, index) => {
                const dominantEmotion = Object.entries(mood.emotions).reduce((a, b) => 
                  mood.emotions[a[0] as keyof typeof mood.emotions] > mood.emotions[b[0] as keyof typeof mood.emotions] ? a : b
                )[0];

                const emotionColors = {
                  joy: 'bg-yellow-100 border-yellow-300 text-yellow-800',
                  sadness: 'bg-blue-100 border-blue-300 text-blue-800',
                  anger: 'bg-red-100 border-red-300 text-red-800',
                  fear: 'bg-purple-100 border-purple-300 text-purple-800',
                  surprise: 'bg-orange-100 border-orange-300 text-orange-800',
                  disgust: 'bg-green-100 border-green-300 text-green-800',
                  trust: 'bg-teal-100 border-teal-300 text-teal-800',
                  anticipation: 'bg-pink-100 border-pink-300 text-pink-800'
                };

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${emotionColors[dominantEmotion as keyof typeof emotionColors] || 'bg-gray-100 border-gray-300 text-gray-800'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{dominantEmotion}</span>
                      <span className="text-xs opacity-75">
                        {mood.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Sentiment: {mood.sentiment > 0 ? '+' : ''}{(mood.sentiment * 100).toFixed(0)}%</div>
                      <div>Intensity: {(mood.intensity * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};