import { apiService } from './api';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  AuthTokens, 
  User, 
  ApiResponse 
} from '../types';

class AuthService {
  private readonly TOKEN_KEY = 'whisper_access_token';
  private readonly REFRESH_TOKEN_KEY = 'whisper_refresh_token';
  private readonly USER_KEY = 'whisper_user';

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      
      if (response.success && response.data) {
        this.setTokens(response.data.tokens);
        this.setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        this.setTokens(response.data.tokens);
        this.setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      const user = this.getUser();
      
      if (!refreshToken || !user) {
        return false;
      }

      const response = await apiService.post<{ tokens: AuthTokens }>('/auth/refresh', {
        refreshToken,
        userId: user._id
      });

      if (response.success && response.data) {
        this.setTokens(response.data.tokens);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return apiService.get<{ user: User }>('/auth/me');
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiService.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return apiService.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiService.post('/auth/reset-password', {
      token,
      newPassword
    });
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<ApiResponse<any>> {
    return apiService.post('/auth/verify-email', { token });
  }

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<ApiResponse<any>> {
    return apiService.post('/auth/resend-verification');
  }

  // Token management methods
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // User management methods
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.clearAuthData();
      }
    }
    return null;
  }

  // Authentication state methods
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!(token && user);
  }

  isEmailVerified(): boolean {
    const user = this.getUser();
    return user?.isEmailVerified || false;
  }

  clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Token validation (basic check for expiration)
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Auto-refresh token if needed
  async ensureValidToken(): Promise<boolean> {
    const token = this.getAccessToken();
    
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      return await this.refreshToken();
    }

    return true;
  }
}

export const authService = new AuthService();
export default authService;