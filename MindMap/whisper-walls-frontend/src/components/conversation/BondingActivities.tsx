import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ClockIcon, 
  MapPinIcon,
  UserGroupIcon,
  SparklesIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { conversationService, ActivitySuggestion, ConversationContext } from '../../services/conversationService';
import { useMood } from '../../hooks/useMood';

interface BondingActivitiesProps {
  partnerMood?: any;
  relationship?: any;
  onActivitySelect?: (activity: ActivitySuggestion) => void;
}

export const BondingActivities: React.FC<BondingActivitiesProps> = ({
  partnerMood,
  relationship,
  onActivitySelect
}) => {
  const [activities, setActivities] = useState<ActivitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivitySuggestion | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const { currentMood, blendedMood } = useMood();

  useEffect(() => {
    if (currentMood) {
      generateBondingActivities();
    }
  }, [currentMood, partnerMood]);

  const generateBondingActivities = async () => {
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

      const newActivities = await conversationService.generateBondingActivities(context);
      setActivities(newActivities);
    } catch (error) {
      console.error('Error generating bonding activities:', error);
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

  const handleActivitySelect = (activity: ActivitySuggestion) => {
    setSelectedActivity(activity);
    onActivitySelect?.(activity);
  };

  const toggleFavorite = (activityId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(activityId)) {
      newFavorites.delete(activityId);
    } else {
      newFavorites.add(activityId);
    }
    setFavorites(newFavorites);
  };

  const markAsCompleted = (activityId: string) => {
    const newCompleted = new Set(completedActivities);
    newCompleted.add(activityId);
    setCompletedActivities(newCompleted);
  };

  const getActivityTypeIcon = (type: ActivitySuggestion['type']) => {
    switch (type) {
      case 'indoor': return '🏠';
      case 'outdoor': return '🌳';
      case 'virtual': return '💻';
      case 'creative': return '🎨';
      case 'physical': return '🏃‍♀️';
      default: return '✨';
    }
  };

  const getActivityTypeColor = (type: ActivitySuggestion['type']) => {
    switch (type) {
      case 'indoor': return 'from-blue-400 to-indigo-400';
      case 'outdoor': return 'from-green-400 to-emerald-400';
      case 'virtual': return 'from-purple-400 to-violet-400';
      case 'creative': return 'from-pink-400 to-rose-400';
      case 'physical': return 'from-orange-400 to-red-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  const getConnectionLevelColor = (level: ActivitySuggestion['connectionLevel']) => {
    switch (level) {
      case 'light': return 'text-blue-600 bg-blue-100';
      case 'moderate': return 'text-purple-600 bg-purple-100';
      case 'deep': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMoodBoostStars = (moodBoost: number) => {
    const stars = Math.round(moodBoost * 5);
    return '⭐'.repeat(stars);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <HeartIcon className="w-8 h-8 text-pink-500 mr-3" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Bonding Activities
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Meaningful activities designed to strengthen your connection and create beautiful memories together.
        </p>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        className="flex justify-center mb-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={generateBondingActivities}
          disabled={loading}
          className="flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          <SparklesIcon className={`w-6 h-6 mr-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Creating Activities...' : 'Generate New Activities'}
        </button>
      </motion.div>

      {/* Activities Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-24 bg-gray-200 rounded mb-6"></div>
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="activities"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 ${
                  completedActivities.has(activity.id) 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-100 hover:border-pink-200'
                }`}
                onClick={() => handleActivitySelect(activity)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getActivityTypeColor(activity.type)} mr-3`}>
                      <span className="mr-2">{getActivityTypeIcon(activity.type)}</span>
                      {activity.type}
                    </div>
                    {completedActivities.has(activity.id) && (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(activity.id);
                    }}
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    {favorites.has(activity.id) ? (
                      <HeartSolidIcon className="w-6 h-6 text-pink-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {activity.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {activity.description}
                </p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">{activity.duration} min</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConnectionLevelColor(activity.connectionLevel)}`}>
                      {activity.connectionLevel} connection
                    </span>
                  </div>
                </div>

                {/* Mood Boost */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center text-gray-600">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">Mood Boost</span>
                  </div>
                  <div className="text-lg">
                    {getMoodBoostStars(activity.moodBoost)}
                  </div>
                </div>

                {/* Requirements */}
                {activity.requirements && activity.requirements.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">What you'll need:</h4>
                    <div className="flex flex-wrap gap-2">
                      {activity.requirements.map((req, reqIndex) => (
                        <span
                          key={reqIndex}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivitySelect(activity);
                  }}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start This Activity
                </motion.button>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-600/5 rounded-3xl opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Activity Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getActivityTypeColor(selectedActivity.type)}`}>
                  <span className="mr-2">{getActivityTypeIcon(selectedActivity.type)}</span>
                  {selectedActivity.type}
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedActivity.title}
              </h2>

              <p className="text-gray-600 text-xl leading-relaxed mb-8">
                {selectedActivity.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-800">{selectedActivity.duration}</div>
                  <div className="text-sm text-gray-600">minutes</div>
                </div>
                <div className="text-center">
                  <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-800">{selectedActivity.connectionLevel}</div>
                  <div className="text-sm text-gray-600">connection</div>
                </div>
                <div className="text-center">
                  <SparklesIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-800">{getMoodBoostStars(selectedActivity.moodBoost)}</div>
                  <div className="text-sm text-gray-600">mood boost</div>
                </div>
                <div className="text-center">
                  <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-800">{selectedActivity.type}</div>
                  <div className="text-sm text-gray-600">setting</div>
                </div>
              </div>

              {selectedActivity.requirements && selectedActivity.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">What you'll need:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedActivity.requirements.map((req, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => toggleFavorite(selectedActivity.id)}
                  className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {favorites.has(selectedActivity.id) ? (
                    <HeartSolidIcon className="w-5 h-5 mr-2 text-pink-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 mr-2" />
                  )}
                  {favorites.has(selectedActivity.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    markAsCompleted(selectedActivity.id);
                    setSelectedActivity(null);
                  }}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Activity
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && activities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <HeartIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-4">
            No activities yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Generate personalized bonding activities based on your current mood and relationship stage.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BondingActivities;