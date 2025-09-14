import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { messageService } from '../services/messageService';

const router = express.Router();

/**
 * POST /api/messages
 * Create a new anonymous message
 */
router.post('/',
  authenticateToken,
  [
    body('content')
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message content must be between 1 and 1000 characters'),
    body('location.latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('location.longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('isAnonymous')
      .optional()
      .isBoolean()
      .withMessage('isAnonymous must be a boolean'),
    body('isEphemeral')
      .optional()
      .isBoolean()
      .withMessage('isEphemeral must be a boolean'),
    body('expirationHours')
      .optional()
      .isInt({ min: 1, max: 168 }) // Max 1 week
      .withMessage('Expiration hours must be between 1 and 168 (1 week)')
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

      const { content, location, isAnonymous, isEphemeral, expirationHours } = req.body;
      const userId = req.user?.id;

      const message = await messageService.createMessage({
        content,
        location,
        isAnonymous,
        isEphemeral,
        expirationHours,
        authorId: isAnonymous === false ? userId : undefined
      });

      res.status(201).json({
        success: true,
        data: message,
        message: 'Message created successfully'
      });
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create message',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/messages/nearby
 * Find nearby messages within a radius
 */
router.get('/nearby',
  authenticateToken,
  [
    query('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    query('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    query('radius')
      .optional()
      .isInt({ min: 10, max: 10000 })
      .withMessage('Radius must be between 10 and 10000 meters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
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

      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radiusInMeters = parseInt(req.query.radius as string) || 1000;
      const limit = parseInt(req.query.limit as string) || 50;

      const messages = await messageService.findNearbyMessages({
        latitude,
        longitude,
        radiusInMeters,
        limit,
        moderationStatus: 'approved'
      });

      res.json({
        success: true,
        data: messages,
        message: `Found ${messages.length} nearby messages`
      });
    } catch (error) {
      console.error('Error finding nearby messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to find nearby messages',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/messages/:messageId
 * Get a specific message by ID
 */
router.get('/:messageId',
  authenticateToken,
  [
    param('messageId')
      .isMongoId()
      .withMessage('Invalid message ID')
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

      const { messageId } = req.params;
      const message = await messageService.getMessageById(messageId);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        });
        return;
      }

      // Check if message is expired
      if (message.isEphemeral && message.expiresAt && message.expiresAt < new Date()) {
        res.status(410).json({
          success: false,
          error: 'Message has expired'
        });
        return;
      }

      res.json({
        success: true,
        data: message,
        message: 'Message retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get message',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/messages/:messageId/react
 * Add a reaction to a message
 */
router.post('/:messageId/react',
  authenticateToken,
  [
    param('messageId')
      .isMongoId()
      .withMessage('Invalid message ID'),
    body('reactionType')
      .isIn(['heart', 'hug', 'smile', 'tear'])
      .withMessage('Reaction type must be one of: heart, hug, smile, tear')
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

      const { messageId } = req.params;
      const { reactionType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User ID not found'
        });
        return;
      }

      const message = await messageService.addReaction({
        messageId,
        userId,
        reactionType
      });

      res.json({
        success: true,
        data: message,
        message: 'Reaction added successfully'
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add reaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/messages/:messageId/discover
 * Mark a message as discovered by the current user
 */
router.post('/:messageId/discover',
  authenticateToken,
  [
    param('messageId')
      .isMongoId()
      .withMessage('Invalid message ID')
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

      const { messageId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User ID not found'
        });
        return;
      }

      const message = await messageService.markMessageDiscovered({
        messageId,
        userId
      });

      res.json({
        success: true,
        data: message,
        message: 'Message marked as discovered'
      });
    } catch (error) {
      console.error('Error marking message as discovered:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark message as discovered',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/messages/location/stats
 * Get message statistics for a location
 */
router.get('/location/stats',
  authenticateToken,
  [
    query('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    query('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    query('radius')
      .optional()
      .isInt({ min: 10, max: 10000 })
      .withMessage('Radius must be between 10 and 10000 meters')
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

      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const radiusInMeters = parseInt(req.query.radius as string) || 1000;

      const stats = await messageService.getLocationStats(latitude, longitude, radiusInMeters);

      res.json({
        success: true,
        data: stats,
        message: 'Location statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting location stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get location statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/messages/user/mine
 * Get messages created by the current user (non-anonymous only)
 */
router.get('/user/mine',
  authenticateToken,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
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

      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User ID not found'
        });
        return;
      }

      const messages = await messageService.getMessagesByUser(userId, limit);

      res.json({
        success: true,
        data: messages,
        message: `Found ${messages.length} messages`
      });
    } catch (error) {
      console.error('Error getting user messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user messages',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;