// Core types for Whisper Walls platform

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface MoodEmbedding {
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  sentiment: number; // -1 to 1
  intensity: number; // 0 to 1
  timestamp: Date;
}

export interface WhisperNote {
  id: string;
  content: string;
  location: GeoLocation;
  moodEmbedding: MoodEmbedding;
  timestamp: Date;
  isEphemeral: boolean;
  discoveredBy: string[];
  reactions: Reaction[];
}

export interface Reaction {
  userId: string;
  type: 'heart' | 'hug' | 'smile' | 'tear';
  timestamp: Date;
}

export interface User {
  _id: string;
  email: string;
  profile: {
    displayName?: string;
    age?: number;
    bio?: string;
    interests: string[];
    location?: GeoLocation;
  };
  preferences: UserPreferences;
  relationships: {
    couples: string[];
    friends: string[];
    blocked: string[];
  };
  isEmailVerified: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  age?: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface UserPreferences {
  musicGenres: string[];
  discoveryRadius: number;
  privacyLevel: 'open' | 'selective' | 'private';
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  nearbyMessages: boolean;
  moodInsights: boolean;
  playlistUpdates: boolean;
  relationshipUpdates: boolean;
  email: boolean;
  push: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  moodContext: MoodEmbedding;
  tracks: Track[];
  isShared: boolean;
  collaborators: string[];
  spotifyPlaylistId?: string;
  createdAt: Date;
}

export interface Track {
  spotifyId: string;
  name: string;
  artist: string;
  moodScore: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EmotionalTheme {
  colors: {
    joy: string;
    nostalgia: string;
    hope: string;
    stress: string;
    love: string;
  };
  animations: {
    heartbeat: string;
    fadeWhisper: string;
    bloomMatch: string;
    butterflyTransition: string;
  };
}

// Spotify Integration Types
export interface SpotifyConnection {
  isConnected: boolean;
  user?: {
    id: string;
    displayName: string;
    email: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface MoodPlaylist {
  id: string;
  name: string;
  description: string;
  moodContext: MoodEmbedding;
  spotifyPlaylistId?: string;
  tracks: Array<{
    spotifyId: string;
    name: string;
    artist: string;
    album: string;
    duration: number;
    moodScore: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}