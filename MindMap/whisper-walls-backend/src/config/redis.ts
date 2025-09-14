import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType | null> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD || undefined,
    });
    
    redisClient.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
    
    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
    });
    
    redisClient.on('disconnect', () => {
      console.log('⚠️ Redis disconnected');
    });
    
    await redisClient.connect();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (redisClient) {
        await redisClient.quit();
        console.log('🔌 Redis connection closed through app termination');
      }
    });
    
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    // Don't throw error for Redis as it's used for caching
    // The app should still work without Redis
    console.log('⚠️ Continuing without Redis cache');
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export default redisClient;