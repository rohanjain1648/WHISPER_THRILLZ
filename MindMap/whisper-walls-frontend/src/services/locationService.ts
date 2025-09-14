import { GeoLocation, WhisperNote, ApiResponse } from '../types';
import { apiService } from './api';

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  error?: string;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface NearbyMessagesOptions {
  radius?: number;
  limit?: number;
  includeExpired?: boolean;
  moodFilter?: {
    minSentiment?: number;
    maxSentiment?: number;
    emotions?: string[];
  };
}

export interface CreateMessageData {
  content: string;
  location: GeoLocation;
  moodEmbedding: any;
  isAnonymous?: boolean;
  isEphemeral?: boolean;
}

export class LocationService {
  private static watchId: number | null = null;
  private static currentLocation: GeoLocation | null = null;
  private static locationCallbacks: ((location: GeoLocation) => void)[] = [];

  /**
   * Check if geolocation is supported by the browser
   */
  static isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Check current permission status for geolocation
   */
  static async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!this.isGeolocationSupported()) {
      return {
        granted: false,
        denied: true,
        prompt: false,
        error: 'Geolocation is not supported by this browser'
      };
    }

    try {
      // Check permissions API if available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return {
          granted: permission.state === 'granted',
          denied: permission.state === 'denied',
          prompt: permission.state === 'prompt'
        };
      }

      // Fallback: try to get position with minimal timeout
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve({ granted: true, denied: false, prompt: false }),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              resolve({ granted: false, denied: true, prompt: false });
            } else {
              resolve({ granted: false, denied: false, prompt: true });
            }
          },
          { timeout: 1000, maximumAge: 300000 }
        );
      });
    } catch (error) {
      return {
        granted: false,
        denied: false,
        prompt: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current location using browser geolocation API
   */
  static async getCurrentLocation(options: GeolocationOptions = {}): Promise<GeoLocation> {
    if (!this.isGeolocationSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };

          this.currentLocation = location;
          this.notifyLocationCallbacks(location);
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          reject(new Error(`${errorMessage}: ${error.message}`));
        },
        defaultOptions
      );
    });
  }

  /**
   * Watch location changes
   */
  static watchLocation(
    callback: (location: GeoLocation) => void,
    options: GeolocationOptions = {}
  ): number {
    if (!this.isGeolocationSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    // Add callback to list
    this.locationCallbacks.push(callback);

    // Start watching if not already watching
    if (this.watchId === null) {
      const defaultOptions: GeolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute for watch
        ...options
      };

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };

          this.currentLocation = location;
          this.notifyLocationCallbacks(location);
        },
        (error) => {
          console.error('Location watch error:', error);
          // Continue watching despite errors
        },
        defaultOptions
      );
    }

    // Return callback index for removal
    return this.locationCallbacks.length - 1;
  }

  /**
   * Stop watching location
   */
  static stopWatchingLocation(callbackIndex?: number): void {
    if (callbackIndex !== undefined) {
      // Remove specific callback
      this.locationCallbacks.splice(callbackIndex, 1);
    } else {
      // Remove all callbacks
      this.locationCallbacks = [];
    }

    // Stop watching if no callbacks remain
    if (this.locationCallbacks.length === 0 && this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get cached current location
   */
  static getCachedLocation(): GeoLocation | null {
    return this.currentLocation;
  }

  /**
   * Validate location coordinates
   */
  static async validateLocation(location: GeoLocation): Promise<ApiResponse> {
    try {
      const response = await apiService.post('/location/validate', {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      });
      return response.data;
    } catch (error) {
      throw new Error(`Location validation failed: ${error}`);
    }
  }

  /**
   * Find nearby messages
   */
  static async findNearbyMessages(
    location: GeoLocation,
    options: NearbyMessagesOptions = {}
  ): Promise<WhisperNote[]> {
    try {
      const params = new URLSearchParams({
        lat: location.latitude.toString(),
        lng: location.longitude.toString(),
        radius: (options.radius || 1000).toString(),
        limit: (options.limit || 50).toString()
      });

      if (options.includeExpired) {
        params.append('includeExpired', 'true');
      }

      if (options.moodFilter) {
        params.append('moodFilter', JSON.stringify(options.moodFilter));
      }

      const response = await apiService.get(`/location/nearby?${params}`);
      return response.data.data.messages;
    } catch (error) {
      throw new Error(`Failed to find nearby messages: ${error}`);
    }
  }

  /**
   * Create a location-based message
   */
  static async createLocationMessage(messageData: CreateMessageData): Promise<WhisperNote> {
    try {
      const response = await apiService.post('/location/messages', messageData);
      return response.data.data.message;
    } catch (error) {
      throw new Error(`Failed to create message: ${error}`);
    }
  }

  /**
   * Get location insights
   */
  static async getLocationInsights(location: GeoLocation, radius: number = 1000): Promise<any> {
    try {
      const params = new URLSearchParams({
        lat: location.latitude.toString(),
        lng: location.longitude.toString(),
        radius: radius.toString()
      });

      const response = await apiService.get(`/location/insights?${params}`);
      return response.data.data.insights;
    } catch (error) {
      throw new Error(`Failed to get location insights: ${error}`);
    }
  }

  /**
   * Mark a message as discovered
   */
  static async markMessageDiscovered(messageId: string): Promise<void> {
    try {
      await apiService.post(`/location/messages/${messageId}/discover`);
    } catch (error) {
      throw new Error(`Failed to mark message as discovered: ${error}`);
    }
  }

  /**
   * Add reaction to a message
   */
  static async addReaction(messageId: string, reactionType: 'heart' | 'hug' | 'smile' | 'tear'): Promise<void> {
    try {
      await apiService.post(`/location/messages/${messageId}/react`, {
        type: reactionType
      });
    } catch (error) {
      throw new Error(`Failed to add reaction: ${error}`);
    }
  }

  /**
   * Calculate distance between two locations
   */
  static async calculateDistance(loc1: GeoLocation, loc2: GeoLocation): Promise<number> {
    try {
      const params = new URLSearchParams({
        lat1: loc1.latitude.toString(),
        lng1: loc1.longitude.toString(),
        lat2: loc2.latitude.toString(),
        lng2: loc2.longitude.toString()
      });

      const response = await apiService.get(`/location/distance?${params}`);
      return response.data.data.distance;
    } catch (error) {
      throw new Error(`Failed to calculate distance: ${error}`);
    }
  }

  /**
   * Request location permission with user-friendly prompts
   */
  static async requestLocationPermission(): Promise<GeoLocation> {
    const permissionStatus = await this.checkPermissionStatus();

    if (permissionStatus.denied) {
      throw new Error('Location access has been denied. Please enable location services in your browser settings to discover nearby whispers.');
    }

    if (permissionStatus.granted) {
      return await this.getCurrentLocation();
    }

    // Permission is in prompt state, request location
    try {
      return await this.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Force fresh location for permission request
      });
    } catch (error) {
      throw new Error('We need location access to show you nearby whispers. Please allow location access when prompted.');
    }
  }

  /**
   * Check if location is accurate enough for the app
   */
  static isLocationAccurate(location: GeoLocation, requiredAccuracy: number = 100): boolean {
    return location.accuracy <= requiredAccuracy;
  }

  /**
   * Get user-friendly accuracy description
   */
  static getAccuracyDescription(accuracy: number): string {
    if (accuracy <= 10) return 'Very High';
    if (accuracy <= 50) return 'High';
    if (accuracy <= 100) return 'Medium';
    if (accuracy <= 500) return 'Low';
    return 'Very Low';
  }

  /**
   * Private method to notify all location callbacks
   */
  private static notifyLocationCallbacks(location: GeoLocation): void {
    this.locationCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Location callback error:', error);
      }
    });
  }
}

export default LocationService;