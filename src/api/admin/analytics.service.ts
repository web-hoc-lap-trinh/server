import { AppDataSource } from '../../config/data-source';
import { User } from '../user/user.entity';
import { Submission, SubmissionStatus } from '../submission/submission.entity';
import { Category } from '../category/category.entity';
import { DailyActivity } from '../daily_activities/daily_activity.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Problem } from '../problem/problem.entity';
import { Between, MoreThanOrEqual } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);
const submissionRepository = AppDataSource.getRepository(Submission);
const categoryRepository = AppDataSource.getRepository(Category);
const dailyActivityRepository = AppDataSource.getRepository(DailyActivity);
const lessonRepository = AppDataSource.getRepository(Lesson);
const problemRepository = AppDataSource.getRepository(Problem);

// ==========================================
// INTERFACES
// ==========================================

export interface UserGrowthData {
    date: string;
    total_users: number;
    new_users: number;
}

export interface CategoryDistribution {
    category_id: number;
    category_name: string;
    lesson_count: number;
    view_count: number;
    percentage: number;
}

export interface SubmissionStatusData {
    status: string;
    count: number;
    percentage: number;
}

export interface TimeFilterParams {
    startDate?: Date;
    endDate?: Date;
}

export interface UserActivityData {
    date: string;
    active_users: number;
    problems_solved: number;
    lessons_completed: number;
    total_submissions: number;
}

export interface ProblemDifficultyDistribution {
    difficulty: string;
    count: number;
    percentage: number;
}

// ==========================================
// SERVICE FUNCTIONS
// ==========================================

/**
 * Lấy dữ liệu tăng trưởng người dùng theo thời gian
 * Biểu đồ: Line/Column Chart
 * @param days - Số ngày muốn xem (mặc định 30 ngày)
 */
export const getUserGrowthData = async (days: number = 30): Promise<UserGrowthData[]> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query to get new users per day
    const query = `
        SELECT 
            DATE_FORMAT(DATE(created_at), '%Y-%m-%d') as date,
            COUNT(*) as new_users
        FROM users
        WHERE created_at >= ?
        GROUP BY DATE_FORMAT(DATE(created_at), '%Y-%m-%d')
        ORDER BY date ASC
    `;

    const newUsersData = await AppDataSource.query(query, [startDate]);

    // Calculate cumulative total users
    let runningTotal = 0;
    const result: UserGrowthData[] = [];

    // Get total users before the period
    const usersBeforePeriod = await userRepository.count({
        where: {
            created_at: Between(new Date('1970-01-01'), startDate),
        },
    });
    runningTotal = usersBeforePeriod;

    // Fill in all dates including dates with no new users
    const dataMap = new Map<string, number>();
    newUsersData.forEach((row: any) => {
        // Date is already in YYYY-MM-DD format from DATE_FORMAT
        dataMap.set(row.date, parseInt(row.new_users));
    });

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        const newUsers = dataMap.get(dateString) || 0;
        runningTotal += newUsers;

        result.push({
            date: dateString,
            new_users: newUsers,
            total_users: runningTotal,
        });
    }

    return result;
};

/**
 * Lấy phân bố các danh mục (Categories)
 * Biểu đồ: Pie/Donut Chart
 * Có thể filter theo thời gian để xem hoạt động trong khoảng thời gian cụ thể
 */
export const getCategoryDistribution = async (filters?: TimeFilterParams): Promise<CategoryDistribution[]> => {
    let query = `
        SELECT 
            c.category_id,
            c.name as category_name,
            COUNT(DISTINCT l.lesson_id) as lesson_count,
            COALESCE(SUM(l.view_count), 0) as view_count
        FROM categories c
        LEFT JOIN lessons l ON c.category_id = l.category_id AND l.is_published = 1
        WHERE c.is_active = 1`;
    
    const params: any[] = [];
    
    // Add time filter for lessons created in specific period
    if (filters?.startDate) {
        query += ` AND l.created_at >= ?`;
        params.push(filters.startDate);
    }
    if (filters?.endDate) {
        query += ` AND l.created_at <= ?`;
        params.push(filters.endDate);
    }
    
    query += `
        GROUP BY c.category_id, c.name
        ORDER BY lesson_count DESC
    `;

    const data = await AppDataSource.query(query, params);

    const totalLessons = data.reduce((sum: number, row: any) => sum + parseInt(row.lesson_count), 0);

    return data.map((row: any) => ({
        category_id: row.category_id,
        category_name: row.category_name,
        lesson_count: parseInt(row.lesson_count),
        view_count: parseInt(row.view_count),
        percentage: totalLessons > 0 ? parseFloat(((parseInt(row.lesson_count) / totalLessons) * 100).toFixed(2)) : 0,
    }));
};

/**
 * Lấy phân bố trạng thái submissions
 * Biểu đồ: Pie/Donut Chart
 * Có thể filter theo thời gian để xem xu hướng trong khoảng thời gian cụ thể
 */
