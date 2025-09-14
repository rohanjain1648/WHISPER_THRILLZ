import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MoodEmbedding } from '../../types';
import { 
  RevealOnScroll, 
  EmotionalPulse, 
  DreamyInteraction, 
  SparkleEffect,
  MagicalShimmer
} from '../animations';

interface MoodInsightsProps {
  moodData: MoodEmbedding[];
  timeRange: 'week' | 'month' | 'year';
  className?: string;
}



interface MoodInsight {
  category: 'pattern' | 'growth' | 'balance' | 'recommendation';
  title: string;
  description: string;
  score: number;
  icon: string;
  color: string;
  actionItems: string[];
}

export const MoodInsights: React.FC<MoodInsightsProps> = ({
  moodData,
  timeRange,
  className = ''
}) => {
  const [selectedInsight, setSelectedInsight] = useState<MoodInsight | null>(null);
  const [activeTab, setActiveTab] = useState<'patterns' | 'growth' | 'recommendations'>('patterns');

  // Generate mood insights using AI-like analysis
  const insights = useMemo(() => {
    if (moodData.length === 0) return [];

    const insights: MoodInsight[] = [];

    // Analyze emotional patterns
    const emotionAverages = calculateEmotionAverages(moodData);
    const sentimentTrend = calculateSentimentTrend(moodData);
    const emotionalBalance = calculateEmotionalBalance(moodData);
    const moodVariability = calculateMoodVariability(moodData);

    // Pattern Recognition Insights
    if (emotionAverages.joy > 0.6) {
      insights.push({
        category: 'pattern',
        title: 'Joyful Spirit',
        description: `Your joy levels are consistently high (${(emotionAverages.joy * 100).toFixed(0)}%), indicating a naturally positive outlook on life.`,
        score: emotionAverages.joy,
        icon: '😊',
        color: '#FFD700',
        actionItems: [
          'Share your positive energy with others',
          'Document what brings you joy',
          'Consider mentoring someone who could benefit from your optimism'
        ]
      });
    }

    if (emotionAverages.sadness > 0.4) {
      insights.push({
        category: 'pattern',
        title: 'Reflective Nature',
        description: `You experience deeper emotions regularly (${(emotionAverages.sadness * 100).toFixed(0)}% sadness), which often indicates high emotional intelligence and empathy.`,
        score: emotionAverages.sadness,
        icon: '🤔',
        color: '#4A90E2',
        actionItems: [
          'Practice self-compassion during difficult moments',
          'Consider journaling to process emotions',
          'Connect with supportive friends or family'
        ]
      });
    }

    if (emotionAverages.trust > 0.7) {
      insights.push({
        category: 'pattern',
        title: 'Strong Foundation',
        description: `Your high trust levels (${(emotionAverages.trust * 100).toFixed(0)}%) suggest strong, healthy relationships and a secure attachment style.`,
        score: emotionAverages.trust,
        icon: '🤝',
        color: '#00BCD4',
        actionItems: [
          'Continue nurturing your relationships',
          'Be open to new connections',
          'Share your trust-building strategies with others'
        ]
      });
    }

    // Growth Insights
    if (sentimentTrend > 0.1) {
      insights.push({
        category: 'growth',
        title: 'Upward Trajectory',
        description: `Your emotional well-being has been improving over the ${timeRange}. This positive trend suggests effective coping strategies and personal growth.`,
        score: sentimentTrend,
        icon: '📈',
        color: '#10B981',
        actionItems: [
          'Identify what has been working well for you',
          'Continue the practices that support your growth',
          'Set new emotional wellness goals'
        ]
      });
    } else if (sentimentTrend < -0.1) {
      insights.push({
        category: 'growth',
        title: 'Opportunity for Support',
        description: `Your mood has been trending downward recently. This is a normal part of life\'s ups and downs, and recognizing it is the first step toward positive change.`,
        score: Math.abs(sentimentTrend),
        icon: '🌱',
        color: '#F59E0B',
        actionItems: [
          'Consider reaching out to a trusted friend or counselor',
          'Focus on self-care activities that bring you comfort',
          'Remember that difficult periods are temporary'
        ]
      });
    }

    if (emotionalBalance > 0.7) {
      insights.push({
        category: 'balance',
        title: 'Emotional Harmony',
        description: `You maintain excellent emotional balance (${(emotionalBalance * 100).toFixed(0)}% balance score), experiencing a healthy range of emotions without extremes.`,
        score: emotionalBalance,
        icon: '⚖️',
        color: '#8B5CF6',
        actionItems: [
          'Continue your balanced approach to life',
          'Share your emotional regulation strategies',
          'Help others find their emotional balance'
        ]
      });
    }

    // Recommendations based on patterns
    if (moodVariability > 0.6) {
      insights.push({
        category: 'recommendation',
        title: 'Stability Focus',
        description: `Your emotions show high variability. While emotional range is healthy, developing stability practices could enhance your well-being.`,
        score: 1 - moodVariability,
        icon: '🧘',
        color: '#EC4899',
        actionItems: [
          'Try mindfulness or meditation practices',
          'Establish consistent daily routines',
          'Consider stress management techniques'
        ]
      });
    }

    if (emotionAverages.anticipation > 0.6) {
      insights.push({
        category: 'recommendation',
        title: 'Future-Focused Energy',
        description: `Your high anticipation levels (${(emotionAverages.anticipation * 100).toFixed(0)}%) show you\'re naturally forward-thinking and goal-oriented.`,
        score: emotionAverages.anticipation,
        icon: '🎯',
        color: '#FF9800',
        actionItems: [
          'Channel your anticipation into concrete goals',
          'Practice patience with long-term objectives',
          'Celebrate small wins along the way'
        ]
      });
    }

    return insights;
  }, [moodData, timeRange]);

  function calculateEmotionAverages(data: MoodEmbedding[]) {
    const totals = {
      joy: 0, sadness: 0, anger: 0, fear: 0,
      surprise: 0, disgust: 0, trust: 0, anticipation: 0
    };

    data.forEach(mood => {
      Object.entries(mood.emotions).forEach(([emotion, value]) => {
        totals[emotion as keyof typeof totals] += value;
      });
    });

    const count = data.length;
    Object.keys(totals).forEach(emotion => {
      totals[emotion as keyof typeof totals] /= count;
    });

    return totals;
  }

  function calculateSentimentTrend(data: MoodEmbedding[]) {
    if (data.length < 2) return 0;
    
    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);
    
    const firstAvg = firstHalf.reduce((sum, mood) => sum + mood.sentiment, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, mood) => sum + mood.sentiment, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  function calculateEmotionalBalance(data: MoodEmbedding[]) {
    const emotionAverages = calculateEmotionAverages(data);
    const values = Object.values(emotionAverages);
    
    // Calculate standard deviation to measure balance
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = better balance
    return Math.max(0, 1 - stdDev * 2);
  }

  function calculateMoodVariability(data: MoodEmbedding[]) {
    if (data.length < 2) return 0;
    
    const sentiments = data.map(mood => mood.sentiment);
    const mean = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentiments.length;
    
    return Math.sqrt(variance);
  }

  const filteredInsights = insights.filter(insight => {
    switch (activeTab) {
      case 'patterns':
        return insight.category === 'pattern';
      case 'growth':
        return insight.category === 'growth' || insight.category === 'balance';
      case 'recommendations':
        return insight.category === 'recommendation';
      default:
        return true;
    }
  });

  return (
    <div className={`mood-insights p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          AI-Powered Mood Insights
        </h3>
        <p className="text-gray-600 text-sm">
          Discover patterns, celebrate growth, and get personalized recommendations based on your emotional journey.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
          {(['patterns', 'growth', 'recommendations'] as const).map((tab) => (
            <DreamyInteraction key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </DreamyInteraction>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredInsights.map((insight, index) => (
          <RevealOnScroll
            key={index}
            animation="bloom"
            delay={index * 0.1}
            withParticles={insight.score > 0.7}
            particleType="sparkles"
          >
            <EmotionalPulse 
              emotion={insight.category === 'growth' ? 'joy' : 'calm'} 
              intensity={insight.score * 0.8}
            >
              <DreamyInteraction>
                <div
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  onClick={() => setSelectedInsight(insight)}
                >
                  {/* Background sparkles for high-scoring insights */}
                  {insight.score > 0.8 && (
                    <div className="absolute inset-0 pointer-events-none">
                      <SparkleEffect count={3} intensity="subtle" color="gold" />
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${insight.color}20` }}
                      >
                        {insight.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: insight.color }}>
                          {(insight.score * 100).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {insight.title}
                    </h4>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium`} style={{
                        backgroundColor: `${insight.color}20`,
                        color: insight.color
                      }}>
                        {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
                      </span>
                      
                      <div className="text-purple-600 text-sm font-medium">
                        View Details →
                      </div>
                    </div>
                  </div>
                </div>
              </DreamyInteraction>
            </EmotionalPulse>
          </RevealOnScroll>
        ))}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Generating Insights
          </h4>
          <p className="text-gray-600">
            We need more mood data to provide meaningful insights in this category.
          </p>
        </div>
      )}

      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <MagicalShimmer intensity="subtle" color="rainbow" trigger={true}>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                        style={{ backgroundColor: `${selectedInsight.color}20` }}
                      >
                        {selectedInsight.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {selectedInsight.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: `${selectedInsight.color}20`,
                              color: selectedInsight.color
                            }}
                          >
                            {selectedInsight.category.charAt(0).toUpperCase() + selectedInsight.category.slice(1)}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-lg font-semibold" style={{ color: selectedInsight.color }}>
                            {(selectedInsight.score * 100).toFixed(0)}% Score
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <DreamyInteraction>
                      <button
                        onClick={() => setSelectedInsight(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                      >
                        ✕
                      </button>
                    </DreamyInteraction>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Detailed Analysis
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedInsight.description}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Recommended Actions
                    </h4>
                    <div className="space-y-3">
                      {selectedInsight.actionItems.map((action, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: selectedInsight.color }}
                          >
                            {index + 1}
                          </div>
                          <p className="text-gray-700">{action}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <DreamyInteraction>
                      <button
                        onClick={() => setSelectedInsight(null)}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Got it! ✨
                      </button>
                    </DreamyInteraction>
                  </div>
                </div>
              </MagicalShimmer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};