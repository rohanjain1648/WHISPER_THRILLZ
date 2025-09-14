// Export all models
export { User, IUser, MoodEmbedding, GeoLocation, UserPreferences, UserProfile, UserRelationships, NotificationSettings } from './User';
export { Message, IMessage, MessageReaction } from './Message';
export { Relationship, IRelationship, BondingMetrics, JournalEntry, SharedJournal, RelationshipPreferences } from './Relationship';
export { Playlist, IPlaylist, PlaylistTrack, SpotifyIntegration, PlaylistMetadata } from './Playlist';

import mongoose from 'mongoose';
import { User } from './User';
import { Message } from './Message';
import { Relationship } from './Relationship';
import { Playlist } from './Playlist';

/**
 * Initialize database indexes for optimal query performance
 * This function should be called after database connection is established
 */
export async function initializeIndexes(): Promise<void> {
  try {
    console.log('Initializing database indexes...');

    // User model indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ 'profile.location': '2dsphere' });
    await User.collection.createIndex({ lastActive: 1 });
    await User.collection.createIndex({ createdAt: 1 });
    await User.collection.createIndex({ 'moodHistory.timestamp': 1 });

    // Message model indexes
    await Message.collection.createIndex({ location: '2dsphere' });
    await Message.collection.createIndex({ 'location': '2dsphere', 'moderationStatus': 1 });
    await Message.collection.createIndex({ 'location': '2dsphere', 'createdAt': -1 });
    await Message.collection.createIndex({ 'location': '2dsphere', 'isEphemeral': 1, 'expiresAt': 1 });
    await Message.collection.createIndex({ authorId: 1, createdAt: -1 });
    await Message.collection.createIndex({ moderationStatus: 1, createdAt: -1 });
    await Message.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await Message.collection.createIndex({ 'moodEmbedding.sentiment': 1 });
    await Message.collection.createIndex({ 'moodEmbedding.emotions.joy': 1 });

    // Relationship model indexes
    await Relationship.collection.createIndex({ users: 1 });
    await Relationship.collection.createIndex({ users: 1, type: 1 });
    await Relationship.collection.createIndex({ users: 1, status: 1 });
    await Relationship.collection.createIndex({ type: 1, status: 1 });
    await Relationship.collection.createIndex({ lastInteraction: -1 });
    await Relationship.collection.createIndex({ createdAt: -1 });
    await Relationship.collection.createIndex({ 'sharedJournal.entries.timestamp': -1 });

    // Playlist model indexes
    await Playlist.collection.createIndex({ createdBy: 1, createdAt: -1 });
    await Playlist.collection.createIndex({ collaborators: 1 });
    await Playlist.collection.createIndex({ relationshipId: 1 });
    await Playlist.collection.createIndex({ isShared: 1, createdAt: -1 });
    await Playlist.collection.createIndex({ tags: 1 });
    await Playlist.collection.createIndex({ 'moodContext.sentiment': 1 });
    await Playlist.collection.createIndex({ 'moodContext.emotions.joy': 1 });
    await Playlist.collection.createIndex({ 'metadata.genre': 1 });
    await Playlist.collection.createIndex({ 'metadata.energy': 1 });
    await Playlist.collection.createIndex({ 'metadata.valence': 1 });
    await Playlist.collection.createIndex({ 'spotifyIntegration.playlistId': 1 });
    await Playlist.collection.createIndex({ playCount: -1 });
    await Playlist.collection.createIndex({ lastPlayedAt: -1 });

    // Compound indexes
    await Playlist.collection.createIndex({ createdBy: 1, isShared: 1, createdAt: -1 });
    await Playlist.collection.createIndex({ relationshipId: 1, createdAt: -1 });

    console.log('Database indexes initialized successfully');
  } catch (error) {
    console.error('Error initializing database indexes:', error);
    throw error;
  }
}

/**
 * Get database statistics for monitoring
 */
export async function getDatabaseStats(): Promise<any> {
  try {
    const stats = {
      users: await User.countDocuments(),
      messages: await Message.countDocuments(),
      relationships: await Relationship.countDocuments(),
      playlists: await Playlist.countDocuments(),
      activeUsers: await User.countDocuments({ 
        lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      }),
      approvedMessages: await Message.countDocuments({ moderationStatus: 'approved' }),
      activeRelationships: await Relationship.countDocuments({ status: 'active' }),
      sharedPlaylists: await Playlist.countDocuments({ isShared: true })
    };

    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}

/**
 * Cleanup expired data
 */
export async function cleanupExpiredData(): Promise<void> {
  try {
    console.log('Starting cleanup of expired data...');

    // Remove expired ephemeral messages (MongoDB TTL should handle this, but manual cleanup as backup)
    const expiredMessages = await Message.deleteMany({
      isEphemeral: true,
      expiresAt: { $lt: new Date() }
    });

    // Clean up old mood history (keep only last 365 days)
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    await User.updateMany(
      {},
      {
        $pull: {
          moodHistory: {
            timestamp: { $lt: oneYearAgo }
          }
        }
      }
    );

    console.log(`Cleanup completed. Removed ${expiredMessages.deletedCount} expired messages`);
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

// Export models for use in other parts of the application
export const models = {
  User,
  Message,
  Relationship,
  Playlist
};

export default models;