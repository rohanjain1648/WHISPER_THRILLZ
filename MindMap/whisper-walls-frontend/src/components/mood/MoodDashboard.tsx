import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MoodEmbedding } from '../../types';
import { 
  RevealOnScroll, 
  EmotionalPulse, 
  DreamyInteraction, 
  ParticleSystem,
  SparkleEffect,
  useAnimationOrchestrator
} from '../animations';
import { MoodTimeline } from './MoodTimeline';
import { MoodHeatmap } from './MoodHeatmap';
import { MoodInsights } from './MoodInsights';
import { MoodVisualization } from './MoodVisualization';
import { VoiceFeedback, VoiceAffirmations } from '../voice';

interface MoodDashboardProps {
  userId: string;
  className?: string;
}

// Mock data generator for demonstration
const generateMockMoodData = (days: number = 30): MoodEmbedding[] => {
  const data: MoodEmbedding[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic mood patterns
    const timeOfDay = date.getHours();
    const dayOfWeek = date.getDay();
    
    // Morning tends to be more hopeful, evening more reflective
    const baseJoy = timeOfDay < 12 ? 0.6 + Math.random() * 0.3 : 0.4 + Math.random() * 0.4;
    const baseSadness = timeOfDay > 20 ? 0.2 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2;
    
    // Weekends tend to be more joyful
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 0.2 : 0;
    
    // Add some random life events
    const randomEvent = Math.random();
    let eventModifier = { joy: 0, sadness: 0, trust: 0, anticipation: 0 };
    
    if (randomEvent > 0.95) {
      // Very happy day
      eventModifier = { joy: 0.4, sadness: -0.2, trust: 0.3, anticipation: 0.2 };
    } else if (randomEvent < 0.05) {
      // Difficult day
      eventModifier = { joy: -0.3, sadness: 0.4, trust: -0.1, anticipation: -0.2 };
    }
    
    const emotions = {
      joy: Math.max(0, Math.min(1, baseJoy + weekendBoost + eventModifier.joy + (Math.random() - 0.5) * 0.2)),
      sadness: Math.max(0, Math.min(1, baseSadness + eventModifier.sadness + (Math.random() - 0.5) * 0.2)),
      anger: Math.max(0, Math.min(1, 0.1 + Math.random() * 0.3)),
      fear: Math.max(0, Math.min(1, 0.1 + Math.random() * 0.2)),
      surprise: Math.max(0, Math.min(1, 0.2 + Math.random() * 0.3)),
      disgust: Math.max(0, Math.min(1, 0.05 + Math.random() * 0.15)),
      trust: Math.max(0, Math.min(1, 0.5 + eventModifier.trust + (Math.random() - 0.5) * 0.3)),
      anticipation: Math.max(0, Math.min(1, 0.4 + eventModifier.anticipation + (Math.random() - 0.5) * 0.3))
    };
    
    // Calculate sentiment based on emotions
    const positiveEmotions = emotions.joy + emotions.trust + emotions.anticipation;
    const negativeEmotions = emotions.sadness + emotions.anger + emotions.fear + emotions.disgust;
    const sentiment = (positiveEmotions - negativeEmotions) / 4;
    
    // Calculate intensity as the sum of all emotions
    const intensity = Object.values(emotions).reduce((sum, val) => sum + val, 0) / 8;
    
    data.push({
      emotions,
      sentiment: Math.max(-1, Math.min(1, sentiment)),
      intensity: Math.max(0, Math.min(1, intensity)),
      timestamp: date
    });
  }
  
  return data;
};

