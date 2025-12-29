import cron from 'node-cron';
import { AppDataSource } from '../../config/data-source';
import { Problem, ProblemDifficulty } from '../problem/problem.entity'; 

const problemRepository = AppDataSource.getRepository(Problem);

export const schedulerService = {
    init: () => {
        console.log('⏳ Daily Challenge Scheduler initialized...');
        
        cron.schedule('0 0 * * *', async () => {
            console.log('⏰ Running scheduled Daily Challenge update...');
            await schedulerService.runDailyChallengeNow();
        }, {
            timezone: "Asia/Ho_Chi_Minh" 
        });
    },

    runDailyChallengeNow: async () => {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            console.log('🔄 Start updating Daily Challenges...');

            await queryRunner.manager
                .createQueryBuilder()
                .update(Problem)
                .set({ is_daily_challenge: false })
                .where("is_daily_challenge = :status", { status: true })
                .execute();

            const easyProblems = await getRandomProblems(ProblemDifficulty.EASY, 2);
            const mediumProblems = await getRandomProblems(ProblemDifficulty.MEDIUM, 2);
            const hardProblems = await getRandomProblems(ProblemDifficulty.HARD, 1);

            const selectedProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
            const selectedIds = selectedProblems.map(p => p.problem_id);

            if (selectedIds.length > 0) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Problem)
                    .set({ is_daily_challenge: true })
                    .where("problem_id IN (:...ids)", { ids: selectedIds })
                    .execute();
            }

            await queryRunner.commitTransaction();
            console.log(`✅ Daily Challenges updated! Selected IDs: ${selectedIds.join(', ')}`);

        } catch (error) {
            console.error('❌ Error updating Daily Challenges:', error);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
};

const getRandomProblems = async (difficulty: ProblemDifficulty, count: number): Promise<Problem[]> => {
    return await problemRepository
        .createQueryBuilder('problem')
        .select(['problem.problem_id'])
        .where('problem.difficulty = :difficulty', { difficulty })
        .andWhere('problem.is_published = :published', { published: true })
        .orderBy('RAND()')
        .take(count)
        .getMany();
};