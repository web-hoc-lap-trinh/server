import { AppDataSource } from '../../config/data-source';
import { DailyActivity } from './daily_activity.entity';
import { User } from '../user/user.entity';
import { Problem } from '../problem/problem.entity';
import { getFormattedDate, getYesterdayDate } from '../../utils/date.utils';
import { NotFoundError } from '../../utils/apiResponse';
import { getPaginationOptions } from '../../utils/pagination';

const dailyActivityRepository = AppDataSource.getRepository(DailyActivity);
const userRepository = AppDataSource.getRepository(User);
const problemRepository = AppDataSource.getRepository(Problem);

/**
 * Update daily activity & streak when user solves a problem
 */
export const updateActivityAndStreak = async (
    userId: number,
    problemId: number,
    pointsEarned: number,
    isAccepted: boolean
): Promise<void> => {

    // ❌ Không AC thì bỏ
    if (!isAccepted) return;

    const today = new Date();
    const todayDate = getFormattedDate(today);
    const yesterdayDate = getFormattedDate(getYesterdayDate(today));

    // 1️⃣ Lấy thông tin bài
    const problem = await problemRepository.findOne({
        where: { problem_id: problemId },
        select: ['problem_id', 'is_daily_challenge'],
    });

    if (!problem) {
        throw new NotFoundError('Không tìm thấy bài tập.');
    }

    const isDailyChallenge = Boolean(problem.is_daily_challenge);

    // 2️⃣ Lấy activity hôm nay (nếu có)
    let todayActivity = await dailyActivityRepository.findOneBy({
        user_id: userId,
        activity_date: todayDate,
    });

    // 3️⃣ Luôn update số bài + điểm
    if (todayActivity) {
        await dailyActivityRepository
            .createQueryBuilder()
            .update(DailyActivity)
            .set({
                problems_solved: () => 'problems_solved + 1',
                points_earned: () => `points_earned + ${pointsEarned}`,
            })
            .where('activity_id = :id', { id: todayActivity.activity_id })
            .execute();
    }

    // 4️⃣ XỬ LÝ STREAK (chỉ khi là Daily Challenge & chưa tính trong ngày)
    if (isDailyChallenge && (!todayActivity || todayActivity.streak_day === 0)) {

        let newStreak = 1;

        const yesterdayActivity = await dailyActivityRepository.findOneBy({
            user_id: userId,
            activity_date: yesterdayDate,
        });

        if (yesterdayActivity && yesterdayActivity.streak_day > 0) {
            newStreak = yesterdayActivity.streak_day + 1;
        }

        // Update User streak
        await userRepository
            .createQueryBuilder()
            .update(User)
            .set({
                current_streak: newStreak,
                max_streak: () => `GREATEST(max_streak, ${newStreak})`,
            })
            .where('user_id = :userId', { userId })
            .execute();

        // Update hoặc tạo DailyActivity hôm nay
        if (todayActivity) {
            await dailyActivityRepository.update(
                { activity_id: todayActivity.activity_id },
                { streak_day: newStreak }
            );
        } else {
            todayActivity = dailyActivityRepository.create({
                user_id: userId,
                activity_date: todayDate,
                problems_solved: 1,
                streak_day: newStreak,
                points_earned: pointsEarned,
            });
            await dailyActivityRepository.save(todayActivity);
            return;
        }
    }

    // 5️⃣ Nếu hôm nay CHƯA có activity → tạo mới (không daily)
    if (!todayActivity) {
        todayActivity = dailyActivityRepository.create({
            user_id: userId,
            activity_date: todayDate,
            problems_solved: 1,
            streak_day: 0,
            points_earned: pointsEarned,
        });
        await dailyActivityRepository.save(todayActivity);
    }
};

/**
 * Get today activity
 */
export const getDailyActivity = async (userId: number) => {
    const todayDate = getFormattedDate(new Date());

    const activity = await dailyActivityRepository.findOne({
        where: { user_id: userId, activity_date: todayDate },
        select: [
            'activity_date',
            'problems_solved',
            'lessons_completed',
            'streak_day',
            'points_earned',
            'time_spent',
        ],
    });

    if (!activity) {
        throw new NotFoundError('Không tìm thấy hoạt động hôm nay.');
    }

    return activity;
};

/**
 * Get activity history
 */
export const getActivitiesHistory = async (
    userId: number,
    page: number = 1,
    limit: number = 10
) => {
    const { skip, take } = getPaginationOptions(page, limit);

    const [data, total] = await dailyActivityRepository.findAndCount({
        where: { user_id: userId },
        order: { activity_date: 'DESC' },
        skip,
        take,
    });

    return {
        data,
        total,
        page,
        limit,
    };
};
