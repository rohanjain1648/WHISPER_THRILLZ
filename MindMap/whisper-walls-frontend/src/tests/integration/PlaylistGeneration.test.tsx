import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PlaylistGenerator } from '../../components/spotify/PlaylistGenerator';
import { CouplePlaylistGenerator } from '../../components/spotify/CouplePlaylistGenerator';
import { playlistGenerationService } from '../../services/playlistGenerationService';
import type { MoodEmbedding } from '../../types';

// Mock the playlist generation service
vi.mock('../../services/playlistGenerationService', () => ({
  playlistGenerationService: {
    generateMoodPlaylist: vi.fn(),
    generateCouplePlaylist: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>
  },
  AnimatePresence: ({ children }: any) => children
}));

// Mock animation components
vi.mock('../../components/animations', () => ({
  DreamyInteraction: ({ children }: any) => children,
  EmotionalPulse: ({ children }: any) => children,
  SparkleEffect: () => null,
  MagicalShimmer: ({ children }: any) => children,
  ParticleSystem: () => null,
  RevealOnScroll: ({ children }: any) => children
}));

// Create mock mood data
const mockMoodEmbedding: MoodEmbedding = {
  emotions: {
    joy: 0.8,
    sadness: 0.1,
    anger: 0.05,
    fear: 0.05,
    surprise: 0.3,
    disgust: 0.02,
    trust: 0.7,
    anticipation: 0.6
  },
  sentiment: 0.6,
  intensity: 0.7,
  timestamp: new Date()
};

const mockUser1Mood: MoodEmbedding = {
  emotions: {
    joy: 0.7,
    sadness: 0.2,
    anger: 0.1,
    fear: 0.1,
    surprise: 0.3,
    disgust: 0.05,
    trust: 0.8,
    anticipation: 0.5
  },
  sentiment: 0.4,
  intensity: 0.6,
  timestamp: new Date()
};

const mockUser2Mood: MoodEmbedding = {
  emotions: {
    joy: 0.6,
    sadness: 0.3,
    anger: 0.05,
    fear: 0.15,
    surprise: 0.2,
    disgust: 0.03,
    trust: 0.7,
    anticipation: 0.4
  },
  sentiment: 0.2,
  intensity: 0.5,
  timestamp: new Date()
};

const mockGeneratedPlaylist = {
  name: 'Joyful Vibes - Test Playlist',
  description: 'A personalized playlist curated by Whisper Walls AI',
  tracks: [
    {
      id: 'track1',
      name: 'Happy Song',
      artist: 'Test Artist',
      album: 'Test Album',
      duration: 180000,
      moodScore: 0.9,
      reasonForInclusion: 'Matches your joy mood perfectly'
    },
    {
      id: 'track2',
      name: 'Upbeat Track',
      artist: 'Another Artist',
      album: 'Another Album',
      duration: 200000,
      moodScore: 0.85,
      reasonForInclusion: 'High energy track that complements your emotional state'
    }
  ],
  moodContext: mockMoodEmbedding,
  audioFeaturesSummary: {
    avgEnergy: 0.8,
    avgValence: 0.7,
    avgDanceability: 0.6,
    avgAcousticness: 0.3,
    avgTempo: 120
  },
  totalDuration: 380000,
  createdAt: new Date()
};

const mockCouplePlaylist = {
  ...mockGeneratedPlaylist,
  name: 'Alice & Bob\'s Joyful Connection - Test Playlist',
  description: 'A shared musical journey for Alice and Bob, blending your emotional energies'
};

