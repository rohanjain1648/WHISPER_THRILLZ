import OpenAI from 'openai';
import { Message, IMessage } from '../models/Message';
import mongoose from 'mongoose';

export interface ModerationResult {
  flagged: boolean;
  categories: {
    hate: boolean;
    'hate/threatening': boolean;
    harassment: boolean;
    'harassment/threatening': boolean;
    'self-harm': boolean;
    'self-harm/intent': boolean;
    'self-harm/instructions': boolean;
    sexual: boolean;
    'sexual/minors': boolean;
    violence: boolean;
    'violence/graphic': boolean;
  };
  categoryScores: {
    hate: number;
    'hate/threatening': number;
    harassment: number;
    'harassment/threatening': number;
    'self-harm': number;
    'self-harm/intent': number;
    'self-harm/instructions': number;
    sexual: number;
    'sexual/minors': number;
    violence: number;
    'violence/graphic': number;
  };
  reason?: string;
}

export interface UserReport {
  _id?: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reason: 'inappropriate' | 'spam' | 'harassment' | 'hate-speech' | 'violence' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface ModerationQueue {
  _id?: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  moderationResult: ModerationResult;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  assignedTo?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContentModerationService {
  private openai: OpenAI;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured - content moderation will use basic filtering');
      return;
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Moderate content using OpenAI's moderation API
   */
  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      if (!this.openai) {
        // Fallback to basic moderation if OpenAI not available
        return this.basicContentModeration(content);
      }

      const moderation = await this.openai.moderations.create({
        input: content,
      });

      const result = moderation.results[0];
      
      return {
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
        reason: result.flagged ? this.generateModerationReason(result.categories) : undefined
      };
    } catch (error) {
      console.error('Error in OpenAI moderation:', error);
      // Fallback to basic moderation on API error
      return this.basicContentModeration(content);
    }
  }

  /**
   * Moderate a message and update its status
   */
  async moderateMessage(messageId: string): Promise<IMessage | null> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const moderationResult = await this.moderateContent(message.content);
      
      if (moderationResult.flagged) {
        // Flag for human review or auto-reject based on severity
        const priority = this.calculateModerationPriority(moderationResult);
        
        if (priority === 'critical') {
          // Auto-reject critical content
          message.moderationStatus = 'rejected';
          await message.save();
          
          // Log the rejection
          console.log(`Message ${messageId} auto-rejected for: ${moderationResult.reason}`);
        } else {
          // Queue for human review
          await this.queueForHumanReview(messageId, moderationResult, priority);
          message.moderationStatus = 'pending';
          await message.save();
        }
      } else {
        // Auto-approve clean content
        message.moderationStatus = 'approved';
        await message.save();
      }

