import { api } from './api';
import type { ApiResponse } from '../types';

export interface ModerationStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  timeframe: 'day' | 'week' | 'month';
}

export interface ReportMessageRequest {
  messageId: string;
  reason: 'inappropriate' | 'spam' | 'harassment' | 'hate-speech' | 'violence' | 'other';
  description?: string;
}

class ModerationService {
  /**
   * Report a message for inappropriate content
   */
  async reportMessage(request: ReportMessageRequest): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>('/moderation/report', request);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to report message');
      }
    } catch (error) {
      console.error('Error reporting message:', error);
      throw new Error('Failed to report message');
    }
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<ModerationStats> {
    try {
      const response = await api.get<ApiResponse<ModerationStats>>(`/moderation/stats?timeframe=${timeframe}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get moderation statistics');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      throw new Error('Failed to get moderation statistics');
    }
  }

  /**
   * Get report reason display text
   */
  getReasonDisplayText(reason: ReportMessageRequest['reason']): string {
    const reasonMap = {
      inappropriate: 'Inappropriate Content',
      spam: 'Spam',
      harassment: 'Harassment',
      'hate-speech': 'Hate Speech',
      violence: 'Violence or Threats',
      other: 'Other'
    };
    return reasonMap[reason];
  }

  /**
   * Get report reason description
   */
  getReasonDescription(reason: ReportMessageRequest['reason']): string {
    const descriptions = {
      inappropriate: 'Content that is not suitable for this platform',
      spam: 'Repetitive, unwanted, or promotional content',
      harassment: 'Content that targets or bullies individuals',
      'hate-speech': 'Content that promotes hatred against groups',
      violence: 'Content that threatens or promotes violence',
      other: 'Other violations of community guidelines'
    };
    return descriptions[reason];
  }

  /**
   * Validate report reason
   */
  isValidReportReason(reason: string): reason is ReportMessageRequest['reason'] {
    const validReasons: ReportMessageRequest['reason'][] = [
      'inappropriate', 'spam', 'harassment', 'hate-speech', 'violence', 'other'
    ];
    return validReasons.includes(reason as ReportMessageRequest['reason']);
  }
}

export const moderationService = new ModerationService();