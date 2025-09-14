import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Users, Sparkles, Lightbulb, Coffee, BookOpen } from 'lucide-react';
import ConversationStarters from './ConversationStarters';
import CoupleBonding from './CoupleBonding';
import EmotionalHealing from './EmotionalHealing';
import { MoodEmbedding, Relationship, User } from '../../types';
import { conversationService } from '../../services/conversationService';

interface ConversationHubProps {
  user: User;
  userMood: MoodEmbedding;
  partner?: User;
  partnerMood?: MoodEmbedding;
  relationship?: Relationship;
  blendedMood?: MoodEmbedding;
}

type ConversationMode = 'starters' | 'bonding' | 'healing' | 'ice_breakers';

export const ConversationHub: React.FC<ConversationHubProps> = ({
  user,
  userMood,
  partner,
  partnerMood,
  relationship,
  blendedMood
}) => {
  const [activeMode, setActiveMode] = useState<ConversationMode>('starters');
  const [recommendedMode, setRecommendedMode] = useState<ConversationMode>('starters');

  useEffect(() => {
    determineRecommendedMode();
  }, [userMood, partnerMood, relationship]);

  const determineRecommendedMode = () => {
    // Analyze emotional context to recommend the best conversation mode
    if (relationship && partnerMood) {
      const emotionalDistance = calculateEmotionalDistance(userMood, partnerMood);
      const relationshipHealth = (
        relationship.bondingMetrics.closeness +
        relationship.bondingMetrics.empathy +
        relationship.bondingMetrics.trust
      ) / 3;

      if (emotionalDistance > 0.5 || relationshipHealth < 60) {
        setRecommendedMode('healing');
      } else if (relationshipHealth > 80) {
        setRecommendedMode('bonding');
      } else {
        setRecommendedMode('starters');
      }
    } else if (!partner) {
      setRecommendedMode('ice_breakers');
    } else {
      setRecommendedMode('starters');
    }
  };

  const calculateEmotionalDistance = (mood1: MoodEmbedding, mood2: MoodEmbedding): number => {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'trust'];
    let totalDistance = 0;

    emotions.forEach(emotion => {
      const diff = Math.abs(
        mood1.emotions[emotion as keyof typeof mood1.emotions] - 
        mood2.emotions[emotion as keyof typeof mood2.emotions]
      );
      totalDistance += diff;
    });

    return totalDistance / emotions.length;
  };

  const conversationModes = [
    {
      key: 'starters' as ConversationMode,
      title: 'Conversation Starters',
      description: 'Thoughtful prompts to spark meaningful conversations',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'from-blue-500 to-indigo-600',
      available: true
    },
    {
      key: 'bonding' as ConversationMode,
      title: 'Couple Bonding',
      description: 'Activities designed to strengthen your relationship',
      icon: <Heart className="w-5 h-5" />,
      color: 'from-pink-500 to-red-600',
      available: !!(partner && relationship && blendedMood)
    },
    {
      key: 'healing' as ConversationMode,
      title: 'Emotional Healing',
      description: 'Gentle prompts to reconnect and heal distance',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-600',
      available: !!(partner && partnerMood && relationship)
    },
    {
      key: 'ice_breakers' as ConversationMode,
      title: 'Ice Breakers',
      description: 'Perfect conversation starters for new connections',
      icon: <Coffee className="w-5 h-5" />,
      color: 'from-green-500 to-teal-600',
      available: true
    }
  ];

  const getContextualWelcome = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    if (partner && relationship) {
      return {
        greeting: `${timeGreeting}, ${user.profile.displayName || 'beautiful soul'}`,
        message: `Ready to deepen your connection with ${partner.profile.displayName || 'your partner'}?`,
        icon: <Heart className="w-6 h-6 text-pink-500" />
      };
    } else {
      return {
        greeting: `${timeGreeting}, ${user.profile.displayName || 'wonderful human'}`,
        message: "Let's create some meaningful conversations today",
        icon: <MessageCircle className="w-6 h-6 text-blue-500" />
      };
    }
  };

  const welcome = getContextualWelcome();

  const renderActiveMode = () => {
    switch (activeMode) {
      case 'starters':
        return (
          <ConversationStarters
            userMood={userMood}
            partnerMood={partnerMood}
            relationship={relationship}
            context={partner ? 'couple' : 'individual'}
          />
        );
      case 'bonding':
        if (blendedMood && relationship) {
          return (
            <CoupleBonding
              blendedMood={blendedMood}
              relationship={relationship}
            />
          );
        }
        return <div className="text-center text-gray-500 p-8">Couple bonding requires a connected partner</div>;
      case 'healing':
        if (partnerMood && relationship) {
          return (
            <EmotionalHealing
              userMood={userMood}
              partnerMood={partnerMood}
              relationship={relationship}
            />
          );
        }
        return <div className="text-center text-gray-500 p-8">Emotional healing requires a connected partner</div>;
      case 'ice_breakers':
        return (
          <ConversationStarters
            userMood={userMood}
            context="new_connection"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {welcome.icon}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{welcome.greeting}</h1>
                <p className="text-gray-600">{welcome.message}</p>
              </div>
            </div>
            
            {recommendedMode !== activeMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-100 border border-yellow-300 rounded-lg p-3"
              >
                <div className="flex items-center text-yellow-800">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    We recommend: {conversationModes.find(m => m.key === recommendedMode)?.title}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mode Selection */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {conversationModes.map((mode) => (
            <motion.button
              key={mode.key}
              onClick={() => mode.available && setActiveMode(mode.key)}
              disabled={!mode.available}
              className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                activeMode === mode.key
                  ? 'border-pink-300 bg-white shadow-lg'
                  : mode.available
                  ? 'border-gray-200 bg-white/70 hover:border-pink-200 hover:bg-white'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
              whileHover={mode.available ? { y: -2 } : {}}
              whileTap={mode.available ? { scale: 0.98 } : {}}
            >
              {mode.key === recommendedMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              )}
              
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${mode.color} flex items-center justify-center text-white mb-3 mx-auto`}>
                {mode.icon}
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-2">{mode.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{mode.description}</p>
              
              {!mode.available && (
                <div className="absolute inset-0 bg-gray-100/50 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">Not Available</span>
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Active Mode Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveMode()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Help Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        whileHover={{ rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        <BookOpen className="w-6 h-6 mx-auto" />
      </motion.button>
    </div>
  );
};

export default ConversationHub;