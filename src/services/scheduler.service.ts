import * as cron from 'node-cron';
import { dailyChallengeService } from './dailyChallenge.service';

export class SchedulerService {
  private tasks: any[] = [];

  /**
   * Khởi động tất cả scheduled tasks
   */
  start(): void {
    // Daily Challenge Scheduler - Chạy vào 0h00 mỗi ngày
    const dailyChallengeTask = cron.schedule(
      '0 0 * * *', // Cron expression: 0h00 mỗi ngày
      async () => {
        try {
          console.log('\n⏰ [Scheduler] Chạy Daily Challenge Update...');
          await dailyChallengeService.updateDailyChallenges();
        } catch (error) {
          console.error('❌ [Scheduler] Lỗi khi cập nhật Daily Challenges:', error);
        }
      },
      {
        timezone: 'Asia/Ho_Chi_Minh', // Múi giờ Việt Nam
      }
    );

    this.tasks.push(dailyChallengeTask);

    console.log('⏰ Scheduler started: Daily Challenges sẽ tự động cập nhật lúc 0h00 mỗi ngày');
  }

  /**
   * Chạy ngay lập tức (cho mục đích testing hoặc khởi động lần đầu)
   */
  async runDailyChallengeNow(): Promise<void> {
    console.log('🚀 Chạy Daily Challenge Update ngay lập tức...');
    await dailyChallengeService.updateDailyChallenges();
  }

  /**
   * Dừng tất cả scheduled tasks
   */
  stop(): void {
    this.tasks.forEach((task) => task.stop());
    console.log('🛑 Scheduler stopped');
  }
}

export const schedulerService = new SchedulerService();
