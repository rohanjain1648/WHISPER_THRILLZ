import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MoodEmbedding } from '../../types';

interface MoodVisualizationProps {
  moodEmbedding: MoodEmbedding;
  type: 'radar' | 'bar' | 'circle' | 'line';
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const MoodVisualization: React.FC<MoodVisualizationProps> = ({
  moodEmbedding,
  type = 'radar',
  className = '',
  size = 'medium'
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

  const sizeConfig = {
    small: { width: 150, height: 150, radius: 60 },
    medium: { width: 200, height: 200, radius: 80 },
    large: { width: 300, height: 300, radius: 120 }
  };

  const config = sizeConfig[size];
  const center = { x: config.width / 2, y: config.height / 2 };

  // Calculate radar chart points
  const radarPoints = useMemo(() => {
    const emotions = Object.entries(moodEmbedding.emotions);
    const angleStep = (2 * Math.PI) / emotions.length;
    
    return emotions.map(([emotion, value], index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const radius = value * config.radius;
      
      return {
        emotion,
        value,
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        labelX: center.x + Math.cos(angle) * (config.radius + 20),
        labelY: center.y + Math.sin(angle) * (config.radius + 20),
        color: emotionColors[emotion]
      };
    });
  }, [moodEmbedding.emotions, config.radius, center]);

  // Create radar chart path
  const radarPath = useMemo(() => {
    if (radarPoints.length === 0) return '';
    
    const pathData = radarPoints.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
    
    return pathData;
  }, [radarPoints]);

  // Create grid lines for radar chart
  const gridLines = useMemo(() => {
    const emotions = Object.keys(moodEmbedding.emotions);
    const angleStep = (2 * Math.PI) / emotions.length;
    
    return emotions.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const endX = center.x + Math.cos(angle) * config.radius;
      const endY = center.y + Math.sin(angle) * config.radius;
      
      return {
        x1: center.x,
        y1: center.y,
        x2: endX,
        y2: endY
      };
    });
  }, [moodEmbedding.emotions, config.radius, center]);

  const renderRadarChart = () => (
    <svg width={config.width} height={config.height} className="overflow-visible">
      {/* Grid circles */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
        <circle
          key={index}
          cx={center.x}
          cy={center.y}
          r={config.radius * scale}
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
      
      {/* Mood area */}
      <motion.path
        d={radarPath}
        fill="url(#moodGradient)"
        fillOpacity="0.3"
        stroke="url(#moodGradient)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      
      {/* Emotion points */}
      {radarPoints.map((point, index) => (
        <motion.g key={point.emotion}>
          <motion.circle
            cx={point.x}
            cy={point.y}
            r="4"
            fill={point.color}
            stroke="white"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
          
          {/* Emotion labels */}
          <text
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-medium fill-gray-600 capitalize"
          >
            {point.emotion}
          </text>
          
          {/* Value labels */}
          <text
            x={point.labelX}
            y={point.labelY + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-500"
          >
            {(point.value * 100).toFixed(0)}%
          </text>
        </motion.g>
      ))}
    </svg>
  );

  const renderBarChart = () => (
    <div className="space-y-3">
      {Object.entries(moodEmbedding.emotions).map(([emotion, value], index) => (
        <motion.div
          key={emotion}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className="flex items-center space-x-3"
        >
          <div className="w-16 text-sm font-medium capitalize text-gray-700">
            {emotion}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: emotionColors[emotion] }}
              initial={{ width: 0 }}
              animate={{ width: `${value * 100}%` }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
            />
          </div>
          <div className="w-12 text-sm text-gray-600 text-right">
            {(value * 100).toFixed(0)}%
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCircleChart = () => {
    const dominantEmotion = Object.entries(moodEmbedding.emotions).reduce((a, b) => 
      moodEmbedding.emotions[a[0] as keyof typeof moodEmbedding.emotions] > 
      moodEmbedding.emotions[b[0] as keyof typeof moodEmbedding.emotions] ? a : b
    );

    return (
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
            style={{ backgroundColor: emotionColors[dominantEmotion[0]] }}
          >
            {(dominantEmotion[1] * 100).toFixed(0)}%
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-white shadow-lg"></div>
        </motion.div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 capitalize">
            {dominantEmotion[0]}
          </div>
          <div className="text-sm text-gray-600">Dominant Emotion</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-800">
              {moodEmbedding.sentiment > 0 ? '+' : ''}{(moodEmbedding.sentiment * 100).toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">Sentiment</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-800">
              {(moodEmbedding.intensity * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Intensity</div>
          </div>
        </div>
      </div>
    );
  };

  const renderVisualization = () => {
    switch (type) {
      case 'radar':
        return renderRadarChart();
      case 'bar':
        return renderBarChart();
      case 'circle':
        return renderCircleChart();
      default:
        return renderRadarChart();
    }
  };

  return (
    <div className={`mood-visualization ${className}`}>
      {renderVisualization()}
    </div>
  );
};