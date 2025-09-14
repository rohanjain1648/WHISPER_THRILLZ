import { describe, it, expect } from '@jest/globals';
import LocationService from '../services/locationService';
import { GeoLocation } from '../types';

describe('LocationService', () => {

  describe('validateLocation', () => {
    it('should validate correct coordinates', () => {
      const location: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: new Date()
      };

      const result = LocationService.validateLocation(location);
      
      expect(result.isValid).toBe(true);
      expect(result.accuracy).toBe('high');
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid latitude', () => {
      const location: GeoLocation = {
        latitude: 91, // Invalid
        longitude: -74.0060,
        accuracy: 10,
        timestamp: new Date()
      };

      const result = LocationService.validateLocation(location);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Latitude must be between -90 and 90 degrees');
    });

    it('should reject invalid longitude', () => {
      const location: GeoLocation = {
        latitude: 40.7128,
        longitude: 181, // Invalid
        accuracy: 10,
        timestamp: new Date()
      };

      const result = LocationService.validateLocation(location);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Longitude must be between -180 and 180 degrees');
    });

    it('should detect null island coordinates', () => {
      const location: GeoLocation = {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        timestamp: new Date()
      };

      const result = LocationService.validateLocation(location);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid coordinates detected (null island)');
    });

    it('should classify accuracy levels correctly', () => {
      const highAccuracy: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 5,
        timestamp: new Date()
      };

      const mediumAccuracy: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 75,
        timestamp: new Date()
      };

      const lowAccuracy: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 150,
        timestamp: new Date()
      };

      expect(LocationService.validateLocation(highAccuracy).accuracy).toBe('high');
      expect(LocationService.validateLocation(mediumAccuracy).accuracy).toBe('medium');
      expect(LocationService.validateLocation(lowAccuracy).accuracy).toBe('low');
    });
  });

  // Note: Database-dependent tests would require MongoDB setup
  // For now, focusing on pure function tests

  describe('calculateDistance', () => {
    it('should calculate distance between two locations', () => {
      const nyc: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 0,
        timestamp: new Date()
      };

      const la: GeoLocation = {
        latitude: 34.0522,
        longitude: -118.2437,
        accuracy: 0,
        timestamp: new Date()
      };

      const distance = LocationService.calculateDistance(nyc, la);

      // Distance between NYC and LA is approximately 3,944 km
      expect(distance).toBeGreaterThan(3900000); // 3,900 km in meters
      expect(distance).toBeLessThan(4000000); // 4,000 km in meters
    });

    it('should return 0 for same location', () => {
      const location: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 0,
        timestamp: new Date()
      };

      const distance = LocationService.calculateDistance(location, location);
      expect(distance).toBe(0);
    });
  });

  describe('isWithinGeofence', () => {
    it('should detect location within geofence', () => {
      const center: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 0,
        timestamp: new Date()
      };

      const nearby: GeoLocation = {
        latitude: 40.7130, // Very close
        longitude: -74.0062,
        accuracy: 0,
        timestamp: new Date()
      };

      const isWithin = LocationService.isWithinGeofence(nearby, center, 1000);
      expect(isWithin).toBe(true);
    });

    it('should detect location outside geofence', () => {
      const center: GeoLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 0,
        timestamp: new Date()
      };

      const faraway: GeoLocation = {
        latitude: 34.0522, // LA
        longitude: -118.2437,
        accuracy: 0,
        timestamp: new Date()
      };

      const isWithin = LocationService.isWithinGeofence(faraway, center, 1000);
      expect(isWithin).toBe(false);
    });
  });

  describe('normalizeCoordinates', () => {
    it('should normalize valid coordinates', () => {
      const location: GeoLocation = {
        latitude: 40.712812345,
        longitude: -74.006012345,
        accuracy: 10,
        timestamp: new Date()
      };

      const normalized = LocationService.normalizeCoordinates(location);

      expect(normalized).toEqual([-74.006012, 40.712812]);
    });

    it('should reject invalid coordinates', () => {
      const invalidLocation: GeoLocation = {
        latitude: 91,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: new Date()
      };

      expect(() => LocationService.normalizeCoordinates(invalidLocation))
        .toThrow('Cannot normalize invalid coordinates');
    });
  });

  describe('coordinatesToGeoLocation', () => {
    it('should convert coordinates to GeoLocation format', () => {
      const coordinates: [number, number] = [-74.0060, 40.7128];
      
      const geoLocation = LocationService.coordinatesToGeoLocation(coordinates);

      expect(geoLocation).toEqual({
        longitude: -74.0060,
        latitude: 40.7128
      });
    });
  });
});