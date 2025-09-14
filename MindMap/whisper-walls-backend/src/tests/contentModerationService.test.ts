// Set up environment variable before importing
process.env.OPENAI_API_KEY = 'test-api-key';

import { ContentModerationService } from '../services/contentModerationService';
import { Message } from '../models/Message';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      moderations: {
        create: jest.fn()
      }
    }))
  };
});

// Mock Message model
jest.mock('../models/Message');

describe('ContentModerationService', () => {
  let moderationService: ContentModerationService;
  let mockOpenAI: any;

  beforeEach(() => {
    // Get the mocked OpenAI constructor
    const OpenAI = require('openai').default;
    mockOpenAI = {
      moderations: {
        create: jest.fn()
      }
    };
    
    // Mock the constructor to return our mock instance
    OpenAI.mockImplementation(() => mockOpenAI);
    
    // Create service instance
    moderationService = new ContentModerationService();

    // Mock Message methods
    (Message.findById as jest.Mock) = jest.fn();
    (Message.aggregate as jest.Mock) = jest.fn();
    (Message.findByIdAndUpdate as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('moderateContent', () => {
    it('should moderate clean content successfully', async () => {
      const mockModerationResponse = {
        results: [{
          flagged: false,
          categories: {
            hate: false,
            'hate/threatening': false,
            harassment: false,
            'harassment/threatening': false,
            'self-harm': false,
            'self-harm/intent': false,
            'self-harm/instructions': false,
            sexual: false,
            'sexual/minors': false,
            violence: false,
            'violence/graphic': false
          },
          category_scores: {
            hate: 0.01,
            'hate/threatening': 0.001,
            harassment: 0.02,
            'harassment/threatening': 0.001,
            'self-harm': 0.001,
            'self-harm/intent': 0.001,
            'self-harm/instructions': 0.001,
            sexual: 0.01,
            'sexual/minors': 0.001,
            violence: 0.01,
            'violence/graphic': 0.001
          }
        }]
      };

      mockOpenAI.moderations.create.mockResolvedValue(mockModerationResponse);

      const result = await moderationService.moderateContent('This is a nice, positive message!');

      expect(result.flagged).toBe(false);
      expect(result.reason).toBeUndefined();
      expect(mockOpenAI.moderations.create).toHaveBeenCalledWith({
        input: 'This is a nice, positive message!'
      });
    });

    it('should flag inappropriate content', async () => {
      const mockModerationResponse = {
        results: [{
          flagged: true,
          categories: {
            hate: true,
            'hate/threatening': false,
            harassment: false,
            'harassment/threatening': false,
            'self-harm': false,
            'self-harm/intent': false,
            'self-harm/instructions': false,
            sexual: false,
            'sexual/minors': false,
            violence: false,
            'violence/graphic': false
          },
          category_scores: {
            hate: 0.95,
            'hate/threatening': 0.1,
            harassment: 0.3,
            'harassment/threatening': 0.05,
            'self-harm': 0.01,
            'self-harm/intent': 0.01,
            'self-harm/instructions': 0.01,
            sexual: 0.02,
            'sexual/minors': 0.001,
            violence: 0.1,
            'violence/graphic': 0.05
          }
        }]
      };

      mockOpenAI.moderations.create.mockResolvedValue(mockModerationResponse);

      const result = await moderationService.moderateContent('Hate speech content');

      expect(result.flagged).toBe(true);
      expect(result.reason).toContain('hate');
      expect(result.categories.hate).toBe(true);
    });

    it('should fallback to basic moderation when OpenAI fails', async () => {
      mockOpenAI.moderations.create.mockRejectedValue(new Error('API Error'));

      const result = await moderationService.moderateContent('This is a test message');

      expect(result).toBeDefined();
      expect(result.flagged).toBe(false);
      // Should use basic moderation as fallback
    });

    it('should use basic moderation when OpenAI is not configured', async () => {
      // Create service without OpenAI
      const serviceWithoutOpenAI = new (ContentModerationService as any)();
      serviceWithoutOpenAI.openai = null;

      const result = await serviceWithoutOpenAI.moderateContent('spam message');

      expect(result).toBeDefined();
      expect(result.flagged).toBe(true); // Should be flagged by basic filter
    });
  });

  describe('moderateMessage', () => {
    it('should moderate and approve clean message', async () => {
      const mockMessage = {
        _id: 'message-id',
        content: 'This is a nice message',
        moderationStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);

      const mockModerationResponse = {
        results: [{
          flagged: false,
          categories: {
            hate: false,
            'hate/threatening': false,
            harassment: false,
            'harassment/threatening': false,
            'self-harm': false,
            'self-harm/intent': false,
            'self-harm/instructions': false,
            sexual: false,
            'sexual/minors': false,
            violence: false,
            'violence/graphic': false
          },
          category_scores: {
            hate: 0.01,
            'hate/threatening': 0.001,
            harassment: 0.02,
            'harassment/threatening': 0.001,
            'self-harm': 0.001,
            'self-harm/intent': 0.001,
            'self-harm/instructions': 0.001,
            sexual: 0.01,
            'sexual/minors': 0.001,
            violence: 0.01,
            'violence/graphic': 0.001
          }
        }]
      };

      mockOpenAI.moderations.create.mockResolvedValue(mockModerationResponse);

      const result = await moderationService.moderateMessage('message-id');

      expect(result).toBeDefined();
      expect(mockMessage.moderationStatus).toBe('approved');
      expect(mockMessage.save).toHaveBeenCalled();
    });

    it('should auto-reject critical content', async () => {
      const mockMessage = {
        _id: 'message-id',
        content: 'Critical violation content',
        moderationStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);

      const mockModerationResponse = {
        results: [{
          flagged: true,
          categories: {
            hate: false,
            'hate/threatening': true, // Critical violation
            harassment: false,
            'harassment/threatening': false,
            'self-harm': false,
            'self-harm/intent': false,
            'self-harm/instructions': false,
            sexual: false,
            'sexual/minors': false,
            violence: false,
            'violence/graphic': false
          },
          category_scores: {
            hate: 0.3,
            'hate/threatening': 0.95,
            harassment: 0.2,
            'harassment/threatening': 0.1,
            'self-harm': 0.01,
            'self-harm/intent': 0.01,
            'self-harm/instructions': 0.01,
            sexual: 0.02,
            'sexual/minors': 0.001,
            violence: 0.1,
            'violence/graphic': 0.05
          }
        }]
      };

      mockOpenAI.moderations.create.mockResolvedValue(mockModerationResponse);

      const result = await moderationService.moderateMessage('message-id');

      expect(result).toBeDefined();
      expect(mockMessage.moderationStatus).toBe('rejected');
      expect(mockMessage.save).toHaveBeenCalled();
    });

    it('should handle non-existent message', async () => {
      (Message.findById as jest.Mock).mockResolvedValue(null);

      await expect(moderationService.moderateMessage('non-existent-id'))
        .rejects.toThrow('Message not found');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow actions within rate limit', () => {
      const result = moderationService.checkRateLimit('user-1', 'message', 10, 60000);
      expect(result).toBe(true);
    });

    it('should block actions exceeding rate limit', () => {
      const userId = 'user-2';
      
      // Exhaust rate limit
      for (let i = 0; i < 10; i++) {
        moderationService.checkRateLimit(userId, 'message', 10, 60000);
      }
      
      // This should be blocked
      const result = moderationService.checkRateLimit(userId, 'message', 10, 60000);
      expect(result).toBe(false);
    });

    it('should reset rate limit after time window', () => {
      const userId = 'user-3';
      
      // Mock time to test window reset
      const originalNow = Date.now;
      let mockTime = 1000000;
      Date.now = jest.fn(() => mockTime);
      
      // Exhaust rate limit
      for (let i = 0; i < 10; i++) {
        moderationService.checkRateLimit(userId, 'message', 10, 60000);
      }
      
      // Should be blocked
      expect(moderationService.checkRateLimit(userId, 'message', 10, 60000)).toBe(false);
      
      // Advance time past window
      mockTime += 61000;
      
      // Should be allowed again
      expect(moderationService.checkRateLimit(userId, 'message', 10, 60000)).toBe(true);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('reportMessage', () => {
    it('should create a report successfully', async () => {
      const mockMessage = {
        _id: 'message-id',
        content: 'Test message'
      };

      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);

      const mockModerationResponse = {
        results: [{
          flagged: false,
          categories: {},
          category_scores: {}
        }]
      };

      mockOpenAI.moderations.create.mockResolvedValue(mockModerationResponse);

      await expect(moderationService.reportMessage(
        'message-id',
        'reporter-id',
        'inappropriate',
        'Test description'
      )).resolves.not.toThrow();
    });

    it('should enforce rate limits on reports', async () => {
      const reporterId = 'reporter-1';
      
      // Exhaust report rate limit (5 reports per 5 minutes)
      for (let i = 0; i < 5; i++) {
        await moderationService.reportMessage('message-id', reporterId, 'spam');
      }
      
      // This should be blocked
      await expect(moderationService.reportMessage('message-id', reporterId, 'spam'))
        .rejects.toThrow('Too many reports');
    });
  });

  describe('getModerationStats', () => {
    it('should return moderation statistics', async () => {
      const mockStats = [
        { _id: 'approved', count: 100 },
        { _id: 'pending', count: 10 },
        { _id: 'rejected', count: 5 }
      ];

      (Message.aggregate as jest.Mock).mockResolvedValue(mockStats);

      const result = await moderationService.getModerationStats('day');

      expect(result).toEqual({
        total: 115,
        approved: 100,
        pending: 10,
        rejected: 5,
        timeframe: 'day'
      });
    });

    it('should handle empty statistics', async () => {
      (Message.aggregate as jest.Mock).mockResolvedValue([]);

      const result = await moderationService.getModerationStats('week');

      expect(result).toEqual({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        timeframe: 'week'
      });
    });
  });

  describe('reviewMessage', () => {
    it('should approve message successfully', async () => {
      const mockMessage = {
        _id: 'message-id',
        moderationStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);

      const result = await moderationService.reviewMessage(
        'message-id',
        'reviewer-id',
        'approve',
        'Looks good'
      );

      expect(result).toBeDefined();
      expect(mockMessage.moderationStatus).toBe('approved');
      expect(mockMessage.save).toHaveBeenCalled();
    });

    it('should reject message successfully', async () => {
      const mockMessage = {
        _id: 'message-id',
        moderationStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);

      const result = await moderationService.reviewMessage(
        'message-id',
        'reviewer-id',
        'reject',
        'Inappropriate content'
      );

      expect(result).toBeDefined();
      expect(mockMessage.moderationStatus).toBe('rejected');
      expect(mockMessage.save).toHaveBeenCalled();
    });
  });
});