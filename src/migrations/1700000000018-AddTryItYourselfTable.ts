import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTryItYourselfTable1700000000018 implements MigrationInterface {
  name = 'AddTryItYourselfTable1700000000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create try_it_yourself table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`try_it_yourself\` (
        \`try_it_yourself_id\` INT NOT NULL AUTO_INCREMENT,
        \`lesson_id\` INT NOT NULL,
        \`language_id\` INT NOT NULL,
        \`example_code\` TEXT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`try_it_yourself_id\`),
        UNIQUE KEY \`uk_try_it_yourself_lesson\` (\`lesson_id\`),
        CONSTRAINT \`fk_try_it_yourself_lesson\` FOREIGN KEY (\`lesson_id\`) 
          REFERENCES \`lessons\` (\`lesson_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_try_it_yourself_language\` FOREIGN KEY (\`language_id\`) 
          REFERENCES \`languages\` (\`language_id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Created try_it_yourself table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`try_it_yourself\``);
    console.log('✅ Dropped try_it_yourself table');
  }
}
