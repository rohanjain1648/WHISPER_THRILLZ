import cron from 'node-cron';
import { messageService } from '../services/messageService';

/**
 * Scheduled job to clean up expired ephemeral messages
 * Runs every hour to remove messages that have passed their expiration time
 */
export function startMessageCleanupJob() {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🧹 Starting expired message cleanup...');
      const deletedCount = await messageService.cleanupExpiredMessages();
      console.log(`✅ Cleaned up ${deletedCount} expired messages`);
    } catch (error) {
      console.error('❌ Error during message cleanup:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log('📅 Message cleanup job scheduled to run every hour');
}

/**
 * Manual cleanup function for testing or immediate cleanup
 */
export async function runMessageCleanup(): Promise<number> {
  try {
    console.log('🧹 Running manual message cleanup...');
    const deletedCount = await messageService.cleanupExpiredMessages();
    console.log(`✅ Manually cleaned up ${deletedCount} expired messages`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error during manual message cleanup:', error);
    throw error;
  }
}