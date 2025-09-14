import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MoodEmbedding } from '../../types';
import { EmotionalPulse, SparkleEffect, DreamyInteraction } from '../animations';

interface BondingMetrics {
  closeness: number;
  empathy: number;
  trust: number;
  communicationFrequency: number;
  sharedActivities: number;
}

interface RelationshipAnalyticsProps {
  user1Mood: MoodEmbedding;
  user2Mood: MoodEmbedding;
  bondingMetrics: BondingMetrics;
  compatibility: number;
  user1Name: string;
  user2Name: string;
  timeRange?: 'week' | 'month' | 'year';
  className?: string;
}

interface RelationshipInsight {
  type: 'strength' | 'growth' | 'recommendation';
  title: string;
  description: string;
  score: number;
  icon: string;
  color: string;
}

export const RelationshipAnalytics: React.FC<RelationshipAnalyticsProps> = ({
  user1Mood,
  user2Mood,
  bondingMetrics,
  compatibility,
  user1Name,
  user2Name,
  timeRange = 'month',
  className = ''
}) => {
  // Generate relationship insights
  const insights = useMemo(() => {
    const insights: RelationshipInsight[] = [];
    
    // Trust analysis
    if (bondingMetrics.trust > 0.8) {
      insights.push({
        type: 'strength',
        title: 'Exceptional Trust',
        description: `Your trust levels are outstanding (${(bondingMetrics.trust * 100).toFixed(0)}%). This creates a solid foundation for your relationship.`,
        score: bondingMetrics.trust,
        icon: '🤝',
        color: '#10B981'
      });
    } else if (bondingMetrics.trust < 0.5) {
      insights.push({
        type: 'growth',
        title: 'Building Trust',
        description: 'Focus on open communication and consistency to strengthen trust between you.',
        score: 1 - bondingMetrics.trust,
        icon: '🌱',
        color: '#F59E0B'
      });
    }
    
    // Empathy analysis
    if (bondingMetrics.empathy > 0.7) {
      insights.push({
        type: 'strength',
        title: 'Deep Empathy',
        description: `You both show high emotional understanding (${(bondingMetrics.empathy * 100).toFixed(0)}%). This helps you connect on a deeper level.`,
        score: bondingMetrics.empathy,
        icon: '💝',
        color: '#8B5CF6'
      });
    }
    
    // Communication analysis
    if (bondingMetrics.communicationFrequency < 0.6) {
      insights.push({
        type: 'recommendation',
        title: 'Enhance Communication',
        description: 'Regular check-ins and deeper conversations could strengthen your emotional bond.',
        score: 1 - bondingMetrics.communicationFrequency,
        icon: '💬',
        color: '#EC4899'
      });
    }
    
    // Shared activities analysis
    if (bondingMetrics.sharedActivities < 0.5) {
      insights.push({
        type: 'recommendation',
        title: 'More Together Time',
        description: 'Creating more shared experiences could deepen your connection and understanding.',
        score: 1 - bondingMetrics.sharedActivities,
        icon: '🎯',
        color: '#F97316'
      });
    }
    
    // Compatibility analysis
    if (compatibility > 0.8) {
      insights.push({
        type: 'strength',
        title: 'Perfect Harmony',
        description: `Your emotional compatibility is exceptional (${(compatibility * 100).toFixed(0)}%). You're naturally in sync.`,
        score: compatibility,
        icon: '✨',
        color: '#06B6D4'
      });
    }
    
    return insights;
  }, [bondingMetrics, compatibility]);

  // Calculate overall relationship health score
  const relationshipHealth = useMemo(() => {
    const metrics = Object.values(bondingMetrics);
    const average = metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
    return (average + compatibility) / 2;
  }, [bondingMetrics, compatibility]);

  const getHealthLabel = (score: number) => {
    if (score > 0.8) return 'Thriving';
    if (score > 0.6) return 'Strong';
    if (score > 0.4) return 'Growing';
    return 'Needs Attention';
  };

  const getHealthColor = (score: number) => {
    if (score > 0.8) return '#10B981';
    if (score > 0.6) return '#F59E0B';
    if (score > 0.4) return '#EF4444';
    return '#6B7280';
  };

  return (
    <div className={`relationship-analytics ${className}`}>
      <div className="space-y-6">
        {/* Overall Health Score */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center relative overflow-hidden">
          <SparkleEffect count={4} intensity="magical" color="rainbow" />
          
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Relationship Health Score
            </h3>
            
            <EmotionalPulse emotion="love" intensity={relationshipHealth}>
              <div className="flex justify-center mb-6">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg relative"
                  style={{ backgroundColor: getHealthColor(relationshipHealth) }}
                >
                  <div className="absolute inset-0 rounded-full animate-pulse opacity-30"
                       style={{ backgroundColor: getHealthColor(relationshipHealth) }}></div>
                  <span className="relative z-10">{(relationshipHealth * 100).toFixed(0)}%</span>
                </div>
              </div>
            </EmotionalPulse>
            
            <h4 className="text-2xl font-bold text-gray-800 mb-2">
              {getHealthLabel(relationshipHealth)}
            </h4>
            
            <p className="text-gray-600 max-w-md mx-auto">
              Your relationship shows {getHealthLabel(relationshipHealth).toLowerCase()} emotional connection 
              and compatibility across all measured dimensions.
            </p>
          </div>
        </div>

        {/* Bonding Metrics Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Bonding Metrics Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(bondingMetrics).map(([metric, value], index) => (
              <motion.div
                key={metric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <EmotionalPulse emotion="trust" intensity={value * 0.8}>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
                      {(value * 100).toFixed(0)}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 capitalize mb-2">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      {value > 0.8 ? 'Excellent' : 
                       value > 0.6 ? 'Good' : 
                       value > 0.4 ? 'Fair' : 'Needs Work'}
                    </div>
                  </div>
                </EmotionalPulse>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Relationship Insights */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Personalized Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <DreamyInteraction>
                  <div className="p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md"
                       style={{ 
                         backgroundColor: `${insight.color}10`,
                         borderColor: `${insight.color}30`
                       }}>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                           style={{ backgroundColor: `${insight.color}20` }}>
                        {insight.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{insight.title}</h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: `${insight.color}20`,
                                  color: insight.color
                                }}>
                            {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm">{insight.description}</p>
                        
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                          <motion.div
                            className="h-1 rounded-full"
                            style={{ backgroundColor: insight.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${insight.score * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.8 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </DreamyInteraction>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emotional Journey Timeline */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Emotional Journey Over Time
          </h3>
          
          <div className="space-y-4">
            <div className="text-center text-gray-600 text-sm">
              Tracking your relationship growth over the past {timeRange}
            </div>
            
            {/* Timeline visualization placeholder */}
            <div className="h-32 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <div className="text-gray-600 text-sm">
                  Detailed timeline visualization coming soon
                </div>
              </div>
            </div>
            
            {/* Key milestones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="text-2xl mb-2">🌟</div>
                <div className="font-semibold text-green-800">Trust Peak</div>
                <div className="text-xs text-gray-600">3 days ago</div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <div className="text-2xl mb-2">💝</div>
                <div className="font-semibold text-blue-800">Empathy High</div>
                <div className="text-xs text-gray-600">1 week ago</div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-purple-800">Connection Goal</div>
                <div className="text-xs text-gray-600">Next milestone</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};