import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('whisper_access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token first
          const refreshToken = localStorage.getItem('whisper_refresh_token');
          const user = localStorage.getItem('whisper_user');
          
          if (refreshToken && user) {
            try {
              const userData = JSON.parse(user);
              const refreshResponse = await axios.post(`${this.api.defaults.baseURL}/auth/refresh`, {
                refreshToken,
                userId: userData._id
              });
              
              if (refreshResponse.data.success) {
                const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.tokens;
                localStorage.setItem('whisper_access_token', accessToken);
                localStorage.setItem('whisper_refresh_token', newRefreshToken);
                
                // Retry the original request
                error.config.headers.Authorization = `Bearer ${accessToken}`;
                return this.api.request(error.config);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          
          // Clear auth data and redirect to login
          localStorage.removeItem('whisper_access_token');
          localStorage.removeItem('whisper_refresh_token');
          localStorage.removeItem('whisper_user');
          
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic API methods
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.get('/health');
  }
}

export const apiService = new ApiService();
export default apiService;