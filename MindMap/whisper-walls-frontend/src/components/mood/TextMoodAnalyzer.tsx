import React, { useState } from 'react';
import { moodService, MoodAnalysisResult } from '../../services/moodService';

import type { MoodEmbedding } from '../../types';

interface TextMoodAnalyzerProps {
  onAnalysisComplete?: (result: MoodAnalysisResult) => void;
  onMoodAnalyzed?: (mood: MoodEmbedding) => void;
  onError?: (error: string) => void;
  className?: string;
  context?: string;
  placeholder?: string;
}

export const TextMoodAnalyzer: React.FC<TextMoodAnalyzerProps> = ({
  onAnalysisComplete,
  onMoodAnalyzed,
  onError,
  className = '',
  context,
  placeholder = "How are you feeling today? Share your thoughts..."
}) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      if (onError) {
        onError('Please enter some text to analyze');
      }
      return;
    }

    try {
      setIsAnalyzing(true);
      const result = await moodService.analyzeTextMood(text.trim(), context);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      if (onMoodAnalyzed) {
        onMoodAnalyzed(result.moodEmbedding);
      }
      
      // Clear text after successful analysis
      setText('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze text';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAnalyze();
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  const maxChars = 2000;

  return (
    <div className={`text-mood-analyzer ${className}`}>
      <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        {/* Text Input */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            maxLength={maxChars}
            className="w-full h-32 p-4 border border-blue-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm placeholder-gray-500"
          />
          
          {/* Character Count */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Word Count and Stats */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{wordCount} words</span>
          <span className="text-xs">Press Ctrl+Enter to analyze</span>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!text.trim() || isAnalyzing}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing your emotions...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Analyze Mood</span>
            </>
          )}
        </button>

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center">
          Share your thoughts, feelings, or experiences. Our AI will analyze the emotional content and provide personalized insights.
        </div>
      </div>
    </div>
  );
};