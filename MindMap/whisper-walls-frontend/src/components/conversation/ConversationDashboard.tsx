import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  HeartIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ConversationStarters from './ConversationStarters';
import BondingActivities from './BondingActivities';
import HealingPrompts from './HealingPrompts';
import { useMood } from '../../hooks/useMood';
import { useAuth } from '../../hooks/useAuth';

type TabType = 'starters' | 'activities' | 'healing';

interface ConversationDashboardProps {
  partnerMood?: any;
  relationship?: any;
}

export const ConversationDashboard: React.FC<ConversationDashboardProps> = ({
  partnerMood,
  relationship
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('starters');
  const { currentMood, blendedMood } = useMood();
  const { user } = useAuth();

  const tabs = [
    {
      id: 'starters' as TabType,
      name: 'Conversation Starters',
      icon: ChatBubbleLeftRightIcon,
      description: 'Beautiful prompts to spark meaningful conversations',
      color: 'from-blue-500 to-cyan-500',
      count: 5
    },
    {
      id: 'activities' as TabType,
      name: 'Bonding Activities',
      icon: HeartIcon,
      description: 'Activities designed to strengthen your connection',
      color: 'from-pink-500 to-rose-500',
      count: 4
    },
    {
      id: 'healing' as TabType,
      name: 'Healing Conversations',
      icon: ShieldCheckIcon,
      description: 'Gentle prompts to bridge emotional distance',
      color: 'from-green-500 to-emerald-500',
      count: 3
    }
  ];

  const getMoodSummary = () => {
    if (!currentMood) return 'Analyzing your emotional state...';
    
    const emotions = currentMood.emotions;
    const dominant = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([emotion]) => emotion);
    
    return `Currently feeling ${dominant.join(' and ')}`;
  };

  const getRecommendedTab = (): TabType => {
    if (!currentMood || !partnerMood) return 'starters';
    
    // Calculate emotional distance
    const userEmotions = currentMood.emotions;
    const partnerEmotions = partnerMood.emotions;
    
    let distance = 0;
    Object.keys(userEmotions).forEach(emotion => {
      distance += Math.abs(userEmotions[emotion as keyof typeof userEmotions] - 
                          partnerEmotions[emotion as keyof typeof partnerEmotions]);
    });
    
    if (distance > 2) return 'healing';
    if (blendedMood && blendedMood.sentiment > 0.3) return 'activities';
    return 'starters';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'starters':
        return (
          <ConversationStarters
            partnerMood={partnerMood}
            relationship={relationship}
          />
        );
      case 'activities':
        return (
          <BondingActivities
            partnerMood={partnerMood}
            relationship={relationship}
          />
        );
      case 'healing':
        return (
          <HealingPrompts
            partnerMood={partnerMood}
            relationship={relationship}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Conversation Hub
              </h1>
              <p className="text-gray-600 mt-2">
                AI-powered prompts and activities to deepen your connections
              </p>
            </div>
            
            {/* Mood Indicator */}
            {currentMood && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mr-3 animate-pulse"></div>
                  <div>
                    <div className="text-sm text-gray-500">Current Mood</div>
                    <div className="font-medium text-gray-800">{getMoodSummary()}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Recommendation Banner */}
          {partnerMood && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-6 border border-purple-200"
            >
              <div className="flex items-center">
                <SparklesIcon className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <div className="font-semibold text-purple-800">
                    Recommended: {tabs.find(tab => tab.id === getRecommendedTab())?.name}
                  </div>
                  <div className="text-sm text-purple-600">
                    Based on your current emotional connection with your partner
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex items-center justify-center px-6 py-4 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white shadow-lg text-gray-800'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{tab.name}</span>
                  
                  {/* Active Tab Indicator */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r ${tab.color} rounded-full`}
                    />
                  )}
                  
                  {/* Recommendation Badge */}
                  {getRecommendedTab() === tab.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="py-8"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                  activeTab === tab.id ? 'ring-2 ring-purple-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${tab.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 bg-gradient-to-r ${tab.color} bg-clip-text text-transparent`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {tab.count}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {tab.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {tab.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Relationship Insights */}
      {relationship && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="max-w-7xl mx-auto px-6 pb-8"
        >
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center mb-6">
              <UserGroupIcon className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Relationship Insights
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {relationship.bondingMetrics?.closeness || 0}%
                </div>
                <div className="text-gray-600">Emotional Closeness</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  {relationship.bondingMetrics?.empathy || 0}%
                </div>
                <div className="text-gray-600">Empathy Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {relationship.bondingMetrics?.trust || 0}%
                </div>
                <div className="text-gray-600">Trust Score</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-purple-800 font-medium">
                  Last meaningful conversation: {new Date(relationship.lastInteraction).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConversationDashboard;