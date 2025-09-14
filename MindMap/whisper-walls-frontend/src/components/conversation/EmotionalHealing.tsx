import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Lightbulb, Clock, AlertCircle, Sparkles, Users, Shield } from 'lucide-react';
import { conversationService, ConversationPrompt } from '../../services/conversationService';
import { MoodEmbedding, Relationship } from '../../types';

interface EmotionalHealingProps {
  userMood: MoodEmbedding;
  partnerMood: MoodEmbedding;
  relationship: Relationship;
  onPromptSelect?: (prompt: ConversationPrompt) => void;
}

export const EmotionalHealing: React.FC<EmotionalHealingProps> = ({
  userMood,
  partnerMood,
  relationship,
  onPromptSelect
}) => {
  const [healingPrompts, setHealingPrompts] = useState<ConversationPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<ConversationPrompt | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    loadHealingPrompts();
  }, [userMood, partnerMood]);

  const loadHealingPrompts = async () => {
    setLoading(true);
    try {
      const prompts = await conversationService.generateHealingPrompts(
        userMood,
        partnerMood,
        relationship
      );
      setHealingPrompts(prompts);
    } catch (error) {
      console.error('Failed to load healing prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSelect = (prompt: ConversationPrompt) => {
    setSelectedPrompt(prompt);
    onPromptSelect?.(prompt);
  };

  const calculateEmotionalDistance = () => {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'trust'];
    let totalDistance = 0;

    emotions.forEach(emotion => {
      const diff = Math.abs(
        userMood.emotions[emotion as keyof typeof userMood.emotions] - 
        partnerMood.emotions[emotion as keyof typeof partnerMood.emotions]
      );
      totalDistance += diff;
    });

    return totalDistance / emotions.length;
  };

  const getDistanceInsight = () => {
    const distance = calculateEmotionalDistance();
    const { closeness, empathy, trust } = relationship.bondingMetrics;

    if (distance > 0.6 || closeness < 50) {
      return {
        level: 'high',
        message: "There seems to be some emotional distance between you. These gentle prompts can help you reconnect.",
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />
      };
    } else if (distance > 0.3 || closeness < 70) {
      return {
        level: 'medium',
        message: "You might benefit from some deeper connection. These prompts can help bridge any gaps.",
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <Lightbulb className="w-5 h-5 text-yellow-500" />
      };
    } else {
      return {
        level: 'low',
        message: "Your emotional connection is strong! These prompts can help maintain and deepen it.",
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <Heart className="w-5 h-5 text-green-500" />
      };
    }
  };

  const insight = getDistanceInsight();

  const communicationGuidelines = [
    {
      title: "Create Safety",
      description: "Ensure both partners feel safe to be vulnerable",
      icon: <Shield className="w-4 h-4" />
    },
    {
      title: "Listen First",
      description: "Focus on understanding before being understood",
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      title: "Use 'I' Statements",
      description: "Express your feelings without blame or criticism",
      icon: <Heart className="w-4 h-4" />
    },
    {
      title: "Stay Present",
      description: "Focus on the current moment and feelings",
      icon: <Sparkles className="w-4 h-4" />
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">Creating healing conversations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Emotional Distance Insight */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Emotional Healing & Reconnection
        </h2>
        
        <div className={`${insight.bgColor} ${insight.borderColor} border rounded-xl p-6 mb-6`}>
          <div className="flex items-center justify-center mb-3">
            {insight.icon}
            <span className={`ml-2 font-medium ${insight.color}`}>
              Connection Assessment
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">{insight.message}</p>
        </div>
      </motion.div>

      {/* Communication Guidelines Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <button
          onClick={() => setShowGuidance(!showGuidance)}
          className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all"
        >
          <div className="flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">
              {showGuidance ? 'Hide' : 'Show'} Communication Guidelines
            </span>
          </div>
        </button>

        <AnimatePresence>
          {showGuidance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {communicationGuidelines.map((guideline, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                      {guideline.icon}
                    </div>
                    <h3 className="font-medium text-gray-800">{guideline.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{guideline.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Healing Prompts */}
      <div className="space-y-6">
        {healingPrompts.map((prompt, index) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
              selectedPrompt?.id === prompt.id
                ? 'border-pink-300 bg-pink-50'
                : 'border-gray-100 hover:border-pink-200'
            }`}
            onClick={() => handlePromptSelect(prompt)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{prompt.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="capitalize">{prompt.difficulty} conversation</span>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {prompt.estimatedTime} min
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 text-lg leading-relaxed italic">
                "{prompt.prompt}"
              </p>
            </div>

            <p className="text-gray-600 mb-4">{prompt.context}</p>

            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {selectedPrompt?.id === prompt.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-pink-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-pink-50 rounded-lg p-4">
                    <h4 className="font-medium text-pink-800 mb-2 flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      For the Speaker:
                    </h4>
                    <ul className="text-sm text-pink-700 space-y-1">
                      <li>• Speak from your heart, not your head</li>
                      <li>• Share your feelings, not just facts</li>
                      <li>• Be vulnerable and authentic</li>
                      <li>• Take your time to find the right words</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      For the Listener:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Listen with empathy and curiosity</li>
                      <li>• Avoid interrupting or problem-solving</li>
                      <li>• Reflect back what you hear</li>
                      <li>• Ask gentle follow-up questions</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    💕 Remember: The goal is understanding and connection, not winning or being right.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Refresh Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <button
          onClick={loadHealingPrompts}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Generate New Healing Prompts
        </button>
      </motion.div>

      {/* Emergency Support Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Need Additional Support?</h4>
            <p className="text-sm text-yellow-700">
              If you're experiencing ongoing relationship difficulties, consider reaching out to a professional counselor or therapist who can provide personalized guidance.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmotionalHealing;