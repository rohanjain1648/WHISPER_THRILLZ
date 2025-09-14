import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService, type GeneratedNarration } from '../../services/voiceService';
import type { MoodEmbedding } from '../../types';
import { 
  DreamyInteraction, 
  EmotionalPulse, 
  SparkleEffect,
  MagicalShimmer,
  ParticleSystem
} from '../animations';

interface CoupleVoiceNarrationProps {
  user1Mood: MoodEmbedding;
  user2Mood: MoodEmbedding;
  user1Name: string;
  user2Name: string;
  compatibility: number;
  className?: string;
}

export const CoupleVoiceNarration: React.FC<CoupleVoiceNarrationProps> = ({
  user1Mood,
  user2Mood,
  user1Name,
  user2Name,
  compatibility,
  className = ''
}) => {
  const [narration, setNarration] = useState<GeneratedNarration | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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

      const generatedNarration = await voiceService.generateCoupleNarration(
        user1Mood,
        user2Mood,
        user1Name,
        user2Name,
        compatibility
      );
      
      setNarration(generatedNarration);
    } catch (error) {
      console.error('Error generating couple narration:', error);
      setError('Failed to generate couple narration. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!narration || !audioRef.current) return;

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

  const getDominantEmotion = (mood: MoodEmbedding): string => {
    return Object.entries(mood.emotions)
      .reduce((a, b) => mood.emotions[a[0] as keyof typeof mood.emotions] > 
                       mood.emotions[b[0] as keyof typeof mood.emotions] ? a : b)[0];
  };

  const getCompatibilityColor = (): string => {
    if (compatibility > 0.8) return '#10B981';
    if (compatibility > 0.6) return '#F59E0B';
    if (compatibility > 0.4) return '#EF4444';
    return '#6B7280';
  };

  const getCompatibilityLabel = (): string => {
    if (compatibility > 0.8) return 'Perfect Harmony';
    if (compatibility > 0.6) return 'Beautiful Connection';
    if (compatibility > 0.4) return 'Growing Together';
    return 'Unique Journey';
  };

  const user1Emotion = getDominantEmotion(user1Mood);
  const user2Emotion = getDominantEmotion(user2Mood);
  const compatibilityColor = getCompatibilityColor();

  return (
    <div className={`couple-voice-narration ${className}`}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
        {/* Background effects */}
        <ParticleSystem 
          type="hearts" 
          count={6} 
          intensity="low" 
          direction="random" 
          speed="slow"
          className="opacity-20"
        />
        
        {isPlaying && (
          <SparkleEffect count={8} intensity="magical" color="pink" pattern="heart" />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              💕 Couple Voice Insights
            </h3>
            <p className="text-gray-600">
              AI-powered relationship narration based on your emotional harmony
            </p>
          </div>

          {/* Couple Overview */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User 1 */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-semibold text-lg">
                  {user1Name.charAt(0)}
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{user1Name}</h4>
                <div className="text-sm text-gray-600 capitalize">{user1Emotion}</div>
                <div className="text-xs text-gray-500">
                  {user1Mood.sentiment > 0 ? '+' : ''}{(user1Mood.sentiment * 100).toFixed(0)} sentiment
                </div>
              </div>

              {/* Compatibility */}
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
                <EmotionalPulse emotion="love" intensity={compatibility}>
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: compatibilityColor }}
                  >
                    {(compatibility * 100).toFixed(0)}%
                  </div>
                </EmotionalPulse>
                <h4 className="font-semibold text-gray-800 mb-1">Harmony</h4>
                <div className="text-sm text-gray-600">{getCompatibilityLabel()}</div>
                <div className="text-xs text-gray-500">Emotional compatibility</div>
              </div>

              {/* User 2 */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-semibold text-lg">
                  {user2Name.charAt(0)}
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{user2Name}</h4>
                <div className="text-sm text-gray-600 capitalize">{user2Emotion}</div>
                <div className="text-xs text-gray-500">
                  {user2Mood.sentiment > 0 ? '+' : ''}{(user2Mood.sentiment * 100).toFixed(0)} sentiment
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-6">
            <DreamyInteraction>
              <motion.button
                onClick={handleGenerateNarration}
                disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Your Love Story...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>💕</span>
                    <span>Generate Couple Insights</span>
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
            {narration && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <MagicalShimmer intensity="magical" color="rainbow" trigger={isPlaying}>
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                    {/* Audio Player */}
                    <div className="flex items-center space-x-4 mb-4">
                      <EmotionalPulse emotion="love" intensity={isPlaying ? 1.0 : 0.6}>
                        <DreamyInteraction>
                          <button
                            onClick={handlePlayPause}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
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
                          <span className="text-sm font-medium text-gray-700">
                            Couple Insights • {narration.emotionalTone}
                          </span>
                          <span className="text-sm text-gray-500">
                            {Math.round(narration.duration)}s
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500"
                            style={{ width: `${audioProgress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Audio Element */}
                    <audio
                      ref={audioRef}
                      src={narration.audioUrl}
                      onEnded={handleAudioEnded}
                      onLoadedMetadata={() => {
                        // Audio is ready to play
                      }}
                    />

                    {/* Transcript Toggle */}
                    <div className="text-center">
                      <DreamyInteraction>
                        <button
                          onClick={() => setShowTranscript(!showTranscript)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                        >
                          {showTranscript ? 'Hide' : 'Show'} Love Story Transcript
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
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">💕</span>
                        Your Love Story Narration
                      </h4>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed italic text-lg">
                          "{narration.text}"
                        </p>
                      </div>

                      {/* Key Messages */}
                      {narration.keyMessages.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="mr-2">🌟</span>
                            Relationship Highlights
                          </h5>
                          <div className="space-y-2">
                            {narration.keyMessages.map((message, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200"
                              >
                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                <span className="text-pink-800 text-sm font-medium">{message}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Affirmations */}
                      {narration.affirmations.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="mr-2">💫</span>
                            Love Affirmations
                          </h5>
                          <div className="space-y-2">
                            {narration.affirmations.map((affirmation, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                              >
                                <div className="text-yellow-500">💕</div>
                                <span className="text-yellow-800 text-sm font-medium">{affirmation}</span>
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
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10">
                  <ParticleSystem 
                    type="hearts" 
                    count={15} 
                    intensity="high" 
                    direction="random" 
                    speed="slow"
                    className="opacity-60"
                  />
                </div>
                
                {/* Pulsing couple indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <EmotionalPulse emotion="love" intensity={1.0}>
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                      💕
                    </div>
                  </EmotionalPulse>
                </div>
                
                {/* Floating names */}
                <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-2xl font-bold text-pink-600 opacity-80"
                  >
                    {user1Name}
                  </motion.div>
                </div>
                
                <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-2xl font-bold text-purple-600 opacity-80"
                  >
                    {user2Name}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};