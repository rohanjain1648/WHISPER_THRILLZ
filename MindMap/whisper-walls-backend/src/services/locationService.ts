import { Message, IMessage } from '../models/Message';
import { GeoLocation } from '../types';

export interface LocationValidationResult {
  isValid: boolean;
  accuracy: 'high' | 'medium' | 'low';
  errors: string[];
}

export interface LocationInsights {
  messageCount: number;
  averageMood: {
    sentiment: number;
    dominantEmotion: string;
  };
  popularTimes: string[];
  nearbyLocations: GeoLocation[];
}

export interface NearbyMessagesOptions {
  limit?: number;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  includeExpired?: boolean;
  excludeDiscoveredBy?: string;
  moodFilter?: {
    minSentiment?: number;
    maxSentiment?: number;
    emotions?: string[];
  };
}

export class LocationService {
  /**
   * Validate location coordinates and accuracy
   */
  static validateLocation(location: GeoLocation): LocationValidationResult {
    const errors: string[] = [];
    let accuracy: 'high' | 'medium' | 'low' = 'high';

    // Validate latitude
    if (location.latitude < -90 || location.latitude > 90) {
      errors.push('Latitude must be between -90 and 90 degrees');
    }

    // Validate longitude
    if (location.longitude < -180 || location.longitude > 180) {
      errors.push('Longitude must be between -180 and 180 degrees');
    }

    // Validate accuracy
    if (location.accuracy > 100) {
      accuracy = 'low';
      errors.push('Location accuracy is low (>100m). Consider requesting higher precision.');
    } else if (location.accuracy > 50) {
      accuracy = 'medium';
    }

    // Check if coordinates are realistic (not null island)
    if (location.latitude === 0 && location.longitude === 0) {
      errors.push('Invalid coordinates detected (null island)');
    }

    return {
      isValid: errors.length === 0,
      accuracy,
      errors
    };
  }

  /**
   * Find nearby messages within a specified radius
   */
  static async findNearbyMessages(
    location: GeoLocation,
    radiusInMeters: number = 1000,
    options: NearbyMessagesOptions = {}
  ): Promise<IMessage[]> {
    // Validate location first
    const validation = this.validateLocation(location);
    if (!validation.isValid) {
      throw new Error(`Invalid location: ${validation.errors.join(', ')}`);
    }

    // Build query options
    const queryOptions = {
      limit: options.limit || 50,
      moderationStatus: options.moderationStatus || 'approved',
      includeExpired: options.includeExpired || false
    };

    // Use the static method from Message model
    let messages = await (Message as any).findNearby(
      location.longitude,
      location.latitude,
      radiusInMeters,
      queryOptions
    );

    // Apply additional filters
    if (options.excludeDiscoveredBy) {
      messages = messages.filter((msg: IMessage) => 
        !msg.discoveredBy.some(id => id.toString() === options.excludeDiscoveredBy)
      );
    }

    if (options.moodFilter) {
      messages = messages.filter((msg: IMessage) => {
        const moodFilter = options.moodFilter!;
        
        // Filter by sentiment range
        if (moodFilter.minSentiment !== undefined && 
            msg.moodEmbedding.sentiment < moodFilter.minSentiment) {
          return false;
        }
        
        if (moodFilter.maxSentiment !== undefined && 
            msg.moodEmbedding.sentiment > moodFilter.maxSentiment) {
          return false;
        }

        // Filter by dominant emotions
        if (moodFilter.emotions && moodFilter.emotions.length > 0) {
          const dominantEmotion = this.getDominantEmotion(msg.moodEmbedding);
          return moodFilter.emotions.includes(dominantEmotion);
        }

        return true;
      });
    }

    return messages;
  }

