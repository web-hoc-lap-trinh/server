import { Router } from 'express';
import * as categoryController from './category.controller';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';
import { uploadSingleImage } from '../../middlewares/fileUpload.middleware';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: "Lấy danh sách tất cả các Chủ đề đang hoạt động"
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Danh sách chủ đề
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
 *                   example: Categories fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *
 *   post:
 *     summary: "[ADMIN] Tạo mới một Chủ đề"
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên chủ đề
 *               order_index:
 *                 type: integer
 *                 description: Thứ tự hiển thị
 *               icon_file:
 *                 type: string
 *                 format: binary
 *                 description: File icon (image/jpeg, image/png)
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/', categoryController.getCategories);
router.post(
  '/',
  authMiddleware,
  checkAdmin,
  uploadSingleImage('icon_file'),
  categoryController.createCategory
);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   get:
 *     summary: "Lấy chi tiết một Chủ đề"
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Chủ đề
 *     responses:
 *       200:
 *         description: Chi tiết chủ đề
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
 *                   example: Category fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy Chủ đề
 *
 *   put:
 *     summary: "[ADMIN] Cập nhật thông tin Chủ đề"
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Chủ đề
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               order_index:
 *                 type: integer
 *               icon_file:
 *                 type: string
 *                 format: binary
 *               is_active:
 *                 type: boolean
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
 *                   example: Cập nhật Chủ đề thành công
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy Chủ đề
 *
 *   delete:
 *     summary: "[ADMIN] Xóa (Deactivate) Chủ đề"
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của Chủ đề
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Xóa (Deactivate) Chủ đề thành công.
 *       404:
 *         description: Không tìm thấy Chủ đề
 */
router.get('/:categoryId', categoryController.getCategory);
router.put(
  '/:categoryId',
  authMiddleware,
  checkAdmin,
  uploadSingleImage('icon_file'),
  categoryController.updateCategory
);
router.delete(
  '/:categoryId',
  authMiddleware,
  checkAdmin,
  categoryController.deleteCategory
);

export default router;
