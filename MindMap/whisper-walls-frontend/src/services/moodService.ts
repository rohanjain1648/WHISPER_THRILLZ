import { api } from './api';
import { MoodEmbedding, ApiResponse } from '../types';

export interface MoodAnalysisResult {
  moodEmbedding: MoodEmbedding;
  insights: string[];
  confidence: number;
}

export interface MoodInsights {
  dominantEmotion: string;
  emotionalTrends: string[];
  recommendations: string[];
  moodScore: number;
}

class MoodService {
  /**
   * Analyze mood from text input
   */
  async analyzeTextMood(text: string, context?: string): Promise<MoodAnalysisResult> {
    try {
      const response = await api.post<ApiResponse<MoodAnalysisResult>>('/mood/analyze-text', {
        text,
        context
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to analyze mood');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error analyzing text mood:', error);
      throw new Error('Failed to analyze mood from text');
    }
  }

  /**
   * Analyze mood from voice input
   */
  async analyzeVoiceMood(audioBlob: Blob, context?: string): Promise<MoodAnalysisResult> {
    try {
      // Convert blob to buffer for API
      const arrayBuffer = await audioBlob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const response = await api.post<ApiResponse<MoodAnalysisResult>>('/mood/analyze-voice', buffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Context': context || ''
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to analyze voice mood');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error analyzing voice mood:', error);
      throw new Error('Failed to analyze mood from voice');
    }
  }

  /**
   * Get mood insights for the current user
   */
  async getMoodInsights(): Promise<MoodInsights> {
    try {
      const response = await api.get<ApiResponse<MoodInsights>>('/mood/insights');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get mood insights');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting mood insights:', error);
      throw new Error('Failed to get mood insights');
    }
  }

  /**
   * Blend moods for couple mode
   */
  async blendCoupleMoods(userMood: MoodEmbedding, partnerMood: MoodEmbedding): Promise<MoodEmbedding> {
    try {
      const response = await api.post<ApiResponse<MoodEmbedding>>('/mood/blend-couple', {
        userMood,
        partnerMood
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to blend couple moods');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error blending couple moods:', error);
      throw new Error('Failed to blend couple moods');
    }
  }

  /**
   * Get mood history for the current user
   */
  async getMoodHistory(timeRange: 'week' | 'month' | 'year' = 'month'): Promise<MoodEmbedding[]> {
    try {
      const response = await api.get<ApiResponse<MoodEmbedding[]>>(`/mood/history?range=${timeRange}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get mood history');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting mood history:', error);
      throw new Error('Failed to get mood history');
    }
  }

  /**
   * Get mood patterns and analytics
   */
  async getMoodPatterns(timeRange: 'week' | 'month' | 'year' = 'month'): Promise<{
    patterns: Array<{
      type: 'peak' | 'valley' | 'trend' | 'cycle';
      emotion: string;
      description: string;
      confidence: number;
      recommendation: string;
    }>;
    trends: {
      sentiment: number;
      intensity: number;
      dominantEmotion: string;
      emotionalBalance: number;
    };
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/mood/patterns?range=${timeRange}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get mood patterns');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting mood patterns:', error);
      throw new Error('Failed to get mood patterns');
    }
  }

  /**
   * Save a mood entry
   */
  async saveMoodEntry(moodEmbedding: MoodEmbedding, context?: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>('/mood/save', {
        moodEmbedding,
        context
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to save mood entry');
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      throw new Error('Failed to save mood entry');
    }
  }

  /**
   * Get mood statistics for dashboard
   */
  async getMoodStatistics(timeRange: 'week' | 'month' | 'year' = 'month'): Promise<{
    totalEntries: number;
    avgSentiment: number;
    avgIntensity: number;
    dominantEmotion: string;
    trend: number;
    emotionBreakdown: Record<string, number>;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/mood/statistics?range=${timeRange}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get mood statistics');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting mood statistics:', error);
      throw new Error('Failed to get mood statistics');
    }
  }
}

export const moodService = new MoodService();