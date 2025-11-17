import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { setupSwagger } from './config/swagger';
import authRoutes from './api/auth/auth.route';
import profileRoutes from './api/profile/profile.route';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';

const app: Express = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 

setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
// Expose profile endpoints under /api/profile
app.use('/api/profile', profileRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Chào mừng đến với Codery API! Truy cập /api-docs để xem tài liệu.');
});

// Error handling - must be last
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
