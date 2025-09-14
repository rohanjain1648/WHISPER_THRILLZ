import { useState, useEffect, useCallback, useRef } from 'react';
import { GeoLocation } from '../types';
import LocationService, { LocationPermissionStatus, GeolocationOptions } from '../services/locationService';

export interface UseLocationOptions extends GeolocationOptions {
  watch?: boolean;
  requestOnMount?: boolean;
  requiredAccuracy?: number;
}

export interface LocationState {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  permission: LocationPermissionStatus | null;
  accuracy: string;
  isAccurate: boolean;
}

export interface LocationActions {
  requestLocation: () => Promise<void>;
  clearError: () => void;
  refreshLocation: () => Promise<void>;
  checkPermission: () => Promise<void>;
}

export function useLocation(options: UseLocationOptions = {}): [LocationState, LocationActions] {
  const {
    watch = false,
    requestOnMount = false,
    requiredAccuracy = 100,
    ...geolocationOptions
  } = options;

  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    permission: null,
    accuracy: 'Unknown',
    isAccurate: false
  });

  const watchIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Safe state update that checks if component is still mounted
  const safeSetState = useCallback((updater: Partial<LocationState> | ((prev: LocationState) => LocationState)) => {
    if (mountedRef.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  // Update location state
  const updateLocation = useCallback((location: GeoLocation) => {
    const accuracy = LocationService.getAccuracyDescription(location.accuracy);
    const isAccurate = LocationService.isLocationAccurate(location, requiredAccuracy);

    safeSetState({
      location,
      accuracy,
      isAccurate,
      loading: false,
      error: null
    });
  }, [requiredAccuracy, safeSetState]);

  // Handle location errors
  const handleLocationError = useCallback((error: Error) => {
    console.error('Location error:', error);
    safeSetState({
      loading: false,
      error: error.message
    });
  }, [safeSetState]);

  // Check permission status
  const checkPermission = useCallback(async () => {
    try {
      const permission = await LocationService.checkPermissionStatus();
      safeSetState({ permission });
    } catch (error) {
      console.error('Permission check error:', error);
    }
  }, [safeSetState]);

  // Request location
  const requestLocation = useCallback(async () => {
    if (!LocationService.isGeolocationSupported()) {
      handleLocationError(new Error('Geolocation is not supported by this browser'));
      return;
    }

    safeSetState({ loading: true, error: null });

    try {
      const location = await LocationService.getCurrentLocation(geolocationOptions);
      updateLocation(location);
    } catch (error) {
      handleLocationError(error as Error);
    }
  }, [geolocationOptions, updateLocation, handleLocationError, safeSetState]);

  // Request location with permission handling
  const requestLocationWithPermission = useCallback(async () => {
    safeSetState({ loading: true, error: null });

    try {
      const location = await LocationService.requestLocationPermission();
      updateLocation(location);
    } catch (error) {
      handleLocationError(error as Error);
    }
  }, [updateLocation, handleLocationError, safeSetState]);

  // Refresh location (force new reading)
  const refreshLocation = useCallback(async () => {
    if (!LocationService.isGeolocationSupported()) {
      handleLocationError(new Error('Geolocation is not supported by this browser'));
      return;
    }

    safeSetState({ loading: true, error: null });

    try {
      const location = await LocationService.getCurrentLocation({
        ...geolocationOptions,
        maximumAge: 0 // Force fresh location
      });
      updateLocation(location);
    } catch (error) {
      handleLocationError(error as Error);
    }
  }, [geolocationOptions, updateLocation, handleLocationError, safeSetState]);

  // Clear error
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  // Start watching location
  const startWatching = useCallback(() => {
    if (watchIdRef.current !== null) return; // Already watching

    try {
      watchIdRef.current = LocationService.watchLocation(
        updateLocation,
        geolocationOptions
      );
    } catch (error) {
      handleLocationError(error as Error);
    }
  }, [updateLocation, handleLocationError, geolocationOptions]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      LocationService.stopWatchingLocation(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Effect for initial setup
  useEffect(() => {
    mountedRef.current = true;

    // Check permission on mount
    checkPermission();

    // Get cached location if available
    const cachedLocation = LocationService.getCachedLocation();
    if (cachedLocation) {
      updateLocation(cachedLocation);
    }

    // Request location on mount if requested
    if (requestOnMount) {
      requestLocationWithPermission();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [checkPermission, updateLocation, requestOnMount, requestLocationWithPermission]);

  // Effect for watching location
  useEffect(() => {
    if (watch && state.location) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      stopWatching();
    };
  }, [watch, state.location, startWatching, stopWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  const actions: LocationActions = {
    requestLocation: requestLocationWithPermission,
    clearError,
    refreshLocation,
    checkPermission
  };

  return [state, actions];
}

export default useLocation;