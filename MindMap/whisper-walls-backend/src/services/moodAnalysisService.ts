import OpenAI from 'openai';
import { 
  MoodEmbedding, 
  MoodAnalysisRequest, 
  MoodAnalysisResponse, 
  VoiceAnalysisRequest,
  MoodInsights,
  EmotionClassification,
  SentimentAnalysis
} from '../types/mood';

export class MoodAnalysisService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for mood analysis');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze mood from text input using OpenAI GPT-4
   */
  async analyzeTextMood(request: MoodAnalysisRequest): Promise<MoodAnalysisResponse> {
    try {
      const prompt = this.createMoodAnalysisPrompt(request.text);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert emotion analyst. Analyze the emotional content of text and return a detailed emotional breakdown in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const analysisResult = JSON.parse(response);
      const moodEmbedding = this.createMoodEmbedding(analysisResult);
      const insights = this.generateInsights(moodEmbedding, analysisResult);

      return {
        moodEmbedding,
        insights,
        confidence: analysisResult.confidence || 0.8
      };
    } catch (error) {
      console.error('Error analyzing text mood:', error);
      throw new Error('Failed to analyze mood from text');
    }
  }

  /**
   * Analyze mood from voice input using Whisper API
   */
  async analyzeVoiceMood(request: VoiceAnalysisRequest): Promise<MoodAnalysisResponse> {
    try {
      // First, convert speech to text using Whisper
      const transcription = await this.transcribeAudio(request.audioBuffer);
      
      // Validate transcription quality
      if (transcription.length < 3) {
        throw new Error('Speech too short or unclear. Please try speaking for a few more seconds.');
      }
      
      // Then analyze the text for mood
      const textAnalysis = await this.analyzeTextMood({
        text: transcription,
        userId: request.userId,
        context: `voice_analysis: ${request.context || 'general'}`
      });

      // Add voice-specific insights
      const voiceInsights = [
        `Voice transcribed: "${transcription}"`,
        'Analysis based on speech content and emotional language patterns'
      ];
      
      // TODO: In future iterations, we can add audio tone analysis
      // This would involve analyzing pitch, pace, volume variations
      // For now, we enhance the text-based analysis with voice context
      
      return {
        ...textAnalysis,
        insights: [
          ...textAnalysis.insights,
          ...voiceInsights
        ],
        confidence: Math.min(textAnalysis.confidence * 0.95, 0.95) // Slightly lower confidence for voice
      };
    } catch (error) {
      console.error('Error analyzing voice mood:', error);
      
      if (error instanceof Error) {
        // Pass through our custom error messages
        if (error.message.includes('Speech too short') || 
            error.message.includes('No speech detected') ||
            error.message.includes('Audio format not supported') ||
            error.message.includes('temporarily unavailable')) {
          throw error;
        }
      }
      
      throw new Error('Failed to analyze mood from voice. Please try text input instead.');
    }
  }

  /**
   * Generate mood insights from mood history
   */
  async generateMoodInsights(moodHistory: MoodEmbedding[]): Promise<MoodInsights> {
    if (moodHistory.length === 0) {
      return {
        dominantEmotion: 'neutral',
        emotionalTrends: ['No mood data available'],
        recommendations: ['Start sharing your thoughts to get personalized insights'],
        moodScore: 0.5
      };
    }

    const recentMoods = moodHistory.slice(-10); // Last 10 moods
    const dominantEmotion = this.findDominantEmotion(recentMoods);
    const emotionalTrends = this.analyzeEmotionalTrends(recentMoods);
    const recommendations = this.generateRecommendations(dominantEmotion, recentMoods);
    const moodScore = this.calculateOverallMoodScore(recentMoods);

    return {
      dominantEmotion,
      emotionalTrends,
      recommendations,
      moodScore
    };
  }

  /**
   * Blend two mood embeddings for couple mode
   */
  async blendCoupleMoods(mood1: MoodEmbedding, mood2: MoodEmbedding): Promise<MoodEmbedding> {
    const blendedEmotions = {
      joy: (mood1.emotions.joy + mood2.emotions.joy) / 2,
      sadness: (mood1.emotions.sadness + mood2.emotions.sadness) / 2,
      anger: (mood1.emotions.anger + mood2.emotions.anger) / 2,
      fear: (mood1.emotions.fear + mood2.emotions.fear) / 2,
      surprise: (mood1.emotions.surprise + mood2.emotions.surprise) / 2,
      disgust: (mood1.emotions.disgust + mood2.emotions.disgust) / 2,
      trust: (mood1.emotions.trust + mood2.emotions.trust) / 2,
      anticipation: (mood1.emotions.anticipation + mood2.emotions.anticipation) / 2
    };

    return {
      emotions: blendedEmotions,
      sentiment: (mood1.sentiment + mood2.sentiment) / 2,
      intensity: (mood1.intensity + mood2.intensity) / 2,
      timestamp: new Date()
    };
  }

  /**
   * Create mood analysis prompt for OpenAI
   */
  private createMoodAnalysisPrompt(text: string): string {
    return `
Analyze the emotional content of the following text and return a JSON response with this exact structure:

{
  "emotions": {
    "joy": 0.0-1.0,
    "sadness": 0.0-1.0,
    "anger": 0.0-1.0,
    "fear": 0.0-1.0,
    "surprise": 0.0-1.0,
    "disgust": 0.0-1.0,
    "trust": 0.0-1.0,
    "anticipation": 0.0-1.0
  },
  "sentiment": -1.0 to 1.0,
  "intensity": 0.0-1.0,
  "dominantEmotion": "string",
  "confidence": 0.0-1.0,
  "emotionalKeywords": ["array", "of", "keywords"],
  "emotionalTone": "string description"
}

Text to analyze: "${text}"

Provide accurate emotional scores based on the Plutchik wheel of emotions. Sentiment should be -1 (very negative) to 1 (very positive). Intensity represents the overall emotional strength.
`;
  }

  /**
   * Convert OpenAI analysis result to MoodEmbedding
   */
  private createMoodEmbedding(analysisResult: any): MoodEmbedding {
    return {
      emotions: {
        joy: analysisResult.emotions?.joy || 0,
        sadness: analysisResult.emotions?.sadness || 0,
        anger: analysisResult.emotions?.anger || 0,
        fear: analysisResult.emotions?.fear || 0,
        surprise: analysisResult.emotions?.surprise || 0,
        disgust: analysisResult.emotions?.disgust || 0,
        trust: analysisResult.emotions?.trust || 0,
        anticipation: analysisResult.emotions?.anticipation || 0
      },
      sentiment: analysisResult.sentiment || 0,
      intensity: analysisResult.intensity || 0.5,
      timestamp: new Date()
    };
  }

  /**
   * Generate insights from mood analysis
   */
  private generateInsights(moodEmbedding: MoodEmbedding, analysisResult: any): string[] {
    const insights: string[] = [];
    
    const dominantEmotion = analysisResult.dominantEmotion || 'neutral';
    insights.push(`Your dominant emotion appears to be ${dominantEmotion}`);
    
    if (moodEmbedding.sentiment > 0.3) {
      insights.push('You seem to be in a positive emotional state');
    } else if (moodEmbedding.sentiment < -0.3) {
      insights.push('You might be experiencing some challenging emotions');
    }
    
    if (moodEmbedding.intensity > 0.7) {
      insights.push('Your emotions are quite intense right now');
    } else if (moodEmbedding.intensity < 0.3) {
      insights.push('Your emotional state seems calm and balanced');
    }

    if (analysisResult.emotionalTone) {
      insights.push(`Emotional tone: ${analysisResult.emotionalTone}`);
    }

    return insights;
  }

  /**
   * Transcribe audio using Whisper API
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Validate audio buffer
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Empty audio buffer provided');
      }
      
      if (audioBuffer.length > 25 * 1024 * 1024) { // 25MB limit
        throw new Error('Audio file too large for processing');
      }
      
      // Determine file type based on buffer header
      let mimeType = 'audio/wav';
      let fileName = 'audio.wav';
      
      // Check for WebM header
      if (audioBuffer.subarray(0, 4).toString('hex') === '1a45dfa3') {
        mimeType = 'audio/webm';
        fileName = 'audio.webm';
      }
      // Check for MP4 header
      else if (audioBuffer.subarray(4, 8).toString() === 'ftyp') {
        mimeType = 'audio/mp4';
        fileName = 'audio.mp4';
      }
      
      // Create a file-like object for the API
      const file = new File([audioBuffer], fileName, { type: mimeType });
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text'
      });

      if (!transcription || typeof transcription !== 'string' || transcription.trim().length === 0) {
        throw new Error('No speech detected in audio. Please try speaking more clearly.');
      }

      return transcription.trim();
    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error('Voice processing is temporarily unavailable. Please try again in a moment.');
        } else if (error.message.includes('invalid_request_error')) {
          throw new Error('Audio format not supported. Please try recording again.');
        } else if (error.message.includes('No speech detected')) {
          throw error; // Re-throw our custom message
        }
      }
      
      throw new Error('Failed to process voice input. Please try text input instead.');
    }
  }

  /**
   * Find the dominant emotion from mood history
   */
  private findDominantEmotion(moods: MoodEmbedding[]): string {
    const emotionSums = {
      joy: 0, sadness: 0, anger: 0, fear: 0,
      surprise: 0, disgust: 0, trust: 0, anticipation: 0
    };

    moods.forEach(mood => {
      Object.keys(emotionSums).forEach(emotion => {
        emotionSums[emotion as keyof typeof emotionSums] += 
          mood.emotions[emotion as keyof typeof mood.emotions];
      });
    });

    return Object.entries(emotionSums).reduce((a, b) => 
      emotionSums[a[0] as keyof typeof emotionSums] > emotionSums[b[0] as keyof typeof emotionSums] ? a : b
    )[0];
  }

  /**
   * Analyze emotional trends
   */
  private analyzeEmotionalTrends(moods: MoodEmbedding[]): string[] {
    const trends: string[] = [];
    
    if (moods.length < 2) {
      return ['Not enough data for trend analysis'];
    }

    const recent = moods.slice(-3);
    const older = moods.slice(-6, -3);

    if (recent.length > 0 && older.length > 0) {
      const recentAvgSentiment = recent.reduce((sum, mood) => sum + mood.sentiment, 0) / recent.length;
      const olderAvgSentiment = older.reduce((sum, mood) => sum + mood.sentiment, 0) / older.length;

      if (recentAvgSentiment > olderAvgSentiment + 0.1) {
        trends.push('Your mood has been improving recently');
      } else if (recentAvgSentiment < olderAvgSentiment - 0.1) {
        trends.push('You might be going through a challenging period');
      } else {
        trends.push('Your emotional state has been relatively stable');
      }
    }

    return trends;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(dominantEmotion: string, moods: MoodEmbedding[]): string[] {
    const recommendations: string[] = [];

    switch (dominantEmotion) {
      case 'joy':
        recommendations.push('Share your positive energy with others nearby');
        recommendations.push('Consider leaving an uplifting message for someone to find');
        break;
      case 'sadness':
        recommendations.push('Take some time for self-care and reflection');
        recommendations.push('Consider reaching out to a friend or loved one');
        break;
      case 'stress':
      case 'fear':
        recommendations.push('Try some deep breathing or meditation');
        recommendations.push('Take a walk in nature if possible');
        break;
      case 'trust':
      case 'anticipation':
        recommendations.push('This is a great time to connect with others');
        recommendations.push('Consider exploring new places or experiences');
        break;
      default:
        recommendations.push('Take a moment to check in with yourself');
        recommendations.push('Consider what would bring you joy today');
    }

    return recommendations;
  }

  /**
   * Calculate overall mood score
   */
  private calculateOverallMoodScore(moods: MoodEmbedding[]): number {
    if (moods.length === 0) return 0.5;

    const avgSentiment = moods.reduce((sum, mood) => sum + mood.sentiment, 0) / moods.length;
    const positiveEmotions = moods.reduce((sum, mood) => 
      sum + mood.emotions.joy + mood.emotions.trust + mood.emotions.anticipation, 0
    ) / (moods.length * 3);

    // Combine sentiment and positive emotions, normalize to 0-1
    return Math.max(0, Math.min(1, (avgSentiment + 1) / 2 * 0.6 + positiveEmotions * 0.4));
  }
}

// Export the service instance only if we have the API key
let moodAnalysisService: MoodAnalysisService | null = null;

try {
  moodAnalysisService = new MoodAnalysisService();
} catch (error) {
  console.warn('MoodAnalysisService not initialized:', error instanceof Error ? error.message : 'Unknown error');
}

export { moodAnalysisService };