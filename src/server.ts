import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config(); 

import app from './app'; 
import { AppDataSource } from './config/data-source';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Database connected successfully using TypeORM');

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1); 
  }
};

startServer();
