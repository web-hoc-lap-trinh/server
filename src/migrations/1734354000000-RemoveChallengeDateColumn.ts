import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveChallengeDateColumn1734354000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xóa column challenge_date khỏi bảng problems
    await queryRunner.query(`
      ALTER TABLE \`problems\` DROP COLUMN \`challenge_date\`
    `);
    
    console.log('✅ Đã xóa column challenge_date từ bảng problems');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khôi phục column challenge_date nếu cần rollback
    await queryRunner.query(`
      ALTER TABLE \`problems\` ADD COLUMN \`challenge_date\` date NULL
    `);
    
    console.log('✅ Đã khôi phục column challenge_date');
  }
}
