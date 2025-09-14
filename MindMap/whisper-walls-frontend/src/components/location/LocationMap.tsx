import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { GeoLocation, WhisperNote } from '../../types';
import { useLocationContext } from '../../contexts/LocationContext';

interface LocationMapProps {
  messages?: WhisperNote[];
  showUserLocation?: boolean;
  showMessages?: boolean;
  onMessageClick?: (message: WhisperNote) => void;
  onLocationClick?: (location: GeoLocation) => void;
  className?: string;
  height?: string;
}

// Simple map implementation without Google Maps API for now
// This can be enhanced with actual Google Maps integration later
export function LocationMap({
  messages = [],
  showUserLocation = true,
  showMessages = true,
  onMessageClick,
  onLocationClick,
  className = '',
  height = '400px'
}: LocationMapProps) {
  const { location, accuracy } = useLocationContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState<GeoLocation | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');

  // Update center when user location changes
  useEffect(() => {
    if (location && !center) {
      setCenter(location);
    }
  }, [location, center]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 1));
  };

  const handleRecenter = () => {
    if (location) {
      setCenter(location);
    }
  };

  const toggleMapStyle = () => {
    setMapStyle(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onLocationClick) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simple coordinate calculation (this would be more complex with real maps)
    // For now, just use the current location as a placeholder
    if (location) {
      const clickedLocation: GeoLocation = {
        latitude: location.latitude + (y - rect.height / 2) * 0.0001,
        longitude: location.longitude + (x - rect.width / 2) * 0.0001,
        accuracy: 0,
        timestamp: new Date()
      };
      onLocationClick(clickedLocation);
    }
  };

  // Calculate relative positions for messages (simplified)
  const getMessagePosition = (messageLocation: GeoLocation) => {
    if (!center) return { x: 0, y: 0 };

    // Simple calculation - in real implementation, this would use proper map projection
    const latDiff = messageLocation.latitude - center.latitude;
    const lngDiff = messageLocation.longitude - center.longitude;
    
    return {
      x: 50 + (lngDiff * 1000000 / zoom), // Simplified positioning
      y: 50 - (latDiff * 1000000 / zoom)
    };
  };

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {/* Map Container */}
      <div
        ref={mapRef}
        onClick={handleMapClick}
        className={`w-full h-full cursor-crosshair relative ${
          mapStyle === 'satellite' 
            ? 'bg-gradient-to-br from-green-800 via-green-600 to-blue-800' 
            : 'bg-gradient-to-br from-green-100 via-blue-50 to-blue-100'
        }`}
      >
        {/* Grid overlay for standard map */}
        {mapStyle === 'standard' && (
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* User Location */}
        {showUserLocation && location && (
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '50%' }}>
            {/* Accuracy circle */}
            <div 
              className="absolute rounded-full bg-blue-200 opacity-30 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: Math.max(20, Math.min(100, accuracy === 'High' ? 20 : accuracy === 'Medium' ? 40 : 80)),
                height: Math.max(20, Math.min(100, accuracy === 'High' ? 20 : accuracy === 'Medium' ? 40 : 80)),
                left: '50%',
                top: '50%'
              }}
            />
            
            {/* User marker */}
            <div className="relative z-10 bg-blue-600 rounded-full p-2 shadow-lg border-2 border-white">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              You are here
            </div>
          </div>
        )}

        {/* Message Markers */}
        {showMessages && messages.map((message) => {
          const position = getMessagePosition(message.location);
          return (
            <div
              key={message.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{ 
                left: `${Math.max(5, Math.min(95, position.x))}%`, 
                top: `${Math.max(5, Math.min(95, position.y))}%` 
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMessageClick?.(message);
              }}
            >
              {/* Message marker */}
              <div className="relative">
                <div className={`rounded-full p-2 shadow-lg border-2 border-white transition-transform hover:scale-110 ${
                  message.moodEmbedding.sentiment > 0 
                    ? 'bg-green-500' 
                    : message.moodEmbedding.sentiment < 0 
                    ? 'bg-red-500' 
                    : 'bg-yellow-500'
                }`}>
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  {message.content.substring(0, 50)}...
                </div>
              </div>
            </div>
          );
        })}

        {/* No location overlay */}
        {!location && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Location access required</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-white shadow-md rounded-md p-2 hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4 text-gray-600" />
        </button>
        
        <button
          onClick={handleZoomOut}
          className="bg-white shadow-md rounded-md p-2 hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4 text-gray-600" />
        </button>
        
        <button
          onClick={toggleMapStyle}
          className="bg-white shadow-md rounded-md p-2 hover:bg-gray-50 transition-colors"
          title="Toggle Map Style"
        >
          <Layers className="h-4 w-4 text-gray-600" />
        </button>
        
        {location && (
          <button
            onClick={handleRecenter}
            className="bg-white shadow-md rounded-md p-2 hover:bg-gray-50 transition-colors"
            title="Center on Location"
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Map Info */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-md px-3 py-2 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Zoom: {zoom}</span>
          {location && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      {showMessages && messages.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-md px-3 py-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Positive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Neutral</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Negative</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationMap;