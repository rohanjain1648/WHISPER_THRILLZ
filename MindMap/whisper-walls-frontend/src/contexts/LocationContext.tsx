import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { GeoLocation, WhisperNote } from '../types';
import { useLocation, LocationState, LocationActions } from '../hooks/useLocation';
import LocationService, { NearbyMessagesOptions } from '../services/locationService';

interface LocationContextValue extends LocationState, LocationActions {
  // Additional location-specific methods
  findNearbyMessages: (options?: NearbyMessagesOptions) => Promise<WhisperNote[]>;
  validateCurrentLocation: () => Promise<boolean>;
  getLocationInsights: (radius?: number) => Promise<any>;
  isLocationServiceAvailable: boolean;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
  autoRequest?: boolean;
  watchLocation?: boolean;
  requiredAccuracy?: number;
}

export function LocationProvider({ 
  children, 
  autoRequest = false, 
  watchLocation = false,
  requiredAccuracy = 100 
}: LocationProviderProps) {
  const [locationState, locationActions] = useLocation({
    requestOnMount: autoRequest,
    watch: watchLocation,
    requiredAccuracy,
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutes
  });

  // Check if location services are available
  const isLocationServiceAvailable = LocationService.isGeolocationSupported();

  // Find nearby messages using current location
  const findNearbyMessages = async (options: NearbyMessagesOptions = {}): Promise<WhisperNote[]> => {
    if (!locationState.location) {
      throw new Error('Current location is not available. Please enable location services.');
    }

    try {
      return await LocationService.findNearbyMessages(locationState.location, options);
    } catch (error) {
      console.error('Failed to find nearby messages:', error);
      throw error;
    }
  };

  // Validate current location
  const validateCurrentLocation = async (): Promise<boolean> => {
    if (!locationState.location) {
      return false;
    }

    try {
      const validation = await LocationService.validateLocation(locationState.location);
      return validation.success && validation.data?.isValid;
    } catch (error) {
      console.error('Location validation failed:', error);
      return false;
    }
  };

  // Get location insights
  const getLocationInsights = async (radius: number = 1000): Promise<any> => {
    if (!locationState.location) {
      throw new Error('Current location is not available. Please enable location services.');
    }

    try {
      return await LocationService.getLocationInsights(locationState.location, radius);
    } catch (error) {
      console.error('Failed to get location insights:', error);
      throw error;
    }
  };

  // Log location changes for debugging
  useEffect(() => {
    if (locationState.location) {
      console.log('Location updated:', {
        latitude: locationState.location.latitude,
        longitude: locationState.location.longitude,
        accuracy: locationState.location.accuracy,
        accuracyDescription: locationState.accuracy,
        isAccurate: locationState.isAccurate
      });
    }
  }, [locationState.location, locationState.accuracy, locationState.isAccurate]);

  // Log permission changes
  useEffect(() => {
    if (locationState.permission) {
      console.log('Location permission status:', locationState.permission);
    }
  }, [locationState.permission]);

  const contextValue: LocationContextValue = {
    ...locationState,
    ...locationActions,
    findNearbyMessages,
    validateCurrentLocation,
    getLocationInsights,
    isLocationServiceAvailable
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextValue {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}

// Custom hooks for specific location operations
export function useNearbyMessages(options: NearbyMessagesOptions = {}) {
  const { location, findNearbyMessages } = useLocationContext();
  const [messages, setMessages] = React.useState<WhisperNote[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadNearbyMessages = React.useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const nearbyMessages = await findNearbyMessages(options);
      setMessages(nearbyMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nearby messages');
    } finally {
      setLoading(false);
    }
  }, [location, findNearbyMessages, options]);

  // Auto-load when location becomes available
  React.useEffect(() => {
    if (location) {
      loadNearbyMessages();
    }
  }, [location, loadNearbyMessages]);

  return {
    messages,
    loading,
    error,
    reload: loadNearbyMessages,
    clearError: () => setError(null)
  };
}

export function useLocationInsights(radius: number = 1000) {
  const { location, getLocationInsights } = useLocationContext();
  const [insights, setInsights] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadInsights = React.useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const locationInsights = await getLocationInsights(radius);
      setInsights(locationInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load location insights');
    } finally {
      setLoading(false);
    }
  }, [location, getLocationInsights, radius]);

  // Auto-load when location becomes available
  React.useEffect(() => {
    if (location) {
      loadInsights();
    }
  }, [location, loadInsights]);

  return {
    insights,
    loading,
    error,
    reload: loadInsights,
    clearError: () => setError(null)
  };
}

export default LocationContext;