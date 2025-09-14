import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { moodAnalysisService } from '../services/moodAnalysisService';
import { MoodAnalysisRequest, VoiceAnalysisRequest } from '../types/mood';

const router = express.Router();

/**
 * POST /api/mood/analyze-text
 * Analyze mood from text input
 */
router.post('/analyze-text', 
  authenticateToken,
  [
    body('text')
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Text must be between 1 and 2000 characters'),
    body('context')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Context must be less than 500 characters')
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { text, context } = req.body;
      const userId = req.user?.id;

      const analysisRequest: MoodAnalysisRequest = {
        text,
        userId,
        context
      };

      if (!moodAnalysisService) {
        res.status(503).json({
          success: false,
          error: 'Mood analysis service not available',
          message: 'OpenAI API key not configured'
        });
        return;
      }

      const result = await moodAnalysisService.analyzeTextMood(analysisRequest);

      res.json({
        success: true,
        data: result,
        message: 'Mood analysis completed successfully'
      });
    } catch (error) {
      console.error('Error in mood analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze mood',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/mood/analyze-voice
 * Analyze mood from voice input
 */
router.post('/analyze-voice',
  authenticateToken,
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      if (!req.body || !Buffer.isBuffer(req.body)) {
        res.status(400).json({
          success: false,
          error: 'Invalid audio data',
          message: 'Audio buffer is required'
        });
        return;
      }

      // Check audio size limits
      const audioBuffer = req.body as Buffer;
      if (audioBuffer.length > 25 * 1024 * 1024) { // 25MB
        res.status(413).json({
          success: false,
          error: 'Audio file too large',
          message: 'Audio file must be smaller than 25MB'
        });
        return;
      }

      if (audioBuffer.length < 1000) { // Very small file
        res.status(400).json({
          success: false,
          error: 'Audio file too small',
          message: 'Audio recording appears to be empty or too short'
        });
        return;
      }

      const userId = req.user?.id;
      const analysisRequest: VoiceAnalysisRequest = {
        audioBuffer,
        userId,
        context: req.headers['x-context'] as string
      };

      if (!moodAnalysisService) {
        res.status(503).json({
          success: false,
          error: 'Mood analysis service not available',
          message: 'Voice analysis is temporarily unavailable. Please try text input instead.'
        });
        return;
      }

      const result = await moodAnalysisService.analyzeVoiceMood(analysisRequest);

      res.json({
        success: true,
        data: result,
        message: 'Voice mood analysis completed successfully'
      });
    } catch (error) {
      console.error('Error in voice mood analysis:', error);
      
      let statusCode = 500;
      let errorMessage = 'Failed to analyze voice mood';
      
      if (error instanceof Error) {
        if (error.message.includes('Speech too short') || 
            error.message.includes('No speech detected')) {
          statusCode = 400;
          errorMessage = error.message;
        } else if (error.message.includes('Audio format not supported')) {
          statusCode = 415;
          errorMessage = error.message;
        } else if (error.message.includes('temporarily unavailable') ||
                   error.message.includes('rate limit')) {
          statusCode = 503;
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      res.status(statusCode).json({
        success: false,
        error: 'Voice analysis failed',
        message: errorMessage
      });
    }
  }
);

/**
 * GET /api/mood/insights
 * Get mood insights for the authenticated user
 */
router.get('/insights',
  authenticateToken,
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      // TODO: Fetch user's mood history from database
      // For now, we'll return a placeholder response
      const mockMoodHistory: any[] = []; // This should come from the database
      
      if (!moodAnalysisService) {
        return res.status(503).json({
          success: false,
          error: 'Mood analysis service not available',
          message: 'OpenAI API key not configured'
        });
      }

      const insights = await moodAnalysisService.generateMoodInsights(mockMoodHistory);

      res.json({
        success: true,
        data: insights,
        message: 'Mood insights generated successfully'
      });
    } catch (error) {
      console.error('Error generating mood insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate mood insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/mood/blend-couple
 * Blend moods for couple mode
 */
router.post('/blend-couple',
  authenticateToken,
  [
    body('partnerMood')
      .isObject()
      .withMessage('Partner mood data is required'),
    body('userMood')
      .isObject()
      .withMessage('User mood data is required')
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { userMood, partnerMood } = req.body;

      if (!moodAnalysisService) {
        res.status(503).json({
          success: false,
          error: 'Mood analysis service not available',
          message: 'OpenAI API key not configured'
        });
        return;
      }

      const blendedMood = await moodAnalysisService.blendCoupleMoods(userMood, partnerMood);

      res.json({
        success: true,
        data: blendedMood,
        message: 'Couple moods blended successfully'
      });
    } catch (error) {
      console.error('Error blending couple moods:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to blend couple moods',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;