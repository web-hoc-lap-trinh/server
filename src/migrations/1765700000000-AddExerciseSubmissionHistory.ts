import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddExerciseSubmissionHistory1765700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create exercise_submissions table
    await queryRunner.createTable(
      new Table({
        name: 'exercise_submissions',
        columns: [
          {
            name: 'submission_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'exercise_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'lesson_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'user_answer',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'correct_answer',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'is_correct',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'time_spent_seconds',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'attempt_number',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'submitted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      'exercise_submissions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['user_id'],
        onDelete: 'CASCADE',
      })
    );

    // Add foreign key to lesson_exercises table
    await queryRunner.createForeignKey(
      'exercise_submissions',
      new TableForeignKey({
        columnNames: ['exercise_id'],
        referencedTableName: 'lesson_exercises',
        referencedColumnNames: ['exercise_id'],
        onDelete: 'CASCADE',
      })
    );

    // Add indexes for better query performance
    await queryRunner.createIndex(
      'exercise_submissions',
      new TableIndex({
        name: 'IDX_SUBMISSIONS_USER_ID',
        columnNames: ['user_id'],
      })
    );

    await queryRunner.createIndex(
      'exercise_submissions',
      new TableIndex({
        name: 'IDX_SUBMISSIONS_EXERCISE_ID',
        columnNames: ['exercise_id'],
      })
    );

    await queryRunner.createIndex(
      'exercise_submissions',
      new TableIndex({
        name: 'IDX_SUBMISSIONS_LESSON_ID',
        columnNames: ['lesson_id'],
      })
    );

    await queryRunner.createIndex(
      'exercise_submissions',
      new TableIndex({
        name: 'IDX_SUBMISSIONS_USER_LESSON',
        columnNames: ['user_id', 'lesson_id'],
      })
    );

    await queryRunner.createIndex(
      'exercise_submissions',
      new TableIndex({
        name: 'IDX_SUBMISSIONS_USER_EXERCISE',
        columnNames: ['user_id', 'exercise_id'],
      })
    );

    await queryRunner.createIndex(
      'exercise_submissions',
      new TableIndex({
        name: 'IDX_SUBMISSIONS_SUBMITTED_AT',
        columnNames: ['submitted_at'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('exercise_submissions', 'IDX_SUBMISSIONS_SUBMITTED_AT');
    await queryRunner.dropIndex('exercise_submissions', 'IDX_SUBMISSIONS_USER_EXERCISE');
    await queryRunner.dropIndex('exercise_submissions', 'IDX_SUBMISSIONS_USER_LESSON');
    await queryRunner.dropIndex('exercise_submissions', 'IDX_SUBMISSIONS_LESSON_ID');
    await queryRunner.dropIndex('exercise_submissions', 'IDX_SUBMISSIONS_EXERCISE_ID');
    await queryRunner.dropIndex('exercise_submissions', 'IDX_SUBMISSIONS_USER_ID');

    // Drop foreign keys
    const table = await queryRunner.getTable('exercise_submissions');
    if (table) {
      const foreignKeys = table.foreignKeys.filter(
        fk => fk.columnNames.indexOf('user_id') !== -1 || fk.columnNames.indexOf('exercise_id') !== -1
      );
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('exercise_submissions', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('exercise_submissions');
  }
}
