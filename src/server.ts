import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { AppDataSource } from './config/data-source';
import mysql from 'mysql2/promise';

const PORT = process.env.PORT || 3000;

const createDatabaseIfNotExists = async () => {
  try {
    // Kết nối MySQL mà không chỉ định database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Tạo database nếu chưa tồn tại
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database '${process.env.DB_NAME}' is ready`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error creating database:', error);
    throw error;
  }
};

const startServer = async () => {
  try {
    // Tạo database nếu chưa tồn tại
    await createDatabaseIfNotExists();

    // Kết nối database
    await AppDataSource.initialize();
    console.log('🌱 Database connected successfully using TypeORM');

    // Tự động chạy migrations
    const pendingMigrations = await AppDataSource.showMigrations();

    if (pendingMigrations) {
      console.log('📦 Running pending migrations...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrations executed successfully');
    } else {
      console.log('✅ Database is up to date');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

startServer();
