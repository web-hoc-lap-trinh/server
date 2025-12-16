import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveParentReplyAndAccepted1765724424531 implements MigrationInterface {
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`discussion_replies\` DROP FOREIGN KEY \`discussion_replies_ibfk_2\`;
    `);
    
    await queryRunner.query(`
        ALTER TABLE \`discussion_replies\` DROP INDEX \`parent_reply_id\`;
    `);
    await queryRunner.query(`
        ALTER TABLE \`discussion_replies\` DROP INDEX \`IDX_reply_parent\`;
    `);


    await queryRunner.query(`
        ALTER TABLE \`discussion_replies\`
        DROP COLUMN \`parent_reply_id\`,
        DROP COLUMN \`is_accepted\`;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`discussion_replies\`
        ADD COLUMN \`parent_reply_id\` int(11) DEFAULT NULL,
        ADD COLUMN \`is_accepted\` tinyint(1) DEFAULT 0;
    `);

    await queryRunner.query(`
        CREATE INDEX \`parent_reply_id\` ON \`discussion_replies\` (\`parent_reply_id\`);
    `);
    await queryRunner.query(`
        CREATE INDEX \`IDX_reply_parent\` ON \`discussion_replies\` (\`parent_reply_id\`);
    `);

    await queryRunner.query(`
        ALTER TABLE \`discussion_replies\`
        ADD CONSTRAINT \`discussion_replies_ibfk_2\` FOREIGN KEY (\`parent_reply_id\`) REFERENCES \`discussion_replies\` (\`reply_id\`);
    `);
  }
}
