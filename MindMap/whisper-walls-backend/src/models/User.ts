import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaces based on the design document
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

export interface MoodEmbedding {
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  sentiment: number; // -1 to 1
  intensity: number; // 0 to 1
  timestamp: Date;
}

export interface NotificationSettings {
  nearbyMessages: boolean;
  moodInsights: boolean;
  playlistUpdates: boolean;
  relationshipUpdates: boolean;
  email: boolean;
  push: boolean;
}

export interface UserPreferences {
  musicGenres: string[];
  discoveryRadius: number;
  privacyLevel: 'open' | 'selective' | 'private';
  notificationSettings: NotificationSettings;
}

export interface UserProfile {
  displayName?: string;
  age?: number;
  bio?: string;
  interests: string[];
  location?: GeoLocation;
}

export interface UserRelationships {
  couples: mongoose.Types.ObjectId[];
  friends: mongoose.Types.ObjectId[];
  blocked: mongoose.Types.ObjectId[];
}

export interface IUser extends Document {
  email: string;
  hashedPassword: string;
  profile: UserProfile;
  moodHistory: MoodEmbedding[];
  preferences: UserPreferences;
  relationships: UserRelationships;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

// Notification Settings Schema
const NotificationSettingsSchema = new Schema<NotificationSettings>({
  nearbyMessages: { type: Boolean, default: true },
  moodInsights: { type: Boolean, default: true },
  playlistUpdates: { type: Boolean, default: true },
  relationshipUpdates: { type: Boolean, default: true },
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: false }
}, { _id: false });

// User Preferences Schema
const UserPreferencesSchema = new Schema<UserPreferences>({
  musicGenres: [{ type: String }],
  discoveryRadius: { type: Number, default: 1000, min: 100, max: 10000 },
  privacyLevel: { 
    type: String, 
    enum: ['open', 'selective', 'private'], 
    default: 'selective' 
  },
  notificationSettings: { type: NotificationSettingsSchema, default: () => ({}) }
}, { _id: false });

// GeoLocation Schema
const GeoLocationSchema = new Schema<GeoLocation>({
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  accuracy: { type: Number, min: 0 },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

// User Profile Schema
const UserProfileSchema = new Schema<UserProfile>({
  displayName: { 
    type: String, 
    trim: true, 
    minlength: 2, 
    maxlength: 50 
  },
  age: { 
    type: Number, 
    min: 18, 
    max: 120 
  },
  bio: { 
    type: String, 
    trim: true, 
    maxlength: 500 
  },
  interests: [{ 
    type: String, 
    trim: true, 
    maxlength: 50 
  }],
  location: GeoLocationSchema
}, { _id: false });

// Mood Embedding Schema
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

// User Relationships Schema
const UserRelationshipsSchema = new Schema<UserRelationships>({
  couples: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  blocked: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { _id: false });

// Main User Schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  hashedPassword: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  profile: {
    type: UserProfileSchema,
    default: () => ({ interests: [] })
  },
  moodHistory: [MoodEmbeddingSchema],
  preferences: {
    type: UserPreferencesSchema,
    default: () => ({})
  },
  relationships: {
    type: UserRelationshipsSchema,
    default: () => ({ couples: [], friends: [], blocked: [] })
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).hashedPassword;
      delete (ret as any).emailVerificationToken;
      delete (ret as any).passwordResetToken;
      delete (ret as any).passwordResetExpires;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ 'profile.location': '2dsphere' });
UserSchema.index({ lastActive: 1 });
UserSchema.index({ createdAt: 1 });
UserSchema.index({ 'moodHistory.timestamp': 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('hashedPassword')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

// Method to generate auth token (will be implemented in auth service)
UserSchema.methods.generateAuthToken = function(): string {
  // This will be implemented in the auth service
  return '';
};

// Update lastActive on certain operations
UserSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  this.set({ lastActive: new Date() });
});

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;