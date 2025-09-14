import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { contentModerationService } from '../services/contentModerationService';
import { messageService } from '../services/messageService';

const router = express.Router();

/**
 * POST /api/moderation/report
 * Report a message for inappropriate content
 */
router.post('/report',
  authenticateToken,
  [
    body('messageId')
      .isMongoId()
      .withMessage('Invalid message ID'),
    body('reason')
      .isIn(['inappropriate', 'spam', 'harassment', 'hate-speech', 'violence', 'other'])
      .withMessage('Invalid report reason'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
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

      const { messageId, reason, description } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User ID not found'
        });
        return;
      }

      await messageService.reportMessage(messageId, userId, reason, description);

      res.json({
        success: true,
        message: 'Report submitted successfully. Thank you for helping keep our community safe.'
      });
    } catch (error) {
      console.error('Error reporting message:', error);
      
      let statusCode = 500;
      let errorMessage = 'Failed to submit report';
      
      if (error instanceof Error) {
        if (error.message.includes('Too many reports')) {
          statusCode = 429;
          errorMessage = error.message;
        } else if (error.message.includes('not found')) {
          statusCode = 404;
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      res.status(statusCode).json({
        success: false,
        error: 'Report submission failed',
        message: errorMessage
      });
    }
  }
);

/**
 * GET /api/moderation/stats
 * Get moderation statistics (admin only)
 */
router.get('/stats',
  authenticateToken,
  [
    query('timeframe')
      .optional()
      .isIn(['day', 'week', 'month'])
      .withMessage('Timeframe must be day, week, or month')
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // TODO: Add admin role check
      // For now, any authenticated user can access stats
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'day';
      const stats = await contentModerationService.getModerationStats(timeframe);

      res.json({
        success: true,
        data: stats,
        message: 'Moderation statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get moderation statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/moderation/queue
 * Get moderation queue for human reviewers (admin/moderator only)
 */
router.get('/queue',
  authenticateToken,
  [
    query('status')
      .optional()
      .isIn(['pending', 'reviewing', 'approved', 'rejected'])
      .withMessage('Invalid status'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // TODO: Add moderator role check
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const status = req.query.status as any || 'pending';
      const limit = parseInt(req.query.limit as string) || 50;

      const queue = await contentModerationService.getModerationQueue(status, limit);

      res.json({
        success: true,
        data: queue,
        message: `Retrieved ${queue.length} items from moderation queue`
      });
    } catch (error) {
      console.error('Error getting moderation queue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get moderation queue',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/moderation/review/:messageId
 * Review a message in the moderation queue (admin/moderator only)
 */
router.post('/review/:messageId',
  authenticateToken,
  [
    param('messageId')
      .isMongoId()
      .withMessage('Invalid message ID'),
    body('decision')
      .isIn(['approve', 'reject'])
      .withMessage('Decision must be approve or reject'),
    body('notes')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Notes must be less than 1000 characters')
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // TODO: Add moderator role check
      
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
      const { decision, notes } = req.body;
      const reviewerId = req.user?.id;

      if (!reviewerId) {
        res.status(401).json({
          success: false,
          error: 'Reviewer ID not found'
        });
        return;
      }

      const message = await contentModerationService.reviewMessage(
        messageId,
        reviewerId,
        decision,
        notes
      );

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        });
        return;
      }

      res.json({
        success: true,
        data: message,
        message: `Message ${decision}d successfully`
      });
    } catch (error) {
      console.error('Error reviewing message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to review message',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/moderation/moderate/:messageId
 * Manually trigger moderation for a specific message (admin only)
 */
router.post('/moderate/:messageId',
  authenticateToken,
  [
    param('messageId')
      .isMongoId()
      .withMessage('Invalid message ID')
  ],
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // TODO: Add admin role check
      
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
      const message = await contentModerationService.moderateMessage(messageId);

      if (!message) {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        });
        return;
      }

      res.json({
        success: true,
        data: message,
        message: 'Message moderation completed'
      });
    } catch (error) {
      console.error('Error moderating message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to moderate message',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;