export const MoodDashboard: React.FC<MoodDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [moodData, setMoodData] = useState<MoodEmbedding[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'timeline' | 'heatmap' | 'insights' | 'voice' | 'affirmations'>('timeline');
  const [isLoading, setIsLoading] = useState(true);
  const { triggerSequence } = useAnimationOrchestrator();

  // Load mood data
  useEffect(() => {
    const loadMoodData = async () => {
      setIsLoading(true);
      
      try {
        // Try to load real data from API
        const { moodService } = await import('../../services/moodService');
        const data = await moodService.getMoodHistory(selectedTimeRange);
        setMoodData(data);
      } catch (error) {
        console.warn('Failed to load mood data from API, using mock data:', error);
        
        // Fallback to mock data for demonstration
        const days = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 365;
        const data = generateMockMoodData(days);
        setMoodData(data);
      }
      
      setIsLoading(false);
      
      // Trigger mood detection animation
      triggerSequence('mood-detected');
    };
    
    loadMoodData();
  }, [userId, selectedTimeRange, triggerSequence]);

  // Calculate mood statistics
  const moodStats = useMemo(() => {
    if (moodData.length === 0) return null;
    
    const avgSentiment = moodData.reduce((sum, mood) => sum + mood.sentiment, 0) / moodData.length;
    const avgIntensity = moodData.reduce((sum, mood) => sum + mood.intensity, 0) / moodData.length;
    
    // Find dominant emotion across all data
    const emotionTotals = moodData.reduce((totals, mood) => {
      Object.entries(mood.emotions).forEach(([emotion, value]) => {
        totals[emotion] = (totals[emotion] || 0) + value;
      });
      return totals;
    }, {} as Record<string, number>);
    
    const dominantEmotion = Object.entries(emotionTotals).reduce((a, b) => 
      emotionTotals[a[0]] > emotionTotals[b[0]] ? a : b
    )[0];
    
    // Calculate mood trend (comparing first half to second half)
    const midPoint = Math.floor(moodData.length / 2);
    const firstHalfAvg = moodData.slice(0, midPoint).reduce((sum, mood) => sum + mood.sentiment, 0) / midPoint;
    const secondHalfAvg = moodData.slice(midPoint).reduce((sum, mood) => sum + mood.sentiment, 0) / (moodData.length - midPoint);
    const trend = secondHalfAvg - firstHalfAvg;
    
    return {
      avgSentiment,
      avgIntensity,
      dominantEmotion,
      trend,
      totalEntries: moodData.length
    };
  }, [moodData]);

  const currentMood = moodData.length > 0 ? moodData[moodData.length - 1] : null;

  return (
    <div className={`mood-dashboard ${className}`}>
      {/* Background particles */}
      <ParticleSystem 
        type="stardust" 
        count={6} 
        intensity="low" 
        direction="random" 
        speed="slow"
        className="opacity-20"
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <RevealOnScroll animation="butterfly" withParticles>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Your Emotional Journey
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover patterns in your emotions, celebrate growth, and gain insights 
              into your beautiful, complex emotional landscape.
            </p>
          </div>
        </RevealOnScroll>

        {/* Time Range Selector */}
        <RevealOnScroll animation="fadeUp" delay={0.2}>
          <div className="flex justify-center">
            <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
              {(['week', 'month', 'year'] as const).map((range) => (
                <DreamyInteraction key={range}>
                  <button
                    onClick={() => setSelectedTimeRange(range)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedTimeRange === range
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                </DreamyInteraction>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* Current Mood & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Mood */}
          <RevealOnScroll animation="bloom" delay={0.4}>
            <EmotionalPulse emotion="joy" intensity={0.6}>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Current Mood
                </h3>
                {currentMood ? (
                  <MoodVisualization 
                    moodEmbedding={currentMood}
                    type="radar"
                    className="border-0 bg-transparent p-0"
                  />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No recent mood data
                  </div>
                )}
              </div>
            </EmotionalPulse>
          </RevealOnScroll>

          {/* Mood Statistics */}
          <RevealOnScroll animation="fadeLeft" delay={0.6}>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Mood Statistics
              </h3>
              {moodStats ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {moodStats.totalEntries}
                    </div>
                    <div className="text-sm text-gray-600">Mood Entries</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {moodStats.avgSentiment > 0 ? '+' : ''}{(moodStats.avgSentiment * 100).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-600">Avg Sentiment</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {(moodStats.avgIntensity * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">Avg Intensity</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
                    <div className="text-sm font-medium text-pink-600 capitalize">
                      {moodStats.dominantEmotion}
                    </div>
                    <div className="text-xs text-gray-600">Dominant Emotion</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      moodStats.trend > 0.1 ? 'text-green-600' : 
                      moodStats.trend < -0.1 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {moodStats.trend > 0.1 ? '📈 Improving' : 
                       moodStats.trend < -0.1 ? '📉 Declining' : '➡️ Stable'}
                    </div>
                    <div className="text-xs text-gray-600">Mood Trend</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Loading statistics...
                </div>
              )}
            </div>
          </RevealOnScroll>

          {/* Quick Insights */}
          <RevealOnScroll animation="sparkle" delay={0.8}>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 relative overflow-hidden">
              <SparkleEffect count={3} intensity="subtle" color="gold" />
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Quick Insights
              </h3>
              {moodStats ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-700">
                      💡 Pattern Recognition
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Your {moodStats.dominantEmotion} levels are most prominent
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-700">
                      🌟 Growth Opportunity
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {moodStats.avgSentiment > 0 ? 
                        'Keep nurturing your positive mindset!' :
                        'Consider activities that boost your mood'
                      }
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-sm font-medium text-green-700">
                      🎯 Recommendation
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {moodStats.avgIntensity > 0.6 ? 
                        'Try some calming activities to balance intensity' :
                        'Engage in activities that energize you'
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Generating insights...
                </div>
              )}
            </div>
          </RevealOnScroll>
        </div>

        {/* View Selector */}
        <RevealOnScroll animation="fadeUp" delay={1.0}>
          <div className="flex justify-center">
            <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
              {(['timeline', 'heatmap', 'insights'] as const).map((view) => (
                <DreamyInteraction key={view}>
                  <button
                    onClick={() => setSelectedView(view)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedView === view
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                </DreamyInteraction>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* View Selector */}
        <RevealOnScroll animation="fadeUp" delay={1.0}>
          <div className="flex justify-center">
            <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
              {(['timeline', 'heatmap', 'insights', 'voice', 'affirmations'] as const).map((view) => (
                <DreamyInteraction key={view}>
                  <button
                    onClick={() => setSelectedView(view)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedView === view
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                </DreamyInteraction>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* Main Visualization */}
        <RevealOnScroll animation="butterfly" delay={1.2}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 text-center"
                >
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                  <div className="text-gray-600">Loading your emotional journey...</div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {selectedView === 'timeline' && (
                    <MoodTimeline 
                      moodData={moodData} 
                      timeRange={selectedTimeRange}
                    />
                  )}
                  {selectedView === 'heatmap' && (
                    <MoodHeatmap 
                      moodData={moodData} 
                      timeRange={selectedTimeRange}
                    />
                  )}
                  {selectedView === 'insights' && (
                    <MoodInsights 
                      moodData={moodData} 
                      timeRange={selectedTimeRange}
                    />
                  )}
                  {selectedView === 'voice' && currentMood && (
                    <VoiceFeedback 
                      moodEmbedding={currentMood}
                      userName="Friend"
                    />
                  )}
                  {selectedView === 'affirmations' && currentMood && (
                    <VoiceAffirmations 
                      moodEmbedding={currentMood}
                      userName="Friend"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};