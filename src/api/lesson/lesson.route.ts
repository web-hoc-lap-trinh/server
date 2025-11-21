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
 * /api/lessons/{lessonId}:
 *   get:
 *     summary: Lấy chi tiết một Bài học (public)
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: true
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
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của Bài học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
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
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của Bài học
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Không tìm thấy Bài học để xóa.
 */

router.get('/:lessonId', lessonController.getLesson);
router.put('/:lessonId', authMiddleware, checkAdmin, lessonController.updateLesson);
router.delete('/:lessonId', authMiddleware, checkAdmin, lessonController.deleteLesson);

/**
 * @swagger
 * /api/lessons:
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

router.post('/', authMiddleware, checkAdmin, lessonController.createLesson);

export default router;