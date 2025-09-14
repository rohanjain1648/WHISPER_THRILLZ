import mongoose, { Document, Schema } from 'mongoose';
import { MoodEmbedding } from './User';

export interface MessageReaction {
  userId: mongoose.Types.ObjectId;
  type: 'heart' | 'hug' | 'smile' | 'tear';
  timestamp: Date;
}

export interface IMessage extends Document {
  content: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  moodEmbedding: MoodEmbedding;
  authorId?: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  isEphemeral: boolean;
  expiresAt?: Date;
  discoveredBy: mongoose.Types.ObjectId[];
  reactions: MessageReaction[];
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  addReaction(userId: mongoose.Types.ObjectId, reactionType: 'heart' | 'hug' | 'smile' | 'tear'): Promise<IMessage>;
  markDiscoveredBy(userId: mongoose.Types.ObjectId): Promise<IMessage>;
}

// Message Reaction Schema
const MessageReactionSchema = new Schema<MessageReaction>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['heart', 'hug', 'smile', 'tear'], 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

// Mood Embedding Schema (reused from User model)
const MoodEmbeddingSchema = new Schema<MoodEmbedding>({
  emotions: {
    joy: { type: Number, required: true, min: 0, max: 1 },
    sadness: { type: Number, required: true, min: 0, max: 1 },
    anger: { type: Number, required: true, min: 0, max: 1 },
    fear: { type: Number, required: true, min: 0, max: 1 },
    surprise: { type: Number, required: true, min: 0, max: 1 },
    disgust: { type: Number, required: true, min: 0, max: 1 },
    trust: { type: Number, required: true, min: 0, max: 1 },
    anticipation: { type: Number, required: true, min: 0, max: 1 }
  },
  sentiment: { type: Number, required: true, min: -1, max: 1 },
  intensity: { type: Number, required: true, min: 0, max: 1 },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

// Main Message Schema
const MessageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    minlength: [1, 'Message cannot be empty'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coordinates: number[]) {
          return coordinates.length === 2 &&
                 coordinates[0] >= -180 && coordinates[0] <= 180 && // longitude
                 coordinates[1] >= -90 && coordinates[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
      }
    }
  },
  moodEmbedding: {
    type: MoodEmbeddingSchema,
    required: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: IMessage) {
      return !this.isAnonymous;
    }
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  isEphemeral: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: function(this: IMessage) {
      if (this.isEphemeral) {
        // Default to 24 hours from creation
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      return undefined;
    }
  },
  discoveredBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [MessageReactionSchema],
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Don't expose authorId for anonymous messages
      if (ret.isAnonymous) {
        delete (ret as any).authorId;
      }
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Geospatial index for location-based queries
MessageSchema.index({ location: '2dsphere' });

// Compound indexes for performance
MessageSchema.index({ 'location': '2dsphere', 'moderationStatus': 1 });
MessageSchema.index({ 'location': '2dsphere', 'createdAt': -1 });
MessageSchema.index({ 'location': '2dsphere', 'isEphemeral': 1, 'expiresAt': 1 });

// Other performance indexes
MessageSchema.index({ authorId: 1, createdAt: -1 });
MessageSchema.index({ moderationStatus: 1, createdAt: -1 });
MessageSchema.index({ expiresAt: 1 }); // For TTL cleanup
MessageSchema.index({ 'moodEmbedding.sentiment': 1 });
MessageSchema.index({ 'moodEmbedding.emotions.joy': 1 });

// TTL index for automatic cleanup of expired ephemeral messages (handled by MongoDB TTL)
// MessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set expiration for ephemeral messages
MessageSchema.pre('save', function(next) {
  if (this.isEphemeral && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

// Static method to find nearby messages
MessageSchema.statics.findNearby = function(
  longitude: number, 
  latitude: number, 
  radiusInMeters: number = 1000,
  options: {
    limit?: number;
    moderationStatus?: string;
    includeExpired?: boolean;
  } = {}
) {
  const query: any = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInMeters
      }
    }
  };

  // Filter by moderation status
  if (options.moderationStatus) {
    query.moderationStatus = options.moderationStatus;
  } else {
    query.moderationStatus = 'approved';
  }

  // Filter out expired messages unless explicitly requested
  if (!options.includeExpired) {
    query.$or = [
      { isEphemeral: false },
      { isEphemeral: true, expiresAt: { $gt: new Date() } }
    ];
  }

  return this.find(query)
    .limit(options.limit || 50)
    .sort({ createdAt: -1 })
    .populate('reactions.userId', 'profile.displayName');
};

// Instance method to add reaction
MessageSchema.methods.addReaction = function(
  userId: mongoose.Types.ObjectId, 
  reactionType: 'heart' | 'hug' | 'smile' | 'tear'
) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    (reaction: MessageReaction) => !reaction.userId.equals(userId)
  );
  
  // Add new reaction
  this.reactions.push({
    userId,
    type: reactionType,
    timestamp: new Date()
  });
  
  return this.save();
};

// Instance method to mark as discovered by user
MessageSchema.methods.markDiscoveredBy = function(userId: mongoose.Types.ObjectId) {
  if (!this.discoveredBy.includes(userId)) {
    this.discoveredBy.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;