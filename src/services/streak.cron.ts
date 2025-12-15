import cron from 'node-cron';
import { AppDataSource } from '../config/data-source';
import { User } from '../api/auth/user.entity';
import { DailyActivity } from '../api/daily_activities/daily_activity.entity';
import { In } from 'typeorm';
import { getFormattedDate, getYesterdayDate } from '../utils/date.utils'; 

const userRepository = AppDataSource.getRepository(User);
const dailyActivityRepository = AppDataSource.getRepository(DailyActivity);

const resetStaleStreaks = async (): Promise<void> => {
    const today = new Date();
    const yesterday = getYesterdayDate(today); 
    const yesterdayDate = getFormattedDate(yesterday);
    
    console.log(`[CRON] Bắt đầu kiểm tra và reset streak cho ngày ${yesterdayDate}...`);

    const usersWithStreak = await userRepository.find({
        where: { current_streak: In([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) },
        select: ['user_id', 'current_streak']
    });

    if (usersWithStreak.length === 0) {
        console.log('[CRON] Không tìm thấy người dùng nào có streak để kiểm tra.');
        return;
    }

    const userIds = usersWithStreak.map(u => u.user_id);
    
    const activeYesterday = await dailyActivityRepository.find({
        where: {
            user_id: In(userIds),
            activity_date: yesterdayDate,
            streak_day: In([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), 
        },
        select: ['user_id']
    });

    const activeUserIds = activeYesterday.map(a => a.user_id);
    
    const usersToReset = userIds.filter(id => !activeUserIds.includes(id));

    if (usersToReset.length > 0) {
         await userRepository.update(
            { user_id: In(usersToReset) },
            { current_streak: 0 }
         );
         console.log(`[CRON] Reset streak (current_streak = 0) cho ${usersToReset.length} người dùng.`);
    } else {
        console.log('[CRON] Tất cả người dùng có streak đều đã duy trì được streak.');
    }
};

export const startStreakCronJob = () => {
    cron.schedule('0 5 0 * * *', async () => {
        if (!AppDataSource.isInitialized) {
             console.warn('[CRON] Database chưa khởi tạo. Bỏ qua chạy Cron Job.');
             return;
        }
        await resetStaleStreaks();
    }, {
        timezone: "Asia/Ho_Chi_Minh"
    });

    console.log('✅ Streak Cron Job đã được lên lịch chạy lúc 00:05 AM.');
};