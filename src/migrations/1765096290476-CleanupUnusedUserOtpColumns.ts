import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CleanupUnusedUserOtpColumns1765096290476 implements MigrationInterface {

    name = 'CleanupUnusedUserOtpColumns1700000000022'; 

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('UP: Xóa các cột change_password_otp không dùng.');
    
    await queryRunner.dropColumns('users', [
      'change_password_otp',
      'change_password_otp_expires',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('DOWN: Thêm lại các cột change_password_otp đã xóa.');
    
    await queryRunner.addColumn('users', new TableColumn({
        name: 'change_password_otp',
        type: 'varchar',
        length: '10',
        isNullable: true,
        default: null,
    }));
    await queryRunner.addColumn('users', new TableColumn({
        name: 'change_password_otp_expires',
        type: 'datetime',
        isNullable: true,
        default: null,
    }));
  }

}
