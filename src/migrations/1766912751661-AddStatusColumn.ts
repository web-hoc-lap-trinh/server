import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusColumn1766912751661 implements MigrationInterface {
    name = 'AddStatusColumn1766912751661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("users");
        const statusColumn = table?.findColumnByName("status");
        if (!statusColumn) {
            await queryRunner.addColumn("users", new TableColumn({
                name: "status",
                type: "enum",
                enum: ["ACTIVE", "BLOCKED"],
                default: "'ACTIVE'",
                isNullable: false
            }));
            console.log("✅ Đã thêm cột 'status' vào bảng 'users'");
        } else {
            console.log("⚠️ Cột 'status' đã tồn tại, bỏ qua bước này.");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("users");
        const statusColumn = table?.findColumnByName("status");

        if (statusColumn) {
            await queryRunner.dropColumn("users", "status");
            console.log("✅ Đã xóa cột 'status' khỏi bảng 'users'");
        }
    }
}