export const getSubmissionStatusDistribution = async (filters?: TimeFilterParams): Promise<SubmissionStatusData[]> => {
    let query = `
        SELECT 
            status,
            COUNT(*) as count
        FROM submissions
        WHERE 1=1`;
    
    const params: any[] = [];
    
    if (filters?.startDate) {
        query += ` AND submitted_at >= ?`;
        params.push(filters.startDate);
    }
    if (filters?.endDate) {
        query += ` AND submitted_at <= ?`;
        params.push(filters.endDate);
    }
    
    query += `
        GROUP BY status
        ORDER BY count DESC
    `;

    const data = await AppDataSource.query(query, params);
    const totalSubmissions = data.reduce((sum: number, row: any) => sum + parseInt(row.count), 0);

    return data.map((row: any) => ({
        status: row.status,
        count: parseInt(row.count),
        percentage: totalSubmissions > 0 ? parseFloat(((parseInt(row.count) / totalSubmissions) * 100).toFixed(2)) : 0,
    }));
};

/**
 * Lấy xu hướng hoạt động người dùng theo thời gian
 * Biểu đồ: Line Chart
 * @param days - Số ngày muốn xem (mặc định 30 ngày)
 */
export const getUserActivityTrend = async (days: number = 30): Promise<UserActivityData[]> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = `
        SELECT 
            DATE_FORMAT(activity_date, '%Y-%m-%d') as date,
            COUNT(DISTINCT user_id) as active_users,
            SUM(problems_solved) as problems_solved,
            SUM(lessons_completed) as lessons_completed
        FROM daily_activities
        WHERE activity_date >= ?
        GROUP BY DATE_FORMAT(activity_date, '%Y-%m-%d')
        ORDER BY date ASC
    `;

    const activityData = await AppDataSource.query(query, [startDate.toISOString().split('T')[0]]);

    // Get submission counts per day
    const submissionQuery = `
        SELECT 
            DATE_FORMAT(DATE(submitted_at), '%Y-%m-%d') as date,
            COUNT(*) as total_submissions
        FROM submissions
        WHERE submitted_at >= ?
        GROUP BY DATE_FORMAT(DATE(submitted_at), '%Y-%m-%d')
        ORDER BY date ASC
    `;

    const submissionData = await AppDataSource.query(submissionQuery, [startDate]);

    // Create a map for easy lookup
    const submissionMap = new Map<string, number>();
    submissionData.forEach((row: any) => {
        submissionMap.set(row.date, parseInt(row.total_submissions));
    });

    const activityMap = new Map<string, any>();
    activityData.forEach((row: any) => {
        activityMap.set(row.date, row);
    });

    // Fill in all dates including dates with no activity
    const result: UserActivityData[] = [];
    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        const activity = activityMap.get(dateString);
        
        result.push({
            date: dateString,
            active_users: activity ? parseInt(activity.active_users) : 0,
            problems_solved: activity ? parseInt(activity.problems_solved) : 0,
            lessons_completed: activity ? parseInt(activity.lessons_completed) : 0,
            total_submissions: submissionMap.get(dateString) || 0,
        });
    }

    return result;
};

/**
 * Lấy phân bố độ khó của Problems
 * Biểu đồ: Pie/Donut Chart
 */
export const getProblemDifficultyDistribution = async (): Promise<ProblemDifficultyDistribution[]> => {
    const query = `
        SELECT 
            difficulty,
            COUNT(*) as count
        FROM problems
        WHERE is_published = 1
        GROUP BY difficulty
        ORDER BY 
            CASE difficulty
                WHEN 'EASY' THEN 1
                WHEN 'MEDIUM' THEN 2
                WHEN 'HARD' THEN 3
            END
    `;

    const data = await AppDataSource.query(query);
    const totalProblems = data.reduce((sum: number, row: any) => sum + parseInt(row.count), 0);

    return data.map((row: any) => ({
        difficulty: row.difficulty,
        count: parseInt(row.count),
        percentage: totalProblems > 0 ? parseFloat(((parseInt(row.count) / totalProblems) * 100).toFixed(2)) : 0,
    }));
};

/**
 * Lấy thống kê tổng hợp cho dashboard
 */
export const getDashboardSummary = async () => {
    const [
        totalUsers,
        totalProblems,
        totalLessons,
        totalSubmissions,
        totalCategories,
    ] = await Promise.all([
        userRepository.count(),
        problemRepository.count({ where: { is_published: true } }),
        lessonRepository.count({ where: { is_published: true } }),
        submissionRepository.count(),
        categoryRepository.count({ where: { is_active: true } }),
    ]);

    // Get today's active users
    const today = new Date().toISOString().split('T')[0];
    const activeUsersToday = await dailyActivityRepository.count({
        where: { activity_date: today as any },
    });

    // Get acceptance rate
    const acceptedSubmissions = await submissionRepository.count({
        where: { status: SubmissionStatus.ACCEPTED },
    });
    const acceptanceRate = totalSubmissions > 0
        ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2))
        : 0;

    // Get growth comparison (last 7 days vs previous 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const previous14Days = new Date();
    previous14Days.setDate(previous14Days.getDate() - 14);

    const newUsersLast7Days = await userRepository.count({
        where: {
            created_at: MoreThanOrEqual(last7Days),
        },
    });

    const newUsersPrevious7Days = await userRepository.count({
        where: {
            created_at: Between(previous14Days, last7Days),
        },
    });

    const userGrowthRate = newUsersPrevious7Days > 0
        ? parseFloat((((newUsersLast7Days - newUsersPrevious7Days) / newUsersPrevious7Days) * 100).toFixed(2))
        : 0;

    return {
        totalUsers,
        totalProblems,
        totalLessons,
        totalSubmissions,
        totalCategories,
        activeUsersToday,
        acceptanceRate,
        newUsersLast7Days,
        userGrowthRate,
    };
};
