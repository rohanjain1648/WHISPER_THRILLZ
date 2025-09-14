import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Check if MongoDB URI is provided
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('⚠️ No MongoDB URI provided. Running in development mode without database.');
      return;
    }
    
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || 'whisper-walls',
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.log('⚠️ Continuing without database connection...');
  }
};

export default mongoose;