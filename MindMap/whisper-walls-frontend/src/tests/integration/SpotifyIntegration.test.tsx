import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SpotifyAuth } from '../../components/spotify/SpotifyAuth';
import { PlaylistManager } from '../../components/spotify/PlaylistManager';
import { SpotifyCallback } from '../../components/spotify/SpotifyCallback';
import { spotifyService } from '../../services/spotifyService';
import type { MoodEmbedding } from '../../types';

// Mock the Spotify service
vi.mock('../../services/spotifyService', () => ({
  spotifyService: {
    isConnected: vi.fn(),
    getCurrentUser: vi.fn(),
    getAuthorizationUrl: vi.fn(),
    disconnect: vi.fn(),
    getUserPlaylists: vi.fn(),
    getMoodBasedRecommendations: vi.fn(),
    createPlaylist: vi.fn(),
    exchangeCodeForTokens: vi.fn()
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
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

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    search: '',
    pathname: '/'
  },
  writable: true
});

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn()
  },
  writable: true
});

// Create mock data
const mockSpotifyUser = {
  id: 'spotify-user-123',
  displayName: 'Test User',
  email: 'test@example.com',
  images: [{ url: 'https://example.com/avatar.jpg', height: 300, width: 300 }],
  followers: { total: 42 },
  country: 'US',
  product: 'premium',
  external_urls: { spotify: 'https://open.spotify.com/user/spotify-user-123' }
};

const mockPlaylist = {
  id: 'playlist-123',
  name: 'Test Playlist',
  description: 'A test playlist',
  images: [{ url: 'https://example.com/playlist.jpg', height: 300, width: 300 }],
  tracks: {
    total: 10,
    items: []
  },
  external_urls: { spotify: 'https://open.spotify.com/playlist/playlist-123' },
  owner: { id: 'user-123', display_name: 'Test User' },
  public: false,
  collaborative: false
};

const mockTrack = {
  id: 'track-123',
  name: 'Test Song',
  artists: [{ id: 'artist-123', name: 'Test Artist' }],
  album: {
    id: 'album-123',
    name: 'Test Album',
    images: [{ url: 'https://example.com/album.jpg', height: 300, width: 300 }]
  },
  duration_ms: 180000,
  preview_url: 'https://example.com/preview.mp3',
  external_urls: { spotify: 'https://open.spotify.com/track/track-123' },
  popularity: 75,
  explicit: false
};

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

const mockRecommendations = {
  tracks: [mockTrack],
  seedGenres: ['pop', 'indie'],
  audioFeatures: {
    acousticness: 0.3,
    danceability: 0.7,
    energy: 0.8,
    instrumentalness: 0.1,
    liveness: 0.2,
    loudness: -5.0,
    speechiness: 0.05,
    tempo: 120,
    valence: 0.8
  },
  moodContext: mockMoodEmbedding
};

