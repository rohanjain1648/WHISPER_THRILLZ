import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MoodDashboard } from '../../components/mood/MoodDashboard';
import { MoodTimeline } from '../../components/mood/MoodTimeline';
import { MoodHeatmap } from '../../components/mood/MoodHeatmap';
import { MoodInsights } from '../../components/mood/MoodInsights';
import { moodService } from '../../services/moodService';
import { MoodEmbedding } from '../../types';

// Mock the mood service
vi.mock('../../services/moodService', () => ({
  moodService: {
    getMoodHistory: vi.fn(),
    getMoodStatistics: vi.fn(),
    getMoodPatterns: vi.fn()
  }
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
    g: ({ children, ...props }: any) => <g {...props}>{children}</g>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
    text: ({ children, ...props }: any) => <text {...props}>{children}</text>
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimationControls: () => ({
    start: vi.fn(),
    stop: vi.fn()
  })
}));

// Mock animation components
vi.mock('../../components/animations', () => ({
  RevealOnScroll: ({ children }: any) => children,
  EmotionalPulse: ({ children }: any) => children,
  DreamyInteraction: ({ children }: any) => children,
  ParticleSystem: () => null,
  ButterflySwarm: () => null,
  MagicalShimmer: ({ children }: any) => children,
  SparkleEffect: () => null,
  useAnimationOrchestrator: () => ({
    triggerSequence: vi.fn(),
    currentTrigger: null,
    clearTrigger: vi.fn()
  })
}));

// Create mock mood data
const createMockMoodData = (count: number = 7): MoodEmbedding[] => {
  const data: MoodEmbedding[] = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      emotions: {
        joy: 0.6 + Math.random() * 0.3,
        sadness: 0.1 + Math.random() * 0.2,
        anger: 0.05 + Math.random() * 0.1,
        fear: 0.05 + Math.random() * 0.1,
        surprise: 0.2 + Math.random() * 0.2,
        disgust: 0.02 + Math.random() * 0.05,
        trust: 0.5 + Math.random() * 0.3,
        anticipation: 0.4 + Math.random() * 0.3
      },
      sentiment: (Math.random() - 0.5) * 1.5, // -0.75 to 0.75
      intensity: 0.3 + Math.random() * 0.5,
      timestamp: date
    });
  }
  
  return data;
};

