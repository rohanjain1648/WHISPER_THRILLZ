import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
  HandRaisedIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { conversationService, ConversationPrompt, ConversationContext } from '../../services/conversationService';
import { useMood } from '../../hooks/useMood';

interface HealingPromptsProps {
  partnerMood?: any;
  relationship?: any;
  onPromptSelect?: (prompt: ConversationPrompt) => void;
}

export const HealingPrompts: React.FC<HealingPromptsProps> = ({
  partnerMood,
  relationship,
  onPromptSelect
}) => {
  const [prompts, setPrompts] = useState<ConversationPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<ConversationPrompt | null>(null);
  const [usedPrompts, setUsedPrompts] = useState<Set<string>>(new Set());
  
  const { currentMood, blendedMood } = useMood();

  useEffect(() => {
    if (currentMood && partnerMood) {
      generateHealingPrompts();
    }
  }, [currentMood, partnerMood]);

  const generateHealingPrompts = async () => {
    if (!currentMood) return;

    setLoading(true);
    try {
      const context: ConversationContext = {
        userMood: currentMood,
        partnerMood,
        blendedMood,
        relationship,
        recentInteractions: ['emotional distance', 'communication gap'],
        timeOfDay: getTimeOfDay(),
        relationshipStage: 'challenging'
      };

      const newPrompts = await conversationService.generateHealingPrompts(context);
      setPrompts(newPrompts);
    } catch (error) {
      console.error('Error generating healing prompts:', error);
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

  const handlePromptSelect = (prompt: ConversationPrompt) => {
    setSelectedPrompt(prompt);
    onPromptSelect?.(prompt);
  };

  const markAsUsed = (promptId: string) => {
    const newUsed = new Set(usedPrompts);
    newUsed.add(promptId);
    setUsedPrompts(newUsed);
  };

  const getEmotionalDistance = () => {
    if (!currentMood || !partnerMood) return 'unknown';
    
    const userEmotions = currentMood.emotions;
    const partnerEmotions = partnerMood.emotions;
    
    let distance = 0;
    Object.keys(userEmotions).forEach(emotion => {
      distance += Math.abs(userEmotions[emotion as keyof typeof userEmotions] - 
                          partnerEmotions[emotion as keyof typeof partnerEmotions]);
    });
    
    if (distance > 3) return 'significant';
    if (distance > 1.5) return 'moderate';
    return 'minor';
  };

  const getDistanceColor = (distance: string) => {
    switch (distance) {
      case 'significant': return 'from-red-400 to-pink-400';
      case 'moderate': return 'from-orange-400 to-yellow-400';
      case 'minor': return 'from-green-400 to-emerald-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  const getHealingIcon = (type: ConversationPrompt['type']) => {
    switch (type) {
      case 'healing': return <HeartIcon className="w-6 h-6" />;
      case 'bonding': return <HandRaisedIcon className="w-6 h-6" />;
      case 'reflection': return <SparklesIcon className="w-6 h-6" />;
      default: return <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />;
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
          <ShieldCheckIcon className="w-8 h-8 text-green-500 mr-3" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            Healing Conversations
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Gentle prompts designed to bridge emotional distance and rebuild connection with compassion and understanding.
        </p>
      </motion.div>

      {/* Emotional Distance Indicator */}
      {currentMood && partnerMood && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Emotional Connection Status
              </h3>
              <p className="text-gray-600">
                Current emotional distance: <span className="font-medium">{getEmotionalDistance()}</span>
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-white bg-gradient-to-r ${getDistanceColor(getEmotionalDistance())}`}>
              <HeartIcon className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              💡 <strong>Healing Tip:</strong> These conversations work best when both partners feel safe and heard. 
              Choose a quiet moment when you both have time to connect without distractions.
            </p>
          </div>
        </motion.div>
      )}

      {/* Generate Button */}
      <motion.div
        className="flex justify-center mb-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={generateHealingPrompts}
          disabled={loading}
          className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          <SparklesIcon className={`w-6 h-6 mr-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Creating Healing Space...' : 'Generate Healing Prompts'}
        </button>
      </motion.div>

      {/* Healing Prompts */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
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
            className="space-y-6"
          >
            {prompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${
                  usedPrompts.has(prompt.id) 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-emerald-400 hover:border-emerald-500'
                }`}
                onClick={() => handlePromptSelect(prompt)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mr-4">
                      {getHealingIcon(prompt.type)}
                    </div>
                    <div>
                      <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium mb-2">
                        {prompt.type}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {prompt.title}
                      </h3>
                    </div>
                  </div>
                  {usedPrompts.has(prompt.id) && (
                    <div className="flex items-center text-green-600 text-sm">
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      Used
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed italic">
                    "{prompt.content}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {prompt.estimatedTime} minutes
                  </div>
                  <div className="flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    {prompt.emotionalTone}
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded-full">
                    {prompt.difficulty}
                  </div>
                </div>

                {/* Healing Tips */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start">
                    <div className="text-blue-500 mr-2">💙</div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 mb-1">Healing Approach:</h4>
                      <p className="text-sm text-blue-700">
                        Speak from the heart, listen with empathy, and remember that healing takes time. 
                        Focus on understanding rather than being understood.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-600/5 rounded-2xl opacity-0"
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
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mr-4">
                    {getHealingIcon(selectedPrompt.type)}
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium">
                    {selectedPrompt.type}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {selectedPrompt.title}
              </h2>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
                <p className="text-gray-700 text-xl leading-relaxed italic">
                  "{selectedPrompt.content}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-800">{selectedPrompt.estimatedTime}</div>
                  <div className="text-sm text-gray-600">minutes</div>
                </div>
                <div className="text-center">
                  <SparklesIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-800">{selectedPrompt.emotionalTone}</div>
                  <div className="text-sm text-gray-600">tone</div>
                </div>
                <div className="text-center">
                  <HeartIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-800">{selectedPrompt.difficulty}</div>
                  <div className="text-sm text-gray-600">depth</div>
                </div>
              </div>

              {/* Healing Guidelines */}
              <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Healing Guidelines
                </h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Create a safe, judgment-free space for both of you
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Listen with your heart, not just your ears
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Speak your truth with kindness and compassion
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Remember that healing is a journey, not a destination
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPrompt.content);
                  }}
                  className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 mr-2" />
                  Copy Prompt
                </button>
                <button
                  onClick={() => {
                    markAsUsed(selectedPrompt.id);
                    setSelectedPrompt(null);
                  }}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:shadow-lg transition-all duration-300"
                >
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Start Healing Conversation
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
          className="text-center py-16"
        >
          <ShieldCheckIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-4">
            Ready to heal together?
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Generate gentle conversation prompts designed to bridge emotional distance and rebuild your connection.
          </p>
        </motion.div>
      )}

      {/* Safety Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-12 bg-yellow-50 border border-yellow-200 rounded-2xl p-6"
      >
        <div className="flex items-start">
          <div className="text-yellow-500 text-2xl mr-3">⚠️</div>
          <div>
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">
              Remember: Your Safety Matters
            </h4>
            <p className="text-yellow-700 text-sm">
              These prompts are designed for healthy relationships working through normal challenges. 
              If you're experiencing abuse, manipulation, or feel unsafe, please reach out to a professional counselor or support service.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HealingPrompts;