describe('Playlist Generation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PlaylistGenerator Component', () => {
    it('should render mood analysis and generation options', () => {
      render(<PlaylistGenerator moodEmbedding={mockMoodEmbedding} />);
      
      expect(screen.getByText('AI Playlist Generator')).toBeInTheDocument();
      expect(screen.getByText('Current Mood Analysis')).toBeInTheDocument();
      expect(screen.getByText('Playlist Options')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate My Playlist/i })).toBeInTheDocument();
    });

    it('should display mood analysis correctly', () => {
      render(<PlaylistGenerator moodEmbedding={mockMoodEmbedding} />);
      
      // Should show dominant emotion (joy at 80%)
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('Joy', { exact: false })).toBeInTheDocument();
      
      // Should show sentiment (+60)
      expect(screen.getByText('+60')).toBeInTheDocument();
      expect(screen.getByText('Positive')).toBeInTheDocument();
      
      // Should show intensity (70%)
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should handle playlist generation options', () => {
      render(<PlaylistGenerator moodEmbedding={mockMoodEmbedding} />);
      
      // Test playlist length selection
      const lengthSelect = screen.getByDisplayValue('20 tracks (~1 hour)');
      fireEvent.change(lengthSelect, { target: { value: '30' } });
      expect(lengthSelect).toHaveValue('30');
      
      // Test energy preference selection
      const energySelect = screen.getByDisplayValue('Adaptive (Match Mood)');
      fireEvent.change(energySelect, { target: { value: 'high' } });
      expect(energySelect).toHaveValue('high');
    });

    it('should show advanced options when toggled', () => {
      render(<PlaylistGenerator moodEmbedding={mockMoodEmbedding} />);
      
      const advancedButton = screen.getByRole('button', { name: /Show Advanced Options/i });
      fireEvent.click(advancedButton);
      
      expect(screen.getByText('Time Context')).toBeInTheDocument();
      expect(screen.getByText('Weather Context')).toBeInTheDocument();
      expect(screen.getByText('Include Popular Tracks')).toBeInTheDocument();
    });

    it('should generate playlist successfully', async () => {
      (playlistGenerationService.generateMoodPlaylist as any).mockResolvedValue(mockGeneratedPlaylist);
      
      const mockCallback = vi.fn();
      render(<PlaylistGenerator moodEmbedding={mockMoodEmbedding} onPlaylistGenerated={mockCallback} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate My Playlist/i });
      fireEvent.click(generateButton);
      
      // Should show generating state
      expect(screen.getByText('Generating...')).toBeInTheDocument();
      
      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByText(mockGeneratedPlaylist.name)).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Should display generated playlist
      expect(screen.getByText(mockGeneratedPlaylist.description)).toBeInTheDocument();
      expect(screen.getByText('Happy Song')).toBeInTheDocument();
      expect(screen.getByText('Upbeat Track')).toBeInTheDocument();
      
      // Should call callback
      expect(mockCallback).toHaveBeenCalledWith(mockGeneratedPlaylist);
    });

    it('should show generation progress', async () => {
      (playlistGenerationService.generateMoodPlaylist as any).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockGeneratedPlaylist), 5000))
      );
      
      render(<PlaylistGenerator moodEmbedding={mockMoodEmbedding} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate My Playlist/i });
      fireEvent.click(generateButton);
      
      // Should show progress steps
      await waitFor(() => {
        expect(screen.getByText('Creating Your Perfect Playlist')).toBeInTheDocument();
      });
      
      // Should show progress bar
      const progressBar = document.querySelector('.bg-gradient-to-r.from-purple-500.to-pink-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should display playlist statistics', async () => {
      (playlistGenerationService.generateMoodPlaylist as any).mockResolvedValue(mockGeneratedPlaylist);
      
      render(<PlaylistGenerator moodEmbedding={mockMoodEmbedding} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate My Playlist/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(mockGeneratedPlaylist.name)).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Should show playlist stats
      expect(screen.getByText('2')).toBeInTheDocument(); // Track count
      expect(screen.getByText('6m')).toBeInTheDocument(); // Duration
      expect(screen.getByText('80%')).toBeInTheDocument(); // Energy
      expect(screen.getByText('70%')).toBeInTheDocument(); // Positivity
    });
  });

  describe('CouplePlaylistGenerator Component', () => {
    it('should render couple mood analysis', () => {
      render(
        <CouplePlaylistGenerator
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
        />
      );
      
      expect(screen.getByText('💕 Couple Playlist Generator')).toBeInTheDocument();
      expect(screen.getByText('Emotional Harmony Analysis')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should calculate and display compatibility score', () => {
      render(
        <CouplePlaylistGenerator
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
        />
      );
      
      // Should show compatibility percentage
      const compatibilityElements = screen.getAllByText(/%/);
      expect(compatibilityElements.length).toBeGreaterThan(0);
      
      // Should show compatibility label
      expect(screen.getByText(/Harmony|Connection|Blend/)).toBeInTheDocument();
    });

    it('should show mood comparison when toggled', () => {
      render(
        <CouplePlaylistGenerator
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
        />
      );
      
      // Should show details by default
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      
      // Test hide/show toggle
      const toggleButton = screen.getByRole('button', { name: /Hide Details/i });
      fireEvent.click(toggleButton);
      
      expect(screen.getByRole('button', { name: /Show Details/i })).toBeInTheDocument();
    });

    it('should handle couple playlist generation', async () => {
      (playlistGenerationService.generateCouplePlaylist as any).mockResolvedValue(mockCouplePlaylist);
      
      const mockCallback = vi.fn();
      render(
        <CouplePlaylistGenerator
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
          onPlaylistGenerated={mockCallback}
        />
      );
      
      const generateButton = screen.getByRole('button', { name: /Generate Our Playlist/i });
      fireEvent.click(generateButton);
      
      // Should show generating state
      expect(screen.getByText('Creating Your Connection...')).toBeInTheDocument();
      
      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByText(mockCouplePlaylist.name)).toBeInTheDocument();
      }, { timeout: 15000 });
      
      // Should display generated playlist
      expect(screen.getByText(mockCouplePlaylist.description)).toBeInTheDocument();
      
      // Should call the service with correct parameters
      expect(playlistGenerationService.generateCouplePlaylist).toHaveBeenCalledWith(
        mockUser1Mood,
        mockUser2Mood,
        'Alice',
        'Bob',
        expect.objectContaining({
          playlistLength: 25,
          energyPreference: 'adaptive'
        })
      );
      
      // Should call callback
      expect(mockCallback).toHaveBeenCalledWith(mockCouplePlaylist);
    });

    it('should show couple-specific generation progress', async () => {
      (playlistGenerationService.generateCouplePlaylist as any).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockCouplePlaylist), 6000))
      );
      
      render(
        <CouplePlaylistGenerator
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
        />
      );
      
      const generateButton = screen.getByRole('button', { name: /Generate Our Playlist/i });
      fireEvent.click(generateButton);
      
      // Should show couple-specific progress messages
      await waitFor(() => {
        expect(screen.getByText('Blending Your Hearts Through Music')).toBeInTheDocument();
      });
      
      // Should show heart particles
      expect(document.querySelector('.opacity-40')).toBeInTheDocument();
    });

    it('should display couple playlist with harmony score', async () => {
      (playlistGenerationService.generateCouplePlaylist as any).mockResolvedValue(mockCouplePlaylist);
      
      render(
        <CouplePlaylistGenerator
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
        />
      );
      
      const generateButton = screen.getByRole('button', { name: /Generate Our Playlist/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(mockCouplePlaylist.name)).toBeInTheDocument();
      }, { timeout: 15000 });
      
      // Should show harmony score in stats
      expect(screen.getByText('Harmony')).toBeInTheDocument();
      
      // Should show couple-specific track reasons
      expect(screen.getByText(/Perfect for your shared/)).toBeInTheDocument();
      
      // Should show couple-specific buttons
      expect(screen.getByRole('button', { name: /Share Together/i })).toBeInTheDocument();
    });

    it('should handle playlist preferences correctly', () => {
      render(
        <CouplePlaylistGenerator
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
        />
      );
      
      // Test playlist length selection
      const lengthSelect = screen.getByDisplayValue('25 tracks (~1.5 hours)');
      fireEvent.change(lengthSelect, { target: { value: '40' } });
      expect(lengthSelect).toHaveValue('40');
      
      // Test energy balance selection
      const energySelect = screen.getByDisplayValue('Adaptive (Blend Both)');
      fireEvent.change(energySelect, { target: { value: 'high' } });
      expect(energySelect).toHaveValue('high');
    });
  });

  describe('Integration Flow', () => {
    it('should complete full playlist generation workflow', async () => {
      (playlistGenerationService.generateMoodPlaylist as any).mockResolvedValue(mockGeneratedPlaylist);
      
      const mockCallback = vi.fn();
      render(<PlaylistGenerator moodEmbedding={mockMoodEmbedding} onPlaylistGenerated={mockCallback} />);
      
      // 1. Verify initial state
      expect(screen.getByText('AI Playlist Generator')).toBeInTheDocument();
      expect(screen.getByText('Joy', { exact: false })).toBeInTheDocument();
      
      // 2. Modify options
      const lengthSelect = screen.getByDisplayValue('20 tracks (~1 hour)');
      fireEvent.change(lengthSelect, { target: { value: '15' } });
      
      // 3. Generate playlist
      const generateButton = screen.getByRole('button', { name: /Generate My Playlist/i });
      fireEvent.click(generateButton);
      
      // 4. Wait for completion
      await waitFor(() => {
        expect(screen.getByText(mockGeneratedPlaylist.name)).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // 5. Verify service was called with correct options
      expect(playlistGenerationService.generateMoodPlaylist).toHaveBeenCalledWith(
        expect.objectContaining({
          moodEmbedding: mockMoodEmbedding,
          playlistLength: 15,
          energyPreference: 'adaptive'
        })
      );
      
      // 6. Verify callback was called
      expect(mockCallback).toHaveBeenCalledWith(mockGeneratedPlaylist);
    });

    it('should complete couple playlist generation workflow', async () => {
      (playlistGenerationService.generateCouplePlaylist as any).mockResolvedValue(mockCouplePlaylist);
      
      const mockCallback = vi.fn();
      render(
        <CouplePlaylistGenerator
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
          onPlaylistGenerated={mockCallback}
        />
      );
      
      // 1. Verify initial state with compatibility
      expect(screen.getByText('💕 Couple Playlist Generator')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      
      // 2. Generate couple playlist
      const generateButton = screen.getByRole('button', { name: /Generate Our Playlist/i });
      fireEvent.click(generateButton);
      
      // 3. Wait for completion
      await waitFor(() => {
        expect(screen.getByText(mockCouplePlaylist.name)).toBeInTheDocument();
      }, { timeout: 15000 });
      
      // 4. Verify service was called correctly
      expect(playlistGenerationService.generateCouplePlaylist).toHaveBeenCalledWith(
        mockUser1Mood,
        mockUser2Mood,
        'Alice',
        'Bob',
        expect.any(Object)
      );
      
      // 5. Verify callback was called
      expect(mockCallback).toHaveBeenCalledWith(mockCouplePlaylist);
    });
  });
});