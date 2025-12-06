import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommunityModule1764830886797 implements MigrationInterface {
  name = 'AddCommunityModule1764830886797'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE discussions
        ADD INDEX IDX_discussion_problem_solution (problem_id, is_solution, created_at)
    `);

    await queryRunner.query(`
        ALTER TABLE discussions
        ADD INDEX IDX_discussion_lesson (lesson_id)
    `);

    await queryRunner.query(`
        ALTER TABLE discussion_replies
        ADD INDEX IDX_reply_discussion (discussion_id)
    `);

    await queryRunner.query(`
        ALTER TABLE discussion_replies
        ADD INDEX IDX_reply_parent (parent_reply_id)
    `);

    await queryRunner.query(`
        ALTER TABLE votes
        ADD UNIQUE KEY UK_user_discussion_reply (user_id, discussion_id, reply_id)
    `);

    await queryRunner.query(`
        ALTER TABLE votes
        ADD INDEX IDX_vote_type (vote_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE discussions
        DROP INDEX IDX_discussion_problem_solution
    `);

    await queryRunner.query(`
        ALTER TABLE discussions
        DROP INDEX IDX_discussion_lesson
    `);

    await queryRunner.query(`
        ALTER TABLE discussion_replies
        DROP INDEX IDX_reply_discussion
    `);

    await queryRunner.query(`
        ALTER TABLE discussion_replies
        DROP INDEX IDX_reply_parent
    `);

    await queryRunner.query(`
        ALTER TABLE votes
        DROP INDEX UK_user_discussion_reply
    `);

    await queryRunner.query(`
        ALTER TABLE votes
        DROP INDEX IDX_vote_type
    `);
  }
}
