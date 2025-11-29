import { MigrationInterface, QueryRunner, TableColumn, Table, TableForeignKey } from 'typeorm';

export class UpdateExerciseForMultipleChoice1700000000008 implements MigrationInterface {
  name = 'UpdateExerciseForMultipleChoice1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if lesson_exercises table exists
    const tableExists = await queryRunner.hasTable('lesson_exercises');
    
    if (tableExists) {
      // Drop existing table and recreate with new structure
      // First drop foreign key if exists
      const table = await queryRunner.getTable('lesson_exercises');
      const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('lesson_id'));
      if (foreignKey) {
        await queryRunner.dropForeignKey('lesson_exercises', foreignKey);
      }
      
      await queryRunner.dropTable('lesson_exercises');
      console.log('Dropped old lesson_exercises table');
    }

    // Create new lesson_exercises table with updated structure
    await queryRunner.createTable(
      new Table({
        name: 'lesson_exercises',
        columns: [
          {
            name: 'exercise_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'lesson_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'question',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'exercise_type',
            type: 'enum',
            enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE'],
            default: "'MULTIPLE_CHOICE'",
          },
          {
            name: 'options',
            type: 'json',
            isNullable: false,
            comment: 'JSON array of {id, text} objects',
          },
          {
            name: 'correct_answer',
            type: 'varchar',
            length: '10',
            isNullable: false,
            comment: 'A/B/C/D for multiple choice, TRUE/FALSE for true/false',
          },
          {
            name: 'explanation',
            type: 'text',
            isNullable: true,
            comment: 'Explanation shown after answering',
          },
          {
            name: 'order_index',
            type: 'int',
            default: 0,
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

    // Add foreign key
    await queryRunner.createForeignKey(
      'lesson_exercises',
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedColumnNames: ['lesson_id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
      })
    );

    // Add index on lesson_id for performance
    await queryRunner.query(`
      CREATE INDEX idx_lesson_exercises_lesson_id ON lesson_exercises (lesson_id)
    `);

    // Add index on order_index for sorting
    await queryRunner.query(`
      CREATE INDEX idx_lesson_exercises_order ON lesson_exercises (lesson_id, order_index)
    `);

    console.log('Created new lesson_exercises table with multiple choice structure');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    const table = await queryRunner.getTable('lesson_exercises');
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('lesson_id'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('lesson_exercises', foreignKey);
    }

    // Drop table
    await queryRunner.dropTable('lesson_exercises');

    // Recreate old structure
    await queryRunner.createTable(
      new Table({
        name: 'lesson_exercises',
        columns: [
          {
            name: 'exercise_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'lesson_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'exercise_type',
            type: 'enum',
            enum: ['fill_blank', 'fix_code', 'multiple_choice', 'coding'],
            isNullable: true,
          },
          {
            name: 'initial_code',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'solution_code',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'hints',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'explanation',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'order_index',
            type: 'int',
            default: 0,
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

    // Add foreign key back
    await queryRunner.createForeignKey(
      'lesson_exercises',
      new TableForeignKey({
        columnNames: ['lesson_id'],
        referencedColumnNames: ['lesson_id'],
        referencedTableName: 'lessons',
        onDelete: 'CASCADE',
      })
    );
  }
}
