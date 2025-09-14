import React, { useState, useCallback } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { MoodVisualization } from './MoodVisualization';
import { moodService, MoodAnalysisResult } from '../../services/moodService';
import { MoodEmbedding } from '../../types';

interface VoiceMoodAnalyzerProps {
  onMoodAnalyzed?: (mood: MoodEmbedding) => void;
  onError?: (error: string) => void;
  className?: string;
  context?: string;
}

export const VoiceMoodAnalyzer: React.FC<VoiceMoodAnalyzerProps> = ({
  onMoodAnalyzed,
  onError,
  className = '',
  context = 'voice_mood_analysis'
}) => {
  const [analysisResult, setAnalysisResult] = useState<MoodAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = useCallback(async (result: MoodAnalysisResult) => {
    try {
      setAnalysisResult(result);
      setError(null);
      
      if (onMoodAnalyzed) {
        onMoodAnalyzed(result.moodEmbedding);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process mood analysis';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [onMoodAnalyzed, onError]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setAnalysisResult(null);
    if (onError) {
      onError(errorMessage);
    }
  }, [onError]);

  const clearResults = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
  }, []);

  const getDominantEmotion = (emotions: MoodEmbedding['emotions']): string => {
    return Object.entries(emotions).reduce((a, b) => 
      emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b
    )[0];
  };

  const getEmotionColor = (emotion: string): string => {
    const colors = {
      joy: 'text-yellow-500',
      sadness: 'text-blue-500',
      anger: 'text-red-500',
      fear: 'text-purple-500',
      surprise: 'text-orange-500',
      disgust: 'text-green-500',
      trust: 'text-teal-500',
      anticipation: 'text-pink-500'
    };
    return colors[emotion as keyof typeof colors] || 'text-gray-500';
  };

  const getSentimentDescription = (sentiment: number): { text: string; color: string } => {
    if (sentiment > 0.3) {
      return { text: 'Positive', color: 'text-green-500' };
    } else if (sentiment < -0.3) {
      return { text: 'Negative', color: 'text-red-500' };
    } else {
      return { text: 'Neutral', color: 'text-gray-500' };
    }
  };

  const getIntensityDescription = (intensity: number): string => {
    if (intensity > 0.7) return 'Very Intense';
    if (intensity > 0.4) return 'Moderate';
    return 'Calm';
  };

  return (
    <div className={`voice-mood-analyzer ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Voice Mood Analysis
          </h2>
          <p className="text-gray-600">
            Share your feelings through voice and discover your emotional landscape
          </p>
        </div>

        {/* Voice Recorder */}
        <VoiceRecorder
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
          context={context}
          className="w-full"
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">Analysis Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={clearResults}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Mood Overview */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Your Emotional State
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    <span className={getEmotionColor(getDominantEmotion(analysisResult.moodEmbedding.emotions))}>
                      {getDominantEmotion(analysisResult.moodEmbedding.emotions).charAt(0).toUpperCase() + 
                       getDominantEmotion(analysisResult.moodEmbedding.emotions).slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Dominant Emotion</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    <span className={getSentimentDescription(analysisResult.moodEmbedding.sentiment).color}>
                      {getSentimentDescription(analysisResult.moodEmbedding.sentiment).text}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Overall Sentiment</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {getIntensityDescription(analysisResult.moodEmbedding.intensity)}
                  </div>
                  <div className="text-sm text-gray-600">Emotional Intensity</div>
                </div>
              </div>
            </div>

            {/* Mood Visualization */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Emotional Breakdown
              </h3>
              <MoodVisualization 
                moodData={[analysisResult.moodEmbedding]}
                type="radar"
                className="h-64"
              />
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Insights & Recommendations
              </h3>
              
              <div className="space-y-3">
                {analysisResult.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Analysis Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysisResult.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-blue-600">
                      {Math.round(analysisResult.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={clearResults}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Analyze Again</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};