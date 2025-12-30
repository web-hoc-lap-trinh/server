import cron from 'node-cron';
import { dailyChallengeService } from '../../services/dailyChallenge.service';

export const schedulerService = {
    start: () => {
        console.log('🕒 Current Server Time:', new Date().toString());
        console.log('⏳ Daily Challenge Scheduler initialized...');
        
        cron.schedule('0 0 * * *', async () => {
            console.log('⏰ Triggering Daily Challenge update...');
            try {
                await dailyChallengeService.updateDailyChallenges();
            } catch (error) {
                console.error('❌ Scheduler failed to update daily challenges:', error);
            }
        }, {
            timezone: "Asia/Ho_Chi_Minh" 
        });
    },


    runDailyChallengeNow: async () => {
        await dailyChallengeService.updateDailyChallenges();
    }
};