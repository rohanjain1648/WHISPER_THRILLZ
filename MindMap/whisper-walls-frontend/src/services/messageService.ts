import { api } from './api';
import type { ApiResponse, MoodEmbedding } from '../types';

export interface WhisperMessage {
  _id: string;
  content: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  moodEmbedding: MoodEmbedding;
  authorId?: string;
  isAnonymous: boolean;
  isEphemeral: boolean;
  expiresAt?: string;
  discoveredBy: string[];
  reactions: MessageReaction[];
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface MessageReaction {
  userId: string;
  type: 'heart' | 'hug' | 'smile' | 'tear';
  timestamp: string;
}

export interface CreateMessageRequest {
  content: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isAnonymous?: boolean;
  isEphemeral?: boolean;
  expirationHours?: number;
}

export interface NearbyMessagesRequest {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

export interface LocationStats {
  totalMessages: number;
  avgSentiment: number;
  avgIntensity: number;
  dominantEmotions: any[];
  totalReactions: number;
  totalDiscoveries: number;
}

class MessageService {
  /**
   * Create a new whisper message
   */
  async createMessage(request: CreateMessageRequest): Promise<WhisperMessage> {
    try {
      const response = await api.post<ApiResponse<WhisperMessage>>('/messages', request);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create message');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error('Failed to create message');
    }
  }

  /**
   * Find nearby messages
   */
  async findNearbyMessages(request: NearbyMessagesRequest): Promise<WhisperMessage[]> {
    try {
      const params = new URLSearchParams({
        latitude: request.latitude.toString(),
        longitude: request.longitude.toString(),
      });

      if (request.radius) {
        params.append('radius', request.radius.toString());
      }

      if (request.limit) {
        params.append('limit', request.limit.toString());
      }

      const response = await api.get<ApiResponse<WhisperMessage[]>>(`/messages/nearby?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to find nearby messages');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error finding nearby messages:', error);
      throw new Error('Failed to find nearby messages');
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessageById(messageId: string): Promise<WhisperMessage> {
    try {
      const response = await api.get<ApiResponse<WhisperMessage>>(`/messages/${messageId}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get message');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting message:', error);
      throw new Error('Failed to get message');
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, reactionType: 'heart' | 'hug' | 'smile' | 'tear'): Promise<WhisperMessage> {
    try {
      const response = await api.post<ApiResponse<WhisperMessage>>(`/messages/${messageId}/react`, {
        reactionType
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to add reaction');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  /**
   * Mark a message as discovered
   */
  async markMessageDiscovered(messageId: string): Promise<WhisperMessage> {
    try {
      const response = await api.post<ApiResponse<WhisperMessage>>(`/messages/${messageId}/discover`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to mark message as discovered');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error marking message as discovered:', error);
      throw new Error('Failed to mark message as discovered');
    }
  }

  /**
   * Get location statistics
   */
  async getLocationStats(latitude: number, longitude: number, radius?: number): Promise<LocationStats> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });

      if (radius) {
        params.append('radius', radius.toString());
      }

      const response = await api.get<ApiResponse<LocationStats>>(`/messages/location/stats?${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get location statistics');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting location stats:', error);
      throw new Error('Failed to get location statistics');
    }
  }

  /**
   * Get user's own messages (non-anonymous only)
   */
  async getUserMessages(limit?: number): Promise<WhisperMessage[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await api.get<ApiResponse<WhisperMessage[]>>(`/messages/user/mine${params}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get user messages');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting user messages:', error);
      throw new Error('Failed to get user messages');
    }
  }

  /**
   * Get reaction emoji for display
   */
  getReactionEmoji(reactionType: 'heart' | 'hug' | 'smile' | 'tear'): string {
    const emojis = {
      heart: '❤️',
      hug: '🤗',
      smile: '😊',
      tear: '😢'
    };
    return emojis[reactionType];
  }

  /**
   * Get mood color based on sentiment
   */
  getMoodColor(sentiment: number): string {
    if (sentiment > 0.3) return 'text-green-500';
    if (sentiment < -0.3) return 'text-red-500';
    return 'text-gray-500';
  }

  /**
   * Format time remaining until expiration
   */
  getTimeRemaining(expiresAt: string): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }

  /**
   * Check if message is expired
   */
  isMessageExpired(message: WhisperMessage): boolean {
    if (!message.isEphemeral || !message.expiresAt) return false;
    return new Date(message.expiresAt) < new Date();
  }

  /**
   * Get distance between two coordinates in meters
   */
  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m away`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km away`;
    }
  }
}

export const messageService = new MessageService();