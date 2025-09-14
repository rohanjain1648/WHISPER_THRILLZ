import { api } from './api';
import type { ApiResponse, MoodEmbedding } from '../types';

export interface SpotifyAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  displayName: string;
  email: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  followers: {
    total: number;
  };
  country: string;
  product: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  popularity: number;
  explicit: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
  external_urls: {
    spotify: string;
  };
  owner: {
    id: string;
    display_name: string;
  };
  public: boolean;
  collaborative: boolean;
}

export interface MoodBasedRecommendations {
  tracks: SpotifyTrack[];
  seedGenres: string[];
  audioFeatures: {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    liveness: number;
    loudness: number;
    speechiness: number;
    tempo: number;
    valence: number;
  };
  moodContext: MoodEmbedding;
}

export interface PlaylistCreationRequest {
  name: string;
  description: string;
  public: boolean;
  collaborative: boolean;
  trackIds: string[];
  moodContext?: MoodEmbedding;
}

class SpotifyService {
  private readonly SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  private readonly SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/auth/spotify/callback`;
  private readonly SPOTIFY_SCOPES = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-top-read',
    'user-read-recently-played',
    'user-library-read'
  ].join(' ');

  /**
   * Generate Spotify authorization URL
   */
  getAuthorizationUrl(): string {
    const state = this.generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.SPOTIFY_CLIENT_ID,
      scope: this.SPOTIFY_SCOPES,
      redirect_uri: this.SPOTIFY_REDIRECT_URI,
      state: state,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(code: string, state: string): Promise<SpotifyAuthTokens> {
    try {
      const storedState = localStorage.getItem('spotify_auth_state');
      if (state !== storedState) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      const response = await api.post<ApiResponse<SpotifyAuthTokens>>('/spotify/auth/token', {
        code,
        redirectUri: this.SPOTIFY_REDIRECT_URI
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to exchange code for tokens');
      }

      // Store tokens securely
      this.storeTokens(response.data.data);
      localStorage.removeItem('spotify_auth_state');

      return response.data.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  /**
   * Get current user's Spotify profile
   */
  async getCurrentUser(): Promise<SpotifyUser> {
    try {
      const response = await api.get<ApiResponse<SpotifyUser>>('/spotify/me');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get user profile');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Failed to get Spotify user profile');
    }
  }

  /**
   * Check if user is connected to Spotify
   */
  async isConnected(): Promise<boolean> {
    try {
      const response = await api.get<ApiResponse<{ connected: boolean }>>('/spotify/status');
      return response.data.success && response.data.data?.connected === true;
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
      return false;
    }
  }

  /**
   * Disconnect from Spotify
   */
  async disconnect(): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>('/spotify/disconnect');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to disconnect from Spotify');
      }

      this.clearStoredTokens();
    } catch (error) {
      console.error('Error disconnecting from Spotify:', error);
      throw new Error('Failed to disconnect from Spotify');
    }
  }

  /**
   * Get mood-based music recommendations
   */
  async getMoodBasedRecommendations(
    moodEmbedding: MoodEmbedding,
    limit: number = 20
  ): Promise<MoodBasedRecommendations> {
    try {
      const response = await api.post<ApiResponse<MoodBasedRecommendations>>('/spotify/recommendations', {
        moodEmbedding,
        limit
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get recommendations');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting mood-based recommendations:', error);
      throw new Error('Failed to get music recommendations');
    }
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(request: PlaylistCreationRequest): Promise<SpotifyPlaylist> {
    try {
      const response = await api.post<ApiResponse<SpotifyPlaylist>>('/spotify/playlists', request);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create playlist');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw new Error('Failed to create Spotify playlist');
    }
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(limit: number = 50, offset: number = 0): Promise<{
    items: SpotifyPlaylist[];
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/spotify/playlists?limit=${limit}&offset=${offset}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get playlists');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting user playlists:', error);
      throw new Error('Failed to get user playlists');
    }
  }

  /**
   * Add tracks to a playlist
   */
  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>(`/spotify/playlists/${playlistId}/tracks`, {
        trackIds
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to add tracks to playlist');
      }
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
      throw new Error('Failed to add tracks to playlist');
    }
  }

  /**
   * Remove tracks from a playlist
   */
  async removeTracksFromPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/spotify/playlists/${playlistId}/tracks`, {
        data: { trackIds }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to remove tracks from playlist');
      }
    } catch (error) {
      console.error('Error removing tracks from playlist:', error);
      throw new Error('Failed to remove tracks from playlist');
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit: number = 20): Promise<{
    tracks: SpotifyTrack[];
    total: number;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to search tracks');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error searching tracks:', error);
      throw new Error('Failed to search for tracks');
    }
  }

  /**
   * Get audio features for tracks
   */
  async getAudioFeatures(trackIds: string[]): Promise<Array<{
    id: string;
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    liveness: number;
    loudness: number;
    speechiness: number;
    tempo: number;
    valence: number;
  }>> {
    try {
      const response = await api.post<ApiResponse<any>>('/spotify/audio-features', {
        trackIds
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get audio features');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting audio features:', error);
      throw new Error('Failed to get audio features');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<SpotifyAuthTokens> {
    try {
      const response = await api.post<ApiResponse<SpotifyAuthTokens>>('/spotify/auth/refresh');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to refresh token');
      }

      this.storeTokens(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh Spotify access token');
    }
  }

  /**
   * Generate random string for state parameter
   */
  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return text;
  }

  /**
   * Store tokens securely (in production, use more secure storage)
   */
  private storeTokens(tokens: SpotifyAuthTokens): void {
    // In production, consider using secure HTTP-only cookies or encrypted storage
    localStorage.setItem('spotify_access_token', tokens.accessToken);
    localStorage.setItem('spotify_refresh_token', tokens.refreshToken);
    localStorage.setItem('spotify_token_expires_at', (Date.now() + tokens.expiresIn * 1000).toString());
  }

  /**
   * Clear stored tokens
   */
  private clearStoredTokens(): void {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires_at');
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('spotify_token_expires_at');
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }

  /**
   * Get stored access token
   */
  getStoredAccessToken(): string | null {
    if (this.isTokenExpired()) {
      return null;
    }
    return localStorage.getItem('spotify_access_token');
  }
}

export const spotifyService = new SpotifyService();