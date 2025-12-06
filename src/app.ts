import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { setupSwagger } from './config/swagger';
import authRoutes from './api/auth/auth.route';
import profileRoutes from './api/profile/profile.route';
import categoryRoutes from './api/category/category.route';
import lessonRoutes from './api/lesson/lesson.route';
import exerciseRoutes from './api/exercise/exercise.route';
import problemRoutes from './api/problem/problem.route';
import testcaseRoutes from './api/problem/testcase.route';
import submissionRoutes from './api/submission/submission.route';
import tagRoutes from './api/tag/tag.route';
import recommendationRoutes from './api/recommendation/recommendation.route';
import { submitCode, getProblemLeaderboard } from './api/submission/submission.controller';
import { authMiddleware } from './middlewares/auth.middleware';
import { addTagsToProblem, removeTagsFromProblem, setTagsForProblem, getTagsForProblem } from './api/tag/tag.controller';
import { getAllConversations } from './api/problem/ai.controller';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import communityRoutes from './api/community/community.route';

const app: Express = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json({ limit: '10mb' })); // Increased for source code
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 

setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
// Expose profile endpoints under /api/profile
app.use('/api/profile', profileRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/lessons', lessonRoutes);
app.use('/api/exercises', exerciseRoutes);

// Online Judge routes
app.use('/api/problems', problemRoutes);
app.use('/api/testcases', testcaseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Submit code endpoint (nested under problems)
app.post('/api/problems/:id/submit', authMiddleware, submitCode);

// Problem leaderboard endpoint
app.get('/api/problems/:id/leaderboard', authMiddleware, getProblemLeaderboard);

// Problem-Tag relation endpoints
app.get('/api/problems/:id/tags', getTagsForProblem);
app.post('/api/problems/:id/tags', authMiddleware, addTagsToProblem);
app.put('/api/problems/:id/tags', authMiddleware, setTagsForProblem);
app.delete('/api/problems/:id/tags', authMiddleware, removeTagsFromProblem);

// AI Chat - get all conversations for current user
app.get('/api/ai/conversations', authMiddleware, getAllConversations);

app.use('/api/community', communityRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Chào mừng đến với Codery API! Truy cập /api-docs để xem tài liệu.');
});

// Error handling - must be last
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
