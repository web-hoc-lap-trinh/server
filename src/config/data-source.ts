import 'reflect-metadata';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [
    path.join(__dirname, '../api/**/*.entity{.ts,.js}'),
  ],
  migrations: [
    path.join(__dirname, '../migrations/**/*{.ts,.js}'),
  ],
  subscribers: [],
  migrationsTableName: 'migrations',
  migrationsRun: false, // Sẽ được xử lý thủ công trong server.ts
});