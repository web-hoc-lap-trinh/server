import { Request, Response, NextFunction } from 'express';
import * as statsService from './stats.service'; 
import { successResponse } from '../../utils/apiResponse'; 
import { asyncHandler } from '../../middlewares/errorHandler.middleware';
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan cho Admin Dashboard
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
 *                     accepted_submissions:
 *                       type: integer
 *                     acceptance_rate:
 *                       type: number
 *                     total_submissions:
 *                       type: integer
 *                     current_highest_streak:
 *                       type: integer
 *             example:
 *               success: true
 *               data:
 *                 total_users: 38100
 *                 active_users_today: 100
 *                 total_lessons: 50
 *                 total_categories: 10
 *                 total_problems: 2000
 *                 total_test_cases: 1000000
 *                 accepted_submissions: 6000
 *                 acceptance_rate: 50.0
 *                 total_submissions: 12000
 *                 current_highest_streak: 30
 */
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await statsService.getAdminStats();
  successResponse(res, 'Admin stats retrieved successfully', stats);
});
