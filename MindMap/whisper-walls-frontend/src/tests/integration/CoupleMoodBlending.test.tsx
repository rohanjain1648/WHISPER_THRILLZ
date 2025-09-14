import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CoupleMoodBlending } from '../../components/mood/CoupleMoodBlending';
import { SharedMoodVisualization } from '../../components/mood/SharedMoodVisualization';
import { RelationshipAnalytics } from '../../components/mood/RelationshipAnalytics';
import { moodService } from '../../services/moodService';
import type { MoodEmbedding } from '../../types';

// Mock the mood service
vi.mock('../../services/moodService', () => ({
  moodService: {
    getMoodHistory: vi.fn(),
    blendCoupleMoods: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
    g: ({ children, ...props }: any) => <g {...props}>{children}</g>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
    text: ({ children, ...props }: any) => <text {...props}>{children}</text>
  },
  AnimatePresence: ({ children }: any) => children
}));

// Mock animation components
vi.mock('../../components/animations', () => ({
  RevealOnScroll: ({ children }: any) => children,
  EmotionalPulse: ({ children }: any) => children,
  DreamyInteraction: ({ children }: any) => children,
  ParticleSystem: () => null,
  SparkleEffect: () => null,
  MagicalShimmer: ({ children }: any) => children,
  useAnimationOrchestrator: () => ({
    triggerSequence: vi.fn(),
    currentTrigger: null,
    clearTrigger: vi.fn()
  })
}));

// Create mock mood data
const createMockMood = (overrides: Partial<MoodEmbedding> = {}): MoodEmbedding => ({
  emotions: {
    joy: 0.6,
    sadness: 0.2,
    anger: 0.1,
    fear: 0.1,
    surprise: 0.3,
    disgust: 0.05,
    trust: 0.7,
    anticipation: 0.5
  },
  sentiment: 0.3,
  intensity: 0.6,
  timestamp: new Date(),
  ...overrides
});

