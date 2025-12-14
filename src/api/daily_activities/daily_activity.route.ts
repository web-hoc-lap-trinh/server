import { Router } from 'express';
import * as dailyActivityController from './daily_activity.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * ======================================================================
 * SWAGGER TAG
 * ======================================================================
 */

/**
 * @swagger
 * tags:
 *   name: DailyActivity
 *   description: Quản lý hoạt động luyện tập hàng ngày và streak
 */

/**
 * ======================================================================
 * DAILY ACTIVITY ROUTES
 * ======================================================================
 */

/**
 * @swagger
 * /api/daily-activities/today:
 *   get:
 *     summary: Lấy hoạt động của người dùng trong ngày hôm nay
 *     tags: [DailyActivity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin hoạt động hôm nay
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Fetched daily activity successfully"
 *               data:
 *                 activity_date: "2025-12-14"
 *                 problems_solved: 3
 *                 streak_day: 5
 *                 points_earned: 150
 *       404:
 *         description: Không có hoạt động nào trong ngày
 */
router.get(
  '/today',
  authMiddleware,
  dailyActivityController.getTodayActivity
);

/**
 * @swagger
 * /api/daily-activities/history:
 *   get:
 *     summary: Lấy lịch sử hoạt động (có phân trang)
 *     tags: [DailyActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lịch sử hoạt động
 */
router.get(
  '/history',
  authMiddleware,
  dailyActivityController.getActivitiesHistory
);

export default router;
