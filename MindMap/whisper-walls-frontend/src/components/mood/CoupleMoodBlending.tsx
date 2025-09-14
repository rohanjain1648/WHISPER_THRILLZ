import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MoodEmbedding } from '../../types';
import { 
  RevealOnScroll, 
  EmotionalPulse, 
  DreamyInteraction, 
  ParticleSystem,
  SparkleEffect,
  MagicalShimmer,
  useAnimationOrchestrator
} from '../animations';
import { SharedMoodVisualization } from './SharedMoodVisualization';
import { RelationshipAnalytics } from './RelationshipAnalytics';
import { CouplePlaylistGenerator } from '../spotify/CouplePlaylistGenerator';
import { CoupleVoiceNarration } from '../voice/CoupleVoiceNarration';

interface CoupleMoodBlendingProps {
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  className?: string;
}

interface BlendedMood {
  blendedEmbedding: MoodEmbedding;
  user1Mood: MoodEmbedding;
  user2Mood: MoodEmbedding;
  compatibility: number;
  dominantEmotions: string[];
  suggestions: {
    activities: string[];
    playlists: string[];
    conversationStarters: string[];
  };
  bondingMetrics: {
    closeness: number;
    empathy: number;
    trust: number;
    communicationFrequency: number;
    sharedActivities: number;
  };
}

// Mock data generator for couple mood blending
const generateMockCoupleMood = (user1Name: string, user2Name: string): BlendedMood => {
  // Generate realistic individual moods
  const user1Mood: MoodEmbedding = {
    emotions: {
      joy: 0.6 + Math.random() * 0.3,
      sadness: 0.1 + Math.random() * 0.2,
      anger: 0.05 + Math.random() * 0.15,
      fear: 0.1 + Math.random() * 0.2,
      surprise: 0.3 + Math.random() * 0.3,
      disgust: 0.05 + Math.random() * 0.1,
      trust: 0.7 + Math.random() * 0.2,
      anticipation: 0.5 + Math.random() * 0.3
    },
    sentiment: 0.2 + Math.random() * 0.6,
    intensity: 0.4 + Math.random() * 0.4,
    timestamp: new Date()
  };

  const user2Mood: MoodEmbedding = {
    emotions: {
      joy: 0.5 + Math.random() * 0.4,
      sadness: 0.15 + Math.random() * 0.25,
      anger: 0.1 + Math.random() * 0.2,
      fear: 0.05 + Math.random() * 0.15,
      surprise: 0.2 + Math.random() * 0.4,
      disgust: 0.05 + Math.random() * 0.1,
      trust: 0.6 + Math.random() * 0.3,
      anticipation: 0.4 + Math.random() * 0.4
    },
    sentiment: 0.1 + Math.random() * 0.7,
    intensity: 0.3 + Math.random() * 0.5,
    timestamp: new Date()
  };

  // Calculate blended mood (centroid)
  const blendedEmbedding: MoodEmbedding = {
    emotions: {
      joy: (user1Mood.emotions.joy + user2Mood.emotions.joy) / 2,
      sadness: (user1Mood.emotions.sadness + user2Mood.emotions.sadness) / 2,
      anger: (user1Mood.emotions.anger + user2Mood.emotions.anger) / 2,
      fear: (user1Mood.emotions.fear + user2Mood.emotions.fear) / 2,
      surprise: (user1Mood.emotions.surprise + user2Mood.emotions.surprise) / 2,
      disgust: (user1Mood.emotions.disgust + user2Mood.emotions.disgust) / 2,
      trust: (user1Mood.emotions.trust + user2Mood.emotions.trust) / 2,
      anticipation: (user1Mood.emotions.anticipation + user2Mood.emotions.anticipation) / 2
    },
    sentiment: (user1Mood.sentiment + user2Mood.sentiment) / 2,
    intensity: (user1Mood.intensity + user2Mood.intensity) / 2,
    timestamp: new Date()
  };  // Calculate compatibility score
  const compatibility = calculateCompatibility(user1Mood, user2Mood);

  // Find dominant emotions in blended mood
  const dominantEmotions = Object.entries(blendedEmbedding.emotions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([emotion]) => emotion);

  // Generate suggestions based on blended mood
  const suggestions = generateSuggestions(blendedEmbedding, compatibility);

  // Generate bonding metrics
  const bondingMetrics = {
    closeness: 0.6 + Math.random() * 0.3,
    empathy: 0.7 + Math.random() * 0.2,
    trust: (user1Mood.emotions.trust + user2Mood.emotions.trust) / 2,
    communicationFrequency: 0.5 + Math.random() * 0.4,
    sharedActivities: 0.4 + Math.random() * 0.5
  };

  return {
    blendedEmbedding,
    user1Mood,
    user2Mood,
    compatibility,
    dominantEmotions,
    suggestions,
    bondingMetrics
  };
};

