import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Sparkles, Clock, TrendingUp, MessageSquare, Activity, Palette, Coffee } from 'lucide-react';
import { conversationService, BondingActivity } from '../../services/conversationService';
import { MoodEmbedding, Relationship } from '../../types';

interface CoupleBondingProps {
  blendedMood: MoodEmbedding;
  relationship: Relationship;
  onActivityStart?: (activity: BondingActivity) => void;
}

type EmotionalGoal = 'increase_intimacy' | 'resolve_tension' | 'celebrate_connection' | 'explore_together';

export const CoupleBonding: React.FC<CoupleBondingProps> = ({
  blendedMood,
  relationship,
  onActivityStart
}) => {
  const [activities, setActivities] = useState<BondingActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<EmotionalGoal>('increase_intimacy');
  const [activeActivity, setActiveActivity] = useState<BondingActivity | null>(null);

  const emotionalGoals: { key: EmotionalGoal; label: string; icon: React.ReactNode; color: string }[] = [
    {
      key: 'increase_intimacy',
      label: 'Increase Intimacy',
      icon: <Heart className="w-4 h-4" />,
      color: 'from-pink-500 to-red-500'
    },
    {
      key: 'resolve_tension',
      label: 'Resolve Tension',
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      key: 'celebrate_connection',
      label: 'Celebrate Connection',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      key: 'explore_together',
      label: 'Explore Together',
      icon: <Users className="w-4 h-4" />,
      color: 'from-green-500 to-teal-500'
    }
  ];

  useEffect(() => {
    loadBondingActivities();
  }, [selectedGoal, blendedMood]);

  const loadBondingActivities = async () => {
    setLoading(true);
    try {
      const result = await conversationService.generateCoupleBondingActivities(
        blendedMood,
        relationship,
        selectedGoal
      );
      setActivities(result);
    } catch (error) {
      console.error('Failed to load bonding activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySelect = (activity: BondingActivity) => {
    setActiveActivity(activity);
    onActivityStart?.(activity);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversation': return <MessageSquare className="w-5 h-5" />;
      case 'activity': return <Activity className="w-5 h-5" />;
      case 'reflection': return <Heart className="w-5 h-5" />;
      case 'creative': return <Palette className="w-5 h-5" />;
      default: return <Coffee className="w-5 h-5" />;
    }
  };

  const getIntimacyGradient = (level: string) => {
    switch (level) {
      case 'casual': return 'from-blue-400 to-blue-600';
      case 'personal': return 'from-purple-400 to-purple-600';
      case 'intimate': return 'from-pink-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRelationshipInsight = () => {
    const { closeness, empathy, trust } = relationship.bondingMetrics;
    const average = (closeness + empathy + trust) / 3;

    if (average >= 80) {
      return {
        message: "Your connection is beautifully strong! These activities will help you celebrate and deepen it further.",
        color: "text-green-600",
        icon: <Heart className="w-5 h-5 text-green-500" />
      };
    } else if (average >= 60) {
      return {
        message: "You have a solid foundation. These activities will help strengthen your bond.",
        color: "text-blue-600",
        icon: <TrendingUp className="w-5 h-5 text-blue-500" />
      };
    } else {
      return {
        message: "Every relationship has room to grow. These gentle activities can help you reconnect.",
        color: "text-purple-600",
        icon: <Sparkles className="w-5 h-5 text-purple-500" />
      };
    }
  };

  const insight = getRelationshipInsight();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Relationship Insight */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Couple Bonding Activities
        </h2>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-center mb-3">
            {insight.icon}
            <span className={`ml-2 font-medium ${insight.color}`}>
              Relationship Insight
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">{insight.message}</p>
          
          {/* Relationship Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{relationship.bondingMetrics.closeness}</div>
              <div className="text-sm text-gray-500">Closeness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{relationship.bondingMetrics.empathy}</div>
              <div className="text-sm text-gray-500">Empathy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{relationship.bondingMetrics.trust}</div>
              <div className="text-sm text-gray-500">Trust</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goal Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          What would you like to focus on today?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {emotionalGoals.map((goal) => (
            <button
              key={goal.key}
              onClick={() => setSelectedGoal(goal.key)}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                selectedGoal === goal.key
                  ? 'border-pink-300 bg-pink-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-pink-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${goal.color} flex items-center justify-center text-white mb-2 mx-auto`}>
                {goal.icon}
              </div>
              <div className="text-sm font-medium text-gray-800 text-center">
                {goal.label}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Activities Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center p-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-gray-600">Creating bonding experiences...</span>
          </motion.div>
        ) : (
          <motion.div
            key="activities"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg transform hover:scale-102 ${
                  activeActivity?.id === activity.id
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-gray-100 hover:border-pink-200'
                }`}
                onClick={() => handleActivitySelect(activity)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getIntimacyGradient(activity.intimacyLevel)} flex items-center justify-center text-white`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{activity.name}</h3>
                      <span className="text-sm text-gray-500 capitalize">{activity.intimacyLevel} • {activity.type}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {activity.duration} min
                    </div>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{Math.round(activity.moodBoost * 100)}% connection
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
                  >
                    Start Activity
                  </motion.button>
                </div>

                {activeActivity?.id === activity.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-pink-200"
                  >
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-pink-800 mb-2">💕 Activity Guide:</h4>
                      <ul className="text-sm text-pink-700 space-y-1">
                        <li>• Create a comfortable, distraction-free environment</li>
                        <li>• Be present and fully engaged with each other</li>
                        <li>• Listen with your heart, not just your ears</li>
                        <li>• Celebrate small moments of connection</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <button
          onClick={loadBondingActivities}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Discover New Activities
        </button>
      </motion.div>
    </div>
  );
};

export default CoupleBonding;