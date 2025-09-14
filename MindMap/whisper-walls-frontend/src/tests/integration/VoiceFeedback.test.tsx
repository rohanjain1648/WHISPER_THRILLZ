import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VoiceFeedback } from '../../components/voice/VoiceFeedback';
import { VoiceAffirmations } from '../../components/voice/VoiceAffirmations';
import { CoupleVoiceNarration } from '../../components/voice/CoupleVoiceNarration';
import { voiceService } from '../../services/voiceService';
import type { MoodEmbedding } from '../../types';

// Mock the voice service
vi.mock('../../services/voiceService', () => ({
  voiceService: {
    generateMoodNarration: vi.fn(),
    generateAffirmations: vi.fn(),
    generateCoupleNarration: vi.fn(),
    generateVoice: vi.fn(),
    getAvailableVoices: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>
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

// Mock HTML5 Audio
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  duration: 30,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

Object.defineProperty(window, 'HTMLAudioElement', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockAudio)
});

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

const mockNarration = {
  text: "Good morning, friend. I can sense that joy is your dominant emotion right now, and your positive energy is truly beautiful.",
  audioUrl: 'blob:mock-audio-url',
  audioBlob: new Blob(['mock audio data'], { type: 'audio/mpeg' }),
  duration: 30,
  emotionalTone: 'uplifting',
  keyMessages: ['Your positive energy is beautiful', 'Feeling deeply is a gift'],
  affirmations: ['You deserve happiness', 'Your joy lights up the world']
};

const mockAffirmations = [
  {
    text: "Your joy is a gift to the world. Keep shining your beautiful light.",
    audioUrl: 'blob:mock-audio-url-1',
    audioBlob: new Blob(['mock audio data 1'], { type: 'audio/mpeg' }),
    duration: 15,
    emotionalTone: 'uplifting',
    keyMessages: ['Embrace your natural radiance'],
    affirmations: ['Your joy is a gift to the world']
  },
  {
    text: "You deserve all the happiness you're feeling right now and more.",
    audioUrl: 'blob:mock-audio-url-2',
    audioBlob: new Blob(['mock audio data 2'], { type: 'audio/mpeg' }),
    duration: 18,
    emotionalTone: 'uplifting',
    keyMessages: ['You are worthy of joy'],
    affirmations: ['You deserve happiness']
  }
];

const mockCoupleNarration = {
  text: "Alice and Bob, your hearts are beautifully connected. Your emotional harmony is extraordinary, with 85% compatibility.",
  audioUrl: 'blob:mock-couple-audio-url',
  audioBlob: new Blob(['mock couple audio data'], { type: 'audio/mpeg' }),
  duration: 45,
  emotionalTone: 'romantic',
  keyMessages: ['Extraordinary emotional harmony', 'Perfect energy blend'],
  affirmations: ['You create a beautiful symphony together']
};

describe('Voice Feedback Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAudio.currentTime = 0;
    mockAudio.duration = 30;
  });

  describe('VoiceFeedback Component', () => {
    it('should render voice feedback interface', () => {
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} userName="TestUser" />);
      
      expect(screen.getByText('🎙️ AI Voice Companion')).toBeInTheDocument();
      expect(screen.getByText('Choose Your Voice Experience')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Voice Feedback/i })).toBeInTheDocument();
    });

    it('should display mood analysis correctly', () => {
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} />);
      
      // Should show dominant emotion (joy at 80%)
      expect(screen.getByText('Joy', { exact: false })).toBeInTheDocument();
      
      // Should show sentiment and intensity
      expect(screen.getByText(/positive|sentiment/i)).toBeInTheDocument();
    });

    it('should show different voice experience options', () => {
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} />);
      
      expect(screen.getByText('insights', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('affirmations', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('guidance', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('celebration', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('comfort', { exact: false })).toBeInTheDocument();
    });

    it('should handle style selection', () => {
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} />);
      
      const affirmationsButton = screen.getByText('affirmations', { exact: false }).closest('button');
      fireEvent.click(affirmationsButton!);
      
      // Should highlight selected style
      expect(affirmationsButton).toHaveClass('border-purple-500');
    });

    it('should generate voice narration successfully', async () => {
      (voiceService.generateMoodNarration as any).mockResolvedValue(mockNarration);
      
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} userName="TestUser" />);
      
      const generateButton = screen.getByRole('button', { name: /Generate Voice Feedback/i });
      fireEvent.click(generateButton);
      
      // Should show generating state
      expect(screen.getByText('Creating Your Voice Message...')).toBeInTheDocument();
      
      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
      });
      
      // Should display audio player
      expect(screen.getByText(/insights.*uplifting/i)).toBeInTheDocument();
      expect(screen.getByText('30s')).toBeInTheDocument();
    });

    it('should handle audio playback', async () => {
      (voiceService.generateMoodNarration as any).mockResolvedValue(mockNarration);
      
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} />);
      
      // Generate narration first
      const generateButton = screen.getByRole('button', { name: /Generate Voice Feedback/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
      });
      
      // Click play button
      const playButton = screen.getByRole('button', { name: /play|pause/i });
      fireEvent.click(playButton);
      
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should show transcript when toggled', async () => {
      (voiceService.generateMoodNarration as any).mockResolvedValue(mockNarration);
      
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} />);
      
      // Generate narration first
      const generateButton = screen.getByRole('button', { name: /Generate Voice Feedback/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Show Transcript')).toBeInTheDocument();
      });
      
      // Toggle transcript
      const transcriptButton = screen.getByText('Show Transcript');
      fireEvent.click(transcriptButton);
      
      expect(screen.getByText('Voice Message Transcript')).toBeInTheDocument();
      expect(screen.getByText(mockNarration.text, { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Key Messages')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      (voiceService.generateMoodNarration as any).mockRejectedValue(new Error('API Error'));
      
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate Voice Feedback/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to generate voice feedback/)).toBeInTheDocument();
      });
    });
  });

  describe('VoiceAffirmations Component', () => {
    it('should render affirmations interface', () => {
      render(<VoiceAffirmations moodEmbedding={mockMoodEmbedding} userName="TestUser" />);
      
      expect(screen.getByText('✨ Daily Affirmations')).toBeInTheDocument();
      expect(screen.getByText(/Personalized uplifting messages/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate My Affirmations/i })).toBeInTheDocument();
    });

    it('should generate multiple affirmations', async () => {
      (voiceService.generateAffirmations as any).mockResolvedValue(mockAffirmations);
      
      render(<VoiceAffirmations moodEmbedding={mockMoodEmbedding} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate My Affirmations/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(mockAffirmations[0].text, { exact: false })).toBeInTheDocument();
        expect(screen.getByText(mockAffirmations[1].text, { exact: false })).toBeInTheDocument();
      });
      
      // Should show play buttons for each affirmation
      const playButtons = screen.getAllByRole('button', { name: /play|pause/i });
      expect(playButtons.length).toBe(2);
    });

    it('should handle individual affirmation playback', async () => {
      (voiceService.generateAffirmations as any).mockResolvedValue(mockAffirmations);
      
      render(<VoiceAffirmations moodEmbedding={mockMoodEmbedding} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate My Affirmations/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        const playButtons = screen.getAllByRole('button', { name: /play|pause/i });
        expect(playButtons.length).toBe(2);
      });
      
      // Click first affirmation play button
      const playButtons = screen.getAllByRole('button', { name: /play|pause/i });
      fireEvent.click(playButtons[0]);
      
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should show mood context for affirmations', async () => {
      (voiceService.generateAffirmations as any).mockResolvedValue(mockAffirmations);
      
      render(<VoiceAffirmations moodEmbedding={mockMoodEmbedding} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate My Affirmations/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Affirmations Tailored for Your.*Joy.*Energy/)).toBeInTheDocument();
      });
      
      // Should show mood breakdown
      expect(screen.getByText('80%')).toBeInTheDocument(); // Joy percentage
      expect(screen.getByText('Dominant Emotion')).toBeInTheDocument();
    });

    it('should handle show more/less functionality', async () => {
      const manyAffirmations = [...mockAffirmations, ...mockAffirmations, ...mockAffirmations];
      (voiceService.generateAffirmations as any).mockResolvedValue(manyAffirmations);
      
      render(<VoiceAffirmations moodEmbedding={mockMoodEmbedding} />);
      
      const generateButton = screen.getByRole('button', { name: /Generate My Affirmations/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Show.*More/)).toBeInTheDocument();
      });
      
      // Click show more
      const showMoreButton = screen.getByText(/Show.*More/);
      fireEvent.click(showMoreButton);
      
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });
  });

  describe('CoupleVoiceNarration Component', () => {
    it('should render couple voice interface', () => {
      render(
        <CoupleVoiceNarration
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
          compatibility={0.85}
        />
      );
      
      expect(screen.getByText('💕 Couple Voice Insights')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument(); // Compatibility
    });

    it('should display compatibility analysis', () => {
      render(
        <CoupleVoiceNarration
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
          compatibility={0.85}
        />
      );
      
      expect(screen.getByText('Perfect Harmony')).toBeInTheDocument();
      expect(screen.getByText('Emotional compatibility')).toBeInTheDocument();
    });

    it('should generate couple narration', async () => {
      (voiceService.generateCoupleNarration as any).mockResolvedValue(mockCoupleNarration);
      
      render(
        <CoupleVoiceNarration
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
          compatibility={0.85}
        />
      );
      
      const generateButton = screen.getByRole('button', { name: /Generate Couple Insights/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
      });
      
      // Should show couple-specific content
      expect(screen.getByText(/Couple Insights.*romantic/)).toBeInTheDocument();
      expect(screen.getByText('45s')).toBeInTheDocument();
    });

    it('should show love story transcript', async () => {
      (voiceService.generateCoupleNarration as any).mockResolvedValue(mockCoupleNarration);
      
      render(
        <CoupleVoiceNarration
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
          compatibility={0.85}
        />
      );
      
      const generateButton = screen.getByRole('button', { name: /Generate Couple Insights/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Show Love Story Transcript')).toBeInTheDocument();
      });
      
      // Toggle transcript
      const transcriptButton = screen.getByText('Show Love Story Transcript');
      fireEvent.click(transcriptButton);
      
      expect(screen.getByText('Your Love Story Narration')).toBeInTheDocument();
      expect(screen.getByText('Relationship Highlights')).toBeInTheDocument();
      expect(screen.getByText('Love Affirmations')).toBeInTheDocument();
    });

    it('should handle different compatibility levels', () => {
      const { rerender } = render(
        <CoupleVoiceNarration
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
          compatibility={0.45}
        />
      );
      
      expect(screen.getByText('Growing Together')).toBeInTheDocument();
      
      rerender(
        <CoupleVoiceNarration
          user1Mood={mockUser1Mood}
          user2Mood={mockUser2Mood}
          user1Name="Alice"
          user2Name="Bob"
          compatibility={0.25}
        />
      );
      
      expect(screen.getByText('Unique Journey')).toBeInTheDocument();
    });
  });

  describe('Integration Flow', () => {
    it('should complete full voice feedback workflow', async () => {
      (voiceService.generateMoodNarration as any).mockResolvedValue(mockNarration);
      
      render(<VoiceFeedback moodEmbedding={mockMoodEmbedding} userName="TestUser" />);
      
      // 1. Select style
      const guidanceButton = screen.getByText('guidance', { exact: false }).closest('button');
      fireEvent.click(guidanceButton!);
      
      // 2. Generate narration
      const generateButton = screen.getByRole('button', { name: /Generate Voice Feedback/i });
      fireEvent.click(generateButton);
      
      // 3. Wait for completion
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
      });
      
      // 4. Play audio
      const playButton = screen.getByRole('button', { name: /play|pause/i });
      fireEvent.click(playButton);
      
      // 5. Show transcript
      const transcriptButton = screen.getByText('Show Transcript');
      fireEvent.click(transcriptButton);
      
      // 6. Verify all elements are present
      expect(screen.getByText('Voice Message Transcript')).toBeInTheDocument();
      expect(screen.getByText('Key Messages')).toBeInTheDocument();
      expect(mockAudio.play).toHaveBeenCalled();
      expect(voiceService.generateMoodNarration).toHaveBeenCalledWith(
        expect.objectContaining({
          moodEmbedding: mockMoodEmbedding,
          narrationStyle: 'guidance',
          personalizedContext: expect.objectContaining({
            userName: 'TestUser'
          })
        })
      );
    });

    it('should handle complete affirmations workflow', async () => {
      (voiceService.generateAffirmations as any).mockResolvedValue(mockAffirmations);
      
      render(<VoiceAffirmations moodEmbedding={mockMoodEmbedding} userName="TestUser" />);
      
      // 1. Generate affirmations
      const generateButton = screen.getByRole('button', { name: /Generate My Affirmations/i });
      fireEvent.click(generateButton);
      
      // 2. Wait for completion
      await waitFor(() => {
        const playButtons = screen.getAllByRole('button', { name: /play|pause/i });
        expect(playButtons.length).toBe(2);
      });
      
      // 3. Play first affirmation
      const playButtons = screen.getAllByRole('button', { name: /play|pause/i });
      fireEvent.click(playButtons[0]);
      
      // 4. Verify service calls and audio playback
      expect(voiceService.generateAffirmations).toHaveBeenCalledWith(mockMoodEmbedding, 5);
      expect(mockAudio.play).toHaveBeenCalled();
    });
  });
});