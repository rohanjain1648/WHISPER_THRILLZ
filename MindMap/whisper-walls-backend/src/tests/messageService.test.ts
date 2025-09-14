import { MessageService } from '../services/messageService';
import { Message } from '../models/Message';
import { moodAnalysisService } from '../services/moodAnalysisService';
import mongoose from 'mongoose';

// Mock the Message model
jest.mock('../models/Message');
jest.mock('../services/moodAnalysisService');

describe('MessageService', () => {
  let messageService: MessageService;
  let mockMessage: any;

  beforeEach(() => {
    messageService = new MessageService();
    
    // Mock Message model
    mockMessage = {
      _id: new mongoose.Types.ObjectId(),
      content: 'Test message',
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128]
      },
      moodEmbedding: {
        emotions: {
          joy: 0.8,
          sadness: 0.1,
          anger: 0.0,
          fear: 0.0,
          surprise: 0.2,
          disgust: 0.0,
          trust: 0.7,
          anticipation: 0.6
        },
        sentiment: 0.7,
        intensity: 0.8,
        timestamp: new Date()
      },
      isAnonymous: true,
      isEphemeral: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      discoveredBy: [],
      reactions: [],
      moderationStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(this),
      addReaction: jest.fn(),
      markDiscoveredBy: jest.fn()
    };

    (Message as any).mockImplementation(() => mockMessage);
    (Message.findById as jest.Mock) = jest.fn();
    (Message.findNearby as jest.Mock) = jest.fn();
    (Message.find as jest.Mock) = jest.fn();
    (Message.aggregate as jest.Mock) = jest.fn();
    (Message.deleteMany as jest.Mock) = jest.fn();
    (Message.findByIdAndUpdate as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      const mockMoodAnalysis = {
        moodEmbedding: {
          emotions: {
            joy: 0.8, sadness: 0.1, anger: 0.0, fear: 0.0,
            surprise: 0.2, disgust: 0.0, trust: 0.7, anticipation: 0.6
          },
          sentiment: 0.7,
          intensity: 0.8,
          timestamp: new Date()
        },
        insights: ['Positive mood detected'],
        confidence: 0.9
      };

      (moodAnalysisService?.analyzeTextMood as jest.Mock) = jest.fn().mockResolvedValue(mockMoodAnalysis);
      mockMessage.save.mockResolvedValue(mockMessage);

      const request = {
        content: 'This is a test message',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        isAnonymous: true,
        isEphemeral: true,
        expirationHours: 24
      };

      const result = await messageService.createMessage(request);

      expect(result).toBeDefined();
      expect(mockMessage.save).toHaveBeenCalled();
      expect(moodAnalysisService?.analyzeTextMood).toHaveBeenCalledWith({
        text: request.content,
        userId: undefined,
        context: 'anonymous_message'
      });
    });

    it('should validate message content', async () => {
      const request = {
        content: '',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      await expect(messageService.createMessage(request)).rejects.toThrow('Message content cannot be empty');
    });

    it('should validate content length', async () => {
      const request = {
        content: 'a'.repeat(1001),
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      await expect(messageService.createMessage(request)).rejects.toThrow('Message content cannot exceed 1000 characters');
    });

    it('should validate location coordinates', async () => {
      const request = {
        content: 'Test message',
        location: {
          latitude: 200, // Invalid latitude
          longitude: -74.0060
        }
      };

      await expect(messageService.createMessage(request)).rejects.toThrow('Latitude must be between -90 and 90');
    });

    it('should handle mood analysis failure gracefully', async () => {
      (moodAnalysisService?.analyzeTextMood as jest.Mock) = jest.fn().mockRejectedValue(new Error('Mood analysis failed'));
      mockMessage.save.mockResolvedValue(mockMessage);

      const request = {
        content: 'Test message',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      const result = await messageService.createMessage(request);

      expect(result).toBeDefined();
      expect(mockMessage.save).toHaveBeenCalled();
      // Should use neutral mood as fallback
    });
  });

  describe('findNearbyMessages', () => {
    it('should find nearby messages successfully', async () => {
      const mockMessages = [mockMessage];
      (Message.findNearby as jest.Mock).mockResolvedValue(mockMessages);

      const options = {
        latitude: 40.7128,
        longitude: -74.0060,
        radiusInMeters: 1000,
        limit: 50
      };

      const result = await messageService.findNearbyMessages(options);

      expect(result).toEqual(mockMessages);
      expect(Message.findNearby).toHaveBeenCalledWith(
        -74.0060, // longitude first
        40.7128,  // latitude second
        1000,
        {
          limit: 50,
          moderationStatus: 'approved',
          includeExpired: false
        }
      );
    });

    it('should validate coordinates', async () => {
      const options = {
        latitude: 200, // Invalid
        longitude: -74.0060,
        radiusInMeters: 1000
      };

      await expect(messageService.findNearbyMessages(options)).rejects.toThrow('Invalid latitude');
    });
  });

  describe('getMessageById', () => {
    it('should get message by ID successfully', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      (Message.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMessage)
      });

      const result = await messageService.getMessageById(messageId);

      expect(result).toEqual(mockMessage);
      expect(Message.findById).toHaveBeenCalledWith(messageId);
    });

    it('should validate message ID', async () => {
      const invalidId = 'invalid-id';

      await expect(messageService.getMessageById(invalidId)).rejects.toThrow('Invalid message ID');
    });

    it('should return null for non-existent message', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      (Message.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const result = await messageService.getMessageById(messageId);

      expect(result).toBeNull();
    });
  });

  describe('addReaction', () => {
    it('should add reaction successfully', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const reactionType = 'heart';

      const mockMessageWithReaction = { ...mockMessage, reactions: [{ userId, type: reactionType, timestamp: new Date() }] };
      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);
      mockMessage.addReaction.mockResolvedValue(mockMessageWithReaction);

      const result = await messageService.addReaction({
        messageId,
        userId,
        reactionType
      });

      expect(result).toEqual(mockMessageWithReaction);
      expect(Message.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessage.addReaction).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(userId),
        reactionType
      );
    });

    it('should validate message ID', async () => {
      const request = {
        messageId: 'invalid-id',
        userId: new mongoose.Types.ObjectId().toString(),
        reactionType: 'heart' as const
      };

      await expect(messageService.addReaction(request)).rejects.toThrow('Invalid message ID');
    });

    it('should handle non-existent message', async () => {
      const request = {
        messageId: new mongoose.Types.ObjectId().toString(),
        userId: new mongoose.Types.ObjectId().toString(),
        reactionType: 'heart' as const
      };

      (Message.findById as jest.Mock).mockResolvedValue(null);

      await expect(messageService.addReaction(request)).rejects.toThrow('Message not found');
    });

    it('should prevent reactions on expired messages', async () => {
      const expiredMessage = {
        ...mockMessage,
        isEphemeral: true,
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      };

      const request = {
        messageId: new mongoose.Types.ObjectId().toString(),
        userId: new mongoose.Types.ObjectId().toString(),
        reactionType: 'heart' as const
      };

      (Message.findById as jest.Mock).mockResolvedValue(expiredMessage);

      await expect(messageService.addReaction(request)).rejects.toThrow('Cannot react to expired message');
    });
  });

  describe('markMessageDiscovered', () => {
    it('should mark message as discovered successfully', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      const mockDiscoveredMessage = { ...mockMessage, discoveredBy: [userId] };
      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);
      mockMessage.markDiscoveredBy.mockResolvedValue(mockDiscoveredMessage);

      const result = await messageService.markMessageDiscovered({
        messageId,
        userId
      });

      expect(result).toEqual(mockDiscoveredMessage);
      expect(mockMessage.markDiscoveredBy).toHaveBeenCalledWith(
        new mongoose.Types.ObjectId(userId)
      );
    });
  });

  describe('getLocationStats', () => {
    it('should get location statistics successfully', async () => {
      const mockStats = {
        totalMessages: 10,
        avgSentiment: 0.5,
        avgIntensity: 0.6,
        dominantEmotions: [],
        totalReactions: 25,
        totalDiscoveries: 15
      };

      (Message.aggregate as jest.Mock).mockResolvedValue([mockStats]);

      const result = await messageService.getLocationStats(40.7128, -74.0060, 1000);

      expect(result).toEqual(mockStats);
      expect(Message.aggregate).toHaveBeenCalled();
    });

    it('should return default stats when no messages found', async () => {
      (Message.aggregate as jest.Mock).mockResolvedValue([]);

      const result = await messageService.getLocationStats(40.7128, -74.0060, 1000);

      expect(result).toEqual({
        totalMessages: 0,
        avgSentiment: 0,
        avgIntensity: 0,
        dominantEmotions: [],
        totalReactions: 0,
        totalDiscoveries: 0
      });
    });
  });

  describe('cleanupExpiredMessages', () => {
    it('should cleanup expired messages successfully', async () => {
      const mockResult = { deletedCount: 5 };
      (Message.deleteMany as jest.Mock).mockResolvedValue(mockResult);

      const result = await messageService.cleanupExpiredMessages();

      expect(result).toBe(5);
      expect(Message.deleteMany).toHaveBeenCalledWith({
        isEphemeral: true,
        expiresAt: { $lt: expect.any(Date) }
      });
    });
  });

  describe('getMessagesByUser', () => {
    it('should get user messages successfully', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMessages = [mockMessage];

      (Message.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockMessages)
          })
        })
      });

      const result = await messageService.getMessagesByUser(userId, 50);

      expect(result).toEqual(mockMessages);
      expect(Message.find).toHaveBeenCalledWith({
        authorId: new mongoose.Types.ObjectId(userId),
        isAnonymous: false
      });
    });
  });
});