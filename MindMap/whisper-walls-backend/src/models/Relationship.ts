import mongoose, { Document, Schema } from 'mongoose';

export interface BondingMetrics {
  closeness: number; // 0-100
  empathy: number; // 0-100
  trust: number; // 0-100
  communicationFrequency: number;
  sharedActivities: number;
}

export interface JournalEntry {
  id: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  moodContext?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  timestamp: Date;
  isShared: boolean;
}

export interface SharedJournal {
  entries: JournalEntry[];
  memoryLog: string[];
}

export interface RelationshipPreferences {
  playlistSharing: boolean;
  moodBlending: boolean;
  jointReflections: boolean;
}

export interface IRelationship extends Document {
  users: mongoose.Types.ObjectId[];
  type: 'couple' | 'friends' | 'family';
  bondingMetrics: BondingMetrics;
  sharedJournal: SharedJournal;
  preferences: RelationshipPreferences;
  status: 'pending' | 'active' | 'paused' | 'ended';
  initiatedBy: mongoose.Types.ObjectId;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  addJournalEntry(content: string, authorId: mongoose.Types.ObjectId, moodContext?: any): Promise<IRelationship>;
  updateBondingMetrics(metrics: Partial<BondingMetrics>): Promise<IRelationship>;
  addMemoryLog(memory: string): Promise<IRelationship>;
  includesUser(userId: mongoose.Types.ObjectId): boolean;
  getOtherUsers(userId: mongoose.Types.ObjectId): mongoose.Types.ObjectId[];
}

// Bonding Metrics Schema
const BondingMetricsSchema = new Schema<BondingMetrics>({
  closeness: { 
    type: Number, 
    default: 50, 
    min: 0, 
    max: 100 
  },
  empathy: { 
    type: Number, 
    default: 50, 
    min: 0, 
    max: 100 
  },
  trust: { 
    type: Number, 
    default: 50, 
    min: 0, 
    max: 100 
  },
  communicationFrequency: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  sharedActivities: { 
    type: Number, 
    default: 0, 
    min: 0 
  }
}, { _id: false });

// Journal Entry Schema
const JournalEntrySchema = new Schema<JournalEntry>({
  id: { 
    type: String, 
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  moodContext: {
    joy: { type: Number, min: 0, max: 1 },
    sadness: { type: Number, min: 0, max: 1 },
    anger: { type: Number, min: 0, max: 1 },
    fear: { type: Number, min: 0, max: 1 },
    surprise: { type: Number, min: 0, max: 1 },
    disgust: { type: Number, min: 0, max: 1 },
    trust: { type: Number, min: 0, max: 1 },
    anticipation: { type: Number, min: 0, max: 1 }
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  isShared: { 
    type: Boolean, 
    default: true 
  }
}, { _id: false });

// Shared Journal Schema
const SharedJournalSchema = new Schema<SharedJournal>({
  entries: [JournalEntrySchema],
  memoryLog: [{ 
    type: String, 
    maxlength: 500 
  }]
}, { _id: false });

// Relationship Preferences Schema
const RelationshipPreferencesSchema = new Schema<RelationshipPreferences>({
  playlistSharing: { 
    type: Boolean, 
    default: true 
  },
  moodBlending: { 
    type: Boolean, 
    default: true 
  },
  jointReflections: { 
    type: Boolean, 
    default: true 
  }
}, { _id: false });

// Main Relationship Schema
const RelationshipSchema = new Schema<IRelationship>({
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['couple', 'friends', 'family'],
    required: true
  },
  bondingMetrics: {
    type: BondingMetricsSchema,
    default: () => ({})
  },
  sharedJournal: {
    type: SharedJournalSchema,
    default: () => ({ entries: [], memoryLog: [] })
  },
  preferences: {
    type: RelationshipPreferencesSchema,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'ended'],
    default: 'pending'
  },
  initiatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for performance
RelationshipSchema.index({ users: 1 });
RelationshipSchema.index({ users: 1, type: 1 });
RelationshipSchema.index({ users: 1, status: 1 });
RelationshipSchema.index({ type: 1, status: 1 });
RelationshipSchema.index({ lastInteraction: -1 });
RelationshipSchema.index({ createdAt: -1 });
RelationshipSchema.index({ 'sharedJournal.entries.timestamp': -1 });

// Validation: Ensure at least 2 users and max based on type
RelationshipSchema.pre('save', function(next) {
  if (this.users.length < 2) {
    return next(new Error('Relationship must have at least 2 users'));
  }
  
  if (this.type === 'couple' && this.users.length > 2) {
    return next(new Error('Couple relationship can only have 2 users'));
  }
  
  if (this.users.length > 10) {
    return next(new Error('Relationship cannot have more than 10 users'));
  }
  
  next();
});

// Static method to find relationships for a user
RelationshipSchema.statics.findForUser = function(
  userId: mongoose.Types.ObjectId,
  type?: 'couple' | 'friends' | 'family',
  status?: 'pending' | 'active' | 'paused' | 'ended'
) {
  const query: any = { users: userId };
  
  if (type) {
    query.type = type;
  }
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('users', 'profile.displayName profile.location email')
    .sort({ lastInteraction: -1 });
};

// Static method to find active couples for a user
RelationshipSchema.statics.findActiveCouples = function(userId: mongoose.Types.ObjectId) {
  return this.find({
    users: userId,
    type: 'couple',
    status: 'active'
  }).populate('users', 'profile.displayName profile.location email');
};

// Instance method to add journal entry
RelationshipSchema.methods.addJournalEntry = function(
  content: string,
  authorId: mongoose.Types.ObjectId,
  moodContext?: any
) {
  const entry: JournalEntry = {
    id: new mongoose.Types.ObjectId().toString(),
    content,
    authorId,
    moodContext,
    timestamp: new Date(),
    isShared: true
  };
  
  this.sharedJournal.entries.push(entry);
  this.lastInteraction = new Date();
  
  return this.save();
};

// Instance method to update bonding metrics
RelationshipSchema.methods.updateBondingMetrics = function(
  metrics: Partial<BondingMetrics>
) {
  Object.assign(this.bondingMetrics, metrics);
  this.lastInteraction = new Date();
  return this.save();
};

// Instance method to add memory log entry
RelationshipSchema.methods.addMemoryLog = function(memory: string) {
  this.sharedJournal.memoryLog.push(memory);
  this.lastInteraction = new Date();
  return this.save();
};

// Instance method to check if user is part of relationship
RelationshipSchema.methods.includesUser = function(userId: mongoose.Types.ObjectId) {
  return this.users.some((user: mongoose.Types.ObjectId) => user.equals(userId));
};

// Instance method to get other users in relationship
RelationshipSchema.methods.getOtherUsers = function(userId: mongoose.Types.ObjectId) {
  return this.users.filter((user: mongoose.Types.ObjectId) => !user.equals(userId));
};

export const Relationship = mongoose.model<IRelationship>('Relationship', RelationshipSchema);
export default Relationship;