// Core types for Whisper Walls backend

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

export interface CreateMessageRequest {
  content: string;
  location: GeoLocation;
  moodEmbedding: MoodEmbedding;
  isAnonymous?: boolean;
  isEphemeral?: boolean;
}

export interface MessageReaction {
  userId: string;
  type: 'heart' | 'hug' | 'smile' | 'tear';
  timestamp: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LocationQuery {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

export interface ErrorResponse {
  type: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
}