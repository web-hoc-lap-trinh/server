import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddUserRecommendations1700000000011 implements MigrationInterface {
  name = 'AddUserRecommendations1700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_recommendations table
    await queryRunner.createTable(
      new Table({
        name: 'user_recommendations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['PROBLEM', 'LESSON'],
            default: "'PROBLEM'",
          },
          {
            name: 'item_id',
            type: 'int',
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      'user_recommendations',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['user_id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_user_recommendations_user',
      })
    );

    // Add index on user_id for faster lookups
    await queryRunner.createIndex(
      'user_recommendations',
      new TableIndex({
        name: 'IDX_user_recommendations_user_id',
        columnNames: ['user_id'],
      })
    );

    // Add composite index on user_id and type
    await queryRunner.createIndex(
      'user_recommendations',
      new TableIndex({
        name: 'IDX_user_recommendations_user_type',
        columnNames: ['user_id', 'type'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.dropIndex('user_recommendations', 'IDX_user_recommendations_user_type');
    await queryRunner.dropIndex('user_recommendations', 'IDX_user_recommendations_user_id');

    // Remove foreign key
    await queryRunner.dropForeignKey('user_recommendations', 'FK_user_recommendations_user');

    // Drop table
    await queryRunner.dropTable('user_recommendations');
  }
}