function calculateCompatibility(mood1: MoodEmbedding, mood2: MoodEmbedding): number {
  // Calculate emotional distance
  const emotionDistance = Object.keys(mood1.emotions).reduce((sum, emotion) => {
    const diff = Math.abs(
      mood1.emotions[emotion as keyof typeof mood1.emotions] - 
      mood2.emotions[emotion as keyof typeof mood2.emotions]
    );
    return sum + diff;
  }, 0) / 8;

  // Calculate sentiment similarity
  const sentimentDistance = Math.abs(mood1.sentiment - mood2.sentiment);
  
  // Calculate intensity similarity
  const intensityDistance = Math.abs(mood1.intensity - mood2.intensity);
  
  // Combine distances (lower distance = higher compatibility)
  const totalDistance = (emotionDistance + sentimentDistance + intensityDistance) / 3;
  return Math.max(0, 1 - totalDistance);
}

function generateSuggestions(blendedMood: MoodEmbedding, compatibility: number) {
  const activities = [];
  const playlists = [];
  const conversationStarters = [];

  // Activity suggestions based on dominant emotions
  if (blendedMood.emotions.joy > 0.6) {
    activities.push('Plan a fun outdoor adventure together', 'Try a new restaurant or cuisine', 'Have a dance party at home');
  }
  if (blendedMood.emotions.trust > 0.7) {
    activities.push('Share childhood memories', 'Plan your future together', 'Try a trust-building exercise');
  }
  if (blendedMood.emotions.anticipation > 0.5) {
    activities.push('Plan a surprise for each other', 'Start a new hobby together', 'Book a weekend getaway');
  }

  // Playlist suggestions
  if (blendedMood.sentiment > 0.3) {
    playlists.push('Upbeat Love Songs', 'Feel-Good Classics', 'Dance Together Mix');
  } else if (blendedMood.sentiment < -0.2) {
    playlists.push('Comfort & Healing', 'Gentle Acoustic', 'Emotional Support');
  } else {
    playlists.push('Chill Vibes', 'Romantic Ballads', 'Cozy Evening');
  }

  // Conversation starters based on compatibility
  if (compatibility > 0.7) {
    conversationStarters.push(
      'What made you smile today?',
      'What are you most excited about right now?',
      'How can we make tomorrow even better together?'
    );
  } else {
    conversationStarters.push(
      'How are you really feeling right now?',
      'What do you need from me today?',
      'What would make you feel more connected to me?'
    );
  }

  return { activities, playlists, conversationStarters };
}