  /**
   * Create a location-based message
   */
  static async createLocationMessage(messageData: {
    content: string;
    location: GeoLocation;
    moodEmbedding: any;
    authorId?: string;
    isAnonymous?: boolean;
    isEphemeral?: boolean;
  }): Promise<IMessage> {
    // Validate location
    const validation = this.validateLocation(messageData.location);
    if (!validation.isValid) {
      throw new Error(`Invalid location: ${validation.errors.join(', ')}`);
    }

    // Create message with geospatial data
    const message = new Message({
      content: messageData.content,
      location: {
        type: 'Point',
        coordinates: [messageData.location.longitude, messageData.location.latitude]
      },
      moodEmbedding: messageData.moodEmbedding,
      authorId: messageData.authorId,
      isAnonymous: messageData.isAnonymous ?? true,
      isEphemeral: messageData.isEphemeral ?? true
    });

    return await message.save();
  }

  /**
   * Get location insights for analytics
   */
  static async getLocationInsights(
    location: GeoLocation,
    radiusInMeters: number = 1000
  ): Promise<LocationInsights> {
    const messages = await this.findNearbyMessages(location, radiusInMeters, {
      includeExpired: true,
      limit: 1000
    });

    if (messages.length === 0) {
      return {
        messageCount: 0,
        averageMood: { sentiment: 0, dominantEmotion: 'neutral' },
        popularTimes: [],
        nearbyLocations: []
      };
    }

    // Calculate average mood
    const totalSentiment = messages.reduce((sum, msg) => sum + msg.moodEmbedding.sentiment, 0);
    const averageSentiment = totalSentiment / messages.length;

    // Find dominant emotion across all messages
    const emotionCounts: { [key: string]: number } = {};
    messages.forEach(msg => {
      const dominantEmotion = this.getDominantEmotion(msg.moodEmbedding);
      emotionCounts[dominantEmotion] = (emotionCounts[dominantEmotion] || 0) + 1;
    });

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    // Analyze popular times (simplified - by hour of day)
    const hourCounts: { [key: number]: number } = {};
    messages.forEach(msg => {
      const hour = new Date(msg.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const popularTimes = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    return {
      messageCount: messages.length,
      averageMood: {
        sentiment: averageSentiment,
        dominantEmotion
      },
      popularTimes,
      nearbyLocations: [] // Could be expanded to find clusters
    };
  }

  /**
   * Calculate distance between two locations in meters
   */
  static calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = loc1.latitude * Math.PI / 180;
    const φ2 = loc2.latitude * Math.PI / 180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Check if a location is within a geofenced area
   */
  static isWithinGeofence(
    location: GeoLocation,
    center: GeoLocation,
    radiusInMeters: number
  ): boolean {
    const distance = this.calculateDistance(location, center);
    return distance <= radiusInMeters;
  }

  /**
   * Get the dominant emotion from mood embedding
   */
  private static getDominantEmotion(moodEmbedding: any): string {
    const emotions = moodEmbedding.emotions;
    let maxEmotion = 'neutral';
    let maxValue = 0;

    Object.entries(emotions).forEach(([emotion, value]) => {
      if (typeof value === 'number' && value > maxValue) {
        maxValue = value;
        maxEmotion = emotion;
      }
    });

    return maxEmotion;
  }

  /**
   * Validate and normalize coordinates for database storage
   */
  static normalizeCoordinates(location: GeoLocation): [number, number] {
    const validation = this.validateLocation(location);
    if (!validation.isValid) {
      throw new Error(`Cannot normalize invalid coordinates: ${validation.errors.join(', ')}`);
    }

    // MongoDB expects [longitude, latitude] format
    return [
      Math.round(location.longitude * 1000000) / 1000000, // 6 decimal places precision
      Math.round(location.latitude * 1000000) / 1000000
    ];
  }

  /**
   * Convert coordinates from database format to GeoLocation
   */
  static coordinatesToGeoLocation(coordinates: [number, number]): Omit<GeoLocation, 'accuracy' | 'timestamp'> {
    return {
      longitude: coordinates[0],
      latitude: coordinates[1]
    };
  }
}

export default LocationService;