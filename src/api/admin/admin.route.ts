import { Router } from 'express';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';
import * as userController from '../user/user.controller';
import * as statsController from '../admin/stats.controller';
import * as discussionController from '../admin/discussion.controller';
import * as analyticsController from '../admin/analytics.controller';

const router = Router();

router.use(authMiddleware, checkAdmin);

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Quản lý tổng thể dành cho Admin (Dashboard & Users)
 *   - name: Admin Analytics
 *     description: API Analytics và Dashboard cho Admin
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUserResponse:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           example: 89393637
 *         full_name:
 *           type: string
 *           example: "Phạm Hà Anh Thư"
 *         avatar_url:
 *           type: string
 *           nullable: true
 *           example: "https://ui-avatars.com/api/?name=Anh+Thu"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-21T04:09:52.000Z"
 *         last_active:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-09-10T04:09:52.000Z"
 *         current_streak:
 *           type: integer
 *           example: 5
 *           description: "Số ngày streak hiện tại của user"
 *         status:
 *           type: string
 *           enum: [ACTIVE, BLOCKED]
 *           example: "ACTIVE"
 *     AdminStatsResponse:
 *       type: object
 *       properties:
 *         total_users:
 *           type: integer
 *           example: 1200
 *         total_submissions:
 *           type: integer
 *           example: 8540
 *         total_lessons:
 *           type: integer
 *           example: 42
 *         total_problems:
 *           type: integer
 *           example: 320
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Lấy dữ liệu thống kê hệ thống cho Dashboard
 *     tags: [Admin]
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
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/stats', statsController.getAdminStats);


/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Danh sách người dùng đầy đủ các cột (Manager)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo tên người dùng
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số người dùng mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy danh sách thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminUserResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get('/users', userController.listUsersForAdmin);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Khóa hoặc mở khóa tài khoản người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BLOCKED]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng thái thành công"
 *                 data:
 *                   type: object
 *                   $ref: '#/components/schemas/AdminUserResponse'
 */
router.patch('/users/:id/status', userController.toggleUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xóa người dùng khỏi hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Xóa người dùng thành công"
 */
router.delete('/users/:id', userController.deleteUser);

// ======================================================================
// DISCUSSIONS (Admin Management)
// ======================================================================

/**
 * @swagger
 * /api/admin/discussions:
 *   get:
 *     summary: Lấy danh sách tất cả discussions (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: problem_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: lesson_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: is_solution
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề
 *     responses:
 *       200:
 *         description: Lấy danh sách discussions thành công
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
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/discussions', discussionController.getAllDiscussions);

/**
 * @swagger
 * /api/admin/discussions/{discussionId}/replies:
 *   get:
 *     summary: Lấy tất cả replies của một discussion (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lấy danh sách replies thành công
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
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/discussions/:discussionId/replies', discussionController.getDiscussionReplies);

/**
 * @swagger
 * /api/admin/discussions/{discussionId}/mark-solution:
 *   patch:
 *     summary: Đánh dấu discussion là solution (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Đánh dấu thành công
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
 */
router.patch('/discussions/:discussionId/mark-solution', discussionController.markAsSolution);

/**
 * @swagger
 * /api/admin/discussions/{discussionId}:
 *   delete:
 *     summary: Xóa discussion (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Xóa thành công
 */
router.delete('/discussions/:discussionId', discussionController.deleteDiscussion);

// ==========================================
// ANALYTICS ROUTES - Dashboard Charts & Metrics
// ==========================================

router.get('/analytics/user-growth', analyticsController.getUserGrowth);
router.get('/analytics/category-distribution', analyticsController.getCategoryDistribution);
router.get('/analytics/submission-status', analyticsController.getSubmissionStatus);
router.get('/analytics/problem-difficulty', analyticsController.getProblemDifficulty);

export default router;
