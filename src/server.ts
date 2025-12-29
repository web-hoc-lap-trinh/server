import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { AppDataSource } from './config/data-source';
import mysql from 'mysql2/promise';
import { initializeQueue, startWorker } from './api/submission/services/queue.service';
import { checkDockerAvailable } from './api/submission/services/docker-runner.service';
import http from 'http';
import { initializeRealtimeServer } from './realtime';
import { schedulerService } from './api/daily_activities/scheduler.service'; 

const PORT = process.env.PORT || 3000;
const ENABLE_WORKER = process.env.ENABLE_WORKER !== 'false'; // Enable by default
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2');

const createDatabaseIfNotExists = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Kết nối MySQL mà không chỉ định database
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });

      // Tạo database nếu chưa tồn tại
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
      console.log(`✅ Database '${process.env.DB_NAME}' is ready`);

      await connection.end();
      return; // Thành công, thoát khỏi hàm
    } catch (error) {
      if (i === retries - 1) {
        console.error('❌ Error creating database after', retries, 'attempts:', error);
        throw error;
      }
      console.log(`⏳ Waiting for database... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const initializeJudgeSystem = async () => {
  try {
    // Check Docker availability
    // const dockerAvailable = await checkDockerAvailable();
    // if (!dockerAvailable) {
    //   console.warn('⚠️  Docker not available - code execution will not work');
    //   return;
    // }
    // console.log('🐳 Docker is available');

    // Initialize queue (Redis required for BullMQ)
    try {
      await initializeQueue();
      console.log('📋 Judge queue initialized');

      // Start worker if enabled
      if (ENABLE_WORKER) {
        await startWorker(WORKER_CONCURRENCY);
        console.log(`👷 Judge worker started (concurrency: ${WORKER_CONCURRENCY})`);
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || 
          error.message?.includes('Redis') || 
          error.message?.includes('NOAUTH') ||
          error.message?.includes('Authentication')) {
        console.warn('⚠️  Redis not available or requires authentication - submissions will be judged synchronously');
        console.warn('   Set REDIS_PASSWORD in .env if your Redis requires authentication');
      } else {
        console.error('❌ Queue initialization error:', error.message);
      }
    }
  } catch (error: any) {
    console.error('❌ Error initializing judge system:', error.message);
    // Don't exit - server can still run without judge system
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
      try {
        await AppDataSource.runMigrations();
        console.log('✅ Migrations executed successfully');
      } catch (error: any) {
        // Nếu lỗi duplicate column, bỏ qua và tiếp tục
        if (error.code === 'ER_DUP_FIELDNAME' || error.message?.includes('Duplicate column')) {
          console.warn('⚠️  Migration warning: Column already exists, skipping...');
        } else {
          throw error; // Throw lại lỗi khác
        }
      }
    } else {
      console.log('✅ Database is up to date');
    }

    // Initialize judge system
    await initializeJudgeSystem();

    // Khởi động scheduler cho Daily Challenges
    schedulerService.start();
    
    // Chạy ngay lập tức lần đầu (nếu muốn - comment dòng này nếu chỉ muốn chạy vào 0h00)
    // await schedulerService.runDailyChallengeNow();

    const httpServer = http.createServer(app);

    initializeRealtimeServer(httpServer); 

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📡 Realtime WS tại ws://localhost:${PORT}/ws/socket.io`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

startServer();