      return message;
    } catch (error) {
      console.error('Error moderating message:', error);
      throw error;
    }
  }

  /**
   * Check rate limits for user actions
   */
  checkRateLimit(userId: string, action: 'message' | 'report', limit: number = 10, windowMs: number = 60000): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(key);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize rate limit
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (userLimit.count >= limit) {
      return false; // Rate limit exceeded
    }

    userLimit.count++;
    return true;
  }

  /**
   * Report a message for inappropriate content
   */
  async reportMessage(
    messageId: string,
    reporterId: string,
    reason: UserReport['reason'],
    description?: string
  ): Promise<void> {
    try {
      // Check rate limit for reports
      if (!this.checkRateLimit(reporterId, 'report', 5, 300000)) { // 5 reports per 5 minutes
        throw new Error('Too many reports. Please wait before reporting again.');
      }

      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Create report record (would be stored in a separate collection in real implementation)
      const report: UserReport = {
        messageId: new mongoose.Types.ObjectId(messageId),
        reporterId: new mongoose.Types.ObjectId(reporterId),
        reason,
        description,
        status: 'pending',
        createdAt: new Date()
      };

      // In a real implementation, you'd save this to a UserReports collection
      console.log('User report created:', report);

      // Re-moderate the message with higher priority
      const moderationResult = await this.moderateContent(message.content);
      await this.queueForHumanReview(messageId, moderationResult, 'high');

    } catch (error) {
      console.error('Error reporting message:', error);
      throw error;
    }
  }

  /**
   * Get moderation queue for human reviewers
   */
  async getModerationQueue(
    status: ModerationQueue['status'] = 'pending',
    limit: number = 50
  ): Promise<ModerationQueue[]> {
    // In a real implementation, this would query a ModerationQueue collection
    // For now, return mock data
    return [];
  }

  /**
   * Review a message in the moderation queue
   */
  async reviewMessage(
    messageId: string,
    reviewerId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<IMessage | null> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      message.moderationStatus = decision === 'approve' ? 'approved' : 'rejected';
      await message.save();

      // Log the review decision
      console.log(`Message ${messageId} ${decision}d by reviewer ${reviewerId}: ${notes || 'No notes'}`);

      return message;
    } catch (error) {
      console.error('Error reviewing message:', error);
      throw error;
    }
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats(timeframe: 'day' | 'week' | 'month' = 'day') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const stats = await Message.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$moderationStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        timeframe
      };

      stats.forEach(stat => {
        result.total += stat.count;
        if (stat._id === 'approved') result.approved = stat.count;
        if (stat._id === 'pending') result.pending = stat.count;
        if (stat._id === 'rejected') result.rejected = stat.count;
      });

      return result;
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      throw error;
    }
  }

  /**
   * Basic content moderation fallback
   */
  private basicContentModeration(content: string): ModerationResult {
    const lowerContent = content.toLowerCase();
    
    // Basic keyword filtering
    const inappropriateKeywords = [
      'spam', 'scam', 'hate', 'kill', 'die', 'suicide',
      // Add more keywords as needed
    ];

    const flagged = inappropriateKeywords.some(keyword => lowerContent.includes(keyword));

    return {
      flagged,
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
      categoryScores: {
        hate: 0,
        'hate/threatening': 0,
        harassment: 0,
        'harassment/threatening': 0,
        'self-harm': 0,
        'self-harm/intent': 0,
        'self-harm/instructions': 0,
        sexual: 0,
        'sexual/minors': 0,
        violence: 0,
        'violence/graphic': 0
      },
      reason: flagged ? 'Content flagged by basic filter' : undefined
    };
  }

  /**
   * Generate human-readable moderation reason
   */
  private generateModerationReason(categories: ModerationResult['categories']): string {
    const flaggedCategories = Object.entries(categories)
      .filter(([_, flagged]) => flagged)
      .map(([category, _]) => category);

    if (flaggedCategories.length === 0) return 'Content flagged for review';

    return `Content flagged for: ${flaggedCategories.join(', ')}`;
  }

  /**
   * Calculate moderation priority based on flagged categories
   */
  private calculateModerationPriority(result: ModerationResult): ModerationQueue['priority'] {
    const { categories, categoryScores } = result;

    // Critical priority for severe violations
    if (categories['hate/threatening'] || categories['harassment/threatening'] || 
        categories['self-harm/intent'] || categories['violence/graphic'] ||
        categories['sexual/minors']) {
      return 'critical';
    }

    // High priority for moderate violations
    if (categories.hate || categories.harassment || categories.violence ||
        categoryScores.hate > 0.7 || categoryScores.harassment > 0.7) {
      return 'high';
    }

    // Medium priority for mild violations
    if (categories.sexual || categories['self-harm'] ||
        categoryScores.sexual > 0.5 || categoryScores.violence > 0.5) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Queue message for human review
   */
  private async queueForHumanReview(
    messageId: string,
    moderationResult: ModerationResult,
    priority: ModerationQueue['priority']
  ): Promise<void> {
    // In a real implementation, this would save to a ModerationQueue collection
    const queueItem: ModerationQueue = {
      messageId: new mongoose.Types.ObjectId(messageId),
      moderationResult,
      priority,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log(`Message ${messageId} queued for human review with priority: ${priority}`);
    console.log('Moderation result:', moderationResult);
  }

  /**
   * Clean up old rate limit entries
   */
  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, limit] of this.rateLimitMap.entries()) {
      if (now > limit.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}

// Export singleton instance
export const contentModerationService = new ContentModerationService();

// Clean up rate limits every 5 minutes
setInterval(() => {
  (contentModerationService as any).cleanupRateLimits();
}, 5 * 60 * 1000);