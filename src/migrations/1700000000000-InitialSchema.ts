import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`user_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`email\` varchar(100) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`full_name\` varchar(100) DEFAULT NULL,
        \`avatar_url\` varchar(255) DEFAULT NULL,
        \`role\` enum('student','admin') DEFAULT 'student',
        \`total_score\` int(11) DEFAULT 0,
        \`solved_problems\` int(11) DEFAULT 0,
        \`current_streak\` int(11) DEFAULT 0,
        \`max_streak\` int(11) DEFAULT 0,
        \`last_active\` datetime DEFAULT NULL,
        \`reset_otp\` varchar(10) DEFAULT NULL,
        \`reset_otp_expires\` datetime DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`user_id\`),
        UNIQUE KEY \`email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng categories
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`category_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`icon_url\` varchar(255) DEFAULT NULL,
        \`order_index\` int(11) DEFAULT 0,
        \`is_active\` tinyint(1) DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`category_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng problems
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`problems\` (
        \`problem_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`title\` varchar(200) NOT NULL,
        \`description\` longtext NOT NULL,
        \`difficulty\` enum('easy','medium','hard') NOT NULL,
        \`category_tags\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`category_tags\`)),
        \`time_limit\` int(11) DEFAULT 1000,
        \`memory_limit\` int(11) DEFAULT 256,
        \`points\` int(11) NOT NULL,
        \`acceptance_rate\` decimal(5,2) DEFAULT 0.00,
        \`total_submissions\` int(11) DEFAULT 0,
        \`accepted_submissions\` int(11) DEFAULT 0,
        \`created_by\` int(11) NOT NULL,
        \`is_published\` tinyint(1) DEFAULT 0,
        \`is_daily_challenge\` tinyint(1) DEFAULT 0,
        \`challenge_date\` date DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`problem_id\`),
        KEY \`created_by\` (\`created_by\`),
        CONSTRAINT \`problems_ibfk_1\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng lessons
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`lessons\` (
        \`lesson_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`category_id\` int(11) NOT NULL,
        \`title\` varchar(200) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`content\` longtext NOT NULL,
        \`difficulty_level\` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
        \`order_index\` int(11) DEFAULT 0,
        \`is_published\` tinyint(1) DEFAULT 0,
        \`view_count\` int(11) DEFAULT 0,
        \`created_by\` int(11) NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`lesson_id\`),
        KEY \`category_id\` (\`category_id\`),
        KEY \`created_by\` (\`created_by\`),
        CONSTRAINT \`lessons_ibfk_1\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`category_id\`),
        CONSTRAINT \`lessons_ibfk_2\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng lesson_exercises
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`lesson_exercises\` (
        \`exercise_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`lesson_id\` int(11) NOT NULL,
        \`title\` varchar(200) NOT NULL,
        \`description\` text NOT NULL,
        \`exercise_type\` enum('fill_blank','fix_code','multiple_choice','coding') DEFAULT NULL,
        \`initial_code\` text DEFAULT NULL,
        \`solution_code\` text DEFAULT NULL,
        \`hints\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`hints\`)),
        \`explanation\` text DEFAULT NULL,
        \`order_index\` int(11) DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`exercise_id\`),
        KEY \`lesson_id\` (\`lesson_id\`),
        CONSTRAINT \`lesson_exercises_ibfk_1\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lessons\` (\`lesson_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng test_cases
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`test_cases\` (
        \`test_case_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`problem_id\` int(11) NOT NULL,
        \`input_data\` longtext NOT NULL,
        \`expected_output\` longtext NOT NULL,
        \`is_sample\` tinyint(1) DEFAULT 0,
        \`is_hidden\` tinyint(1) DEFAULT 1,
        \`explanation\` text DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`test_case_id\`),
        KEY \`problem_id\` (\`problem_id\`),
        CONSTRAINT \`test_cases_ibfk_1\` FOREIGN KEY (\`problem_id\`) REFERENCES \`problems\` (\`problem_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng submissions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`submissions\` (
        \`submission_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`problem_id\` int(11) NOT NULL,
        \`language_id\` int(11) NOT NULL,
        \`source_code\` longtext NOT NULL,
        \`status\` enum('pending','accepted','wrong_answer','time_limit','memory_limit','runtime_error','compile_error') DEFAULT NULL,
        \`execution_time\` int(11) DEFAULT NULL,
        \`memory_used\` int(11) DEFAULT NULL,
        \`points_earned\` int(11) DEFAULT 0,
        \`test_cases_passed\` int(11) DEFAULT 0,
        \`total_test_cases\` int(11) DEFAULT 0,
        \`error_message\` text DEFAULT NULL,
        \`submitted_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`submission_id\`),
        KEY \`user_id\` (\`user_id\`),
        KEY \`problem_id\` (\`problem_id\`),
        CONSTRAINT \`submissions_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`),
        CONSTRAINT \`submissions_ibfk_2\` FOREIGN KEY (\`problem_id\`) REFERENCES \`problems\` (\`problem_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng discussions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`discussions\` (
        \`discussion_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`problem_id\` int(11) DEFAULT NULL,
        \`lesson_id\` int(11) DEFAULT NULL,
        \`user_id\` int(11) NOT NULL,
        \`title\` varchar(200) NOT NULL,
        \`content\` longtext NOT NULL,
        \`discussion_type\` enum('question','solution','general','bug_report') DEFAULT 'question',
        \`is_solution\` tinyint(1) DEFAULT 0,
        \`upvotes\` int(11) DEFAULT 0,
        \`downvotes\` int(11) DEFAULT 0,
        \`view_count\` int(11) DEFAULT 0,
        \`reply_count\` int(11) DEFAULT 0,
        \`is_pinned\` tinyint(1) DEFAULT 0,
        \`is_locked\` tinyint(1) DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`discussion_id\`),
        KEY \`problem_id\` (\`problem_id\`),
        KEY \`lesson_id\` (\`lesson_id\`),
        KEY \`user_id\` (\`user_id\`),
        CONSTRAINT \`discussions_ibfk_1\` FOREIGN KEY (\`problem_id\`) REFERENCES \`problems\` (\`problem_id\`),
        CONSTRAINT \`discussions_ibfk_2\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lessons\` (\`lesson_id\`),
        CONSTRAINT \`discussions_ibfk_3\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng discussion_replies
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`discussion_replies\` (
        \`reply_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`discussion_id\` int(11) NOT NULL,
        \`parent_reply_id\` int(11) DEFAULT NULL,
        \`user_id\` int(11) NOT NULL,
        \`content\` longtext NOT NULL,
        \`upvotes\` int(11) DEFAULT 0,
        \`downvotes\` int(11) DEFAULT 0,
        \`is_accepted\` tinyint(1) DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`reply_id\`),
        KEY \`discussion_id\` (\`discussion_id\`),
        KEY \`parent_reply_id\` (\`parent_reply_id\`),
        KEY \`user_id\` (\`user_id\`),
        CONSTRAINT \`discussion_replies_ibfk_1\` FOREIGN KEY (\`discussion_id\`) REFERENCES \`discussions\` (\`discussion_id\`),
        CONSTRAINT \`discussion_replies_ibfk_2\` FOREIGN KEY (\`parent_reply_id\`) REFERENCES \`discussion_replies\` (\`reply_id\`),
        CONSTRAINT \`discussion_replies_ibfk_3\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng votes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`votes\` (
        \`vote_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`discussion_id\` int(11) DEFAULT NULL,
        \`reply_id\` int(11) DEFAULT NULL,
        \`vote_type\` enum('upvote','downvote') NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`vote_id\`),
        KEY \`user_id\` (\`user_id\`),
        KEY \`discussion_id\` (\`discussion_id\`),
        KEY \`reply_id\` (\`reply_id\`),
        CONSTRAINT \`votes_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`),
        CONSTRAINT \`votes_ibfk_2\` FOREIGN KEY (\`discussion_id\`) REFERENCES \`discussions\` (\`discussion_id\`),
        CONSTRAINT \`votes_ibfk_3\` FOREIGN KEY (\`reply_id\`) REFERENCES \`discussion_replies\` (\`reply_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng user_progress
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`user_progress\` (
        \`progress_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`lesson_id\` int(11) DEFAULT NULL,
        \`problem_id\` int(11) DEFAULT NULL,
        \`status\` enum('not_started','in_progress','completed') DEFAULT 'not_started',
        \`progress_percentage\` int(11) DEFAULT 0,
        \`time_spent\` int(11) DEFAULT 0,
        \`best_score\` int(11) DEFAULT 0,
        \`attempts_count\` int(11) DEFAULT 0,
        \`first_attempt_at\` datetime DEFAULT NULL,
        \`completed_at\` datetime DEFAULT NULL,
        \`last_accessed\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`progress_id\`),
        KEY \`user_id\` (\`user_id\`),
        KEY \`lesson_id\` (\`lesson_id\`),
        KEY \`problem_id\` (\`problem_id\`),
        CONSTRAINT \`user_progress_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`),
        CONSTRAINT \`user_progress_ibfk_2\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lessons\` (\`lesson_id\`),
        CONSTRAINT \`user_progress_ibfk_3\` FOREIGN KEY (\`problem_id\`) REFERENCES \`problems\` (\`problem_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng daily_activities
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`daily_activities\` (
        \`activity_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) NOT NULL,
        \`activity_date\` date NOT NULL,
        \`problems_solved\` int(11) DEFAULT 0,
        \`lessons_completed\` int(11) DEFAULT 0,
        \`time_spent\` int(11) DEFAULT 0,
        \`points_earned\` int(11) DEFAULT 0,
        \`streak_day\` int(11) DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`activity_id\`),
        KEY \`user_id\` (\`user_id\`),
        CONSTRAINT \`daily_activities_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Tạo bảng system_stats
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`system_stats\` (
        \`stat_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`stat_date\` date NOT NULL,
        \`total_users\` int(11) DEFAULT 0,
        \`active_users_today\` int(11) DEFAULT 0,
        \`new_users_today\` int(11) DEFAULT 0,
        \`total_submissions\` int(11) DEFAULT 0,
        \`successful_submissions\` int(11) DEFAULT 0,
        \`total_discussions\` int(11) DEFAULT 0,
        \`total_problems\` int(11) DEFAULT 0,
        \`total_lessons\` int(11) DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`stat_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các bảng theo thứ tự ngược lại (tránh foreign key constraint)
    await queryRunner.query(`DROP TABLE IF EXISTS \`system_stats\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`daily_activities\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_progress\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`votes\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`discussion_replies\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`discussions\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`submissions\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`test_cases\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`lesson_exercises\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`lessons\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`problems\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`categories\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