describe('Couple Mood Blending Integration Tests', () => {
  const mockUser1Id = 'user1-123';
  const mockUser2Id = 'user2-456';
  const mockUser1Name = 'Alice';
  const mockUser2Name = 'Bob';
  
  const mockUser1Mood = createMockMood({
    emotions: { ...createMockMood().emotions, joy: 0.8, trust: 0.9 },
    sentiment: 0.5
  });
  
  const mockUser2Mood = createMockMood({
    emotions: { ...createMockMood().emotions, joy: 0.6, trust: 0.8 },
    sentiment: 0.3
  });
  
  const mockBlendedMood = createMockMood({
    emotions: { ...createMockMood().emotions, joy: 0.7, trust: 0.85 },
    sentiment: 0.4
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock responses
    (moodService.getMoodHistory as any).mockImplementation((timeRange: string) => {
      return Promise.resolve([mockUser1Mood, mockUser2Mood]);
    });
    
    (moodService.blendCoupleMoods as any).mockResolvedValue(mockBlendedMood);
  });

  describe('CoupleMoodBlending Component', () => {
    it('should render loading state initially', () => {
      render(
        <CoupleMoodBlending
          user1Id={mockUser1Id}
          user2Id={mockUser2Id}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      expect(screen.getByText('Blending Your Hearts Together')).toBeInTheDocument();
      expect(screen.getByText(/Analyzing your emotional connection/)).toBeInTheDocument();
    });

    it('should load and display couple mood data successfully', async () => {
      render(
        <CoupleMoodBlending
          user1Id={mockUser1Id}
          user2Id={mockUser2Id}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(`${mockUser1Name} 💕 ${mockUser2Name}`)).toBeInTheDocument();
      });

      expect(moodService.getMoodHistory).toHaveBeenCalledWith('week');
      expect(moodService.blendCoupleMoods).toHaveBeenCalledWith(mockUser1Mood, mockUser2Mood);
    });

    it('should display compatibility score', async () => {
      render(
        <CoupleMoodBlending
          user1Id={mockUser1Id}
          user2Id={mockUser2Id}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Your emotional compatibility score/)).toBeInTheDocument();
      });
      
      // Should show percentage
      const percentageElements = screen.getAllByText(/%/);
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    it('should switch between different tabs', async () => {
      render(
        <CoupleMoodBlending
          user1Id={mockUser1Id}
          user2Id={mockUser2Id}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(`${mockUser1Name} 💕 ${mockUser2Name}`)).toBeInTheDocument();
      });

      // Switch to activities tab
      const activitiesButton = screen.getByRole('button', { name: /activities/i });
      fireEvent.click(activitiesButton);
      
      expect(screen.getByText(/Suggested Activities for You Both/)).toBeInTheDocument();

      // Switch to metrics tab
      const metricsButton = screen.getByRole('button', { name: /metrics/i });
      fireEvent.click(metricsButton);
      
      expect(screen.getByText(/Relationship Health Score/)).toBeInTheDocument();
    });

    it('should display activity suggestions', async () => {
      render(
        <CoupleMoodBlending
          user1Id={mockUser1Id}
          user2Id={mockUser2Id}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(`${mockUser1Name} 💕 ${mockUser2Name}`)).toBeInTheDocument();
      });

      // Switch to activities tab
      const activitiesButton = screen.getByRole('button', { name: /activities/i });
      fireEvent.click(activitiesButton);
      
      expect(screen.getByText(/Perfect Playlists for Your Mood/)).toBeInTheDocument();
      expect(screen.getByText(/Conversation Starters/)).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      // Mock API failure
      (moodService.getMoodHistory as any).mockRejectedValue(new Error('API Error'));
      
      render(
        <CoupleMoodBlending
          user1Id={mockUser1Id}
          user2Id={mockUser2Id}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      // Should still render with fallback mock data
      await waitFor(() => {
        expect(screen.getByText(`${mockUser1Name} 💕 ${mockUser2Name}`)).toBeInTheDocument();
      });
    });
  });

  describe('SharedMoodVisualization Component', () => {
    it('should render mood comparison visualization', () => {
      render(
        <SharedMoodVisualization
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          blendedMood={mockBlendedMood}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      expect(screen.getByText('Emotional Harmony Radar')).toBeInTheDocument();
      expect(screen.getByText('Legend')).toBeInTheDocument();
      expect(screen.getByText(`${mockUser1Name}'s Mood`)).toBeInTheDocument();
      expect(screen.getByText(`${mockUser2Name}'s Mood`)).toBeInTheDocument();
      expect(screen.getByText('Blended Mood')).toBeInTheDocument();
    });

    it('should display mood comparison stats', () => {
      render(
        <SharedMoodVisualization
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          blendedMood={mockBlendedMood}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      expect(screen.getByText('Mood Comparison')).toBeInTheDocument();
      expect(screen.getByText('💕 Together')).toBeInTheDocument();
      
      // Should show sentiment scores
      expect(screen.getByText('+50')).toBeInTheDocument(); // User1 sentiment
      expect(screen.getByText('+30')).toBeInTheDocument(); // User2 sentiment
      expect(screen.getByText('+40')).toBeInTheDocument(); // Blended sentiment
    });

    it('should render SVG radar chart', () => {
      render(
        <SharedMoodVisualization
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          blendedMood={mockBlendedMood}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // Should have radar chart elements
      const circles = document.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThan(0);
      
      const paths = document.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe('RelationshipAnalytics Component', () => {
    const mockBondingMetrics = {
      closeness: 0.8,
      empathy: 0.7,
      trust: 0.9,
      communicationFrequency: 0.6,
      sharedActivities: 0.5
    };

    it('should render relationship health score', () => {
      render(
        <RelationshipAnalytics
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          bondingMetrics={mockBondingMetrics}
          compatibility={0.8}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      expect(screen.getByText('Relationship Health Score')).toBeInTheDocument();
      expect(screen.getByText('Thriving')).toBeInTheDocument();
    });

    it('should display bonding metrics breakdown', () => {
      render(
        <RelationshipAnalytics
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          bondingMetrics={mockBondingMetrics}
          compatibility={0.8}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      expect(screen.getByText('Bonding Metrics Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Closeness')).toBeInTheDocument();
      expect(screen.getByText('Empathy')).toBeInTheDocument();
      expect(screen.getByText('Trust')).toBeInTheDocument();
      expect(screen.getByText('Communication Frequency')).toBeInTheDocument();
      expect(screen.getByText('Shared Activities')).toBeInTheDocument();
    });

    it('should generate personalized insights', () => {
      render(
        <RelationshipAnalytics
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          bondingMetrics={mockBondingMetrics}
          compatibility={0.8}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      expect(screen.getByText('Personalized Insights')).toBeInTheDocument();
      
      // Should show insights based on high trust
      expect(screen.getByText('Exceptional Trust')).toBeInTheDocument();
    });

    it('should show emotional journey timeline', () => {
      render(
        <RelationshipAnalytics
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          bondingMetrics={mockBondingMetrics}
          compatibility={0.8}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      expect(screen.getByText('Emotional Journey Over Time')).toBeInTheDocument();
      expect(screen.getByText('Trust Peak')).toBeInTheDocument();
      expect(screen.getByText('Empathy High')).toBeInTheDocument();
      expect(screen.getByText('Connection Goal')).toBeInTheDocument();
    });
  });

  describe('Integration Flow', () => {
    it('should complete full couple mood blending workflow', async () => {
      render(
        <CoupleMoodBlending
          user1Id={mockUser1Id}
          user2Id={mockUser2Id}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      // 1. Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(`${mockUser1Name} 💕 ${mockUser2Name}`)).toBeInTheDocument();
      });
      
      // 2. Verify compatibility score is displayed
      expect(screen.getByText(/Your emotional compatibility score/)).toBeInTheDocument();
      
      // 3. Switch to activities tab
      const activitiesButton = screen.getByRole('button', { name: /activities/i });
      fireEvent.click(activitiesButton);
      
      expect(screen.getByText(/Suggested Activities for You Both/)).toBeInTheDocument();
      
      // 4. Switch to metrics tab
      const metricsButton = screen.getByRole('button', { name: /metrics/i });
      fireEvent.click(metricsButton);
      
      expect(screen.getByText(/Relationship Health Score/)).toBeInTheDocument();
      
      // 5. Verify all API calls were made
      expect(moodService.getMoodHistory).toHaveBeenCalledWith('week');
      expect(moodService.blendCoupleMoods).toHaveBeenCalledWith(mockUser1Mood, mockUser2Mood);
    });

    it('should handle mood blending calculations correctly', async () => {
      render(
        <CoupleMoodBlending
          user1Id={mockUser1Id}
          user2Id={mockUser2Id}
          user1Name={mockUser1Name}
          user2Name={mockUser2Name}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(`${mockUser1Name} 💕 ${mockUser2Name}`)).toBeInTheDocument();
      });
      
      // Verify that blended mood is calculated correctly
      expect(moodService.blendCoupleMoods).toHaveBeenCalledWith(
        expect.objectContaining({
          sentiment: 0.5,
          emotions: expect.objectContaining({
            joy: 0.8,
            trust: 0.9
          })
        }),
        expect.objectContaining({
          sentiment: 0.3,
          emotions: expect.objectContaining({
            joy: 0.6,
            trust: 0.8
          })
        })
      );
    });
  });
});