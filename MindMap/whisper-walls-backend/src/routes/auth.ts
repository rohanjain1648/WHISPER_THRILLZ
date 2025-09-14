import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { authenticateToken, userRateLimit } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
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
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', 
  userRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  registerValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { email, password, displayName, age } = req.body;

      const result = await AuthService.register({
        email,
        password,
        displayName,
        age
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        tokens: result.tokens
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login',
  userRateLimit(10, 15 * 60 * 1000), // 10 requests per 15 minutes
  loginValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      res.json({
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Invalid credentials'
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh',
  userRateLimit(20, 60 * 60 * 1000), // 20 requests per hour
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken, userId } = req.body;

      if (!refreshToken || !userId) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Refresh token and user ID are required'
        });
        return;
      }

      const tokens = await AuthService.refreshAccessToken(userId, refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        tokens
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Invalid refresh token'
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.headers.authorization?.substring(7);
      if (token && req.userId) {
        await AuthService.logout(req.userId, token);
      }

      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: 'An error occurred during logout'
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me',
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
 * PUT /api/auth/change-password
 * Change user password
 */
router.put('/change-password',
  authenticateToken,
  changePasswordValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { currentPassword, newPassword } = req.body;

      if (!req.userId) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      await AuthService.changePassword(req.userId, currentPassword, newPassword);

      res.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        error: 'Password change failed',
        message: error instanceof Error ? error.message : 'Failed to change password'
      });
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password',
  userRateLimit(3, 60 * 60 * 1000), // 3 requests per hour
  body('email').isEmail().normalizeEmail(),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { email } = req.body;

      await AuthService.generatePasswordResetToken(email);

      // Always return success to prevent email enumeration
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      // Always return success to prevent email enumeration
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password',
  userRateLimit(5, 60 * 60 * 1000), // 5 requests per hour
  resetPasswordValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { token, newPassword } = req.body;

      await AuthService.resetPassword(token, newPassword);

      res.json({
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({
        error: 'Password reset failed',
        message: error instanceof Error ? error.message : 'Invalid or expired reset token'
      });
    }
  }
);

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post('/verify-email',
  body('token').notEmpty().withMessage('Verification token is required'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (handleValidationErrors(req, res)) return;

      const { token } = req.body;

      await AuthService.verifyEmail(token);

      res.json({
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        error: 'Email verification failed',
        message: error instanceof Error ? error.message : 'Invalid verification token'
      });
    }
  }
);

/**
 * POST /api/auth/resend-verification
 * Resend email verification
 */
router.post('/resend-verification',
  authenticateToken,
  userRateLimit(3, 60 * 60 * 1000), // 3 requests per hour
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in first'
        });
        return;
      }

      if (req.user.isEmailVerified) {
        res.status(400).json({
          error: 'Email already verified',
          message: 'Your email address is already verified'
        });
        return;
      }

      // Generate new verification token
      const crypto = require('crypto');
      req.user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
      await req.user.save();

      res.json({
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        error: 'Failed to resend verification',
        message: 'An error occurred while sending verification email'
      });
    }
  }
);

export default router;