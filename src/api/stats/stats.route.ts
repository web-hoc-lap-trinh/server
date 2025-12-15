import { Router } from 'express';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';
import * as statsController from '../stats/stats.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: API để lấy các số liệu thống kê tổng quan (Admin View)
 */

// Áp dụng Auth và Admin Check cho tất cả các route trong module này
router.use(authMiddleware, checkAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan cho Admin Dashboard
 *     description: Cung cấp các chỉ số tổng hợp về người dùng, bài tập, bài nộp và streak
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về các chỉ số thống kê
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_users:
 *                       type: integer
 *                     active_users_today:
 *                       type: integer
 *                     total_lessons:
 *                       type: integer
 *                     total_categories:
 *                       type: integer
 *                     total_problems:
 *                       type: integer
 *                     total_test_cases:
 *                       type: integer
 *                     total_submissions:
 *                       type: integer
 *                     accepted_submissions:
 *                       type: integer
 *                     acceptance_rate:
 *                       type: number
 *                       format: float
 *                     current_highest_streak:
 *                       type: integer
 *             example:
 *               success: true
 *               message: "Admin stats retrieved successfully"
 *               data:
 *                 total_users: 38100
 *                 active_users_today: 100
 *                 total_lessons: 50
 *                 total_categories: 10
 *                 total_problems: 2000
 *                 total_test_cases: 1000000
 *                 total_submissions: 12000
 *                 accepted_submissions: 6000
 *                 acceptance_rate: 50.0
 *                 current_highest_streak: 30
 *
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/', statsController.getAdminStats);

router.use(authMiddleware, checkAdmin); 

export default router;