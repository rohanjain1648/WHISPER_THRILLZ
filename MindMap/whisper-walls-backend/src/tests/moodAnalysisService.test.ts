// Set up environment variable before importing
process.env.OPENAI_API_KEY = 'test-api-key';

import { MoodAnalysisService } from '../services/moodAnalysisService';
import { MoodEmbedding, MoodAnalysisRequest } from '../types/mood';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      },
      audio: {
        transcriptions: {
          create: jest.fn()
        }
      }
    }))
  };
});

describe('MoodAnalysisService', () => {
  let moodService: MoodAnalysisService;
  let mockOpenAI: any;

  beforeEach(() => {
    // Get the mocked OpenAI constructor
    const OpenAI = require('openai').default;
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn()
        }
      },
      audio: {
        transcriptions: {
          create: jest.fn()
        }
      }
    };
    
    // Mock the constructor to return our mock instance
    OpenAI.mockImplementation(() => mockOpenAI);
    
    // Create service instance
    moodService = new MoodAnalysisService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeTextMood', () => {
    it('should analyze positive text and return appropriate mood embedding', async () => {
      // Mock OpenAI response
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
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
              dominantEmotion: 'joy',
              confidence: 0.9,
              emotionalKeywords: ['happy', 'excited', 'wonderful'],
              emotionalTone: 'very positive and enthusiastic'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const request: MoodAnalysisRequest = {
        text: 'I am so happy and excited about this wonderful day!',
        userId: 'test-user-id'
      };

      const result = await moodService.analyzeTextMood(request);

      expect(result).toBeDefined();
      expect(result.moodEmbedding.emotions.joy).toBe(0.8);
      expect(result.moodEmbedding.sentiment).toBe(0.7);
      expect(result.moodEmbedding.intensity).toBe(0.8);
      expect(result.confidence).toBe(0.9);
      expect(result.insights).toContain('Your dominant emotion appears to be joy');
      expect(result.insights).toContain('You seem to be in a positive emotional state');
    });

    it('should analyze negative text and return appropriate mood embedding', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              emotions: {
                joy: 0.1,
                sadness: 0.8,
                anger: 0.3,
                fear: 0.4,
                surprise: 0.0,
                disgust: 0.2,
                trust: 0.2,
                anticipation: 0.1
              },
              sentiment: -0.6,
              intensity: 0.7,
              dominantEmotion: 'sadness',
              confidence: 0.85,
              emotionalKeywords: ['sad', 'disappointed', 'hurt'],
              emotionalTone: 'melancholic and distressed'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const request: MoodAnalysisRequest = {
        text: 'I feel so sad and disappointed about everything that happened.',
        userId: 'test-user-id'
      };

      const result = await moodService.analyzeTextMood(request);

      expect(result.moodEmbedding.emotions.sadness).toBe(0.8);
      expect(result.moodEmbedding.sentiment).toBe(-0.6);
      expect(result.insights).toContain('Your dominant emotion appears to be sadness');
      expect(result.insights).toContain('You might be experiencing some challenging emotions');
    });

    it('should handle OpenAI API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const request: MoodAnalysisRequest = {
        text: 'Test text',
        userId: 'test-user-id'
      };

      await expect(moodService.analyzeTextMood(request)).rejects.toThrow('Failed to analyze mood from text');
    });

    it('should handle invalid JSON response from OpenAI', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const request: MoodAnalysisRequest = {
        text: 'Test text',
        userId: 'test-user-id'
      };

      await expect(moodService.analyzeTextMood(request)).rejects.toThrow('Failed to analyze mood from text');
    });
  });

  describe('analyzeVoiceMood', () => {
    it('should transcribe audio and analyze mood', async () => {
      // Mock Whisper transcription
      mockOpenAI.audio.transcriptions.create.mockResolvedValue('I am feeling great today!');

      // Mock mood analysis
      const mockMoodResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              emotions: {
                joy: 0.9,
                sadness: 0.0,
                anger: 0.0,
                fear: 0.0,
                surprise: 0.1,
                disgust: 0.0,
                trust: 0.8,
                anticipation: 0.7
              },
              sentiment: 0.8,
              intensity: 0.9,
              dominantEmotion: 'joy',
              confidence: 0.95
            })
          }
        }]
      };
      mockOpenAI.chat.completions.create.mockResolvedValue(mockMoodResponse);

      const audioBuffer = Buffer.from('fake-audio-data-that-is-long-enough');
      const result = await moodService.analyzeVoiceMood({
        audioBuffer,
        userId: 'test-user-id'
      });

      expect(result.moodEmbedding.emotions.joy).toBe(0.9);
      expect(result.insights).toContain('Voice transcribed: "I am feeling great today!"');
      expect(result.insights).toContain('Analysis based on speech content and emotional language patterns');
      expect(result.confidence).toBeLessThanOrEqual(0.95);
      expect(mockOpenAI.audio.transcriptions.create).toHaveBeenCalled();
    });

    it('should handle empty audio buffer', async () => {
      const emptyBuffer = Buffer.alloc(0);
      
      await expect(moodService.analyzeVoiceMood({
        audioBuffer: emptyBuffer,
        userId: 'test-user-id'
      })).rejects.toThrow('Empty audio buffer provided');
    });

    it('should handle audio buffer that is too large', async () => {
      const largeBuffer = Buffer.alloc(30 * 1024 * 1024); // 30MB
      
      await expect(moodService.analyzeVoiceMood({
        audioBuffer: largeBuffer,
        userId: 'test-user-id'
      })).rejects.toThrow('Audio file too large for processing');
    });

    it('should handle transcription that is too short', async () => {
      mockOpenAI.audio.transcriptions.create.mockResolvedValue('Hi');

      const audioBuffer = Buffer.from('fake-audio-data-that-is-long-enough');
      
      await expect(moodService.analyzeVoiceMood({
        audioBuffer,
        userId: 'test-user-id'
      })).rejects.toThrow('Speech too short or unclear');
    });

    it('should handle empty transcription', async () => {
      mockOpenAI.audio.transcriptions.create.mockResolvedValue('');

      const audioBuffer = Buffer.from('fake-audio-data-that-is-long-enough');
      
      await expect(moodService.analyzeVoiceMood({
        audioBuffer,
        userId: 'test-user-id'
      })).rejects.toThrow('No speech detected in audio');
    });

    it('should handle Whisper API rate limit errors', async () => {
      const rateLimitError = new Error('rate limit exceeded');
      mockOpenAI.audio.transcriptions.create.mockRejectedValue(rateLimitError);

      const audioBuffer = Buffer.from('fake-audio-data-that-is-long-enough');
      
      await expect(moodService.analyzeVoiceMood({
        audioBuffer,
        userId: 'test-user-id'
      })).rejects.toThrow('Voice processing is temporarily unavailable');
    });

    it('should handle invalid audio format errors', async () => {
      const formatError = new Error('invalid_request_error: unsupported format');
      mockOpenAI.audio.transcriptions.create.mockRejectedValue(formatError);

      const audioBuffer = Buffer.from('fake-audio-data-that-is-long-enough');
      
      await expect(moodService.analyzeVoiceMood({
        audioBuffer,
        userId: 'test-user-id'
      })).rejects.toThrow('Audio format not supported');
    });

    it('should detect WebM audio format from buffer header', async () => {
      // Create a buffer with WebM header
      const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
      const webmBuffer = Buffer.concat([webmHeader, Buffer.alloc(1000)]);
      
      mockOpenAI.audio.transcriptions.create.mockResolvedValue('Test transcription from WebM');
      
      const mockMoodResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              emotions: { joy: 0.5, sadness: 0.2, anger: 0.0, fear: 0.0, surprise: 0.1, disgust: 0.0, trust: 0.6, anticipation: 0.4 },
              sentiment: 0.3,
              intensity: 0.5,
              dominantEmotion: 'joy',
              confidence: 0.8
            })
          }
        }]
      };
      mockOpenAI.chat.completions.create.mockResolvedValue(mockMoodResponse);

      const result = await moodService.analyzeVoiceMood({
        audioBuffer: webmBuffer,
        userId: 'test-user-id'
      });

      expect(result.insights).toContain('Voice transcribed: "Test transcription from WebM"');
      
      // Verify the correct file type was used
      const createCall = mockOpenAI.audio.transcriptions.create.mock.calls[0][0];
      expect(createCall.file.type).toBe('audio/webm');
      expect(createCall.file.name).toBe('audio.webm');
    });
  });

  describe('blendCoupleMoods', () => {
    it('should correctly blend two mood embeddings', async () => {
      const mood1: MoodEmbedding = {
        emotions: {
          joy: 0.8,
          sadness: 0.2,
          anger: 0.0,
          fear: 0.1,
          surprise: 0.3,
          disgust: 0.0,
          trust: 0.9,
          anticipation: 0.7
        },
        sentiment: 0.6,
        intensity: 0.8,
        timestamp: new Date()
      };

      const mood2: MoodEmbedding = {
        emotions: {
          joy: 0.4,
          sadness: 0.6,
          anger: 0.2,
          fear: 0.3,
          surprise: 0.1,
          disgust: 0.1,
          trust: 0.5,
          anticipation: 0.3
        },
        sentiment: -0.2,
        intensity: 0.6,
        timestamp: new Date()
      };

      const blended = await moodService.blendCoupleMoods(mood1, mood2);

      expect(blended.emotions.joy).toBeCloseTo(0.6, 1);
      expect(blended.emotions.sadness).toBeCloseTo(0.4, 1);
      expect(blended.sentiment).toBeCloseTo(0.2, 1);
      expect(blended.intensity).toBeCloseTo(0.7, 1);
      expect(blended.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('generateMoodInsights', () => {
    it('should generate insights for empty mood history', async () => {
      const insights = await moodService.generateMoodInsights([]);

      expect(insights.dominantEmotion).toBe('neutral');
      expect(insights.emotionalTrends).toContain('No mood data available');
      expect(insights.recommendations).toContain('Start sharing your thoughts to get personalized insights');
      expect(insights.moodScore).toBe(0.5);
    });

    it('should generate insights for mood history with positive trend', async () => {
      const moodHistory: MoodEmbedding[] = [
        {
          emotions: { joy: 0.8, sadness: 0.1, anger: 0.0, fear: 0.0, surprise: 0.2, disgust: 0.0, trust: 0.7, anticipation: 0.6 },
          sentiment: 0.7,
          intensity: 0.8,
          timestamp: new Date()
        },
        {
          emotions: { joy: 0.9, sadness: 0.0, anger: 0.0, fear: 0.0, surprise: 0.1, disgust: 0.0, trust: 0.8, anticipation: 0.7 },
          sentiment: 0.8,
          intensity: 0.9,
          timestamp: new Date()
        }
      ];

      const insights = await moodService.generateMoodInsights(moodHistory);

      expect(insights.dominantEmotion).toBe('joy');
      expect(insights.moodScore).toBeGreaterThan(0.7);
      expect(insights.recommendations).toContain('Share your positive energy with others nearby');
    });

    it('should generate insights for mood history with negative emotions', async () => {
      const moodHistory: MoodEmbedding[] = [
        {
          emotions: { joy: 0.1, sadness: 0.8, anger: 0.2, fear: 0.3, surprise: 0.0, disgust: 0.1, trust: 0.2, anticipation: 0.1 },
          sentiment: -0.6,
          intensity: 0.7,
          timestamp: new Date()
        }
      ];

      const insights = await moodService.generateMoodInsights(moodHistory);

      expect(insights.dominantEmotion).toBe('sadness');
      expect(insights.moodScore).toBeLessThan(0.5);
      expect(insights.recommendations).toContain('Take some time for self-care and reflection');
    });
  });

  describe('Service initialization', () => {
    it('should throw error if OPENAI_API_KEY is not provided', () => {
      delete process.env.OPENAI_API_KEY;
      
      expect(() => new MoodAnalysisService()).toThrow('OPENAI_API_KEY is required for mood analysis');
    });
  });
});