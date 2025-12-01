import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAuthorsToAdmin1700000000016 implements MigrationInterface {
  name = 'UpdateAuthorsToAdmin1700000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set created_by = 2 for all problems
    await queryRunner.query(`UPDATE problems SET created_by = 2 WHERE created_by IS NULL OR created_by <> 2`);

    // Set created_by = 2 for all lessons (if table exists)
    // Some schemas may use `lessons` table name; adjust if necessary.
    await queryRunner.query(`UPDATE lessons SET created_by = 2 WHERE created_by IS NULL OR created_by <> 2`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert created_by to 1 where it equals 2
    await queryRunner.query(`UPDATE problems SET created_by = 1 WHERE created_by = 2`);
    await queryRunner.query(`UPDATE lessons SET created_by = 1 WHERE created_by = 2`);
  }
}