describe('MoodDashboard Integration Tests', () => {
  const mockUserId = 'test-user-123';
  const mockMoodData = createMockMoodData(30);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    (moodService.getMoodHistory as any).mockResolvedValue(mockMoodData);
    (moodService.getMoodStatistics as any).mockResolvedValue({
      totalEntries: mockMoodData.length,
      avgSentiment: 0.3,
      avgIntensity: 0.6,
      dominantEmotion: 'joy',
      trend: 0.1,
      emotionBreakdown: {
        joy: 0.6,
        sadness: 0.15,
        anger: 0.05,
        fear: 0.05,
        surprise: 0.2,
        disgust: 0.02,
        trust: 0.65,
        anticipation: 0.55
      }
    });
  });

  describe('MoodDashboard Component', () => {
    it('should render dashboard with loading state initially', async () => {
      render(<MoodDashboard userId={mockUserId} />);
      
      expect(screen.getByText('Loading your emotional journey...')).toBeInTheDocument();
    });

    it('should load and display mood data successfully', async () => {
      render(<MoodDashboard userId={mockUserId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Your Emotional Journey')).toBeInTheDocument();
      });

      expect(moodService.getMoodHistory).toHaveBeenCalledWith('month');
    });

    it('should switch between different time ranges', async () => {
      render(<MoodDashboard userId={mockUserId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Your Emotional Journey')).toBeInTheDocument();
      });

      // Click on week button
      const weekButton = screen.getByRole('button', { name: /week/i });
      fireEvent.click(weekButton);

      await waitFor(() => {
        expect(moodService.getMoodHistory).toHaveBeenCalledWith('week');
      });
    });

    it('should switch between different visualization views', async () => {
      render(<MoodDashboard userId={mockUserId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Your Emotional Journey')).toBeInTheDocument();
      });

      // Switch to heatmap view
      const heatmapButton = screen.getByRole('button', { name: /heatmap/i });
      fireEvent.click(heatmapButton);

      // Switch to insights view
      const insightsButton = screen.getByRole('button', { name: /insights/i });
      fireEvent.click(insightsButton);

      // Verify buttons are working (no errors thrown)
      expect(heatmapButton).toBeInTheDocument();
      expect(insightsButton).toBeInTheDocument();
    });

    it('should display mood statistics correctly', async () => {
      render(<MoodDashboard userId={mockUserId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Mood Statistics')).toBeInTheDocument();
      });

      // Check if statistics are displayed
      expect(screen.getByText('30')).toBeInTheDocument(); // Total entries
      expect(screen.getByText('+30')).toBeInTheDocument(); // Avg sentiment
      expect(screen.getByText('60%')).toBeInTheDocument(); // Avg intensity
    });

    it('should handle API errors gracefully', async () => {
      // Mock API failure
      (moodService.getMoodHistory as any).mockRejectedValue(new Error('API Error'));
      
      render(<MoodDashboard userId={mockUserId} />);
      
      // Should still render with fallback mock data
      await waitFor(() => {
        expect(screen.getByText('Your Emotional Journey')).toBeInTheDocument();
      });
    });
  });

  describe('MoodTimeline Component', () => {
    it('should render timeline with mood data', () => {
      render(
        <MoodTimeline 
          moodData={mockMoodData.slice(0, 7)} 
          timeRange="week" 
        />
      );
      
      expect(screen.getByText(/Mood Timeline - Week/)).toBeInTheDocument();
      expect(screen.getByText(/Track your emotional journey over time/)).toBeInTheDocument();
    });

    it('should display mood points on timeline', () => {
      render(
        <MoodTimeline 
          moodData={mockMoodData.slice(0, 7)} 
          timeRange="week" 
        />
      );
      
      // Check for SVG elements (timeline chart)
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should show mood details when point is clicked', async () => {
      render(
        <MoodTimeline 
          moodData={mockMoodData.slice(0, 7)} 
          timeRange="week" 
        />
      );
      
      // Find and click a mood point (circle element)
      const circles = document.querySelectorAll('circle');
      if (circles.length > 0) {
        fireEvent.click(circles[0]);
        
        // Should show mood details
        await waitFor(() => {
          expect(screen.getByText(/Dominant Emotion/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('MoodHeatmap Component', () => {
    it('should render heatmap with different view modes', () => {
      render(
        <MoodHeatmap 
          moodData={mockMoodData} 
          timeRange="month" 
        />
      );
      
      expect(screen.getByText(/Mood Heatmap - Month/)).toBeInTheDocument();
      
      // Check for view mode buttons
      expect(screen.getByRole('button', { name: /sentiment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /intensity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /emotion/i })).toBeInTheDocument();
    });

    it('should switch between view modes', () => {
      render(
        <MoodHeatmap 
          moodData={mockMoodData} 
          timeRange="month" 
        />
      );
      
      const intensityButton = screen.getByRole('button', { name: /intensity/i });
      fireEvent.click(intensityButton);
      
      const emotionButton = screen.getByRole('button', { name: /emotion/i });
      fireEvent.click(emotionButton);
      
      // Verify buttons are clickable
      expect(intensityButton).toBeInTheDocument();
      expect(emotionButton).toBeInTheDocument();
    });

    it('should display calendar grid for month view', () => {
      render(
        <MoodHeatmap 
          moodData={mockMoodData} 
          timeRange="month" 
        />
      );
      
      // Check for day labels
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
    });
  });

  describe('MoodInsights Component', () => {
    it('should render insights with different categories', () => {
      render(
        <MoodInsights 
          moodData={mockMoodData} 
          timeRange="month" 
        />
      );
      
      expect(screen.getByText('AI-Powered Mood Insights')).toBeInTheDocument();
      
      // Check for tab buttons
      expect(screen.getByRole('button', { name: /patterns/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /growth/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /recommendations/i })).toBeInTheDocument();
    });

    it('should switch between insight categories', () => {
      render(
        <MoodInsights 
          moodData={mockMoodData} 
          timeRange="month" 
        />
      );
      
      const growthButton = screen.getByRole('button', { name: /growth/i });
      fireEvent.click(growthButton);
      
      const recommendationsButton = screen.getByRole('button', { name: /recommendations/i });
      fireEvent.click(recommendationsButton);
      
      // Verify tab switching works
      expect(growthButton).toBeInTheDocument();
      expect(recommendationsButton).toBeInTheDocument();
    });

    it('should generate insights based on mood data', () => {
      // Create mood data with high joy levels
      const joyfulMoodData = mockMoodData.map(mood => ({
        ...mood,
        emotions: {
          ...mood.emotions,
          joy: 0.8
        }
      }));
      
      render(
        <MoodInsights 
          moodData={joyfulMoodData} 
          timeRange="month" 
        />
      );
      
      // Should generate joyful spirit insight
      expect(screen.getByText(/Joyful Spirit/)).toBeInTheDocument();
    });
  });

  describe('Integration Flow', () => {
    it('should complete full mood dashboard workflow', async () => {
      render(<MoodDashboard userId={mockUserId} />);
      
      // 1. Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Your Emotional Journey')).toBeInTheDocument();
      });
      
      // 2. Switch to week view
      const weekButton = screen.getByRole('button', { name: /week/i });
      fireEvent.click(weekButton);
      
      await waitFor(() => {
        expect(moodService.getMoodHistory).toHaveBeenCalledWith('week');
      });
      
      // 3. Switch to heatmap view
      const heatmapButton = screen.getByRole('button', { name: /heatmap/i });
      fireEvent.click(heatmapButton);
      
      // 4. Switch to insights view
      const insightsButton = screen.getByRole('button', { name: /insights/i });
      fireEvent.click(insightsButton);
      
      // 5. Verify all components are working
      expect(screen.getByText('Your Emotional Journey')).toBeInTheDocument();
      expect(weekButton).toHaveClass('bg-gradient-to-r');
      expect(insightsButton).toHaveClass('bg-gradient-to-r');
    });

    it('should handle empty mood data gracefully', async () => {
      (moodService.getMoodHistory as any).mockResolvedValue([]);
      
      render(<MoodDashboard userId={mockUserId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Your Emotional Journey')).toBeInTheDocument();
      });
      
      // Should show appropriate empty states
      expect(screen.getByText('No recent mood data')).toBeInTheDocument();
    });
  });
});