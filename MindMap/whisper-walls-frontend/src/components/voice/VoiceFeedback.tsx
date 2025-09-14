import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService, type GeneratedNarration, type MoodNarrationRequest } from '../../services/voiceService';
import type { MoodEmbedding } from '../../types';
import { 
  DreamyInteraction, 
  EmotionalPulse, 
  SparkleEffect,
  MagicalShimmer,
  ParticleSystem
} from '../animations';

interface VoiceFeedbackProps {
  moodEmbedding: MoodEmbedding;
  userName?: string;
  className?: string;
}

export const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({
  moodEmbedding,
  userName,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNarration, setCurrentNarration] = useState<GeneratedNarration | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'insights' | 'affirmations' | 'guidance' | 'celebration' | 'comfort'>('insights');
  const [audioProgress, setAudioProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleGenerateNarration = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const request: MoodNarrationRequest = {
        moodEmbedding,
        narrationStyle: selectedStyle,
        personalizedContext: {
          userName,
          timeOfDay: getTimeOfDay(),
          relationshipStatus: 'single' // This could be dynamic
        },
        voicePreference: getVoicePreferenceForStyle(selectedStyle)
      };

      const narration = await voiceService.generateMoodNarration(request);
      setCurrentNarration(narration);
    } catch (error) {
      console.error('Error generating narration:', error);
      setError('Failed to generate voice feedback. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!currentNarration || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setAudioProgress(progress);
      }
    }, 100);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const getVoicePreferenceForStyle = (style: string): 'warm' | 'gentle' | 'energetic' | 'soothing' => {
    const mapping: Record<string, any> = {
      insights: 'warm',
      affirmations: 'energetic',
      guidance: 'gentle',
      celebration: 'energetic',
      comfort: 'soothing'
    };
    return mapping[style] || 'warm';
  };

  const getDominantEmotion = (): string => {
    return Object.entries(moodEmbedding.emotions)
      .reduce((a, b) => moodEmbedding.emotions[a[0] as keyof typeof moodEmbedding.emotions] > 
                       moodEmbedding.emotions[b[0] as keyof typeof moodEmbedding.emotions] ? a : b)[0];
  };

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      joy: '#FFD700',
      sadness: '#4A90E2',
      anger: '#E74C3C',
      fear: '#9B59B6',
      surprise: '#E91E63',
      disgust: '#4CAF50',
      trust: '#00BCD4',
      anticipation: '#FF9800'
    };
    return colors[emotion] || '#6B7280';
  };

  const getStyleIcon = (style: string): string => {
    const icons: Record<string, string> = {
      insights: '🔍',
      affirmations: '✨',
      guidance: '🧭',
      celebration: '🎉',
      comfort: '🤗'
    };
    return icons[style] || '💝';
  };

  const getStyleDescription = (style: string): string => {
    const descriptions: Record<string, string> = {
      insights: 'Deep analysis of your emotional state',
      affirmations: 'Uplifting and empowering messages',
      guidance: 'Gentle direction for emotional wellbeing',
      celebration: 'Joyful recognition of your journey',
      comfort: 'Soothing support during difficult times'
    };
    return descriptions[style] || 'Personalized emotional support';
  };

  const dominantEmotion = getDominantEmotion();
  const emotionColor = getEmotionColor(dominantEmotion);

  return (
    <div className={`voice-feedback ${className}`}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
        {/* Background effects */}
        <ParticleSystem 
          type="stardust" 
          count={4} 
          intensity="low" 
          direction="random" 
          speed="slow"
          className="opacity-20"
        />
        
        {isPlaying && (
          <SparkleEffect count={6} intensity="magical" color={dominantEmotion} />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              🎙️ AI Voice Companion
            </h3>
            <p className="text-gray-600">
              Receive empathetic voice feedback tailored to your emotional state
            </p>
          </div>

          {/* Style Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Choose Your Voice Experience
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(['insights', 'affirmations', 'guidance', 'celebration', 'comfort'] as const).map((style) => (
                <DreamyInteraction key={style}>
                  <button
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 text-center ${
                      selectedStyle === style
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{getStyleIcon(style)}</div>
                    <div className="text-sm font-medium capitalize">{style}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getStyleDescription(style)}
                    </div>
                  </button>
                </DreamyInteraction>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-6">
            <DreamyInteraction>
              <motion.button
                onClick={handleGenerateNarration}
                disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Your Voice Message...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{getStyleIcon(selectedStyle)}</span>
                    <span>Generate Voice Feedback</span>
                  </div>
                )}
              </motion.button>
            </DreamyInteraction>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="text-red-500">⚠️</div>
                <span className="text-red-700">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Voice Player */}
          <AnimatePresence>
            {currentNarration && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <MagicalShimmer intensity="subtle" color="rainbow" trigger={isPlaying}>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    {/* Audio Player */}
                    <div className="flex items-center space-x-4 mb-4">
                      <EmotionalPulse emotion={dominantEmotion as any} intensity={isPlaying ? 0.8 : 0.4}>
                        <DreamyInteraction>
                          <button
                            onClick={handlePlayPause}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {isPlaying ? (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            )}
                          </button>
                        </DreamyInteraction>
                      </EmotionalPulse>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {selectedStyle} • {currentNarration.emotionalTone}
                          </span>
                          <span className="text-sm text-gray-500">
                            {Math.round(currentNarration.duration)}s
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                            style={{ width: `${audioProgress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Audio Element */}
                    <audio
                      ref={audioRef}
                      src={currentNarration.audioUrl}
                      onEnded={handleAudioEnded}
                      onLoadedMetadata={() => {
                        if (audioRef.current) {
                          // Audio is ready to play
                        }
                      }}
                    />

                    {/* Transcript Toggle */}
                    <div className="text-center">
                      <DreamyInteraction>
                        <button
                          onClick={() => setShowTranscript(!showTranscript)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                        >
                          {showTranscript ? 'Hide' : 'Show'} Transcript
                        </button>
                      </DreamyInteraction>
                    </div>
                  </div>
                </MagicalShimmer>

                {/* Transcript */}
                <AnimatePresence>
                  {showTranscript && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                    >
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Voice Message Transcript
                      </h4>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed italic">
                          "{currentNarration.text}"
                        </p>
                      </div>

                      {/* Key Messages */}
                      {currentNarration.keyMessages.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-gray-800 mb-3">Key Messages</h5>
                          <div className="space-y-2">
                            {currentNarration.keyMessages.map((message, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-blue-800 text-sm">{message}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Affirmations */}
                      {currentNarration.affirmations.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-gray-800 mb-3">Affirmations</h5>
                          <div className="space-y-2">
                            {currentNarration.affirmations.map((affirmation, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg"
                              >
                                <div className="text-green-500">✨</div>
                                <span className="text-green-800 text-sm font-medium">{affirmation}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visual Feedback During Playback */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 pointer-events-none z-50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <ParticleSystem 
                    type="hearts" 
                    count={12} 
                    intensity="medium" 
                    direction="random" 
                    speed="slow"
                    className="opacity-60"
                  />
                </div>
                
                {/* Pulsing emotion indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <EmotionalPulse emotion={dominantEmotion as any} intensity={1.0}>
                    <div 
                      className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
                      style={{ backgroundColor: emotionColor }}
                    >
                      🎙️
                    </div>
                  </EmotionalPulse>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};