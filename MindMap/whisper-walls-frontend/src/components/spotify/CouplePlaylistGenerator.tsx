import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  playlistGenerationService,
  type GeneratedPlaylist 
} from '../../services/playlistGenerationService';
import type { MoodEmbedding } from '../../types';
import { 
  DreamyInteraction, 
  EmotionalPulse, 
  SparkleEffect,
  MagicalShimmer,
  ParticleSystem,
  RevealOnScroll
} from '../animations';

interface CouplePlaylistGeneratorProps {
  user1Mood: MoodEmbedding;
  user2Mood: MoodEmbedding;
  user1Name: string;
  user2Name: string;
  onPlaylistGenerated?: (playlist: GeneratedPlaylist) => void;
  className?: string;
}

export const CouplePlaylistGenerator: React.FC<CouplePlaylistGeneratorProps> = ({
  user1Mood,
  user2Mood,
  user1Name,
  user2Name,
  onPlaylistGenerated,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [playlistLength, setPlaylistLength] = useState(25);
  const [energyPreference, setEnergyPreference] = useState<'low' | 'medium' | 'high' | 'adaptive'>('adaptive');
  const [showMoodComparison, setShowMoodComparison] = useState(true);

  const handleGenerateCouplePlaylist = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setCurrentStep('Analyzing both moods...');

      // Simulate generation steps with progress
      const steps = [
        { message: 'Analyzing both moods...', progress: 10 },
        { message: 'Finding emotional harmony...', progress: 25 },
        { message: 'Blending your musical tastes...', progress: 40 },
        { message: 'Discovering shared vibes...', progress: 60 },
        { message: 'Creating your connection soundtrack...', progress: 80 },
        { message: 'Finalizing your couple playlist...', progress: 95 }
      ];

      for (const step of steps) {
        setCurrentStep(step.message);
        setGenerationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate the actual couple playlist
      const playlist = await playlistGenerationService.generateCouplePlaylist(
        user1Mood,
        user2Mood,
        user1Name,
        user2Name,
        {
          playlistLength,
          energyPreference,
          includePopular: true,
          includeDiscovery: true
        }
      );
      
      setGenerationProgress(100);
      setCurrentStep('Your couple playlist is ready!');
      setGeneratedPlaylist(playlist);
      onPlaylistGenerated?.(playlist);

    } catch (error) {
      console.error('Error generating couple playlist:', error);
      setCurrentStep('Failed to generate playlist');
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        setCurrentStep('');
      }, 1500);
    }
  };

  const calculateCompatibility = (): number => {
    // Calculate emotional compatibility between the two moods
    const emotionDistance = Object.keys(user1Mood.emotions).reduce((sum, emotion) => {
      const diff = Math.abs(
        user1Mood.emotions[emotion as keyof typeof user1Mood.emotions] - 
        user2Mood.emotions[emotion as keyof typeof user2Mood.emotions]
      );
      return sum + diff;
    }, 0) / 8;

    const sentimentDistance = Math.abs(user1Mood.sentiment - user2Mood.sentiment);
    const intensityDistance = Math.abs(user1Mood.intensity - user2Mood.intensity);
    
    const totalDistance = (emotionDistance + sentimentDistance + intensityDistance) / 3;
    return Math.max(0, 1 - totalDistance);
  };

  const getDominantEmotion = (mood: MoodEmbedding): string => {
    return Object.entries(mood.emotions)
      .reduce((a, b) => mood.emotions[a[0] as keyof typeof mood.emotions] > 
                       mood.emotions[b[0] as keyof typeof mood.emotions] ? a : b)[0];
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

  const formatDuration = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const compatibility = calculateCompatibility();
  const user1Emotion = getDominantEmotion(user1Mood);
  const user2Emotion = getDominantEmotion(user2Mood);

  return (
    <div className={`couple-playlist-generator ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <RevealOnScroll animation="butterfly" withParticles particleType="hearts">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              💕 Couple Playlist Generator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create a shared musical journey that blends both your emotional energies. 
              Our AI finds the perfect harmony between your moods to strengthen your connection.
            </p>
          </div>
        </RevealOnScroll>

        {/* Mood Comparison */}
        <RevealOnScroll animation="bloom" delay={0.2}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
            <SparkleEffect count={4} intensity="magical" color="pink" pattern="heart" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Emotional Harmony Analysis
                </h3>
                <DreamyInteraction>
                  <button
                    onClick={() => setShowMoodComparison(!showMoodComparison)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                  >
                    {showMoodComparison ? 'Hide' : 'Show'} Details
                  </button>
                </DreamyInteraction>
              </div>

              {/* Compatibility Score */}
              <div className="text-center mb-6">
                <EmotionalPulse emotion="love" intensity={compatibility}>
                  <div 
                    className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{ 
                      backgroundColor: compatibility > 0.8 ? '#10B981' : 
                                     compatibility > 0.6 ? '#F59E0B' : '#EF4444'
                    }}
                  >
                    {(compatibility * 100).toFixed(0)}%
                  </div>
                </EmotionalPulse>
                
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {compatibility > 0.8 ? 'Perfect Harmony' : 
                   compatibility > 0.6 ? 'Great Connection' : 
                   compatibility > 0.4 ? 'Complementary Vibes' : 'Unique Blend'}
                </h4>
                <p className="text-gray-600 text-sm">
                  Your emotional compatibility score for music selection
                </p>
              </div>

              <AnimatePresence>
                {showMoodComparison && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* User 1 Mood */}
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-semibold">
                        {user1Name.charAt(0)}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{user1Name}</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-gray-600">{user1Emotion}</span>
                          <span 
                            className="font-medium"
                            style={{ color: getEmotionColor(user1Emotion) }}
                          >
                            {(user1Mood.emotions[user1Emotion as keyof typeof user1Mood.emotions] * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sentiment</span>
                          <span className="font-medium text-blue-600">
                            {user1Mood.sentiment > 0 ? '+' : ''}{(user1Mood.sentiment * 100).toFixed(0)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Intensity</span>
                          <span className="font-medium text-blue-600">
                            {(user1Mood.intensity * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User 2 Mood */}
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-semibold">
                        {user2Name.charAt(0)}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">{user2Name}</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-gray-600">{user2Emotion}</span>
                          <span 
                            className="font-medium"
                            style={{ color: getEmotionColor(user2Emotion) }}
                          >
                            {(user2Mood.emotions[user2Emotion as keyof typeof user2Mood.emotions] * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sentiment</span>
                          <span className="font-medium text-green-600">
                            {user2Mood.sentiment > 0 ? '+' : ''}{(user2Mood.sentiment * 100).toFixed(0)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Intensity</span>
                          <span className="font-medium text-green-600">
                            {(user2Mood.intensity * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </RevealOnScroll>

        {/* Generation Options */}
        <RevealOnScroll animation="fadeUp" delay={0.4}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Playlist Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Length
                </label>
                <select
                  value={playlistLength}
                  onChange={(e) => setPlaylistLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={15}>15 tracks (~45 min)</option>
                  <option value={20}>20 tracks (~1 hour)</option>
                  <option value={25}>25 tracks (~1.5 hours)</option>
                  <option value={30}>30 tracks (~2 hours)</option>
                  <option value={40}>40 tracks (~2.5 hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Balance
                </label>
                <select
                  value={energyPreference}
                  onChange={(e) => setEnergyPreference(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="adaptive">Adaptive (Blend Both)</option>
                  <option value="low">Chill & Relaxed</option>
                  <option value="medium">Balanced Energy</option>
                  <option value="high">Upbeat & Energetic</option>
                </select>
              </div>
            </div>

            <div className="text-center">
              <DreamyInteraction>
                <motion.button
                  onClick={handleGenerateCouplePlaylist}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Your Connection...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>💕</span>
                      <span>Generate Our Playlist</span>
                    </div>
                  )}
                </motion.button>
              </DreamyInteraction>
            </div>
          </div>
        </RevealOnScroll>

        {/* Generation Progress */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden"
            >
              <ParticleSystem 
                type="hearts" 
                count={8} 
                intensity="medium" 
                direction="random" 
                speed="slow"
                className="opacity-40"
              />
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Blending Your Hearts Through Music
                  </h3>
                  <p className="text-gray-600">{currentStep}</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                <div className="text-center text-sm text-gray-500">
                  {generationProgress}% Complete
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Playlist Display */}
        <AnimatePresence>
          {generatedPlaylist && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden"
            >
              <MagicalShimmer intensity="magical" color="rainbow" trigger={true}>
                <SparkleEffect count={6} intensity="magical" color="pink" pattern="heart" />
                
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      💕 {generatedPlaylist.name}
                    </h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      {generatedPlaylist.description}
                    </p>
                  </div>

                  {/* Playlist Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
                      <div className="text-lg font-bold text-pink-600">
                        {generatedPlaylist.tracks.length}
                      </div>
                      <div className="text-sm text-gray-600">Tracks</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {formatDuration(generatedPlaylist.totalDuration)}
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {(generatedPlaylist.audioFeaturesSummary.avgEnergy * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Energy</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {(compatibility * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Harmony</div>
                    </div>
                  </div>

                  {/* Track List Preview */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {generatedPlaylist.tracks.slice(0, 6).map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">
                            {track.name}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {track.artist}
                          </div>
                          <div className="text-xs text-gray-500">
                            Perfect for your shared {user1Emotion}/{user2Emotion} vibe
                          </div>
                        </div>
                        
                        <div className="text-sm text-pink-600 font-medium">
                          💕 {(track.moodScore * 100).toFixed(0)}%
                        </div>
                      </motion.div>
                    ))}
                    
                    {generatedPlaylist.tracks.length > 6 && (
                      <div className="text-center text-gray-500 text-sm py-2">
                        + {generatedPlaylist.tracks.length - 6} more tracks to discover together...
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-center space-x-4">
                    <DreamyInteraction>
                      <button
                        onClick={() => {
                          // This would integrate with the PlaylistManager to create the actual Spotify playlist
                          console.log('Creating couple Spotify playlist:', generatedPlaylist);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow hover:shadow-md transition-all duration-300"
                      >
                        Create in Spotify
                      </button>
                    </DreamyInteraction>
                    
                    <DreamyInteraction>
                      <button
                        onClick={() => {
                          // Share playlist functionality
                          console.log('Sharing couple playlist:', generatedPlaylist);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow hover:shadow-md transition-all duration-300"
                      >
                        Share Together
                      </button>
                    </DreamyInteraction>
                  </div>
                </div>
              </MagicalShimmer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};