export const CoupleMoodBlending: React.FC<CoupleMoodBlendingProps> = ({
  user1Id,
  user2Id,
  user1Name,
  user2Name,
  className = ''
}) => {
  const [blendedMood, setBlendedMood] = useState<BlendedMood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'activities' | 'metrics'>('overview');
  const { triggerSequence } = useAnimationOrchestrator();

  useEffect(() => {
    const loadCoupleMood = async () => {
      setIsLoading(true);
      
      try {
        // Try to load real data from API
        const { moodService } = await import('../../services/moodService');
        
        // Get current moods for both users
        const user1Mood = await moodService.getMoodHistory('week').then(history => 
          history.length > 0 ? history[history.length - 1] : null
        );
        const user2Mood = await moodService.getMoodHistory('week').then(history => 
          history.length > 0 ? history[history.length - 1] : null
        );
        
        if (user1Mood && user2Mood) {
          // Blend the moods using the API
          const blendedEmbedding = await moodService.blendCoupleMoods(user1Mood, user2Mood);
          
          // Calculate additional metrics
          const compatibility = calculateCompatibility(user1Mood, user2Mood);
          const dominantEmotions = Object.entries(blendedEmbedding.emotions)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([emotion]) => emotion);
          
          const suggestions = generateSuggestions(blendedEmbedding, compatibility);
          const bondingMetrics = {
            closeness: 0.6 + Math.random() * 0.3,
            empathy: 0.7 + Math.random() * 0.2,
            trust: (user1Mood.emotions.trust + user2Mood.emotions.trust) / 2,
            communicationFrequency: 0.5 + Math.random() * 0.4,
            sharedActivities: 0.4 + Math.random() * 0.5
          };
          
          setBlendedMood({
            blendedEmbedding,
            user1Mood,
            user2Mood,
            compatibility,
            dominantEmotions,
            suggestions,
            bondingMetrics
          });
        } else {
          throw new Error('No mood data available for one or both users');
        }
      } catch (error) {
        console.warn('Failed to load couple mood data from API, using mock data:', error);
        
        // Fallback to mock data
        const mockData = generateMockCoupleMood(user1Name, user2Name);
        setBlendedMood(mockData);
      }
      
      setIsLoading(false);
      
      // Trigger connection animation
      triggerSequence('connection-made');
    };

    loadCoupleMood();
  }, [user1Id, user2Id, user1Name, user2Name, triggerSequence]);

  const compatibilityColor = useMemo(() => {
    if (!blendedMood) return '#6B7280';
    if (blendedMood.compatibility > 0.8) return '#10B981';
    if (blendedMood.compatibility > 0.6) return '#F59E0B';
    return '#EF4444';
  }, [blendedMood]);

  const compatibilityLabel = useMemo(() => {
    if (!blendedMood) return 'Unknown';
    if (blendedMood.compatibility > 0.8) return 'Excellent Harmony';
    if (blendedMood.compatibility > 0.6) return 'Good Connection';
    if (blendedMood.compatibility > 0.4) return 'Some Differences';
    return 'Need Support';
  }, [blendedMood]);

  if (isLoading) {
    return (
      <div className={`couple-mood-blending ${className}`}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="relative">
              <ParticleSystem 
                type="hearts" 
                count={8} 
                intensity="medium" 
                direction="random" 
                speed="slow"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full mb-4"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Blending Your Hearts Together
            </h3>
            <p className="text-gray-600">
              Analyzing your emotional connection and creating your shared mood profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!blendedMood) return null;

  return (
    <div className={`couple-mood-blending ${className}`}>
      {/* Background particles */}
      <ParticleSystem 
        type="hearts" 
        count={6} 
        intensity="low" 
        direction="random" 
        speed="slow"
        className="opacity-30"
      />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <RevealOnScroll animation="butterfly" withParticles particleType="hearts">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {user1Name} 💕 {user2Name}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your hearts are connected. Discover your shared emotional landscape and 
              strengthen your bond through understanding.
            </p>
          </div>
        </RevealOnScroll>

        {/* Compatibility Overview */}
        <RevealOnScroll animation="bloom" delay={0.3}>
          <EmotionalPulse emotion="love" intensity={blendedMood.compatibility}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center relative overflow-hidden">
              <SparkleEffect count={5} intensity="magical" color="pink" pattern="heart" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{ backgroundColor: compatibilityColor }}
                  >
                    {(blendedMood.compatibility * 100).toFixed(0)}%
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {compatibilityLabel}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Your emotional compatibility score reflects how well your current moods align
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Individual Moods */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-semibold">
                      {user1Name.charAt(0)}
                    </div>
                    <h4 className="font-semibold text-gray-800">{user1Name}</h4>
                    <p className="text-sm text-gray-600">
                      Sentiment: {blendedMood.user1Mood.sentiment > 0 ? '+' : ''}{(blendedMood.user1Mood.sentiment * 100).toFixed(0)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                      💕
                    </div>
                    <h4 className="font-semibold text-gray-800">Blended</h4>
                    <p className="text-sm text-gray-600">
                      Together: {blendedMood.blendedEmbedding.sentiment > 0 ? '+' : ''}{(blendedMood.blendedEmbedding.sentiment * 100).toFixed(0)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-semibold">
                      {user2Name.charAt(0)}
                    </div>
                    <h4 className="font-semibold text-gray-800">{user2Name}</h4>
                    <p className="text-sm text-gray-600">
                      Sentiment: {blendedMood.user2Mood.sentiment > 0 ? '+' : ''}{(blendedMood.user2Mood.sentiment * 100).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </EmotionalPulse>
        </RevealOnScroll>      
  {/* Tab Navigation */}
        <RevealOnScroll animation="fadeUp" delay={0.5}>
          <div className="flex justify-center">
            <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
              {(['overview', 'activities', 'metrics'] as const).map((tab) => (
                <DreamyInteraction key={tab}>
                  <button
                    onClick={() => setSelectedTab(tab)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedTab === tab
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                </DreamyInteraction>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Dominant Emotions */}
                <RevealOnScroll animation="sparkle" delay={0.2}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                      Your Shared Emotional Landscape
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {blendedMood.dominantEmotions.map((emotion, index) => (
                        <div key={emotion} className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
                            {(blendedMood.blendedEmbedding.emotions[emotion as keyof typeof blendedMood.blendedEmbedding.emotions] * 100).toFixed(0)}%
                          </div>
                          <h4 className="font-semibold text-gray-800 capitalize">{emotion}</h4>
                          <p className="text-sm text-gray-600">
                            {index === 0 ? 'Primary Emotion' : 'Secondary Emotion'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>

                {/* Shared Mood Visualization */}
                <RevealOnScroll animation="butterfly" delay={0.4}>
                  <SharedMoodVisualization
                    user1Mood={blendedMood.user1Mood}
                    user2Mood={blendedMood.user2Mood}
                    blendedMood={blendedMood.blendedEmbedding}
                    user1Name={user1Name}
                    user2Name={user2Name}
                  />
                </RevealOnScroll>
              </div>
            )}

            {selectedTab === 'activities' && (
              <div className="space-y-6">
                {/* Activity Suggestions */}
                <RevealOnScroll animation="heart" delay={0.2}>
                  <MagicalShimmer intensity="subtle" color="rainbow" trigger={true}>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                        💝 Suggested Activities for You Both
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {blendedMood.suggestions.activities.map((activity, index) => (
                          <DreamyInteraction key={index}>
                            <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-200 hover:shadow-md transition-all duration-300">
                              <div className="text-2xl mb-2">💕</div>
                              <p className="text-gray-700 font-medium">{activity}</p>
                            </div>
                          </DreamyInteraction>
                        ))}
                      </div>
                    </div>
                  </MagicalShimmer>
                </RevealOnScroll>

                {/* Playlist Suggestions */}
                <RevealOnScroll animation="bloom" delay={0.4}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                      🎵 Perfect Playlists for Your Mood
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {blendedMood.suggestions.playlists.map((playlist, index) => (
                        <DreamyInteraction key={index}>
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300 text-center">
                            <div className="text-2xl mb-2">🎶</div>
                            <h4 className="font-semibold text-gray-800">{playlist}</h4>
                            <p className="text-sm text-gray-600 mt-1">Curated for your vibe</p>
                          </div>
                        </DreamyInteraction>
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>

                {/* Conversation Starters */}
                <RevealOnScroll animation="sparkle" delay={0.6}>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                      💬 Conversation Starters
                    </h3>
                    
                    <div className="space-y-3">
                      {blendedMood.suggestions.conversationStarters.map((starter, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 font-medium">"{starter}"</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            )}

            {selectedTab === 'metrics' && (
              <RevealOnScroll animation="butterfly" delay={0.2}>
                <RelationshipAnalytics
                  user1Mood={blendedMood.user1Mood}
                  user2Mood={blendedMood.user2Mood}
                  bondingMetrics={blendedMood.bondingMetrics}
                  compatibility={blendedMood.compatibility}
                  user1Name={user1Name}
                  user2Name={user2Name}
                  timeRange="month"
                />
              </RevealOnScroll>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};