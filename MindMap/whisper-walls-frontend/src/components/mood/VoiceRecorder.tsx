import React, { useEffect } from 'react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { moodService, MoodAnalysisResult } from '../../services/moodService';

interface VoiceRecorderProps {
  onAnalysisComplete?: (result: MoodAnalysisResult) => void;
  onError?: (error: string) => void;
  className?: string;
  context?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAnalysisComplete,
  onError,
  className = '',
  context
}) => {
  const {
    isRecording,
    isProcessing,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    playRecording,
    cleanup
  } = useVoiceRecording();

  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleAnalyzeVoice = async () => {
    if (!audioBlob) return;

    try {
      setIsAnalyzing(true);
      
      // Check audio blob size (should be reasonable for API)
      if (audioBlob.size > 25 * 1024 * 1024) { // 25MB limit
        throw new Error('Audio file is too large. Please record a shorter message.');
      }
      
      if (audioBlob.size < 1000) { // Very small file, likely empty
        throw new Error('Recording seems too short. Please try recording again.');
      }
      
      const result = await moodService.analyzeVoiceMood(audioBlob, context);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      let errorMessage = 'Failed to analyze voice';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('transcribe') || error.message.includes('whisper')) {
          errorMessage = 'Could not process your voice. Try speaking more clearly or use text input instead.';
        } else {
          errorMessage = error.message;
        }
      }
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`voice-recorder ${className}`}>
      <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
        {/* Recording Status */}
        <div className="text-center">
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording... {formatDuration(duration)}</span>
            </div>
          )}
          
          {audioBlob && !isRecording && (
            <div className="text-green-600 font-medium">
              Recording ready ({formatDuration(duration)})
            </div>
          )}
          
          {!isRecording && !audioBlob && (
            <div className="text-gray-600">
              Tap to record your voice
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center space-x-4">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </button>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={playRecording}
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={clearRecording}
                className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                onClick={handleAnalyzeVoice}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Analyze Mood</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center max-w-sm">
          {!audioBlob && !isRecording && (
            "Share your feelings through voice. We'll analyze your emotions and provide personalized insights."
          )}
          {isRecording && (
            "Speak naturally about how you're feeling. We'll capture the emotion in your voice."
          )}
          {audioBlob && (
            "Play back your recording or analyze it to discover your emotional state."
          )}
        </div>
      </div>
    </div>
  );
};