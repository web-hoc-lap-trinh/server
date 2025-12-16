import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDailyActivitiesTable1765727788882 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
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
        UNIQUE KEY \`UK_user_date\` (\`user_id\`, \`activity_date\`),
        CONSTRAINT \`daily_activities_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`daily_activities\``);
  }

}
