import dotenv from 'dotenv';
dotenv.config();
import express, { Express, Request, Response } from 'express';
import { setupSwagger } from './config/swagger.js'; 

import authRoutes from './api/auth/auth.route.js';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

setupSwagger(app);

app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Chào mừng đến với Codery API! Truy cập /api-docs để xem tài liệu.');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});