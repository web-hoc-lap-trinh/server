import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnlineJudgeFields1700000000003 implements MigrationInterface {
  name = 'AddOnlineJudgeFields1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==========================================
    // TABLE: problems - Add missing fields
    // ==========================================
    await queryRunner.query(`
      ALTER TABLE \`problems\`
      ADD COLUMN \`input_format\` TEXT NULL COMMENT 'Description of input format',
      ADD COLUMN \`output_format\` TEXT NULL COMMENT 'Description of output format',
      ADD COLUMN \`constraints\` TEXT NULL COMMENT 'Problem constraints (e.g., 1 <= N <= 10^6)',
      ADD COLUMN \`samples\` JSON NULL COMMENT 'Sample inputs/outputs array [{input, output, explanation}]',
      ADD COLUMN \`author_notes\` TEXT NULL COMMENT 'Private notes from problem author'
    `);

    // ==========================================
    // TABLE: test_cases - Add score field
    // ==========================================
    await queryRunner.query(`
      ALTER TABLE \`test_cases\`
      ADD COLUMN \`score\` INT NOT NULL DEFAULT 1 COMMENT 'Score for this test case'
    `);

    // ==========================================
    // TABLE: submissions - Add execution details
    // ==========================================
    await queryRunner.query(`
      ALTER TABLE \`submissions\`
      ADD COLUMN \`language\` VARCHAR(50) NULL COMMENT 'Programming language name (e.g., cpp, python, javascript)',
      ADD COLUMN \`language_version\` VARCHAR(50) NULL COMMENT 'Language version (e.g., 17 for C++17)',
      ADD COLUMN \`stdout\` LONGTEXT NULL COMMENT 'Standard output from execution',
      ADD COLUMN \`stderr\` LONGTEXT NULL COMMENT 'Standard error from execution',
      ADD COLUMN \`execution_logs\` JSON NULL COMMENT 'Detailed execution logs per test case'
    `);

    // ==========================================
    // TABLE: languages - Create programming languages table
    // ==========================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`languages\` (
        \`language_id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(50) NOT NULL COMMENT 'Language name (e.g., C++, Python)',
        \`code\` VARCHAR(20) NOT NULL COMMENT 'Language code (e.g., cpp, python)',
        \`version\` VARCHAR(20) NULL COMMENT 'Language version',
        \`docker_image\` VARCHAR(100) NOT NULL COMMENT 'Docker image for this language',
        \`compile_command\` VARCHAR(500) NULL COMMENT 'Compile command template',
        \`run_command\` VARCHAR(500) NOT NULL COMMENT 'Run command template',
        \`file_extension\` VARCHAR(10) NOT NULL COMMENT 'Source file extension',
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`language_id\`),
        UNIQUE KEY \`idx_language_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    // ==========================================
    // Seed default languages
    // ==========================================
    await queryRunner.query(`
      INSERT INTO \`languages\` (\`name\`, \`code\`, \`version\`, \`docker_image\`, \`compile_command\`, \`run_command\`, \`file_extension\`) VALUES
      ('C++', 'cpp', '17', 'gcc:latest', 'g++ -std=c++17 -O2 -o /app/solution /app/solution.cpp', '/app/solution', 'cpp'),
      ('C', 'c', '11', 'gcc:latest', 'gcc -std=c11 -O2 -o /app/solution /app/solution.c', '/app/solution', 'c'),
      ('Python', 'python', '3.11', 'python:3.11-slim', NULL, 'python3 /app/solution.py', 'py'),
      ('JavaScript', 'javascript', 'ES2022', 'node:20-slim', NULL, 'node /app/solution.js', 'js'),
      ('Java', 'java', '17', 'openjdk:17-slim', 'javac /app/Solution.java', 'java -cp /app Solution', 'java')
    `);

    // ==========================================
    // Add indexes for better performance
    // ==========================================
    await queryRunner.query(`
      CREATE INDEX \`idx_submissions_status\` ON \`submissions\` (\`status\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`idx_submissions_user_problem\` ON \`submissions\` (\`user_id\`, \`problem_id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX \`idx_submissions_status\` ON \`submissions\``);
    await queryRunner.query(`DROP INDEX \`idx_submissions_user_problem\` ON \`submissions\``);

    // Drop languages table
    await queryRunner.query(`DROP TABLE IF EXISTS \`languages\``);

    // Remove columns from submissions
    await queryRunner.query(`
      ALTER TABLE \`submissions\`
      DROP COLUMN \`language\`,
      DROP COLUMN \`language_version\`,
      DROP COLUMN \`stdout\`,
      DROP COLUMN \`stderr\`,
      DROP COLUMN \`execution_logs\`
    `);

    // Remove column from test_cases
    await queryRunner.query(`
      ALTER TABLE \`test_cases\`
      DROP COLUMN \`score\`
    `);

    // Remove columns from problems
    await queryRunner.query(`
      ALTER TABLE \`problems\`
      DROP COLUMN \`input_format\`,
      DROP COLUMN \`output_format\`,
      DROP COLUMN \`constraints\`,
      DROP COLUMN \`samples\`,
      DROP COLUMN \`author_notes\`
    `);
  }
}
