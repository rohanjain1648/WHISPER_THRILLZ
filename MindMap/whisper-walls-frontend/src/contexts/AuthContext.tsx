import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginCredentials, RegisterData, ApiResponse, AuthResponse } from '../types';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponse>>;
  register: (userData: RegisterData) => Promise<ApiResponse<AuthResponse>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ApiResponse<any>>;
  forgotPassword: (email: string) => Promise<ApiResponse<any>>;
  resetPassword: (token: string, newPassword: string) => Promise<ApiResponse<any>>;
  verifyEmail: (token: string) => Promise<ApiResponse<any>>;
  resendVerification: () => Promise<ApiResponse<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is stored locally
      const storedUser = authService.getUser();
      const hasToken = authService.isAuthenticated();
      
      if (storedUser && hasToken) {
        // Verify token is still valid by fetching current user
        const response = await authService.getCurrentUser();
        
        if (response.success && response.data) {
          setUser(response.data.user);
          authService.setUser(response.data.user); // Update stored user data
        } else {
          // Token is invalid, clear auth data
          authService.clearAuthData();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authService.clearAuthData();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    setIsLoading(true);
    
    try {
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      
      if (response.success && response.data) {
        setUser(response.data.user);
        authService.setUser(response.data.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const changePassword = async (
    currentPassword: string, 
    newPassword: string
  ): Promise<ApiResponse<any>> => {
    return authService.changePassword(currentPassword, newPassword);
  };

  const forgotPassword = async (email: string): Promise<ApiResponse<any>> => {
    return authService.forgotPassword(email);
  };

  const resetPassword = async (
    token: string, 
    newPassword: string
  ): Promise<ApiResponse<any>> => {
    return authService.resetPassword(token, newPassword);
  };

  const verifyEmail = async (token: string): Promise<ApiResponse<any>> => {
    const response = await authService.verifyEmail(token);
    
    if (response.success) {
      // Refresh user data to update email verification status
      await refreshUser();
    }
    
    return response;
  };

  const resendVerification = async (): Promise<ApiResponse<any>> => {
    return authService.resendVerification();
  };

  // Auto-refresh token periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await authService.ensureValidToken();
      } catch (error) {
        console.error('Token refresh error:', error);
        // If token refresh fails, logout user
        await logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const value: AuthContextType = {
    // State
    user,
    isAuthenticated: !!user,
    isLoading,
    isEmailVerified: user?.isEmailVerified || false,

    // Actions
    login,
    register,
    logout,
    refreshUser,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-love-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show login component
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;