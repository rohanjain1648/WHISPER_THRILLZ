import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService, type GeneratedNarration } from '../../services/voiceService';
import type { MoodEmbedding } from '../../types';
import { 
  DreamyInteraction, 
  EmotionalPulse, 
  SparkleEffect,
  MagicalShimmer,
  ParticleSystem,
  RevealOnScroll
} from '../animations';

interface VoiceAffirmationsProps {
  moodEmbedding: MoodEmbedding;
  userName?: string;
  className?: string;
}

export const VoiceAffirmations: React.FC<VoiceAffirmationsProps> = ({
  moodEmbedding,
  userName,
  className = ''
}) => {
  const [affirmations, setAffirmations] = useState<GeneratedNarration[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [showAllAffirmations, setShowAllAffirmations] = useState(false);
  
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const progressIntervals = useRef<(NodeJS.Timeout | null)[]>([]);

  useEffect(() => {
    return () => {
      // Cleanup intervals on unmount
      progressIntervals.current.forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  const handleGenerateAffirmations = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const generatedAffirmations = await voiceService.generateAffirmations(moodEmbedding, 5);
      setAffirmations(generatedAffirmations);
      
      // Initialize audio refs
      audioRefs.current = new Array(generatedAffirmations.length).fill(null);
      progressIntervals.current = new Array(generatedAffirmations.length).fill(null);
    } catch (error) {
      console.error('Error generating affirmations:', error);
      setError('Failed to generate affirmations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAffirmation = (index: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;

    // Stop any currently playing affirmation
    if (currentlyPlaying !== null && currentlyPlaying !== index) {
      const currentAudio = audioRefs.current[currentlyPlaying];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      if (progressIntervals.current[currentlyPlaying]) {
        clearInterval(progressIntervals.current[currentlyPlaying]!);
      }
    }

    if (currentlyPlaying === index) {
      // Pause current affirmation
      audio.pause();
      setCurrentlyPlaying(null);
      if (progressIntervals.current[index]) {
        clearInterval(progressIntervals.current[index]!);
      }
    } else {
      // Play new affirmation
      audio.play();
      setCurrentlyPlaying(index);
      startProgressTracking(index);
    }
  };

  const startProgressTracking = (index: number) => {
    if (progressIntervals.current[index]) {
      clearInterval(progressIntervals.current[index]!);
    }

    progressIntervals.current[index] = setInterval(() => {
      const audio = audioRefs.current[index];
      if (audio && audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        setPlaybackProgress(prev => ({ ...prev, [index]: progress }));
      }
    }, 100);
  };

  const handleAffirmationEnded = (index: number) => {
    setCurrentlyPlaying(null);
    setPlaybackProgress(prev => ({ ...prev, [index]: 0 }));
    if (progressIntervals.current[index]) {
      clearInterval(progressIntervals.current[index]!);
    }
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

  const getAffirmationIcon = (index: number): string => {
    const icons = ['✨', '🌟', '💫', '⭐', '🌈'];
    return icons[index % icons.length];
  };

  const dominantEmotion = getDominantEmotion();
  const emotionColor = getEmotionColor(dominantEmotion);
  const displayedAffirmations = showAllAffirmations ? affirmations : affirmations.slice(0, 3);

  return (
    <div className={`voice-affirmations ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <RevealOnScroll animation="butterfly" withParticles>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              ✨ Daily Affirmations
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Personalized uplifting messages designed to boost your confidence and emotional wellbeing. 
              Each affirmation is crafted specifically for your current emotional state.
            </p>
          </div>
        </RevealOnScroll>

        {/* Generate Button */}
        <RevealOnScroll animation="fadeUp" delay={0.2}>
          <div className="text-center">
            <DreamyInteraction>
              <motion.button
                onClick={handleGenerateAffirmations}
                disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Your Affirmations...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>✨</span>
                    <span>Generate My Affirmations</span>
                  </div>
                )}
              </motion.button>
            </DreamyInteraction>
          </div>
        </RevealOnScroll>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="text-red-500">⚠️</div>
              <span className="text-red-700">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Affirmations List */}
        <AnimatePresence>
          {affirmations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {displayedAffirmations.map((affirmation, index) => (
                <RevealOnScroll key={index} animation="bloom" delay={index * 0.1}>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
                    {/* Background effects */}
                    {currentlyPlaying === index && (
                      <SparkleEffect count={4} intensity="magical" color="gold" />
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex items-start space-x-4">
                        {/* Play Button */}
                        <EmotionalPulse 
                          emotion="joy" 
                          intensity={currentlyPlaying === index ? 1.0 : 0.6}
                        >
                          <DreamyInteraction>
                            <button
                              onClick={() => handlePlayAffirmation(index)}
                              className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0"
                            >
                              {currentlyPlaying === index ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              )}
                            </button>
                          </DreamyInteraction>
                        </EmotionalPulse>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-2xl">{getAffirmationIcon(index)}</span>
                            <span className="text-sm font-medium text-gray-600">
                              Affirmation {index + 1}
                            </span>
                          </div>
                          
                          <blockquote className="text-lg text-gray-800 font-medium italic mb-4 leading-relaxed">
                            "{affirmation.text}"
                          </blockquote>

                          {/* Progress Bar */}
                          {currentlyPlaying === index && (
                            <div className="mb-4">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                  className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                  style={{ width: `${playbackProgress[index] || 0}%` }}
                                  transition={{ duration: 0.1 }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Key Message */}
                          {affirmation.keyMessages.length > 0 && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-yellow-800 text-sm font-medium">
                                  {affirmation.keyMessages[0]}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Audio Element */}
                          <audio
                            ref={el => audioRefs.current[index] = el}
                            src={affirmation.audioUrl}
                            onEnded={() => handleAffirmationEnded(index)}
                            preload="metadata"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}

              {/* Show More/Less Button */}
              {affirmations.length > 3 && (
                <div className="text-center">
                  <DreamyInteraction>
                    <button
                      onClick={() => setShowAllAffirmations(!showAllAffirmations)}
                      className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                      {showAllAffirmations ? 'Show Less' : `Show ${affirmations.length - 3} More`}
                    </button>
                  </DreamyInteraction>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Context Display */}
        {affirmations.length > 0 && (
          <RevealOnScroll animation="sparkle" delay={0.5}>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Affirmations Tailored for Your {dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)} Energy
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: emotionColor }}
                  >
                    {(moodEmbedding.emotions[dominantEmotion as keyof typeof moodEmbedding.emotions] * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm font-medium text-gray-800 capitalize">{dominantEmotion}</div>
                  <div className="text-xs text-gray-600">Dominant Emotion</div>
                </div>
                
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-500 to-indigo-600">
                    {moodEmbedding.sentiment > 0 ? '+' : ''}{(moodEmbedding.sentiment * 100).toFixed(0)}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {moodEmbedding.sentiment > 0.3 ? 'Positive' : 
                     moodEmbedding.sentiment < -0.3 ? 'Reflective' : 'Balanced'}
                  </div>
                  <div className="text-xs text-gray-600">Sentiment</div>
                </div>
                
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold bg-gradient-to-br from-green-500 to-emerald-600">
                    {(moodEmbedding.intensity * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {moodEmbedding.intensity > 0.7 ? 'High' : 
                     moodEmbedding.intensity > 0.4 ? 'Medium' : 'Low'}
                  </div>
                  <div className="text-xs text-gray-600">Intensity</div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* Global Playback Effects */}
        <AnimatePresence>
          {currentlyPlaying !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                <ParticleSystem 
                  type="stardust" 
                  count={8} 
                  intensity="medium" 
                  direction="up" 
                  speed="slow"
                  className="opacity-40"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};