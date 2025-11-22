import { Router } from 'express';
import * as lessonController from './lesson.controller';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Lesson fetched successfully
 *         data:
 *           $ref: '#/components/schemas/Lesson'
 *
 *     LessonListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Lessons fetched successfully
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Xóa Bài học thành công.
 */

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Lấy danh sách tất cả các Bài học đã xuất bản (public)
 *     tags: [Lesson]
 *     responses:
 *       200:
 *         description: Danh sách bài học đã xuất bản
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonListResponse'
 *
 *   post:
 *     summary: "[ADMIN] Tạo mới một Bài học"
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *     responses:
 *       201:
 *         description: Tạo mới thành công
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
 *                   example: Tạo Bài học thành công
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/', lessonController.getPublishedLessons); 
router.post('/', authMiddleware, checkAdmin, lessonController.createLesson);

/**
 * @swagger
 * /api/lessons/admin:
 *   get:
 *     summary: "[ADMIN] Lấy danh sách tất cả Bài học (bao gồm cả chưa xuất bản)"
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả bài học
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonListResponse'
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/admin', authMiddleware, checkAdmin, lessonController.getAllLessonsAdmin);

/**
 * @swagger
 * /api/lessons/category/{categoryId}:
 *   get:
 *     summary: Lấy danh sách Bài học theo Chủ đề (Category ID)
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Chủ đề
 *     responses:
 *       200:
 *         description: Danh sách bài học theo chủ đề
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonListResponse'
 *       400:
 *         description: Category ID không hợp lệ
 */
router.get('/category/:categoryId', lessonController.getLessonsByCategory);

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   get:
 *     summary: Lấy chi tiết một Bài học (public)
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Bài học
 *     responses:
 *       200:
 *         description: Chi tiết bài học
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonResponse'
 *       404:
 *         description: Bài học không tồn tại hoặc chưa xuất bản
 *
 *   put:
 *     summary: "[ADMIN] Cập nhật Bài học"
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Bài học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *           examples:
 *             UpdateAndPublish:
 *               summary: Cập nhật nội dung và Xuất bản
 *               value:
 *                 category_id: 1
 *                 title: "Tựa đề bài học đã cập nhật"
 *                 content: "Nội dung bài học dạng HTML đã chỉnh sửa"
 *                 description: "Mô tả ngắn gọn đã sửa"
 *                 difficulty_level: "INTERMEDIATE"
 *                 order_index: 1
 *                 is_published: true
 *             UnpublishLesson:
 *               summary: Chuyển về trạng thái nháp
 *               value:
 *                 is_published: false
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
 *                   example: Cập nhật Bài học thành công
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       403:
 *         description: Không có quyền Admin
 *
 *   delete:
 *     summary: "[ADMIN] Xóa Bài học"
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Bài học
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Không tìm thấy Bài học để xóa
 */
router.get('/:lessonId', lessonController.getLesson);
router.put('/:lessonId', authMiddleware, checkAdmin, lessonController.updateLesson);
router.delete('/:lessonId', authMiddleware, checkAdmin, lessonController.deleteLesson);

export default router;
