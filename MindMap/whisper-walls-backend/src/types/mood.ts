// Mood analysis types for backend

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

export interface MoodAnalysisRequest {
  text: string;
  userId?: string;
  context?: string;
}

export interface MoodAnalysisResponse {
  moodEmbedding: MoodEmbedding;
  insights: string[];
  confidence: number;
}

export interface VoiceAnalysisRequest {
  audioBuffer: Buffer;
  userId?: string;
  context?: string;
}

export interface MoodInsights {
  dominantEmotion: string;
  emotionalTrends: string[];
  recommendations: string[];
  moodScore: number;
}

export interface EmotionClassification {
  emotion: string;
  confidence: number;
  intensity: number;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number;
}