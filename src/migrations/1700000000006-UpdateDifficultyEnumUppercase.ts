import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDifficultyEnumUppercase1700000000006 implements MigrationInterface {
  name = 'UpdateDifficultyEnumUppercase1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists
    const tableExists = await queryRunner.hasTable('problems');
    if (!tableExists) {
      console.log('Table problems does not exist, skipping migration');
      return;
    }

    // First update existing data to uppercase
    await queryRunner.query(`UPDATE problems SET difficulty = 'EASY' WHERE difficulty = 'easy'`);
    await queryRunner.query(`UPDATE problems SET difficulty = 'MEDIUM' WHERE difficulty = 'medium'`);
    await queryRunner.query(`UPDATE problems SET difficulty = 'HARD' WHERE difficulty = 'hard'`);

    // Then alter the enum to only allow uppercase values
    await queryRunner.query(`
      ALTER TABLE problems 
      MODIFY COLUMN difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'EASY'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to lowercase
    await queryRunner.query(`UPDATE problems SET difficulty = 'easy' WHERE difficulty = 'EASY'`);
    await queryRunner.query(`UPDATE problems SET difficulty = 'medium' WHERE difficulty = 'MEDIUM'`);
    await queryRunner.query(`UPDATE problems SET difficulty = 'hard' WHERE difficulty = 'HARD'`);

    await queryRunner.query(`
      ALTER TABLE problems 
      MODIFY COLUMN difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'easy'
    `);
  }
}
