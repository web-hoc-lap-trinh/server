import { AppDataSource } from '../../config/data-source';
import { User } from '../user/user.entity';
import { Submission, SubmissionStatus } from '../submission/submission.entity';
import { Problem } from '../problem/problem.entity';
import { Lesson } from '../lesson/lesson.entity';
import { DailyActivity } from '../daily_activities/daily_activity.entity'; 
import { Category } from '../category/category.entity'; 
import { TestCase } from '../problem/testcase.entity';
import { getFormattedDate } from '../../utils/date.utils'; 

const userRepository = AppDataSource.getRepository(User);
const submissionRepository = AppDataSource.getRepository(Submission);
const problemRepository = AppDataSource.getRepository(Problem);
const lessonRepository = AppDataSource.getRepository(Lesson);
const dailyActivityRepository = AppDataSource.getRepository(DailyActivity);
const categoryRepository = AppDataSource.getRepository(Category); 
const testCaseRepository = AppDataSource.getRepository(TestCase); 


export interface AdminStats {
    total_users: number;
    active_users_today: number; 
    total_lessons: number;
    total_categories: number; 
    total_problems: number; 
    total_test_cases: number; 
    
    total_submissions: number; 
    accepted_submissions: number;
    acceptance_rate: number;
    current_highest_streak: number;
}

export const getAdminStats = async (): Promise<AdminStats> => {
    const today = new Date();
    const todayDate = getFormattedDate(today);

    const [
        total_users,
        total_problems,
        total_lessons,
        total_submissions,
        total_categories,
        total_test_cases,
    ] = await Promise.all([
        userRepository.count(),
        problemRepository.count({ where: { is_published: true } }),
        lessonRepository.count({ where: { is_published: true } }),
        submissionRepository.count(),
        categoryRepository.count({ where: { is_active: true } }),
        testCaseRepository.count(),
    ]);

    const accepted_submissions = await submissionRepository.count({
        where: { status: SubmissionStatus.ACCEPTED },
    });
    
    const acceptance_rate = total_submissions > 0
        ? parseFloat(((accepted_submissions / total_submissions) * 100).toFixed(2))
        : 0;

    const active_users_today = await dailyActivityRepository.count({
        where: { activity_date: todayDate as any },
    });

    const highestStreakResult = await userRepository.findOne({
        order: { max_streak: 'DESC' },
        select: ['max_streak'],
        where: { role: 'STUDENT' }
    });
    const current_highest_streak = highestStreakResult?.max_streak || 0;


    return {
        total_users,
        active_users_today,
        total_lessons,
        total_categories,
        total_problems,
        total_test_cases,
        
        total_submissions,
        accepted_submissions,
        acceptance_rate,
        current_highest_streak,
    };
};