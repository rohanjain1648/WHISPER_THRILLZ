import { Message, IMessage, MessageReaction } from '../models/Message';
import { moodAnalysisService } from './moodAnalysisService';
import { contentModerationService } from './contentModerationService';
import { MoodEmbedding } from '../types/mood';
import mongoose, { type PipelineStage } from 'mongoose';

export interface CreateMessageRequest {
  content: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isAnonymous?: boolean;
  isEphemeral?: boolean;
  authorId?: string;
  expirationHours?: number;
}

export interface MessageSearchOptions {
  latitude: number;
  longitude: number;
  radiusInMeters?: number;
  limit?: number;
  includeExpired?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface MessageReactionRequest {
  messageId: string;
  userId: string;
  reactionType: 'heart' | 'hug' | 'smile' | 'tear';
}

export interface MessageDiscoveryRequest {
  messageId: string;
  userId: string;
}

export class MessageService {
  /**
   * Create a new anonymous message with mood analysis
   */
  async createMessage(request: CreateMessageRequest): Promise<IMessage> {
    try {
      // Check rate limits for message creation
      if (request.authorId && !contentModerationService.checkRateLimit(request.authorId, 'message', 10, 300000)) {
        throw new Error('Too many messages. Please wait before posting again.');
      }

      // Validate content
      if (!request.content || request.content.trim().length === 0) {
        throw new Error('Message content cannot be empty');
      }

      if (request.content.length > 1000) {
        throw new Error('Message content cannot exceed 1000 characters');
      }

      // Validate location
      if (!request.location || 
          typeof request.location.latitude !== 'number' || 
          typeof request.location.longitude !== 'number') {
        throw new Error('Valid location coordinates are required');
      }

      if (request.location.latitude < -90 || request.location.latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (request.location.longitude < -180 || request.location.longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }

      // Analyze mood of the message content
      let moodEmbedding: MoodEmbedding;
      
      if (moodAnalysisService) {
        try {
          const moodAnalysis = await moodAnalysisService.analyzeTextMood({
            text: request.content,
            userId: request.authorId,
            context: 'anonymous_message'
          });
          moodEmbedding = moodAnalysis.moodEmbedding;
        } catch (error) {
          console.warn('Failed to analyze mood for message, using neutral mood:', error);
          // Fallback to neutral mood
          moodEmbedding = this.createNeutralMood();
        }
      } else {
        // Fallback to neutral mood if service not available
        moodEmbedding = this.createNeutralMood();
      }

      // Calculate expiration date
      let expiresAt: Date | undefined;
      if (request.isEphemeral !== false) { // Default to ephemeral
        const hours = request.expirationHours || 24;
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      }

      // Create message
      const message = new Message({
        content: request.content.trim(),
        location: {
          type: 'Point',
          coordinates: [request.location.longitude, request.location.latitude]
        },
        moodEmbedding,
        authorId: request.authorId ? new mongoose.Types.ObjectId(request.authorId) : undefined,
        isAnonymous: request.isAnonymous !== false, // Default to anonymous
        isEphemeral: request.isEphemeral !== false, // Default to ephemeral
        expiresAt,
        discoveredBy: [],
        reactions: [],
        moderationStatus: 'pending' // Will be moderated before approval
      });

      const savedMessage = await message.save();
      
      // Trigger content moderation in background
      this.moderateMessageInBackground(savedMessage.id);

      return savedMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Find nearby messages within a radius
   */
  async findNearbyMessages(options: MessageSearchOptions): Promise<IMessage[]> {
    try {
      const {
        latitude,
        longitude,
        radiusInMeters = 1000,
        limit = 50,
        includeExpired = false,
        moderationStatus = 'approved'
      } = options;

      // Validate coordinates
      if (latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude');
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude');
      }

      const messages = await (Message as any).findNearby(
        longitude,
        latitude,
        radiusInMeters,
        {
          limit,
          moderationStatus,
          includeExpired
        }
      );

      return messages;
    } catch (error) {
      console.error('Error finding nearby messages:', error);
      throw error;
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessageById(messageId: string): Promise<IMessage | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error('Invalid message ID');
      }

      const message = await Message.findById(messageId)
        .populate('reactions.userId', 'profile.displayName');

      return message;
    } catch (error) {
      console.error('Error getting message by ID:', error);
      throw error;
    }
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(request: MessageReactionRequest): Promise<IMessage> {
    try {
      if (!mongoose.Types.ObjectId.isValid(request.messageId)) {
        throw new Error('Invalid message ID');
      }

      if (!mongoose.Types.ObjectId.isValid(request.userId)) {
        throw new Error('Invalid user ID');
      }

      const message = await Message.findById(request.messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Check if message is expired
      if (message.isEphemeral && message.expiresAt && message.expiresAt < new Date()) {
        throw new Error('Cannot react to expired message');
      }

      // Check if message is approved
      if (message.moderationStatus !== 'approved') {
        throw new Error('Cannot react to unapproved message');
      }

      const updatedMessage = await message.addReaction(
        new mongoose.Types.ObjectId(request.userId),
        request.reactionType
      );

      return updatedMessage;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Mark a message as discovered by a user
   */
  async markMessageDiscovered(request: MessageDiscoveryRequest): Promise<IMessage> {
    try {
      if (!mongoose.Types.ObjectId.isValid(request.messageId)) {
        throw new Error('Invalid message ID');
      }

      if (!mongoose.Types.ObjectId.isValid(request.userId)) {
        throw new Error('Invalid user ID');
      }

      const message = await Message.findById(request.messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const updatedMessage = await message.markDiscoveredBy(
        new mongoose.Types.ObjectId(request.userId)
      );

      return updatedMessage;
    } catch (error) {
      console.error('Error marking message as discovered:', error);
      throw error;
    }
  }

  /**
   * Get messages by user (for non-anonymous messages)
   */
  async getMessagesByUser(userId: string, limit: number = 50): Promise<IMessage[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const messages = await Message.find({
        authorId: new mongoose.Types.ObjectId(userId),
        isAnonymous: false
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('reactions.userId', 'profile.displayName');

      return messages;
    } catch (error) {
      console.error('Error getting messages by user:', error);
      throw error;
    }
  }

  /**
   * Get message statistics for a location
   */
  async getLocationStats(latitude: number, longitude: number, radiusInMeters: number = 1000) {
    try {
      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [longitude, latitude] as [number, number]
            },
            distanceField: 'distance',
            maxDistance: radiusInMeters,
            query: { moderationStatus: 'approved' }
          }
        },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            avgSentiment: { $avg: '$moodEmbedding.sentiment' },
            avgIntensity: { $avg: '$moodEmbedding.intensity' },
            dominantEmotions: {
              $push: {
                joy: '$moodEmbedding.emotions.joy',
                sadness: '$moodEmbedding.emotions.sadness',
                anger: '$moodEmbedding.emotions.anger',
                fear: '$moodEmbedding.emotions.fear',
                surprise: '$moodEmbedding.emotions.surprise',
                disgust: '$moodEmbedding.emotions.disgust',
                trust: '$moodEmbedding.emotions.trust',
                anticipation: '$moodEmbedding.emotions.anticipation'
              }
            },
            totalReactions: { $sum: { $size: '$reactions' } },
            totalDiscoveries: { $sum: { $size: '$discoveredBy' } }
          }
        }
      ];

      const stats = await Message.aggregate(pipeline);
      return stats[0] || {
        totalMessages: 0,
        avgSentiment: 0,
        avgIntensity: 0,
        dominantEmotions: [],
        totalReactions: 0,
        totalDiscoveries: 0
      };
    } catch (error) {
      console.error('Error getting location stats:', error);
      throw error;
    }
  }

  /**
   * Report a message for inappropriate content
   */
  async reportMessage(
    messageId: string,
    reporterId: string,
    reason: 'inappropriate' | 'spam' | 'harassment' | 'hate-speech' | 'violence' | 'other',
    description?: string
  ): Promise<void> {
    try {
      await contentModerationService.reportMessage(messageId, reporterId, reason, description);
    } catch (error) {
      console.error('Error reporting message:', error);
      throw error;
    }
  }

  /**
   * Clean up expired messages (called by scheduled job)
   */
  async cleanupExpiredMessages(): Promise<number> {
    try {
      const result = await Message.deleteMany({
        isEphemeral: true,
        expiresAt: { $lt: new Date() }
      });

      console.log(`Cleaned up ${result.deletedCount} expired messages`);
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error cleaning up expired messages:', error);
      throw error;
    }
  }

  /**
   * Create a neutral mood embedding as fallback
   */
  private createNeutralMood(): MoodEmbedding {
    return {
      emotions: {
        joy: 0.5,
        sadness: 0.1,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.1,
        disgust: 0.1,
        trust: 0.5,
        anticipation: 0.4
      },
      sentiment: 0.0,
      intensity: 0.3,
      timestamp: new Date()
    };
  }

  /**
   * Moderate message in background using AI content moderation
   */
  private async moderateMessageInBackground(messageId: string): Promise<void> {
    try {
      // Use AI-powered content moderation
      setTimeout(async () => {
        await contentModerationService.moderateMessage(messageId);
      }, 100); // Small delay to ensure message is saved
    } catch (error) {
      console.error('Error in background moderation:', error);
      // Fallback: auto-approve if moderation fails
      try {
        await Message.findByIdAndUpdate(messageId, {
          moderationStatus: 'approved'
        });
      } catch (fallbackError) {
        console.error('Error in moderation fallback:', fallbackError);
      }
    }
  }
}

// Export singleton instance
export const messageService = new MessageService();