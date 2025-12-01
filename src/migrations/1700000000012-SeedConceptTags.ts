import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedConceptTags1700000000012 implements MigrationInterface {
  name = 'SeedConceptTags1700000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert concept tags for learning recommendations
    const conceptTags = [
      {
        name: 'Syntax Basic',
        slug: 'syntax-basic',
        description: 'Basic programming syntax and language fundamentals',
        color: '#10B981', // Emerald green
        icon: 'code',
        order_index: 100,
      },
      {
        name: 'Time Complexity',
        slug: 'time-complexity',
        description: 'Algorithm time complexity and optimization',
        color: '#F59E0B', // Amber
        icon: 'clock',
        order_index: 101,
      },
      {
        name: 'Memory Management',
        slug: 'memory-management',
        description: 'Memory allocation, optimization and management',
        color: '#8B5CF6', // Purple
        icon: 'memory',
        order_index: 102,
      },
      {
        name: 'Logic & Edge Cases',
        slug: 'logic-edge-cases',
        description: 'Program logic and handling edge cases',
        color: '#EF4444', // Red
        icon: 'lightbulb',
        order_index: 103,
      },
      {
        name: 'Debugging',
        slug: 'debugging',
        description: 'Debugging techniques and error handling',
        color: '#3B82F6', // Blue
        icon: 'bug',
        order_index: 104,
      },
    ];

    for (const tag of conceptTags) {
      // Check if tag already exists
      const existingTag = await queryRunner.query(
        `SELECT tag_id FROM tags WHERE slug = ?`,
        [tag.slug]
      );

      if (existingTag.length === 0) {
        await queryRunner.query(
          `INSERT INTO tags (name, slug, description, color, icon, order_index, is_active, problem_count)
           VALUES (?, ?, ?, ?, ?, ?, true, 0)`,
          [tag.name, tag.slug, tag.description, tag.color, tag.icon, tag.order_index]
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the seeded concept tags
    const slugs = [
      'syntax-basic',
      'time-complexity',
      'memory-management',
      'logic-edge-cases',
      'debugging',
    ];

    for (const slug of slugs) {
      await queryRunner.query(`DELETE FROM tags WHERE slug = ?`, [slug]);
    }
  }
}
