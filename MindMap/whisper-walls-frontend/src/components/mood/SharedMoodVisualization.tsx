import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MoodEmbedding } from '../../types';
import { EmotionalPulse, SparkleEffect } from '../animations';

interface SharedMoodVisualizationProps {
  user1Mood: MoodEmbedding;
  user2Mood: MoodEmbedding;
  blendedMood: MoodEmbedding;
  user1Name: string;
  user2Name: string;
  className?: string;
}

export const SharedMoodVisualization: React.FC<SharedMoodVisualizationProps> = ({
  user1Mood,
  user2Mood,
  blendedMood,
  user1Name,
  user2Name,
  className = ''
}) => {
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

  // Calculate radar chart points for all three moods
  const createRadarPoints = (mood: MoodEmbedding, radius: number) => {
    const emotions = Object.entries(mood.emotions);
    const angleStep = (2 * Math.PI) / emotions.length;
    const center = { x: 200, y: 200 };
    
    return emotions.map(([emotion, value], index) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = value * radius;
      
      return {
        emotion,
        value,
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r,
        labelX: center.x + Math.cos(angle) * (radius + 30),
        labelY: center.y + Math.sin(angle) * (radius + 30),
        color: emotionColors[emotion]
      };
    });
  };

  const user1Points = useMemo(() => createRadarPoints(user1Mood, 120), [user1Mood]);
  const user2Points = useMemo(() => createRadarPoints(user2Mood, 120), [user2Mood]);
  const blendedPoints = useMemo(() => createRadarPoints(blendedMood, 120), [blendedMood]);

  // Create SVG paths
  const createPath = (points: any[]) => {
    if (points.length === 0) return '';
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
  };

  const user1Path = useMemo(() => createPath(user1Points), [user1Points]);
  const user2Path = useMemo(() => createPath(user2Points), [user2Points]);
  const blendedPath = useMemo(() => createPath(blendedPoints), [blendedPoints]);

  // Grid lines
  const gridLines = useMemo(() => {
    const emotions = Object.keys(user1Mood.emotions);
    const angleStep = (2 * Math.PI) / emotions.length;
    const center = { x: 200, y: 200 };
    
    return emotions.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const endX = center.x + Math.cos(angle) * 120;
      const endY = center.y + Math.sin(angle) * 120;
      
      return { x1: center.x, y1: center.y, x2: endX, y2: endY };
    });
  }, [user1Mood.emotions]);

  return (
    <div className={`shared-mood-visualization ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
        <SparkleEffect count={3} intensity="subtle" color="rainbow" />
        
        <div className="relative z-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Emotional Harmony Radar
          </h3>
          
          <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Radar Chart */}
            <div className="flex-1">
              <svg width="400" height="400" viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
                {/* Grid circles */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
                  <circle
                    key={index}
                    cx="200"
                    cy="200"
                    r={120 * scale}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                ))}
                
                {/* Grid lines */}
                {gridLines.map((line, index) => (
                  <line
                    key={index}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                ))}
                
                {/* User 1 mood area */}
                <motion.path
                  d={user1Path}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
                
                {/* User 2 mood area */}
                <motion.path
                  d={user2Path}
                  fill="rgba(34, 197, 94, 0.2)"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.4 }}
                />
                
                {/* Blended mood area */}
                <motion.path
                  d={blendedPath}
                  fill="rgba(168, 85, 247, 0.3)"
                  stroke="#A855F7"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.6 }}
                />
                
                {/* Emotion labels */}
                {blendedPoints.map((point, index) => (
                  <g key={point.emotion}>
                    <text
                      x={point.labelX}
                      y={point.labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-medium fill-gray-700 capitalize"
                    >
                      {point.emotion}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            
            {/* Legend and Stats */}
            <div className="flex-1 space-y-6">
              {/* Legend */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
                
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded opacity-50"></div>
                  <span className="text-sm text-gray-700">{user1Name}'s Mood</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded opacity-50"></div>
                  <span className="text-sm text-gray-700">{user2Name}'s Mood</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-700 font-medium">Blended Mood</span>
                </div>
              </div>
              
              {/* Mood Comparison */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Mood Comparison</h4>
                
                <div className="grid grid-cols-1 gap-3">
                  <EmotionalPulse emotion="joy" intensity={0.6}>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{user1Name}</span>
                        <span className="text-sm text-blue-600 font-semibold">
                          {user1Mood.sentiment > 0 ? '+' : ''}{(user1Mood.sentiment * 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Intensity: {(user1Mood.intensity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </EmotionalPulse>
                  
                  <EmotionalPulse emotion="trust" intensity={0.6}>
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{user2Name}</span>
                        <span className="text-sm text-green-600 font-semibold">
                          {user2Mood.sentiment > 0 ? '+' : ''}{(user2Mood.sentiment * 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Intensity: {(user2Mood.intensity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </EmotionalPulse>
                  
                  <EmotionalPulse emotion="love" intensity={0.8}>
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">💕 Together</span>
                        <span className="text-sm text-purple-600 font-bold">
                          {blendedMood.sentiment > 0 ? '+' : ''}{(blendedMood.sentiment * 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Intensity: {(blendedMood.intensity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </EmotionalPulse>
                </div>
              </div>
              
              {/* Emotional Overlap */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Emotional Overlap</h4>
                
                {Object.entries(blendedMood.emotions).slice(0, 3).map(([emotion, value]) => (
                  <div key={emotion} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium text-gray-700">{emotion}</span>
                      <span className="text-gray-600">{(value * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: emotionColors[emotion] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};