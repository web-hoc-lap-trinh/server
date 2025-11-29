import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveCategoryTagsColumn1700000000007 implements MigrationInterface {
  name = 'RemoveCategoryTagsColumn1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before dropping
    const table = await queryRunner.getTable('problems');
    const categoryTagsColumn = table?.findColumnByName('category_tags');
    
    if (categoryTagsColumn) {
      await queryRunner.dropColumn('problems', 'category_tags');
      console.log('Dropped category_tags column from problems table');
    } else {
      console.log('category_tags column does not exist, skipping');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the column if needed
    await queryRunner.addColumn(
      'problems',
      new TableColumn({
        name: 'category_tags',
        type: 'json',
        isNullable: true,
      })
    );
  }
}
