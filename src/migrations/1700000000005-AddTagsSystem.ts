import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddTagsSystem1700000000005 implements MigrationInterface {
  name = 'AddTagsSystem1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tags table
    await queryRunner.createTable(
      new Table({
        name: 'tags',
        columns: [
          {
            name: 'tag_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '7',
            isNullable: true,
            comment: 'Hex color code',
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Icon class or name',
          },
          {
            name: 'order_index',
            type: 'int',
            default: 0,
            comment: 'Display order',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'problem_count',
            type: 'int',
            default: 0,
            comment: 'Number of problems with this tag',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create problem_tags junction table
    await queryRunner.createTable(
      new Table({
        name: 'problem_tags',
        columns: [
          {
            name: 'problem_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'tag_id',
            type: 'int',
            isPrimary: true,
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

    // Add foreign keys
    await queryRunner.createForeignKey(
      'problem_tags',
      new TableForeignKey({
        columnNames: ['problem_id'],
        referencedColumnNames: ['problem_id'],
        referencedTableName: 'problems',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'problem_tags',
      new TableForeignKey({
        columnNames: ['tag_id'],
        referencedColumnNames: ['tag_id'],
        referencedTableName: 'tags',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_TAGS_SLUG',
        columnNames: ['slug'],
      })
    );

    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_TAGS_IS_ACTIVE',
        columnNames: ['is_active'],
      })
    );

    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_TAGS_ORDER',
        columnNames: ['order_index'],
      })
    );

    // Seed some default tags
    await queryRunner.query(`
      INSERT INTO tags (name, slug, description, color, order_index) VALUES
      ('Array', 'array', 'Problems involving array manipulation', '#ef4444', 1),
      ('String', 'string', 'Problems involving string manipulation', '#f97316', 2),
      ('Hash Table', 'hash-table', 'Problems using hash maps or sets', '#eab308', 3),
      ('Math', 'math', 'Problems involving mathematical concepts', '#84cc16', 4),
      ('Dynamic Programming', 'dynamic-programming', 'Problems with optimal substructure', '#22c55e', 5),
      ('Sorting', 'sorting', 'Problems involving sorting algorithms', '#14b8a6', 6),
      ('Greedy', 'greedy', 'Problems using greedy approach', '#06b6d4', 7),
      ('Binary Search', 'binary-search', 'Problems using binary search', '#0ea5e9', 8),
      ('Tree', 'tree', 'Problems involving tree data structure', '#3b82f6', 9),
      ('Graph', 'graph', 'Problems involving graph algorithms', '#6366f1', 10),
      ('Two Pointers', 'two-pointers', 'Problems using two pointer technique', '#8b5cf6', 11),
      ('Stack', 'stack', 'Problems using stack data structure', '#a855f7', 12),
      ('Queue', 'queue', 'Problems using queue data structure', '#d946ef', 13),
      ('Linked List', 'linked-list', 'Problems involving linked lists', '#ec4899', 14),
      ('Recursion', 'recursion', 'Problems using recursive approach', '#f43f5e', 15),
      ('Backtracking', 'backtracking', 'Problems using backtracking', '#64748b', 16),
      ('Bit Manipulation', 'bit-manipulation', 'Problems involving bit operations', '#475569', 17),
      ('Heap', 'heap', 'Problems using heap/priority queue', '#78716c', 18)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const problemTagsTable = await queryRunner.getTable('problem_tags');
    if (problemTagsTable) {
      const foreignKeys = problemTagsTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('problem_tags', fk);
      }
    }

    // Drop indexes
    await queryRunner.dropIndex('tags', 'IDX_TAGS_SLUG');
    await queryRunner.dropIndex('tags', 'IDX_TAGS_IS_ACTIVE');
    await queryRunner.dropIndex('tags', 'IDX_TAGS_ORDER');

    // Drop tables
    await queryRunner.dropTable('problem_tags', true);
    await queryRunner.dropTable('tags', true);
  }
}
