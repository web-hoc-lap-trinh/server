import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnumToUppercase1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Update existing data in users table to UPPERCASE
    await queryRunner.query(`
      UPDATE users 
      SET role = UPPER(role)
      WHERE role IN ('student', 'admin')
    `);

    // 2. Modify users.role enum to UPPERCASE
    await queryRunner.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('STUDENT', 'ADMIN') DEFAULT 'STUDENT'
    `);

    // 3. Update existing data in lessons table to UPPERCASE
    await queryRunner.query(`
      UPDATE lessons 
      SET difficulty_level = UPPER(difficulty_level)
      WHERE difficulty_level IN ('beginner', 'intermediate', 'advanced')
    `);

    // 4. Modify lessons.difficulty_level enum to UPPERCASE
    await queryRunner.query(`
      ALTER TABLE lessons 
      MODIFY COLUMN difficulty_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER'
    `);

    // 5. Update existing data in problems table to UPPERCASE
    await queryRunner.query(`
      UPDATE problems 
      SET difficulty = UPPER(difficulty)
      WHERE difficulty IN ('easy', 'medium', 'hard')
    `);

    // 6. Modify problems.difficulty enum to UPPERCASE
    await queryRunner.query(`
      ALTER TABLE problems 
      MODIFY COLUMN difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL
    `);

    // 7. Update existing data in lesson_exercises table to UPPERCASE
    await queryRunner.query(`
      UPDATE lesson_exercises 
      SET exercise_type = UPPER(exercise_type)
      WHERE exercise_type IN ('fill_blank', 'fix_code', 'multiple_choice', 'coding')
    `);

    // 8. Modify lesson_exercises.exercise_type enum to UPPERCASE
    await queryRunner.query(`
      ALTER TABLE lesson_exercises 
      MODIFY COLUMN exercise_type ENUM('FILL_BLANK', 'FIX_CODE', 'MULTIPLE_CHOICE', 'CODING') DEFAULT NULL
    `);

    // 9. Update existing data in submissions table to UPPERCASE
    await queryRunner.query(`
      UPDATE submissions 
      SET status = UPPER(status)
      WHERE status IN ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'runtime_error', 'compile_error', 'internal_error')
    `);

    // 10. Modify submissions.status enum to UPPERCASE (including RUNNING and INTERNAL_ERROR)
    await queryRunner.query(`
      ALTER TABLE submissions 
      MODIFY COLUMN status ENUM('PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT', 'MEMORY_LIMIT', 'RUNTIME_ERROR', 'COMPILE_ERROR', 'INTERNAL_ERROR') DEFAULT 'PENDING'
    `);

    // 11. Update existing data in discussions table to UPPERCASE
    await queryRunner.query(`
      UPDATE discussions 
      SET discussion_type = UPPER(discussion_type)
      WHERE discussion_type IN ('question', 'solution', 'general', 'bug_report')
    `);

    // 12. Modify discussions.discussion_type enum to UPPERCASE
    await queryRunner.query(`
      ALTER TABLE discussions 
      MODIFY COLUMN discussion_type ENUM('QUESTION', 'SOLUTION', 'GENERAL', 'BUG_REPORT') DEFAULT 'QUESTION'
    `);

    // 13. Update existing data in votes table to UPPERCASE
    await queryRunner.query(`
      UPDATE votes 
      SET vote_type = UPPER(vote_type)
      WHERE vote_type IN ('upvote', 'downvote')
    `);

    // 14. Modify votes.vote_type enum to UPPERCASE
    await queryRunner.query(`
      ALTER TABLE votes 
      MODIFY COLUMN vote_type ENUM('UPVOTE', 'DOWNVOTE') NOT NULL
    `);

    // 15. Update existing data in user_progress table to UPPERCASE
    await queryRunner.query(`
      UPDATE user_progress 
      SET status = UPPER(status)
      WHERE status IN ('not_started', 'in_progress', 'completed')
    `);

    // 16. Modify user_progress.status enum to UPPERCASE
    await queryRunner.query(`
      ALTER TABLE user_progress 
      MODIFY COLUMN status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'NOT_STARTED'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to lowercase (if needed for rollback)

    // 1. Revert users.role
    await queryRunner.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('student', 'admin') DEFAULT 'student'
    `);
    await queryRunner.query(`
      UPDATE users 
      SET role = LOWER(role)
      WHERE role IN ('STUDENT', 'ADMIN')
    `);

    // 2. Revert lessons.difficulty_level
    await queryRunner.query(`
      ALTER TABLE lessons 
      MODIFY COLUMN difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner'
    `);
    await queryRunner.query(`
      UPDATE lessons 
      SET difficulty_level = LOWER(difficulty_level)
      WHERE difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
    `);

    // 3. Revert problems.difficulty
    await queryRunner.query(`
      ALTER TABLE problems 
      MODIFY COLUMN difficulty ENUM('easy', 'medium', 'hard') NOT NULL
    `);
    await queryRunner.query(`
      UPDATE problems 
      SET difficulty = LOWER(difficulty)
      WHERE difficulty IN ('EASY', 'MEDIUM', 'HARD')
    `);

    // 4. Revert lesson_exercises.exercise_type
    await queryRunner.query(`
      ALTER TABLE lesson_exercises 
      MODIFY COLUMN exercise_type ENUM('fill_blank', 'fix_code', 'multiple_choice', 'coding') DEFAULT NULL
    `);
    await queryRunner.query(`
      UPDATE lesson_exercises 
      SET exercise_type = LOWER(exercise_type)
      WHERE exercise_type IN ('FILL_BLANK', 'FIX_CODE', 'MULTIPLE_CHOICE', 'CODING')
    `);

    // 5. Revert submissions.status
    await queryRunner.query(`
      ALTER TABLE submissions 
      MODIFY COLUMN status ENUM('pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'runtime_error', 'compile_error', 'internal_error') DEFAULT NULL
    `);
    await queryRunner.query(`
      UPDATE submissions 
      SET status = LOWER(status)
      WHERE status IN ('PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT', 'MEMORY_LIMIT', 'RUNTIME_ERROR', 'COMPILE_ERROR', 'INTERNAL_ERROR')
    `);

    // 6. Revert discussions.discussion_type
    await queryRunner.query(`
      ALTER TABLE discussions 
      MODIFY COLUMN discussion_type ENUM('question', 'solution', 'general', 'bug_report') DEFAULT 'question'
    `);
    await queryRunner.query(`
      UPDATE discussions 
      SET discussion_type = LOWER(discussion_type)
      WHERE discussion_type IN ('QUESTION', 'SOLUTION', 'GENERAL', 'BUG_REPORT')
    `);

    // 7. Revert votes.vote_type
    await queryRunner.query(`
      ALTER TABLE votes 
      MODIFY COLUMN vote_type ENUM('upvote', 'downvote') NOT NULL
    `);
    await queryRunner.query(`
      UPDATE votes 
      SET vote_type = LOWER(vote_type)
      WHERE vote_type IN ('UPVOTE', 'DOWNVOTE')
    `);

    // 8. Revert user_progress.status
    await queryRunner.query(`
      ALTER TABLE user_progress 
      MODIFY COLUMN status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started'
    `);
    await queryRunner.query(`
      UPDATE user_progress 
      SET status = LOWER(status)
      WHERE status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')
    `);
  }
}
