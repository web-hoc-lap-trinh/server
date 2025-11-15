import { Router } from 'express';
import * as profileController from './profile.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Lấy thông tin profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/', authMiddleware, profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Cập nhật profile (tên, avatar)
 *     description: Chỉ cho phép cập nhật full_name và avatar_url. Các trường khác (email, password) sẽ bị bỏ qua.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.put('/', authMiddleware, profileController.updateProfile);

/**
 * @swagger
 * /api/profile/change-password:
 *   post:
 *     summary: Đổi mật khẩu (xác thực bằng mật khẩu cũ)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       401:
 *         description: Mật khẩu cũ không đúng hoặc chưa đăng nhập
 */
router.post('/change-password', authMiddleware, profileController.changePassword);

export default router;