describe('Spotify Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SpotifyAuth Component', () => {
    it('should render disconnected state initially', async () => {
      (spotifyService.isConnected as any).mockResolvedValue(false);
      
      render(<SpotifyAuth />);
      
      await waitFor(() => {
        expect(screen.getByText('Connect to Spotify')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Link your Spotify account/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Connect with Spotify/i })).toBeInTheDocument();
    });

    it('should render connected state when user is connected', async () => {
      (spotifyService.isConnected as any).mockResolvedValue(true);
      (spotifyService.getCurrentUser as any).mockResolvedValue(mockSpotifyUser);
      
      render(<SpotifyAuth />);
      
      await waitFor(() => {
        expect(screen.getByText('Connected to Spotify')).toBeInTheDocument();
      });
      
      expect(screen.getByText(mockSpotifyUser.displayName)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Disconnect/i })).toBeInTheDocument();
    });

    it('should handle connection process', async () => {
      (spotifyService.isConnected as any).mockResolvedValue(false);
      (spotifyService.getAuthorizationUrl as any).mockReturnValue('https://accounts.spotify.com/authorize?...');
      
      // Mock window.location.href setter
      const mockLocationHref = vi.fn();
      Object.defineProperty(window.location, 'href', {
        set: mockLocationHref
      });
      
      render(<SpotifyAuth />);
      
      await waitFor(() => {
        expect(screen.getByText('Connect to Spotify')).toBeInTheDocument();
      });
      
      const connectButton = screen.getByRole('button', { name: /Connect with Spotify/i });
      fireEvent.click(connectButton);
      
      expect(spotifyService.getAuthorizationUrl).toHaveBeenCalled();
      expect(mockLocationHref).toHaveBeenCalledWith('https://accounts.spotify.com/authorize?...');
    });

    it('should handle disconnection', async () => {
      (spotifyService.isConnected as any).mockResolvedValue(true);
      (spotifyService.getCurrentUser as any).mockResolvedValue(mockSpotifyUser);
      (spotifyService.disconnect as any).mockResolvedValue(undefined);
      
      render(<SpotifyAuth />);
      
      await waitFor(() => {
        expect(screen.getByText('Connected to Spotify')).toBeInTheDocument();
      });
      
      const disconnectButton = screen.getByRole('button', { name: /Disconnect/i });
      fireEvent.click(disconnectButton);
      
      await waitFor(() => {
        expect(spotifyService.disconnect).toHaveBeenCalled();
      });
    });

    it('should call onConnectionChange callback', async () => {
      const mockCallback = vi.fn();
      (spotifyService.isConnected as any).mockResolvedValue(true);
      (spotifyService.getCurrentUser as any).mockResolvedValue(mockSpotifyUser);
      
      render(<SpotifyAuth onConnectionChange={mockCallback} />);
      
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('PlaylistManager Component', () => {
    beforeEach(() => {
      (spotifyService.getUserPlaylists as any).mockResolvedValue({
        items: [mockPlaylist],
        total: 1,
        limit: 50,
        offset: 0
      });
    });

    it('should render loading state initially', () => {
      render(<PlaylistManager />);
      
      expect(screen.getByText('Loading your music...')).toBeInTheDocument();
    });

    it('should load and display user playlists', async () => {
      render(<PlaylistManager />);
      
      await waitFor(() => {
        expect(screen.getByText('Your Playlists')).toBeInTheDocument();
      });
      
      expect(screen.getByText(mockPlaylist.name)).toBeInTheDocument();
      expect(screen.getByText(`${mockPlaylist.tracks.total} tracks`)).toBeInTheDocument();
    });

    it('should load mood-based recommendations when mood is provided', async () => {
      (spotifyService.getMoodBasedRecommendations as any).mockResolvedValue(mockRecommendations);
      
      render(<PlaylistManager moodEmbedding={mockMoodEmbedding} />);
      
      await waitFor(() => {
        expect(screen.getByText('🎵 Recommended for Your Mood')).toBeInTheDocument();
      });
      
      expect(screen.getByText(mockTrack.name)).toBeInTheDocument();
      expect(screen.getByText(mockTrack.artists[0].name)).toBeInTheDocument();
      expect(spotifyService.getMoodBasedRecommendations).toHaveBeenCalledWith(mockMoodEmbedding, 20);
    });

    it('should display audio features for recommendations', async () => {
      (spotifyService.getMoodBasedRecommendations as any).mockResolvedValue(mockRecommendations);
      
      render(<PlaylistManager moodEmbedding={mockMoodEmbedding} />);
      
      await waitFor(() => {
        expect(screen.getByText('80%')).toBeInTheDocument(); // Energy
        expect(screen.getByText('80%')).toBeInTheDocument(); // Positivity (valence)
        expect(screen.getByText('70%')).toBeInTheDocument(); // Danceability
        expect(screen.getByText('120')).toBeInTheDocument(); // BPM (tempo)
      });
    });

    it('should handle track selection for playlist creation', async () => {
      (spotifyService.getMoodBasedRecommendations as any).mockResolvedValue(mockRecommendations);
      
      render(<PlaylistManager moodEmbedding={mockMoodEmbedding} />);
      
      await waitFor(() => {
        expect(screen.getByText(mockTrack.name)).toBeInTheDocument();
      });
      
      // Click on track to select it
      const trackElement = screen.getByText(mockTrack.name).closest('div');
      fireEvent.click(trackElement!);
      
      // Should show selection indicator
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should create playlist with selected tracks', async () => {
      (spotifyService.getMoodBasedRecommendations as any).mockResolvedValue(mockRecommendations);
      (spotifyService.createPlaylist as any).mockResolvedValue(mockPlaylist);
      
      // Mock alert
      window.alert = vi.fn();
      
      render(<PlaylistManager moodEmbedding={mockMoodEmbedding} />);
      
      await waitFor(() => {
        expect(screen.getByText(mockTrack.name)).toBeInTheDocument();
      });
      
      // Select track
      const trackElement = screen.getByText(mockTrack.name).closest('div');
      fireEvent.click(trackElement!);
      
      // Open create form
      const createButton = screen.getByRole('button', { name: /Create Playlist/i });
      fireEvent.click(createButton);
      
      // Fill in playlist name
      const nameInput = screen.getByPlaceholderText('Enter playlist name...');
      fireEvent.change(nameInput, { target: { value: 'My Test Playlist' } });
      
      // Create playlist
      const submitButton = screen.getByRole('button', { name: /Create with 1 tracks/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(spotifyService.createPlaylist).toHaveBeenCalledWith({
          name: 'My Test Playlist',
          description: 'A mood-based playlist created by Whisper Walls based on your emotional state',
          public: false,
          collaborative: false,
          trackIds: [mockTrack.id],
          moodContext: mockMoodEmbedding
        });
      });
    });

    it('should handle empty playlists state', async () => {
      (spotifyService.getUserPlaylists as any).mockResolvedValue({
        items: [],
        total: 0,
        limit: 50,
        offset: 0
      });
      
      render(<PlaylistManager />);
      
      await waitFor(() => {
        expect(screen.getByText('No playlists found')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Create your first mood-based playlist above!')).toBeInTheDocument();
    });
  });

  describe('SpotifyCallback Component', () => {
    beforeEach(() => {
      // Reset URL
      Object.defineProperty(window, 'location', {
        value: {
          search: '?code=test-code&state=test-state',
          pathname: '/auth/spotify/callback'
        },
        writable: true
      });
    });

    it('should render processing state initially', () => {
      render(<SpotifyCallback />);
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(screen.getByText('Connecting to Spotify...')).toBeInTheDocument();
    });

    it('should handle successful authorization', async () => {
      (spotifyService.exchangeCodeForTokens as any).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        scope: 'user-read-private'
      });
      
      const mockOnSuccess = vi.fn();
      
      render(<SpotifyCallback onSuccess={mockOnSuccess} />);
      
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Successfully connected to Spotify!')).toBeInTheDocument();
      expect(spotifyService.exchangeCodeForTokens).toHaveBeenCalledWith('test-code', 'test-state');
      
      // Should call onSuccess after delay
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should handle authorization errors', async () => {
      // Mock URL with error
      Object.defineProperty(window, 'location', {
        value: {
          search: '?error=access_denied&state=test-state',
          pathname: '/auth/spotify/callback'
        },
        writable: true
      });
      
      const mockOnError = vi.fn();
      
      render(<SpotifyCallback onError={mockOnError} />);
      
      await waitFor(() => {
        expect(screen.getByText('Connection Failed')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Spotify authorization error: access_denied/)).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Spotify authorization error: access_denied');
    });

    it('should handle token exchange errors', async () => {
      (spotifyService.exchangeCodeForTokens as any).mockRejectedValue(new Error('Token exchange failed'));
      
      const mockOnError = vi.fn();
      
      render(<SpotifyCallback onError={mockOnError} />);
      
      await waitFor(() => {
        expect(screen.getByText('Connection Failed')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Token exchange failed')).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Token exchange failed');
    });
  });

  describe('Integration Flow', () => {
    it('should complete full Spotify integration workflow', async () => {
      // 1. Start with disconnected state
      (spotifyService.isConnected as any).mockResolvedValue(false);
      
      const { rerender } = render(<SpotifyAuth />);
      
      await waitFor(() => {
        expect(screen.getByText('Connect to Spotify')).toBeInTheDocument();
      });
      
      // 2. Simulate successful connection
      (spotifyService.isConnected as any).mockResolvedValue(true);
      (spotifyService.getCurrentUser as any).mockResolvedValue(mockSpotifyUser);
      
      rerender(<SpotifyAuth />);
      
      await waitFor(() => {
        expect(screen.getByText('Connected to Spotify')).toBeInTheDocument();
      });
      
      // 3. Test playlist manager with connection
      (spotifyService.getUserPlaylists as any).mockResolvedValue({
        items: [mockPlaylist],
        total: 1,
        limit: 50,
        offset: 0
      });
      (spotifyService.getMoodBasedRecommendations as any).mockResolvedValue(mockRecommendations);
      
      render(<PlaylistManager moodEmbedding={mockMoodEmbedding} />);
      
      await waitFor(() => {
        expect(screen.getByText('🎵 Recommended for Your Mood')).toBeInTheDocument();
        expect(screen.getByText('Your Playlists')).toBeInTheDocument();
      });
      
      // Verify all API calls were made
      expect(spotifyService.getUserPlaylists).toHaveBeenCalled();
      expect(spotifyService.getMoodBasedRecommendations).toHaveBeenCalledWith(mockMoodEmbedding, 20);
    });
  });
});