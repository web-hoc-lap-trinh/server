import { Router } from 'express';
import * as categoryController from './category.controller';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách tất cả các Chủ đề đang hoạt động
 *     tags: [Category] 
 *     responses:
 *       200:
 *         description: Danh sách chủ đề
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *   post:
 *     summary: [ADMIN] Tạo mới một Chủ đề
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Tạo mới thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/', categoryController.getCategories);
router.post('/', authMiddleware, checkAdmin, categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   put:
 *     summary: [ADMIN] Cập nhật thông tin Chủ đề
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của Chủ đề
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy Chủ đề
 *   delete:
 *     summary: [ADMIN] Xóa (Deactivate) Chủ đề
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của Chủ đề
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy Chủ đề
 */
router.put('/:categoryId', authMiddleware, checkAdmin, categoryController.updateCategory);
router.delete('/:categoryId', authMiddleware, checkAdmin, categoryController.deleteCategory);

export default router;
