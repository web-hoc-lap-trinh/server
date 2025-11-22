import { Router } from 'express';
import * as profileController from './profile.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { uploadSingleImage } from '../../middlewares/fileUpload.middleware';

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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lấy thông tin profile thành công
 *                 data:
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
 *     description: Cập nhật full_name và/hoặc avatar. Nếu gửi kèm file, avatar sẽ được upload lên Cloudinary.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Tên đầy đủ của người dùng
 *               avatar_file:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh đại diện (jpeg, png)
 *           examples:
 *             UpdateNameOnly:
 *               summary: Cập nhật chỉ Tên
 *               value:
 *                 full_name: "Nguyễn Văn User (Đã sửa)"
 *             UpdateNameAndAvatar:
 *               summary: Cập nhật Tên và Ảnh đại diện (Gửi kèm file 'avatar_file')
 *               value:
 *                 full_name: "Nguyễn Văn User (Đã sửa)"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *                   example: Cập nhật profile thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Chưa đăng nhập
 */
router.put('/', authMiddleware, uploadSingleImage('avatar_file'), profileController.updateProfile);

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
 *                   example: Đổi mật khẩu thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Mật khẩu cũ không đúng hoặc chưa đăng nhập
 */
router.post('/change-password', authMiddleware, profileController.changePassword);

/**
 * @swagger
 * /api/profile/request-change-password:
 *   post:
 *     summary: Yêu cầu gửi OTP để đổi mật khẩu (khi đã đăng nhập)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã gửi OTP xác nhận qua email
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
 *                   example: Đã gửi OTP xác nhận qua email.
 *       401:
 *         description: Chưa đăng nhập
 */
router.post('/request-change-password', authMiddleware, profileController.requestChangePassword);

/**
 * @swagger
 * /api/profile/verify-change-password:
 *   post:
 *     summary: Xác thực OTP và đặt lại mật khẩu mới (khi đã đăng nhập)
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
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
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
 *                   example: Đổi mật khẩu thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: OTP không hợp lệ/hết hạn
 *       401:
 *         description: Chưa đăng nhập
 */
router.post('/verify-change-password', authMiddleware, profileController.verifyChangePassword);

export default router;
