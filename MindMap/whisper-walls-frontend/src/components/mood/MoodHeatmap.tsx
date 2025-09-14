import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MoodEmbedding } from '../../types';
import { DreamyInteraction } from '../animations';

interface MoodHeatmapProps {
  moodData: MoodEmbedding[];
  timeRange: 'week' | 'month' | 'year';
  className?: string;
}

interface HeatmapCell {
  date: Date;
  mood: MoodEmbedding | null;
  sentiment: number;
  intensity: number;
  dominantEmotion: string;
  dayOfWeek: number;
  weekOfYear: number;
  dayOfMonth: number;
  color: string;
  opacity: number;
}

export const MoodHeatmap: React.FC<MoodHeatmapProps> = ({
  moodData,
  timeRange,
  className = ''
}) => {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [viewMode, setViewMode] = useState<'sentiment' | 'intensity' | 'emotion'>('sentiment');

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    const cells: HeatmapCell[] = [];
    const now = new Date();
    
    // Create a map of dates to mood data for quick lookup
    const moodMap = new Map<string, MoodEmbedding>();
    moodData.forEach(mood => {
      const dateKey = new Date(mood.timestamp).toDateString();
      moodMap.set(dateKey, mood);
    });

    if (timeRange === 'week') {
      // Generate 7 days for week view
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();
        const mood = moodMap.get(dateKey) || null;
        
        cells.push(createHeatmapCell(date, mood));
      }
    } else if (timeRange === 'month') {
      // Generate calendar grid for month view
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      
      // Start from the beginning of the week containing the first day
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - startOfMonth.getDay());
      
      // Generate 42 cells (6 weeks × 7 days) to fill the calendar grid
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Only include cells within or around the current month
        if (date <= now) {
          const dateKey = date.toDateString();
          const mood = moodMap.get(dateKey) || null;
          cells.push(createHeatmapCell(date, mood));
        }
      }
    } else {
      // Year view - generate 52 weeks
      for (let week = 0; week < 52; week++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (51 - week) * 7);
        
        // Get average mood for this week
        const weekMoods: MoodEmbedding[] = [];
        for (let day = 0; day < 7; day++) {
          const dayDate = new Date(date);
          dayDate.setDate(dayDate.getDate() + day);
          const dateKey = dayDate.toDateString();
          const mood = moodMap.get(dateKey);
          if (mood) weekMoods.push(mood);
        }
        
        const avgMood = weekMoods.length > 0 ? averageMoods(weekMoods) : null;
        cells.push(createHeatmapCell(date, avgMood));
      }
    }

    return cells;
  }, [moodData, timeRange]);

  function createHeatmapCell(date: Date, mood: MoodEmbedding | null): HeatmapCell {
    const sentiment = mood?.sentiment || 0;
    const intensity = mood?.intensity || 0;
    
    let dominantEmotion = 'neutral';
    if (mood) {
      dominantEmotion = Object.entries(mood.emotions).reduce((a, b) => 
        mood.emotions[a[0] as keyof typeof mood.emotions] > mood.emotions[b[0] as keyof typeof mood.emotions] ? a : b
      )[0];
    }

    // Calculate color and opacity based on view mode
    let color = '#E5E7EB'; // Default gray
    let opacity = 0.3;

    if (mood) {
      switch (viewMode) {
        case 'sentiment':
          if (sentiment > 0.3) {
            color = '#10B981'; // Green for positive
            opacity = 0.3 + (sentiment * 0.7);
          } else if (sentiment < -0.3) {
            color = '#EF4444'; // Red for negative
            opacity = 0.3 + (Math.abs(sentiment) * 0.7);
          } else {
            color = '#6B7280'; // Gray for neutral
            opacity = 0.5;
          }
          break;
        case 'intensity':
          color = '#8B5CF6'; // Purple for intensity
          opacity = 0.2 + (intensity * 0.8);
          break;
        case 'emotion':
          const emotionColors: Record<string, string> = {
            joy: '#FFD700',
            sadness: '#4A90E2',
            anger: '#E74C3C',
            fear: '#9B59B6',
            surprise: '#E91E63',
            disgust: '#4CAF50',
            trust: '#00BCD4',
            anticipation: '#FF9800'
          };
          color = emotionColors[dominantEmotion] || '#E5E7EB';
          opacity = 0.4 + (mood.emotions[dominantEmotion as keyof typeof mood.emotions] * 0.6);
          break;
      }
    }

    return {
      date,
      mood,
      sentiment,
      intensity,
      dominantEmotion,
      dayOfWeek: date.getDay(),
      weekOfYear: getWeekOfYear(date),
      dayOfMonth: date.getDate(),
      color,
      opacity
    };
  }

  function averageMoods(moods: MoodEmbedding[]): MoodEmbedding {
    const avgEmotions = {
      joy: 0, sadness: 0, anger: 0, fear: 0,
      surprise: 0, disgust: 0, trust: 0, anticipation: 0
    };
    
    let avgSentiment = 0;
    let avgIntensity = 0;
    
    moods.forEach(mood => {
      Object.entries(mood.emotions).forEach(([emotion, value]) => {
        avgEmotions[emotion as keyof typeof avgEmotions] += value;
      });
      avgSentiment += mood.sentiment;
      avgIntensity += mood.intensity;
    });
    
    const count = moods.length;
    Object.keys(avgEmotions).forEach(emotion => {
      avgEmotions[emotion as keyof typeof avgEmotions] /= count;
    });
    
    return {
      emotions: avgEmotions,
      sentiment: avgSentiment / count,
      intensity: avgIntensity / count,
      timestamp: moods[0].timestamp
    };
  }

  function getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={`mood-heatmap p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Mood Heatmap - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            </h3>
            <p className="text-gray-600 text-sm">
              Visualize your emotional patterns over time. Click on cells to see details.
            </p>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['sentiment', 'intensity', 'emotion'] as const).map((mode) => (
              <DreamyInteraction key={mode}>
                <button
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              </DreamyInteraction>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
        {/* Heatmap Grid */}
        {timeRange === 'week' && (
          <div className="grid grid-cols-7 gap-2">
            {/* Day labels */}
            {dayLabels.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 mb-2">
                {day}
              </div>
            ))}
            
            {/* Heatmap cells */}
            {heatmapData.map((cell, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="aspect-square rounded-lg cursor-pointer border-2 border-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                style={{ 
                  backgroundColor: cell.color,
                  opacity: cell.opacity
                }}
                onClick={() => setSelectedCell(cell)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs font-medium text-white">
                  {cell.date.getDate()}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {timeRange === 'month' && (
          <div>
            {/* Month header */}
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                {monthLabels[new Date().getMonth()]} {new Date().getFullYear()}
              </h4>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Day labels */}
              {dayLabels.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 mb-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar cells */}
              {heatmapData.map((cell, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  className="aspect-square rounded-lg cursor-pointer border-2 border-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                  style={{ 
                    backgroundColor: cell.color,
                    opacity: cell.mood ? cell.opacity : 0.1
                  }}
                  onClick={() => cell.mood && setSelectedCell(cell)}
                  whileHover={cell.mood ? { scale: 1.1 } : {}}
                  whileTap={cell.mood ? { scale: 0.95 } : {}}
                >
                  <span className={`text-xs font-medium ${cell.mood ? 'text-white' : 'text-gray-400'}`}>
                    {cell.date.getDate()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {timeRange === 'year' && (
          <div>
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                {new Date().getFullYear()} - Weekly Overview
              </h4>
            </div>
            
            <div className="grid grid-cols-13 gap-1">
              {heatmapData.map((cell, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.01, duration: 0.3 }}
                  className="aspect-square rounded cursor-pointer border border-white hover:shadow-md transition-all duration-200"
                  style={{ 
                    backgroundColor: cell.color,
                    opacity: cell.mood ? cell.opacity : 0.1
                  }}
                  onClick={() => cell.mood && setSelectedCell(cell)}
                  whileHover={cell.mood ? { scale: 1.2 } : {}}
                  whileTap={cell.mood ? { scale: 0.9 } : {}}
                  title={`Week ${cell.weekOfYear}: ${cell.mood ? 'Data available' : 'No data'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Less</span>
            <div className="flex space-x-1">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor: viewMode === 'sentiment' ? '#10B981' : 
                                   viewMode === 'intensity' ? '#8B5CF6' : '#FFD700',
                    opacity
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">More</span>
          </div>
        </div>
      </div>

      {/* Selected Cell Details */}
      <AnimatePresence>
        {selectedCell && selectedCell.mood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                {selectedCell.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              <DreamyInteraction>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </DreamyInteraction>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedCell.sentiment > 0 ? '+' : ''}{(selectedCell.sentiment * 100).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Sentiment Score</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(selectedCell.intensity * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Emotional Intensity</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 capitalize">
                  {selectedCell.dominantEmotion}
                </div>
                <div className="text-sm text-gray-600">Dominant Emotion</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};