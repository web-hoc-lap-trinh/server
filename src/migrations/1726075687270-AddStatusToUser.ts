import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusToUser1726075687270 implements MigrationInterface {
public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "status",
                type: "enum",
                enum: ["ACTIVE", "BLOCKED"],
                default: "'ACTIVE'",
                comment: "ACTIVE: Công khai, BLOCKED: Khóa"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "status");
    }
}
