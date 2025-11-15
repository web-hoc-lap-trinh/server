import express, { Express, Request, Response } from 'express';
import { setupSwagger } from './config/swagger';
import authRoutes from './api/auth/auth.route';
import profileRoutes from './api/profile/profile.route';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';

const app: Express = express();

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
