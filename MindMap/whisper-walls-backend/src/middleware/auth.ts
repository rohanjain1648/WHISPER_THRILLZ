import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthTokenPayload } from '../services/authService';
import { User, IUser } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
  userId: string;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
      return;
    }

    // Check if token is blacklisted
    const isBlacklisted = await AuthService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      res.status(401).json({
        error: 'Access denied',
        message: 'Token has been revoked'
      });
      return;
    }

    // Verify token
    const decoded: AuthTokenPayload = AuthService.verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: 'Access denied',
        message: 'User not found'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id?.toString();

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token'
    });
  }
};

/**
 * Middleware to optionally authenticate tokens (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      // Check if token is blacklisted
      const isBlacklisted = await AuthService.isTokenBlacklisted(token);
      if (!isBlacklisted) {
        try {
          const decoded: AuthTokenPayload = AuthService.verifyAccessToken(token);
          const user = await User.findById(decoded.userId);
          if (user) {
            req.user = user;
            req.userId = user._id?.toString();
          }
        } catch (error) {
          // Token is invalid, but we continue without authentication
          console.log('Optional auth failed:', error);
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Middleware to check if user email is verified
 */
export const requireEmailVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in first'
    });
    return;
  }

  if (!req.user.isEmailVerified) {
    res.status(403).json({
      error: 'Email verification required',
      message: 'Please verify your email address before accessing this resource'
    });
    return;
  }

  next();
};

/**
 * Middleware to check user permissions/roles (for future use)
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in first'
      });
      return;
    }

    // For now, all authenticated users have all permissions
    // This can be extended later with role-based access control
    next();
  };
};

/**
 * Middleware for rate limiting per user
 */
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.userId || req.ip || 'anonymous';
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (!userRequests || now > userRequests.resetTime) {
      // Reset or initialize counter
      requests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${Math.ceil((userRequests.resetTime - now) / 1000)} seconds.`
      });
      return;
    }

    userRequests.count++;
    next();
  };
};

/**
 * Middleware to validate user ownership of resources
 */
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in first'
      });
      return;
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.userId) {
      res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
      return;
    }

    next();
  };
};

export default {
  authenticateToken,
  optionalAuth,
  requireEmailVerification,
  requirePermission,
  userRateLimit,
  requireOwnership
};