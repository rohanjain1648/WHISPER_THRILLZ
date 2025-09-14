import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireOwnership, userRateLimit } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('interests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 interests allowed'),
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters')
];

const updateLocationValidation = [
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

const updatePreferencesValidation = [
  body('musicGenres')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 music genres allowed'),
  body('discoveryRadius')
    .optional()
    .isInt({ min: 100, max: 10000 })
    .withMessage('Discovery radius must be between 100 and 10000 meters'),
  body('privacyLevel')
    .optional()
    .isIn(['open', 'selective', 'private'])
    .withMessage('Privacy level must be open, selective, or private'),
  body('notificationSettings.nearbyMessages')
    .optional()
    .isBoolean()
    .withMessage('Nearby messages notification setting must be boolean'),
  body('notificationSettings.moodInsights')
    .optional()
    .isBoolean()
    .withMessage('Mood insights notification setting must be boolean'),
  body('notificationSettings.playlistUpdates')
    .optional()
    .isBoolean()
    .withMessage('Playlist updates notification setting must be boolean'),
  body('notificationSettings.relationshipUpdates')
    .optional()
    .isBoolean()
    .withMessage('Relationship updates notification setting must be boolean'),
  body('notificationSettings.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification setting must be boolean'),
  body('notificationSettings.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification setting must be boolean')
];

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array()
    });
    return true;
  }
  return false;
};

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      res.json({
        user: req.user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: 'An error occurred while fetching user profile'
      });
    }
  }
);

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile',
  authenticateToken,
  updateProfileValidation,
  userRateLimit(20, 60 * 60 * 1000), // 20 requests per hour
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      const { displayName, age, bio, interests } = req.body;

      // Update profile fields
      if (displayName !== undefined) req.user.profile.displayName = displayName;
      if (age !== undefined) req.user.profile.age = age;
      if (bio !== undefined) req.user.profile.bio = bio;
      if (interests !== undefined) req.user.profile.interests = interests;

      await req.user.save();

      res.json({
        message: 'Profile updated successfully',
        user: req.user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: 'An error occurred while updating profile'
      });
    }
  }
);

/**
 * PUT /api/users/location
 * Update user location
 */
router.put('/location',
  authenticateToken,
  updateLocationValidation,
  userRateLimit(100, 60 * 60 * 1000), // 100 requests per hour (location updates are frequent)
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      const { latitude, longitude, accuracy } = req.body;

      req.user.profile.location = {
        latitude,
        longitude,
        accuracy,
        timestamp: new Date()
      };

      await req.user.save();

      res.json({
        message: 'Location updated successfully',
        location: req.user.profile.location
      });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({
        error: 'Failed to update location',
        message: 'An error occurred while updating location'
      });
    }
  }
);

/**
 * PUT /api/users/preferences
 * Update user preferences
 */
router.put('/preferences',
  authenticateToken,
  updatePreferencesValidation,
  userRateLimit(20, 60 * 60 * 1000), // 20 requests per hour
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      const { musicGenres, discoveryRadius, privacyLevel, notificationSettings } = req.body;

      // Update preferences
      if (musicGenres !== undefined) req.user.preferences.musicGenres = musicGenres;
      if (discoveryRadius !== undefined) req.user.preferences.discoveryRadius = discoveryRadius;
      if (privacyLevel !== undefined) req.user.preferences.privacyLevel = privacyLevel;
      
      if (notificationSettings) {
        // Merge notification settings
        req.user.preferences.notificationSettings = {
          ...req.user.preferences.notificationSettings,
          ...notificationSettings
        };
      }

      await req.user.save();

      res.json({
        message: 'Preferences updated successfully',
        preferences: req.user.preferences
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        error: 'Failed to update preferences',
        message: 'An error occurred while updating preferences'
      });
    }
  }
);

/**
 * GET /api/users/:userId
 * Get public user profile (limited information)
 */
router.get('/:userId',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      const user = await User.findById(userId).select(
        'profile.displayName profile.age profile.bio profile.interests createdAt'
      );

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'The requested user does not exist'
        });
        return;
      }

      // Check privacy settings
      if (user.preferences?.privacyLevel === 'private') {
        // Only show minimal info for private users
        res.json({
          user: {
            _id: user._id,
            profile: {
              displayName: user.profile.displayName || 'Anonymous User'
            },
            createdAt: user.createdAt
          }
        });
        return;
      }

      res.json({
        user: {
          _id: user._id,
          profile: user.profile,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Failed to get user',
        message: 'An error occurred while fetching user profile'
      });
    }
  }
);

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete('/account',
  authenticateToken,
  userRateLimit(3, 24 * 60 * 60 * 1000), // 3 requests per day
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      // TODO: In a production app, you might want to:
      // 1. Soft delete instead of hard delete
      // 2. Clean up related data (messages, relationships, etc.)
      // 3. Send confirmation email
      // 4. Add a grace period for account recovery

      await User.findByIdAndDelete(req.user._id);

      res.json({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        error: 'Failed to delete account',
        message: 'An error occurred while deleting account'
      });
    }
  }
);

/**
 * POST /api/users/relationships/couple
 * Add couple relationship
 */
router.post('/relationships/couple',
  authenticateToken,
  body('partnerId').isMongoId().withMessage('Valid partner ID is required'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      const { partnerId } = req.body;

      // Check if partner exists
      const partner = await User.findById(partnerId);
      if (!partner) {
        res.status(404).json({
          error: 'Partner not found',
          message: 'The specified partner does not exist'
        });
        return;
      }

      // Check if already in relationship
      if (req.user.relationships.couples.includes(partnerId)) {
        res.status(400).json({
          error: 'Already in relationship',
          message: 'You are already in a couple relationship with this user'
        });
        return;
      }

      // Add to both users' couple relationships
      req.user.relationships.couples.push(partnerId);
      partner.relationships.couples.push(req.user._id as any);

      await Promise.all([req.user.save(), partner.save()]);

      res.json({
        message: 'Couple relationship added successfully',
        partnerId
      });
    } catch (error) {
      console.error('Add couple relationship error:', error);
      res.status(500).json({
        error: 'Failed to add relationship',
        message: 'An error occurred while adding couple relationship'
      });
    }
  }
);

/**
 * DELETE /api/users/relationships/couple/:partnerId
 * Remove couple relationship
 */
router.delete('/relationships/couple/:partnerId',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { partnerId } = req.params;

      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      // Remove from current user's relationships
      req.user.relationships.couples = req.user.relationships.couples.filter(
        id => id.toString() !== partnerId
      );

      // Remove from partner's relationships
      const partner = await User.findById(partnerId);
      if (partner && req.user) {
        partner.relationships.couples = partner.relationships.couples.filter(
          id => id.toString() !== req.user!._id?.toString()
        );
        await partner.save();
      }

      await req.user.save();

      res.json({
        message: 'Couple relationship removed successfully'
      });
    } catch (error) {
      console.error('Remove couple relationship error:', error);
      res.status(500).json({
        error: 'Failed to remove relationship',
        message: 'An error occurred while removing couple relationship'
      });
    }
  }
);

export default router;