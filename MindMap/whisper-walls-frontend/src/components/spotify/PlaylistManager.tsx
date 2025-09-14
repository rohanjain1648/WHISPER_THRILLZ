import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  spotifyService, 
  type SpotifyPlaylist, 
  type SpotifyTrack,
  type MoodBasedRecommendations 
} from '../../services/spotifyService';
import type { MoodEmbedding } from '../../types';
import { 
  DreamyInteraction, 
  EmotionalPulse, 
  SparkleEffect,
  RevealOnScroll 
} from '../animations';

interface PlaylistManagerProps {
  moodEmbedding?: MoodEmbedding;
  className?: string;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  moodEmbedding,
  className = ''
}) => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recommendations, setRecommendations] = useState<MoodBasedRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [playlistName, setPlaylistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [moodEmbedding]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user playlists
      const playlistsData = await spotifyService.getUserPlaylists(20);
      setPlaylists(playlistsData.items);

      // Load mood-based recommendations if mood is provided
      if (moodEmbedding) {
        const recommendationsData = await spotifyService.getMoodBasedRecommendations(moodEmbedding, 20);
        setRecommendations(recommendationsData);
        
        // Generate default playlist name based on mood
        const dominantEmotion = Object.entries(moodEmbedding.emotions)
          .reduce((a, b) => moodEmbedding.emotions[a[0] as keyof typeof moodEmbedding.emotions] > 
                           moodEmbedding.emotions[b[0] as keyof typeof moodEmbedding.emotions] ? a : b)[0];
        
        setPlaylistName(`${dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)} Vibes - ${new Date().toLocaleDateString()}`);
      }
    } catch (error) {
      console.error('Error loading playlist data:', error);
      setError('Failed to load playlist data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelection = (trackId: string) => {
    const newSelection = new Set(selectedTracks);
    if (newSelection.has(trackId)) {
      newSelection.delete(trackId);
    } else {
      newSelection.add(trackId);
    }
    setSelectedTracks(newSelection);
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim() || selectedTracks.size === 0) {
      setError('Please enter a playlist name and select at least one track');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const playlist = await spotifyService.createPlaylist({
        name: playlistName.trim(),
        description: moodEmbedding ? 
          `A mood-based playlist created by Whisper Walls based on your emotional state` :
          'Created by Whisper Walls',
        public: false,
        collaborative: false,
        trackIds: Array.from(selectedTracks),
        moodContext: moodEmbedding
      });

      // Refresh playlists
      await loadData();
      
      // Reset form
      setShowCreateForm(false);
      setSelectedTracks(new Set());
      setPlaylistName('');

      // Show success message
      alert(`Playlist "${playlist.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError('Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={`playlist-manager ${className}`}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-gray-600">Loading your music...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`playlist-manager ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your Music Library
          </h2>
          <p className="text-gray-600">
            Manage your playlists and discover new music based on your mood
          </p>
        </div>

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

        {/* Mood-Based Recommendations */}
        {recommendations && (
          <RevealOnScroll animation="bloom">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
              <SparkleEffect count={4} intensity="subtle" color="purple" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      🎵 Recommended for Your Mood
                    </h3>
                    <p className="text-gray-600 text-sm">
                      AI-curated tracks based on your current emotional state
                    </p>
                  </div>
                  
                  <DreamyInteraction>
                    <button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300"
                    >
                      Create Playlist
                    </button>
                  </DreamyInteraction>
                </div>

                {/* Audio Features Display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">
                      {(recommendations.audioFeatures.energy * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Energy</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">
                      {(recommendations.audioFeatures.valence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Positivity</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">
                      {(recommendations.audioFeatures.danceability * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Danceability</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                    <div className="text-lg font-semibold text-orange-600">
                      {Math.round(recommendations.audioFeatures.tempo)}
                    </div>
                    <div className="text-xs text-gray-600">BPM</div>
                  </div>
                </div>

                {/* Create Playlist Form */}
                <AnimatePresence>
                  {showCreateForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Playlist Name
                          </label>
                          <input
                            type="text"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter playlist name..."
                          />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <DreamyInteraction>
                            <button
                              onClick={handleCreatePlaylist}
                              disabled={isCreating || selectedTracks.size === 0}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreating ? 'Creating...' : `Create with ${selectedTracks.size} tracks`}
                            </button>
                          </DreamyInteraction>
                          
                          <button
                            onClick={() => setShowCreateForm(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recommended Tracks */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recommendations.tracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                        selectedTracks.has(track.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => handleTrackSelection(track.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {track.album.images[0]?.url ? (
                            <img
                              src={track.album.images[0].url}
                              alt={track.album.name}
                              className="w-12 h-12 rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white">
                              🎵
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">
                            {track.name}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {track.artists.map(artist => artist.name).join(', ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {track.album.name} • {formatDuration(track.duration_ms)}
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 flex items-center space-x-2">
                          <div className="text-sm text-gray-500">
                            {track.popularity}%
                          </div>
                          
                          {selectedTracks.has(track.id) && (
                            <EmotionalPulse emotion="joy" intensity={0.6}>
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                                ✓
                              </div>
                            </EmotionalPulse>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* Existing Playlists */}
        <RevealOnScroll animation="fadeUp" delay={0.3}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Your Playlists
            </h3>
            
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎵</div>
                <div className="text-gray-600">No playlists found</div>
                <div className="text-sm text-gray-500 mt-2">
                  Create your first mood-based playlist above!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <DreamyInteraction>
                      <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer">
                        <div className="flex items-center space-x-3 mb-3">
                          {playlist.images[0]?.url ? (
                            <img
                              src={playlist.images[0].url}
                              alt={playlist.name}
                              className="w-12 h-12 rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white">
                              🎵
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate">
                              {playlist.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {playlist.tracks.total} tracks
                            </div>
                          </div>
                        </div>
                        
                        {playlist.description && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {playlist.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            by {playlist.owner.display_name}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(playlist.external_urls.spotify, '_blank');
                            }}
                            className="text-green-600 hover:text-green-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </DreamyInteraction>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};