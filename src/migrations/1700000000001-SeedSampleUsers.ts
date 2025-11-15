import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcryptjs from 'bcryptjs';

export class SeedSampleUsers1700000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Hash passwords
        const userPasswordHash = await bcryptjs.hash('string', 10);
        const adminPasswordHash = await bcryptjs.hash('string', 10);

        // Insert student user
        await queryRunner.query(`
            INSERT INTO users (
                email, 
                password_hash, 
                full_name, 
                role, 
                is_verified,
                avatar_url,
                total_score,
                solved_problems,
                current_streak,
                max_streak,
                created_at,
                updated_at
            ) VALUES (
                'user@gmail.com',
                '${userPasswordHash}',
                'Nguyễn Văn User',
                'student',
                1,
                'https://ui-avatars.com/api/?name=Nguyen+Van+User&background=random',
                150,
                12,
                5,
                8,
                NOW(),
                NOW()
            )
        `);

        // Insert admin user
        await queryRunner.query(`
            INSERT INTO users (
                email, 
                password_hash, 
                full_name, 
                role, 
                is_verified,
                avatar_url,
                total_score,
                solved_problems,
                current_streak,
                max_streak,
                created_at,
                updated_at
            ) VALUES (
                'admin@gmail.com',
                '${adminPasswordHash}',
                'Admin Codery',
                'admin',
                1,
                'https://ui-avatars.com/api/?name=Admin+Codery&background=random',
                0,
                0,
                0,
                0,
                NOW(),
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove sample users
        await queryRunner.query(`
            DELETE FROM users WHERE email IN ('user@gmail.com', 'admin@gmail.com')
        `);
    }
}
