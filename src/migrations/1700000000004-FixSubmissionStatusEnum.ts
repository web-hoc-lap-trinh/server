import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSubmissionStatusEnum1700000000004 implements MigrationInterface {
  name = 'FixSubmissionStatusEnum1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Fixing submission status ENUM to UPPERCASE with all values...');
    
    // First convert existing lowercase values to uppercase
    await queryRunner.query(`
      UPDATE \`submissions\` SET \`status\` = UPPER(\`status\`) WHERE \`status\` IS NOT NULL
    `);
    
    // Modify the ENUM to include all required status values in UPPERCASE
    await queryRunner.query(`
      ALTER TABLE \`submissions\` 
      MODIFY COLUMN \`status\` ENUM(
        'PENDING',
        'RUNNING',
        'ACCEPTED',
        'WRONG_ANSWER',
        'TIME_LIMIT',
        'MEMORY_LIMIT',
        'RUNTIME_ERROR',
        'COMPILE_ERROR',
        'INTERNAL_ERROR'
      ) DEFAULT 'PENDING'
    `);
    
    console.log('Submission status ENUM fixed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to original ENUM (without RUNNING and INTERNAL_ERROR)
    // First update any submissions with new statuses
    await queryRunner.query(`
      UPDATE \`submissions\` 
      SET \`status\` = 'PENDING' 
      WHERE \`status\` IN ('RUNNING', 'INTERNAL_ERROR')
    `);
    
    await queryRunner.query(`
      ALTER TABLE \`submissions\` 
      MODIFY COLUMN \`status\` ENUM(
        'PENDING',
        'ACCEPTED',
        'WRONG_ANSWER',
        'TIME_LIMIT',
        'MEMORY_LIMIT',
        'RUNTIME_ERROR',
        'COMPILE_ERROR'
      ) DEFAULT 'PENDING'
    `);
  }
}
