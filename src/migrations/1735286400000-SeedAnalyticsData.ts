import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

export class SeedAnalyticsData1735286400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🌱 Seeding analytics data for dashboard...');

        // Hash password for sample users
        const passwordHash = await bcryptjs.hash('password123', 10);

        // ==========================================
        // SEED USERS FOR USER GROWTH CHART
        // ==========================================
        // Create users over the last 60 days with varying amounts per day
        const today = new Date();
        const usersToCreate: any[] = [];

        // Generate users for the last 60 days
        for (let i = 60; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

            // Vary the number of users per day (1-8 users)
            const usersPerDay = Math.floor(Math.random() * 8) + 1;

            for (let j = 0; j < usersPerDay; j++) {
                const randomHour = Math.floor(Math.random() * 24);
                const randomMinute = Math.floor(Math.random() * 60);
                const userDate = new Date(date);
                userDate.setHours(randomHour, randomMinute, 0, 0);

                const firstName = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ'][Math.floor(Math.random() * 10)];
                const middleName = ['Văn', 'Thị', 'Đức', 'Hữu', 'Minh', 'Anh', 'Quốc', 'Thanh', 'Thành', 'Hải'][Math.floor(Math.random() * 10)];
                const lastName = ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Linh', 'Mai', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Tuấn', 'Việt', 'Yến'][Math.floor(Math.random() * 15)];
                const fullName = `${firstName} ${middleName} ${lastName}`;
                const email = `user${Date.now()}_${Math.random().toString(36).substr(2, 9)}@demo.com`;

                usersToCreate.push({
                    email,
                    password_hash: passwordHash,
                    full_name: fullName,
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    is_verified: true,
                    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
                    total_score: Math.floor(Math.random() * 500),
                    solved_problems: Math.floor(Math.random() * 20),
                    current_streak: Math.floor(Math.random() * 10),
                    max_streak: Math.floor(Math.random() * 15),
                    created_at: userDate,
                    updated_at: userDate,
                    last_active: userDate
                });
            }
        }

        // Insert users in batches
        console.log(`📊 Creating ${usersToCreate.length} sample users...`);
        for (const user of usersToCreate) {
            await queryRunner.query(
                `INSERT INTO users (email, password_hash, full_name, role, status, is_verified, avatar_url, total_score, solved_problems, current_streak, max_streak, created_at, updated_at, last_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.email,
                    user.password_hash,
                    user.full_name,
                    user.role,
                    user.status,
                    user.is_verified,
                    user.avatar_url,
                    user.total_score,
                    user.solved_problems,
                    user.current_streak,
                    user.max_streak,
                    user.created_at,
                    user.updated_at,
                    user.last_active
                ]
            );
        }

        console.log('✅ Sample users created successfully');

        // ==========================================
        // SEED SUBMISSIONS FOR SUBMISSION STATUS CHART
        // ==========================================
        
        // Get some existing users and problems
        const users = await queryRunner.query(`SELECT user_id FROM users WHERE role = 'STUDENT' LIMIT 50`);
        const problems = await queryRunner.query(`SELECT problem_id FROM problems WHERE is_published = 1 LIMIT 20`);
        const languages = await queryRunner.query(`SELECT language_id FROM languages LIMIT 5`);

        if (users.length === 0 || problems.length === 0 || languages.length === 0) {
            console.log('⚠️ Not enough data to create submissions. Skipping submission seeding.');
            return;
        }

        console.log('📊 Creating sample submissions...');

        // Status distribution (realistic percentages)
        const statusDistribution = [
            { status: 'ACCEPTED', weight: 45 },          // 45%
            { status: 'WRONG_ANSWER', weight: 30 },      // 30%
            { status: 'TIME_LIMIT', weight: 10 },        // 10%
            { status: 'RUNTIME_ERROR', weight: 8 },      // 8%
            { status: 'COMPILE_ERROR', weight: 5 },      // 5%
            { status: 'MEMORY_LIMIT', weight: 2 }        // 2%
        ];

        // Create weighted status array
        const weightedStatuses: string[] = [];
        statusDistribution.forEach(({ status, weight }) => {
            for (let i = 0; i < weight; i++) {
                weightedStatuses.push(status);
            }
        });

        // Create 500 submissions over the last 30 days
        const submissionsToCreate = 500;
        for (let i = 0; i < submissionsToCreate; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomProblem = problems[Math.floor(Math.random() * problems.length)];
            const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
            const randomStatus = weightedStatuses[Math.floor(Math.random() * weightedStatuses.length)];

            // Random date within last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const submissionDate = new Date(today);
            submissionDate.setDate(submissionDate.getDate() - daysAgo);
            submissionDate.setHours(
                Math.floor(Math.random() * 24),
                Math.floor(Math.random() * 60),
                Math.floor(Math.random() * 60)
            );

            // Generate realistic metrics based on status
            let executionTime = null;
            let memoryUsed = null;
            let pointsEarned = 0;
            let testCasesPassed = 0;
            let totalTestCases = Math.floor(Math.random() * 10) + 5;

            if (randomStatus === 'ACCEPTED') {
                executionTime = Math.floor(Math.random() * 500) + 50; // 50-550ms
                memoryUsed = Math.floor(Math.random() * 100) + 20; // 20-120KB
                pointsEarned = 100;
                testCasesPassed = totalTestCases;
            } else if (randomStatus === 'WRONG_ANSWER') {
                executionTime = Math.floor(Math.random() * 500) + 50;
                memoryUsed = Math.floor(Math.random() * 100) + 20;
                testCasesPassed = Math.floor(Math.random() * totalTestCases);
            } else if (randomStatus === 'TIME_LIMIT') {
                executionTime = 2000; // Over limit
                memoryUsed = Math.floor(Math.random() * 100) + 20;
                testCasesPassed = Math.floor(Math.random() * (totalTestCases / 2));
            } else if (randomStatus === 'RUNTIME_ERROR' || randomStatus === 'COMPILE_ERROR') {
                executionTime = Math.floor(Math.random() * 100);
                memoryUsed = Math.floor(Math.random() * 50);
                testCasesPassed = 0;
            } else if (randomStatus === 'MEMORY_LIMIT') {
                executionTime = Math.floor(Math.random() * 500);
                memoryUsed = 300; // Over limit
                testCasesPassed = Math.floor(Math.random() * (totalTestCases / 2));
            }

            const sourceCode = `// Sample ${randomStatus} submission
function solve() {
    // Code here
    return result;
}`;

            await queryRunner.query(
                `INSERT INTO submissions (user_id, problem_id, language_id, source_code, status, execution_time, memory_used, points_earned, test_cases_passed, total_test_cases, submitted_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    randomUser.user_id,
                    randomProblem.problem_id,
                    randomLanguage.language_id,
                    sourceCode,
                    randomStatus,
                    executionTime,
                    memoryUsed,
                    pointsEarned,
                    testCasesPassed,
                    totalTestCases,
                    submissionDate
                ]
            );
        }

        console.log(`✅ Created ${submissionsToCreate} sample submissions`);
        console.log('🎉 Analytics seed data completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🗑️ Rolling back analytics seed data...');
        
        // Delete sample users (those created by this migration have demo.com emails)
        await queryRunner.query(`DELETE FROM users WHERE email LIKE '%@demo.com'`);
        
        console.log('✅ Rollback completed');
    }
}
