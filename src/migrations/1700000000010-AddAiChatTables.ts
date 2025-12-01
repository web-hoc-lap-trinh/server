import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddAiChatTables1700000000010 implements MigrationInterface {
  name = 'AddAiChatTables1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasConv = await queryRunner.hasTable('ai_conversations');
    if (!hasConv) {
      await queryRunner.createTable(
        new Table({
          name: 'ai_conversations',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'problem_id', type: 'int', isNullable: false },
            { name: 'user_id', type: 'int', isNullable: false },
            { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          ],
        }),
        true
      );

      await queryRunner.createForeignKey(
        'ai_conversations',
        new TableForeignKey({ columnNames: ['problem_id'], referencedTableName: 'problems', referencedColumnNames: ['problem_id'], onDelete: 'CASCADE' })
      );

      await queryRunner.createForeignKey(
        'ai_conversations',
        new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['user_id'], onDelete: 'CASCADE' })
      );
    }

    const hasMsg = await queryRunner.hasTable('ai_messages');
    if (!hasMsg) {
      await queryRunner.createTable(
        new Table({
          name: 'ai_messages',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'conversation_id', type: 'int', isNullable: false },
            { name: 'role', type: 'enum', enum: ['user', 'assistant'], isNullable: false },
            { name: 'message', type: 'text', isNullable: false },
            { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          ],
        }),
        true
      );

      await queryRunner.createForeignKey(
        'ai_messages',
        new TableForeignKey({ columnNames: ['conversation_id'], referencedTableName: 'ai_conversations', referencedColumnNames: ['id'], onDelete: 'CASCADE' })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMsg = await queryRunner.hasTable('ai_messages');
    if (hasMsg) {
      const table = await queryRunner.getTable('ai_messages');
      const fk = table?.foreignKeys.find(fk => fk.columnNames.indexOf('conversation_id') !== -1);
      if (fk) await queryRunner.dropForeignKey('ai_messages', fk);
      await queryRunner.dropTable('ai_messages');
    }

    const hasConv = await queryRunner.hasTable('ai_conversations');
    if (hasConv) {
      const table = await queryRunner.getTable('ai_conversations');
      const fk1 = table?.foreignKeys.find(fk => fk.columnNames.indexOf('problem_id') !== -1);
      if (fk1) await queryRunner.dropForeignKey('ai_conversations', fk1);
      const fk2 = table?.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
      if (fk2) await queryRunner.dropForeignKey('ai_conversations', fk2);
      await queryRunner.dropTable('ai_conversations');
    }
  }
}
