import { AppDataSource } from '../config/data-source';
import { Problem, ProblemDifficulty } from '../api/problem/problem.entity';

export class DailyChallengeService {
  private problemRepository = AppDataSource.getRepository(Problem);

  /**
   * Cập nhật daily challenges mỗi ngày vào 0h00
   * - Xóa các daily challenges cũ (set is_daily_challenge = false)
   * - Chọn ngẫu nhiên 5 bài tập với đầy đủ độ khó
   * - Set is_daily_challenge = true cho 5 bài tập đó
   */
  async updateDailyChallenges(): Promise<void> {
    try {
      console.log('🔄 Đang cập nhật Daily Challenges...');

      // Bước 1: Reset tất cả daily challenges cũ
      await this.problemRepository
        .createQueryBuilder()
        .update(Problem)
        .set({ is_daily_challenge: false })
        .where('is_daily_challenge = :value', { value: true })
        .execute();

      console.log('✅ Đã reset daily challenges cũ');

      // Bước 2: Lấy danh sách bài tập theo từng độ khó (chỉ lấy bài đã publish)
      const easyProblems = await this.problemRepository.find({
        where: { difficulty: ProblemDifficulty.EASY, is_published: true },
        order: { problem_id: 'DESC' },
      });

      const mediumProblems = await this.problemRepository.find({
        where: { difficulty: ProblemDifficulty.MEDIUM, is_published: true },
        order: { problem_id: 'DESC' },
      });

      const hardProblems = await this.problemRepository.find({
        where: { difficulty: ProblemDifficulty.HARD, is_published: true },
        order: { problem_id: 'DESC' },
      });

      // Bước 3: Chọn ngẫu nhiên từng độ khó
      const selectedProblems: Problem[] = [];

      // Chọn 2 EASY
      if (easyProblems.length > 0) {
        const selected = this.getRandomProblems(easyProblems, Math.min(2, easyProblems.length));
        selectedProblems.push(...selected);
      }

      // Chọn 2 MEDIUM
      if (mediumProblems.length > 0) {
        const selected = this.getRandomProblems(mediumProblems, Math.min(2, mediumProblems.length));
        selectedProblems.push(...selected);
      }

      // Chọn 1 HARD
      if (hardProblems.length > 0) {
        const selected = this.getRandomProblems(hardProblems, Math.min(1, hardProblems.length));
        selectedProblems.push(...selected);
      }

      // Bước 4: Set is_daily_challenge = true cho các bài đã chọn
      if (selectedProblems.length > 0) {
        const problemIds = selectedProblems.map((p) => p.problem_id);
        
        await this.problemRepository
          .createQueryBuilder()
          .update(Problem)
          .set({ is_daily_challenge: true })
          .where('problem_id IN (:...ids)', { ids: problemIds })
          .execute();

        console.log(`✅ Đã chọn ${selectedProblems.length} bài tập làm Daily Challenges:`);
        selectedProblems.forEach((p) => {
          console.log(`   - [${p.difficulty}] ${p.title} (ID: ${p.problem_id})`);
        });
      } else {
        console.log('⚠️ Không có đủ bài tập để tạo Daily Challenges');
      }

      console.log('🎉 Cập nhật Daily Challenges thành công!');
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật Daily Challenges:', error);
      throw error;
    }
  }

  /**
   * Chọn ngẫu nhiên n bài tập từ danh sách
   */
  private getRandomProblems(problems: Problem[], count: number): Problem[] {
    const shuffled = [...problems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Lấy danh sách daily challenges hiện tại
   */
  async getCurrentDailyChallenges(): Promise<Problem[]> {
    return await this.problemRepository.find({
      where: { is_daily_challenge: true, is_published: true },
      order: { difficulty: 'ASC' },
    });
  }
}

export const dailyChallengeService = new DailyChallengeService();
