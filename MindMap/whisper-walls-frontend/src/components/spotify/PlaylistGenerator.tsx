import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  playlistGenerationService, 
  type PlaylistGenerationOptions,
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

interface PlaylistGeneratorProps {
  moodEmbedding: MoodEmbedding;
  onPlaylistGenerated?: (playlist: GeneratedPlaylist) => void;
  className?: string;
}

export const PlaylistGenerator: React.FC<PlaylistGeneratorProps> = ({
  moodEmbedding,
  onPlaylistGenerated,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [generationOptions, setGenerationOptions] = useState<PlaylistGenerationOptions>({
    moodEmbedding,
    playlistLength: 20,
    includePopular: true,
    includeDiscovery: true,
    energyPreference: 'adaptive',
    excludeExplicit: false
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    setGenerationOptions(prev => ({ ...prev, moodEmbedding }));
  }, [moodEmbedding]);

  const handleGeneratePlaylist = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setCurrentStep('Analyzing your mood...');

      // Simulate generation steps with progress
      const steps = [
        { message: 'Analyzing your mood...', progress: 10 },
        { message: 'Mapping emotions to music...', progress: 25 },
        { message: 'Finding perfect genres...', progress: 40 },
        { message: 'Discovering tracks...', progress: 60 },
        { message: 'Calculating mood scores...', progress: 80 },
        { message: 'Finalizing your playlist...', progress: 95 }
      ];

      for (const step of steps) {
        setCurrentStep(step.message);
        setGenerationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Generate the actual playlist
      const playlist = await playlistGenerationService.generateMoodPlaylist(generationOptions);
      
      setGenerationProgress(100);
      setCurrentStep('Playlist ready!');
      setGeneratedPlaylist(playlist);
      onPlaylistGenerated?.(playlist);

    } catch (error) {
      console.error('Error generating playlist:', error);
      setCurrentStep('Failed to generate playlist');
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        setCurrentStep('');
      }, 1000);
    }
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

  const getDominantEmotion = () => {
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

  const dominantEmotion = getDominantEmotion();
  const emotionColor = getEmotionColor(dominantEmotion);

  return (
    <div className={`playlist-generator ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <RevealOnScroll animation="butterfly" withParticles>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              AI Playlist Generator
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Let our AI create the perfect playlist based on your current emotional state. 
              Every track is carefully selected to match your mood and enhance your experience.
            </p>
          </div>
        </RevealOnScroll>

        {/* Mood Context Display */}
        <RevealOnScroll animation="bloom" delay={0.2}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
            <SparkleEffect count={3} intensity="subtle" color={dominantEmotion} />
            
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Current Mood Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EmotionalPulse emotion={dominantEmotion as any} intensity={0.8}>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: emotionColor }}
                    >
                      {(moodEmbedding.emotions[dominantEmotion as keyof typeof moodEmbedding.emotions] * 100).toFixed(0)}%
                    </div>
                    <div className="font-semibold text-gray-800 capitalize">{dominantEmotion}</div>
                    <div className="text-sm text-gray-600">Dominant Emotion</div>
                  </div>
                </EmotionalPulse>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    {moodEmbedding.sentiment > 0 ? '+' : ''}{(moodEmbedding.sentiment * 100).toFixed(0)}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {moodEmbedding.sentiment > 0.3 ? 'Positive' : 
                     moodEmbedding.sentiment < -0.3 ? 'Reflective' : 'Balanced'}
                  </div>
                  <div className="text-sm text-gray-600">Sentiment</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-green-500 to-emerald-600">
                    {(moodEmbedding.intensity * 100).toFixed(0)}%
                  </div>
                  <div className="font-semibold text-gray-800">
                    {moodEmbedding.intensity > 0.7 ? 'High' : 
                     moodEmbedding.intensity > 0.4 ? 'Medium' : 'Low'}
                  </div>
                  <div className="text-sm text-gray-600">Intensity</div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Generation Options */}
        <RevealOnScroll animation="fadeUp" delay={0.4}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Playlist Options
              </h3>
              <DreamyInteraction>
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                >
                  {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                </button>
              </DreamyInteraction>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Length
                </label>
                <select
                  value={generationOptions.playlistLength}
                  onChange={(e) => setGenerationOptions(prev => ({ 
                    ...prev, 
                    playlistLength: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={10}>10 tracks (~30 min)</option>
                  <option value={15}>15 tracks (~45 min)</option>
                  <option value={20}>20 tracks (~1 hour)</option>
                  <option value={25}>25 tracks (~1.5 hours)</option>
                  <option value={30}>30 tracks (~2 hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Preference
                </label>
                <select
                  value={generationOptions.energyPreference}
                  onChange={(e) => setGenerationOptions(prev => ({ 
                    ...prev, 
                    energyPreference: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="adaptive">Adaptive (Match Mood)</option>
                  <option value="low">Low Energy</option>
                  <option value="medium">Medium Energy</option>
                  <option value="high">High Energy</option>
                </select>
              </div>
            </div>

            <AnimatePresence>
              {showAdvancedOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Context
                      </label>
                      <select
                        value={generationOptions.timeContext || ''}
                        onChange={(e) => setGenerationOptions(prev => ({ 
                          ...prev, 
                          timeContext: e.target.value as any || undefined
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Auto-detect</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weather Context
                      </label>
                      <select
                        value={generationOptions.weatherContext || ''}
                        onChange={(e) => setGenerationOptions(prev => ({ 
                          ...prev, 
                          weatherContext: e.target.value as any || undefined
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">No preference</option>
                        <option value="sunny">Sunny</option>
                        <option value="rainy">Rainy</option>
                        <option value="cloudy">Cloudy</option>
                        <option value="stormy">Stormy</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={generationOptions.includePopular}
                        onChange={(e) => setGenerationOptions(prev => ({ 
                          ...prev, 
                          includePopular: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Popular Tracks</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={generationOptions.includeDiscovery}
                        onChange={(e) => setGenerationOptions(prev => ({ 
                          ...prev, 
                          includeDiscovery: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include Discovery Tracks</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={generationOptions.excludeExplicit}
                        onChange={(e) => setGenerationOptions(prev => ({ 
                          ...prev, 
                          excludeExplicit: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Exclude Explicit Content</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <DreamyInteraction>
                <motion.button
                  onClick={handleGeneratePlaylist}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>✨</span>
                      <span>Generate My Playlist</span>
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
                type="stardust" 
                count={6} 
                intensity="medium" 
                direction="random" 
                speed="medium"
                className="opacity-30"
              />
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Creating Your Perfect Playlist
                  </h3>
                  <p className="text-gray-600">{currentStep}</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
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
              <MagicalShimmer intensity="subtle" color="rainbow" trigger={true}>
                <SparkleEffect count={5} intensity="magical" color="gold" />
                
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      🎵 {generatedPlaylist.name}
                    </h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      {generatedPlaylist.description}
                    </p>
                  </div>

                  {/* Playlist Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {generatedPlaylist.tracks.length}
                      </div>
                      <div className="text-sm text-gray-600">Tracks</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {formatDuration(generatedPlaylist.totalDuration)}
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {(generatedPlaylist.audioFeaturesSummary.avgEnergy * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Energy</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {(generatedPlaylist.audioFeaturesSummary.avgValence * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Positivity</div>
                    </div>
                  </div>

                  {/* Track List Preview */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {generatedPlaylist.tracks.slice(0, 5).map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
                            {track.reasonForInclusion}
                          </div>
                        </div>
                        
                        <div className="text-sm text-purple-600 font-medium">
                          {(track.moodScore * 100).toFixed(0)}%
                        </div>
                      </motion.div>
                    ))}
                    
                    {generatedPlaylist.tracks.length > 5 && (
                      <div className="text-center text-gray-500 text-sm py-2">
                        + {generatedPlaylist.tracks.length - 5} more tracks...
                      </div>
                    )}
                  </div>

                  <div className="mt-6 text-center">
                    <DreamyInteraction>
                      <button
                        onClick={() => {
                          // This would integrate with the PlaylistManager to create the actual Spotify playlist
                          console.log('Creating Spotify playlist:', generatedPlaylist);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow hover:shadow-md transition-all duration-300"
                      >
                        Create in Spotify
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