import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  HeartIcon, 
  SparklesIcon,
  ClockIcon,
  TagIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { conversationService, ConversationPrompt, ConversationContext } from '../../services/conversationService';
import { useMood } from '../../hooks/useMood';
import { useAuth } from '../../hooks/useAuth';

interface ConversationStartersProps {
  partnerMood?: any;
  relationship?: any;
  onPromptSelect?: (prompt: ConversationPrompt) => void;
}

export const ConversationStarters: React.FC<ConversationStartersProps> = ({
  partnerMood,
  relationship,
  onPromptSelect
}) => {
  const [prompts, setPrompts] = useState<ConversationPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<ConversationPrompt | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const { currentMood, blendedMood } = useMood();
  const { user } = useAuth();

  useEffect(() => {
    if (currentMood) {
      generateConversationStarters();
    }
  }, [currentMood, partnerMood]);

  const generateConversationStarters = async () => {
    if (!currentMood) return;

    setLoading(true);
    try {
      const context: ConversationContext = {
        userMood: currentMood,
        partnerMood,
        blendedMood,
        relationship,
        recentInteractions: [],
        timeOfDay: getTimeOfDay(),
        relationshipStage: getRelationshipStage()
      };

      const newPrompts = await conversationService.generateConversationStarters(context);
      setPrompts(newPrompts);
    } catch (error) {
      console.error('Error generating conversation starters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const getRelationshipStage = (): 'new' | 'developing' | 'established' | 'challenging' => {
    if (!relationship) return 'new';
    const daysTogether = Math.floor((Date.now() - new Date(relationship.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysTogether < 30) return 'new';
    if (daysTogether < 180) return 'developing';
    if (relationship.bondingMetrics?.closeness > 70) return 'established';
    return 'challenging';
  };

  const handlePromptSelect = (prompt: ConversationPrompt) => {
    setSelectedPrompt(prompt);
    onPromptSelect?.(prompt);
  };

  const toggleFavorite = (promptId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(promptId)) {
      newFavorites.delete(promptId);
    } else {
      newFavorites.add(promptId);
    }
    setFavorites(newFavorites);
  };

  const getPromptTypeColor = (type: ConversationPrompt['type']) => {
    switch (type) {
      case 'icebreaker': return 'from-blue-400 to-cyan-400';
      case 'bonding': return 'from-pink-400 to-rose-400';
      case 'healing': return 'from-green-400 to-emerald-400';
      case 'reflection': return 'from-purple-400 to-violet-400';
      case 'activity': return 'from-orange-400 to-amber-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  const getDifficultyIcon = (difficulty: ConversationPrompt['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '💫';
      case 'medium': return '✨';
      case 'deep': return '🌟';
      default: return '💫';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-pink-500 mr-3" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Conversation Starters
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Beautiful prompts crafted just for you, designed to deepen your connection and spark meaningful conversations.
        </p>
      </motion.div>

      {/* Refresh Button */}
      <motion.div
        className="flex justify-center mb-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={generateConversationStarters}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          <RefreshIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Creating Magic...' : 'New Conversation Starters'}
        </button>
      </motion.div>

      {/* Conversation Prompts Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="prompts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {prompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-pink-200"
                onClick={() => handlePromptSelect(prompt)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getPromptTypeColor(prompt.type)}`}>
                    {prompt.type}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(prompt.id);
                    }}
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    {favorites.has(prompt.id) ? (
                      <HeartSolidIcon className="w-5 h-5 text-pink-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                  {prompt.title}
                </h3>

                {/* Content */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {prompt.content}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {prompt.estimatedTime}min
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">{getDifficultyIcon(prompt.difficulty)}</span>
                    {prompt.difficulty}
                  </div>
                </div>

                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {prompt.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-2xl opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Prompt Modal */}
      <AnimatePresence>
        {selectedPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPrompt(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getPromptTypeColor(selectedPrompt.type)}`}>
                  {selectedPrompt.type}
                </div>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedPrompt.title}
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {selectedPrompt.content}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {selectedPrompt.estimatedTime} minutes
                </div>
                <div className="flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-1" />
                  {selectedPrompt.emotionalTone}
                </div>
                <div className="flex items-center">
                  <span className="mr-1">{getDifficultyIcon(selectedPrompt.difficulty)}</span>
                  {selectedPrompt.difficulty}
                </div>
              </div>

              {selectedPrompt.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPrompt.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => toggleFavorite(selectedPrompt.id)}
                  className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {favorites.has(selectedPrompt.id) ? (
                    <HeartSolidIcon className="w-5 h-5 mr-2 text-pink-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 mr-2" />
                  )}
                  {favorites.has(selectedPrompt.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    // Copy to clipboard or share functionality
                    navigator.clipboard.writeText(selectedPrompt.content);
                    setSelectedPrompt(null);
                  }}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Use This Prompt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && prompts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No conversation starters yet
          </h3>
          <p className="text-gray-500 mb-6">
            Click the button above to generate personalized conversation prompts based on your current mood.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ConversationStarters;