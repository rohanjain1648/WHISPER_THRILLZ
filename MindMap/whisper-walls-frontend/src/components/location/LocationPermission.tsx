import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useLocationContext } from '../../contexts/LocationContext';

interface LocationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  showAccuracy?: boolean;
  className?: string;
}

export function LocationPermission({
  onPermissionGranted,
  onPermissionDenied,
  showAccuracy = true,
  className = ''
}: LocationPermissionProps) {
  const {
    location,
    loading,
    error,
    permission,
    accuracy,
    isAccurate,
    requestLocation,
    clearError,
    checkPermission,
    isLocationServiceAvailable
  } = useLocationContext();

  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  // Handle permission changes
  useEffect(() => {
    if (permission?.granted && location && onPermissionGranted) {
      onPermissionGranted();
    } else if (permission?.denied && onPermissionDenied) {
      onPermissionDenied();
    }
  }, [permission, location, onPermissionGranted, onPermissionDenied]);

  const handleRequestLocation = async () => {
    setHasRequestedPermission(true);
    clearError();
    await requestLocation();
  };

  const handleRetryPermission = async () => {
    clearError();
    await checkPermission();
    if (!permission?.denied) {
      await requestLocation();
    }
  };

  // If geolocation is not supported
  if (!isLocationServiceAvailable) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-red-800">
              Location Not Supported
            </h3>
            <p className="text-red-600 mt-1">
              Your browser doesn't support location services. Please use a modern browser to discover nearby whispers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If permission is denied
  if (permission?.denied) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-amber-800">
              Location Access Denied
            </h3>
            <p className="text-amber-600 mt-1">
              We need location access to show you nearby whispers. Please enable location services in your browser settings.
            </p>
            <div className="mt-4 space-y-2 text-sm text-amber-700">
              <p><strong>To enable location access:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Click the location icon in your browser's address bar</li>
                <li>Select "Allow" for location access</li>
                <li>Refresh the page if needed</li>
              </ul>
            </div>
            <button
              onClick={handleRetryPermission}
              className="mt-4 inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If location is granted and available
  if (permission?.granted && location) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-green-800">
              Location Access Granted
            </h3>
            <p className="text-green-600 mt-1">
              Great! We can now show you nearby whispers and help you leave your own.
            </p>
            
            {showAccuracy && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Location Accuracy:</span>
                  <span className={`font-medium ${
                    isAccurate ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {accuracy} ({Math.round(location.accuracy)}m)
                  </span>
                </div>
                
                {!isAccurate && (
                  <div className="bg-amber-100 border border-amber-200 rounded p-3">
                    <p className="text-sm text-amber-700">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Location accuracy is low. For better whisper discovery, try moving to an area with better GPS signal.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If we have an error
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-800">
              Location Error
            </h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={handleRequestLocation}
              disabled={loading}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If loading
  if (loading) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 text-blue-500 animate-spin flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-blue-800">
              Getting Your Location...
            </h3>
            <p className="text-blue-600 mt-1">
              Please wait while we determine your current location.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - request permission
  return (
    <div className={`bg-purple-50 border border-purple-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-3">
        <MapPin className="h-6 w-6 text-purple-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-purple-800">
            Discover Nearby Whispers
          </h3>
          <p className="text-purple-600 mt-1">
            Allow location access to find heartfelt messages left by others near you and share your own whispers with the world.
          </p>
          
          <div className="mt-4 space-y-2 text-sm text-purple-700">
            <p><strong>With location access, you can:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Discover anonymous messages left at nearby locations</li>
              <li>Leave your own whispers tied to special places</li>
              <li>See mood insights for different areas</li>
              <li>Connect with others through location-based experiences</li>
            </ul>
          </div>

          <button
            onClick={handleRequestLocation}
            disabled={loading}
            className="mt-6 inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <MapPin className="h-5 w-5 mr-2" />
            )}
            Enable Location Access
          </button>

          {hasRequestedPermission && (
            <p className="mt-3 text-sm text-purple-600">
              If you don't see a permission prompt, check your browser's address bar for a location icon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationPermission;