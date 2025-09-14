import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import LocationService from '../services/locationService';
import { ApiResponse, CreateMessageRequest, GeoLocation } from '../types';
import { Message } from '../models/Message';

const router = express.Router();

// Validation middleware
const validateLocation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Accuracy must be a positive number')
];

const validateNearbyQuery = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 50000 })
    .withMessage('Radius must be between 1 and 50000 meters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateCreateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('moodEmbedding')
    .isObject()
    .withMessage('Mood embedding is required'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('isEphemeral')
    .optional()
    .isBoolean()
    .withMessage('isEphemeral must be a boolean')
];

// Helper function to handle validation errors
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message: errors.array().map(err => err.msg).join(', ')
    };
    return res.status(400).json(response);
  }
  return next();
};

/**
 * POST /api/location/validate
 * Validate location coordinates and accuracy
 */
router.post('/validate', validateLocation, handleValidationErrors, (req, res) => {
  try {
    const location: GeoLocation = {
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      accuracy: parseFloat(req.body.accuracy) || 0,
      timestamp: new Date()
    };

    const validation = LocationService.validateLocation(location);
    
    const response: ApiResponse = {
      success: validation.isValid,
      data: {
        isValid: validation.isValid,
        accuracy: validation.accuracy,
        errors: validation.errors,
        location: validation.isValid ? location : undefined
      },
      message: validation.isValid ? 'Location is valid' : 'Location validation failed'
    };

    res.status(validation.isValid ? 200 : 400).json(response);
  } catch (error) {
    console.error('Location validation error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to validate location'
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/location/nearby
 * Find nearby messages within radius
 */
router.get('/nearby', validateNearbyQuery, handleValidationErrors, authenticateToken, async (req, res) => {
  try {
    const location: GeoLocation = {
      latitude: parseFloat(req.query.lat as string),
      longitude: parseFloat(req.query.lng as string),
      accuracy: 0,
      timestamp: new Date()
    };

    const radius = parseInt(req.query.radius as string) || 1000;
    const limit = parseInt(req.query.limit as string) || 50;
    const includeExpired = req.query.includeExpired === 'true';
    const moodFilter = req.query.moodFilter ? JSON.parse(req.query.moodFilter as string) : undefined;

    const messages = await LocationService.findNearbyMessages(location, radius, {
      limit,
      includeExpired,
      excludeDiscoveredBy: (req as any).user.userId,
      moodFilter
    });

    const response: ApiResponse = {
      success: true,
      data: {
        messages,
        count: messages.length,
        location,
        radius,
        searchParams: {
          includeExpired,
          moodFilter,
          limit
        }
      },
      message: `Found ${messages.length} nearby messages`
    };

    res.json(response);
  } catch (error) {
    console.error('Nearby messages error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to find nearby messages',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/location/messages
 * Create a location-based message
 */
router.post('/messages', validateCreateMessage, handleValidationErrors, authenticateToken, async (req, res) => {
  try {
    const messageData: CreateMessageRequest = {
      content: req.body.content.trim(),
      location: {
        latitude: parseFloat(req.body.location.latitude),
        longitude: parseFloat(req.body.location.longitude),
        accuracy: parseFloat(req.body.location.accuracy) || 0,
        timestamp: new Date()
      },
      moodEmbedding: req.body.moodEmbedding,
      isAnonymous: req.body.isAnonymous ?? true,
      isEphemeral: req.body.isEphemeral ?? true
    };

    // Add author ID if not anonymous
    const authorId = messageData.isAnonymous ? undefined : (req as any).user.userId;

    const message = await LocationService.createLocationMessage({
      ...messageData,
      authorId
    });

    const response: ApiResponse = {
      success: true,
      data: {
        message,
        location: messageData.location
      },
      message: 'Message created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create message error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create message',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/location/insights
 * Get location insights and analytics
 */
router.get('/insights', validateNearbyQuery, handleValidationErrors, authenticateToken, async (req, res) => {
  try {
    const location: GeoLocation = {
      latitude: parseFloat(req.query.lat as string),
      longitude: parseFloat(req.query.lng as string),
      accuracy: 0,
      timestamp: new Date()
    };

    const radius = parseInt(req.query.radius as string) || 1000;

    const insights = await LocationService.getLocationInsights(location, radius);

    const response: ApiResponse = {
      success: true,
      data: {
        insights,
        location,
        radius
      },
      message: 'Location insights retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Location insights error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get location insights',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/location/messages/:messageId/discover
 * Mark a message as discovered by the current user
 */
router.post('/messages/:messageId/discover', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = (req as any).user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      const response: ApiResponse = {
        success: false,
        error: 'Message not found',
        message: 'The requested message does not exist'
      };
      return res.status(404).json(response);
    }

    await message.markDiscoveredBy(userId);

    const response: ApiResponse = {
      success: true,
      data: { message },
      message: 'Message marked as discovered'
    };

    res.json(response);
  } catch (error) {
    console.error('Mark discovered error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to mark message as discovered',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/location/messages/:messageId/react
 * Add a reaction to a message
 */
router.post('/messages/:messageId/react', 
  body('type').isIn(['heart', 'hug', 'smile', 'tear']).withMessage('Invalid reaction type'),
  handleValidationErrors,
  authenticateToken, 
  async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const userId = (req as any).user.userId;
      const reactionType = req.body.type;

      const message = await Message.findById(messageId);
      if (!message) {
        const response: ApiResponse = {
          success: false,
          error: 'Message not found',
          message: 'The requested message does not exist'
        };
        return res.status(404).json(response);
      }

      await message.addReaction(userId, reactionType);

      const response: ApiResponse = {
        success: true,
        data: { message },
        message: `${reactionType} reaction added successfully`
      };

      res.json(response);
    } catch (error) {
      console.error('Add reaction error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to add reaction',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
  }
);

/**
 * GET /api/location/distance
 * Calculate distance between two locations
 */
router.get('/distance', 
  query('lat1').isFloat({ min: -90, max: 90 }),
  query('lng1').isFloat({ min: -180, max: 180 }),
  query('lat2').isFloat({ min: -90, max: 90 }),
  query('lng2').isFloat({ min: -180, max: 180 }),
  handleValidationErrors,
  (req, res) => {
    try {
      const loc1: GeoLocation = {
        latitude: parseFloat(req.query.lat1 as string),
        longitude: parseFloat(req.query.lng1 as string),
        accuracy: 0,
        timestamp: new Date()
      };

      const loc2: GeoLocation = {
        latitude: parseFloat(req.query.lat2 as string),
        longitude: parseFloat(req.query.lng2 as string),
        accuracy: 0,
        timestamp: new Date()
      };

      const distance = LocationService.calculateDistance(loc1, loc2);

      const response: ApiResponse = {
        success: true,
        data: {
          distance,
          locations: { loc1, loc2 },
          unit: 'meters'
        },
        message: `Distance calculated: ${Math.round(distance)}m`
      };

      res.json(response);
    } catch (error) {
      console.error('Distance calculation error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to calculate distance',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
  }
);

export default router;