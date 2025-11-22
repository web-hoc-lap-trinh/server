import { Router } from 'express';
import * as authController from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *         email:
 *           type: string
 *         full_name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [STUDENT, ADMIN]
 *
 *     RegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - full_name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *         full_name:
 *           type: string
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@gmail.com
 *         password:
 *           type: string
 *           format: password
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Tên chủ đề
 *         order_index:
 *           type: integer
 *           description: Thứ tự hiển thị
 *         icon_url:
 *           type: string
 *           description: URL icon (optional)
 *
 *     Category:
 *       type: object
 *       properties:
 *         category_id:
 *           type: integer
 *         name:
 *           type: string
 *         order_index:
 *           type: integer
 *         icon_url:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     LessonInput:
 *       type: object
 *       required:
 *         - category_id
 *         - title
 *         - content
 *       properties:
 *         category_id:
 *           type: integer
 *           description: ID của Chủ đề liên quan
 *         title:
 *           type: string
 *           description: Tiêu đề Bài học
 *         content:
 *           type: string
 *           description: Nội dung Bài học (dạng HTML, bao gồm cả bài tập điền vào chỗ trống)
 *         description:
 *           type: string
 *           description: Mô tả ngắn gọn
 *         difficulty_level:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *         order_index:
 *           type: integer
 *
 *     Lesson:
 *       type: object
 *       properties:
 *         lesson_id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         difficulty_level:
 *           type: string
 *         view_count:
 *           type: integer
 *         updated_at:
 *           type: string
 *           format: date-time
 *         category:
 *           $ref: '#/components/schemas/Category'
 *
 * tags:
 *   - name: Auth
 *     description: API xác thực người dùng
 *   - name: Profile
 *     description: API quản lý thông tin cá nhân
 *   - name: Category
 *     description: API Quản lý Chủ đề Học tập (Admin) & Xem (Public)
 *   - name: Lesson
 *     description: API Quản lý Bài học (Admin) & Xem (Public)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký và gửi OTP xác thực
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Đăng ký thành công, chờ xác thực
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Email đã tồn tại
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/verify-account:
 *   post:
 *     summary: Xác thực tài khoản bằng OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xác thực thành công (tự động đăng nhập)
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
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: OTP không hợp lệ hoặc hết hạn
 */
router.post('/verify-account', authController.verifyAccount);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Gửi lại OTP xác thực
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Đã gửi lại OTP
 *       400:
 *         description: Email không tồn tại hoặc tài khoản đã xác thực
 */
router.post('/resend-otp', authController.resendVerificationOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập (cả student và admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *                   example: 'Đăng nhập thành công'
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Sai email hoặc mật khẩu
 *       403:
 *         description: Tài khoản student chưa được xác thực
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Yêu cầu gửi OTP reset mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP đã được gửi
 *       400:
 *         description: Email không tồn tại
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu bằng OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: OTP không hợp lệ hoặc hết hạn
 */
router.post('/reset-password', authController.resetPassword);
// Profile routes have been moved to a dedicated router mounted at /api/profile

export default router;
