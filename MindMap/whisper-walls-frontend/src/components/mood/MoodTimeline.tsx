import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MoodEmbedding } from '../../types';
import { DreamyInteraction, EmotionalPulse } from '../animations';

interface MoodTimelineProps {
  moodData: MoodEmbedding[];
  timeRange: 'week' | 'month' | 'year';
  className?: string;
}

interface TimelinePoint {
  mood: MoodEmbedding;
  x: number;
  y: number;
  date: string;
  dominantEmotion: string;
  color: string;
}

export const MoodTimeline: React.FC<MoodTimelineProps> = ({
  moodData,
  timeRange,
  className = ''
}) => {
  const [selectedPoint, setSelectedPoint] = useState<TimelinePoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null);

  // Emotion colors
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

  // Process data for timeline visualization
  const timelineData = useMemo(() => {
    if (moodData.length === 0) return [];

    const points: TimelinePoint[] = [];
    const width = 800; // Chart width
    const height = 300; // Chart height
    const padding = 40;

    moodData.forEach((mood, index) => {
      // Calculate x position based on time
      const x = padding + (index / (moodData.length - 1)) * (width - 2 * padding);
      
      // Calculate y position based on sentiment (-1 to 1 mapped to height)
      const y = height - padding - ((mood.sentiment + 1) / 2) * (height - 2 * padding);
      
      // Find dominant emotion
      const dominantEmotion = Object.entries(mood.emotions).reduce((a, b) => 
        mood.emotions[a[0] as keyof typeof mood.emotions] > mood.emotions[b[0] as keyof typeof mood.emotions] ? a : b
      )[0];

      // Format date
      const date = new Date(mood.timestamp);
      const dateString = timeRange === 'week' 
        ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : timeRange === 'month'
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      points.push({
        mood,
        x,
        y,
        date: dateString,
        dominantEmotion,
        color: emotionColors[dominantEmotion]
      });
    });

    return points;
  }, [moodData, timeRange]);

  // Create SVG path for the mood line
  const moodPath = useMemo(() => {
    if (timelineData.length < 2) return '';
    
    let path = `M ${timelineData[0].x} ${timelineData[0].y}`;
    
    for (let i = 1; i < timelineData.length; i++) {
      const prev = timelineData[i - 1];
      const curr = timelineData[i];
      
      // Create smooth curves using quadratic bezier
      const cpx = prev.x + (curr.x - prev.x) / 2;
      const cpy = prev.y;
      
      path += ` Q ${cpx} ${cpy} ${curr.x} ${curr.y}`;
    }
    
    return path;
  }, [timelineData]);

  // Get sentiment label
  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.5) return 'Very Positive';
    if (sentiment > 0.2) return 'Positive';
    if (sentiment > -0.2) return 'Neutral';
    if (sentiment > -0.5) return 'Negative';
    return 'Very Negative';
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return '#10B981';
    if (sentiment < -0.3) return '#EF4444';
    return '#6B7280';
  };

  const displayPoint = selectedPoint || hoveredPoint;

  return (
    <div className={`mood-timeline p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Mood Timeline - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
        </h3>
        <p className="text-gray-600 text-sm">
          Track your emotional journey over time. Hover over points to see details.
        </p>
      </div>

      <div className="relative">
        {/* Main Timeline Chart */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
          <svg
            width="100%"
            height="300"
            viewBox="0 0 800 300"
            className="overflow-visible"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Y-axis labels */}
            <text x="20" y="50" textAnchor="middle" className="text-xs fill-gray-500">Very Positive</text>
            <text x="20" y="150" textAnchor="middle" className="text-xs fill-gray-500">Neutral</text>
            <text x="20" y="250" textAnchor="middle" className="text-xs fill-gray-500">Very Negative</text>
            
            {/* Mood line */}
            {moodPath && (
              <motion.path
                d={moodPath}
                fill="none"
                stroke="url(#moodGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            )}
            
            {/* Gradient definition for mood line */}
            <defs>
              <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            
            {/* Data points */}
            {timelineData.map((point, index) => (
              <motion.g
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === point ? 8 : 6}
                  fill={point.color}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setSelectedPoint(point)}
                />
                
                {/* Emotion indicator */}
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 pointer-events-none"
                  opacity={hoveredPoint === point ? 1 : 0}
                >
                  {point.dominantEmotion}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>

        {/* Timeline Labels */}
        <div className="flex justify-between px-4 text-xs text-gray-500">
          {timelineData.length > 0 && (
            <>
              <span>{timelineData[0].date}</span>
              {timelineData.length > 2 && (
                <span>{timelineData[Math.floor(timelineData.length / 2)].date}</span>
              )}
              <span>{timelineData[timelineData.length - 1].date}</span>
            </>
          )}
        </div>

        {/* Mood Detail Panel */}
        <AnimatePresence>
          {displayPoint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6"
            >
              <EmotionalPulse emotion={displayPoint.dominantEmotion as any} intensity={0.6}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {displayPoint.date}
                    </h4>
                    {selectedPoint && (
                      <DreamyInteraction>
                        <button
                          onClick={() => setSelectedPoint(null)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          ✕
                        </button>
                      </DreamyInteraction>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dominant Emotion */}
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: displayPoint.color }}
                      >
                        {(displayPoint.mood.emotions[displayPoint.dominantEmotion as keyof typeof displayPoint.mood.emotions] * 100).toFixed(0)}%
                      </div>
                      <div className="font-medium text-gray-800 capitalize">
                        {displayPoint.dominantEmotion}
                      </div>
                      <div className="text-sm text-gray-600">Dominant Emotion</div>
                    </div>
                    
                    {/* Sentiment */}
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: getSentimentColor(displayPoint.mood.sentiment) }}
                      >
                        {displayPoint.mood.sentiment > 0 ? '+' : ''}{(displayPoint.mood.sentiment * 100).toFixed(0)}
                      </div>
                      <div className="font-medium text-gray-800">
                        {getSentimentLabel(displayPoint.mood.sentiment)}
                      </div>
                      <div className="text-sm text-gray-600">Overall Sentiment</div>
                    </div>
                    
                    {/* Intensity */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500">
                        {(displayPoint.mood.intensity * 100).toFixed(0)}%
                      </div>
                      <div className="font-medium text-gray-800">
                        {displayPoint.mood.intensity > 0.7 ? 'High' : 
                         displayPoint.mood.intensity > 0.4 ? 'Medium' : 'Low'}
                      </div>
                      <div className="text-sm text-gray-600">Emotional Intensity</div>
                    </div>
                  </div>
                  
                  {/* Emotion Breakdown */}
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-700 mb-3">Emotion Breakdown</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(displayPoint.mood.emotions).map(([emotion, value]) => (
                        <div key={emotion} className="text-center">
                          <div className="text-sm font-medium capitalize text-gray-700">
                            {emotion}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${value * 100}%`,
                                backgroundColor: emotionColors[emotion]
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {(value * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </EmotionalPulse>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};