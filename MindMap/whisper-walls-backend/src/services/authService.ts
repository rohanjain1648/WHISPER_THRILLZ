import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { getRedisClient } from '../config/redis';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  age?: number;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d' as string;
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '30d';
  private static readonly REDIS_TOKEN_PREFIX = 'refresh_token:';
  private static readonly REDIS_BLACKLIST_PREFIX = 'blacklisted_token:';

  /**
   * Generate JWT access token
   */
  static generateAccessToken(payload: AuthTokenPayload): string {
    return jwt.sign(
      { userId: payload.userId, email: payload.email },
      this.JWT_SECRET as string,
      {
        expiresIn: this.JWT_EXPIRES_IN,
        issuer: 'whisper-walls-api',
        audience: 'whisper-walls-client'
      } as any
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generate both access and refresh tokens
   */
  static async generateTokens(user: IUser): Promise<AuthTokens> {
    const payload: AuthTokenPayload = {
      userId: user._id?.toString() || '',
      email: user.email
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken();

    // Store refresh token in Redis with expiration
    const redisClient = getRedisClient();
    if (redisClient) {
      const refreshTokenKey = `${this.REDIS_TOKEN_PREFIX}${user._id}`;
      await redisClient.setEx(refreshTokenKey, 30 * 24 * 60 * 60, refreshToken); // 30 days
    }

    return { accessToken, refreshToken };
  }

  /**
   * Verify JWT token
   */
  static verifyAccessToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET as string, {
        issuer: 'whisper-walls-api',
        audience: 'whisper-walls-client'
      }) as AuthTokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  static async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return false;
      
      const storedToken = await redisClient.get(`${this.REDIS_TOKEN_PREFIX}${userId}`);
      return storedToken === refreshToken;
    } catch (error) {
      return false;
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Validate password strength
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Create new user
    const user = new User({
      email: userData.email.toLowerCase(),
      hashedPassword: userData.password, // Will be hashed by pre-save middleware
      profile: {
        displayName: userData.displayName,
        age: userData.age,
        interests: []
      },
      emailVerificationToken: crypto.randomBytes(32).toString('hex')
    });

    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Find user by email
    const user = await User.findOne({ email: credentials.email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(userId: string, refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const isValidRefreshToken = await this.verifyRefreshToken(userId, refreshToken);
    if (!isValidRefreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Logout user (blacklist tokens)
   */
  static async logout(userId: string, accessToken: string): Promise<void> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return;

      // Remove refresh token from Redis
      await redisClient.del(`${this.REDIS_TOKEN_PREFIX}${userId}`);

      // Blacklist the access token
      const decoded = this.verifyAccessToken(accessToken);
      if (decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisClient.setEx(`${this.REDIS_BLACKLIST_PREFIX}${accessToken}`, ttl, 'blacklisted');
        }
      }
    } catch (error) {
      // Even if token verification fails, we should still try to clean up
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.del(`${this.REDIS_TOKEN_PREFIX}${userId}`);
      }
    }
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return false;
      
      const result = await redisClient.get(`${this.REDIS_BLACKLIST_PREFIX}${token}`);
      return result === 'blacklisted';
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(email: string): Promise<string> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    return resetToken;
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<IUser> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    user.hashedPassword = newPassword; // Will be hashed by pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return user;
  }

  /**
   * Verify email using token
   */
  static async verifyEmail(token: string): Promise<IUser> {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      throw new Error('Invalid verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return user;
  }

  /**
   * Change password (authenticated user)
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    user.hashedPassword = newPassword; // Will be hashed by pre-save middleware
    await user.save();
  }
}

export default AuthService;