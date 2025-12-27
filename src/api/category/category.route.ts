import { Router } from 'express';
import * as categoryController from './category.controller';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';
import { uploadSingleImage } from '../../middlewares/fileUpload.middleware';

const router = Router();

/* ======================================================
   ADMIN ROUTES (Cần đăng nhập + Quyền Admin)
====================================================== */

/**
 * @swagger
 * /api/categories/admin:
 *   get:
 *     summary: "[ADMIN] Lấy danh sách tất cả Chủ đề (bao gồm cả ẩn)"
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đầy đủ Chủ đề
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       403:
 *         description: Không có quyền Admin
 */
router.get(
  '/admin',
  authMiddleware,
  checkAdmin,
  categoryController.getCategoriesAdmin
);

/**
 * @swagger
 * /api/categories/admin/{categoryId}:
 *   get:
 *     summary: "[ADMIN] Lấy chi tiết Chủ đề (kể cả inactive)"
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết Chủ đề
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
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy Chủ đề
 */
router.get(
  '/admin/:categoryId',
  authMiddleware,
  checkAdmin,
  categoryController.getCategoryAdmin
);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: "[ADMIN] Tạo mới Chủ đề"
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
 *               order_index:
 *                 type: integer
 *               icon_file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo mới thành công
 */
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
 *   put:
 *     summary: "[ADMIN] Cập nhật Chủ đề"
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
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
 */
router.put(
  '/:categoryId',
  authMiddleware,
  checkAdmin,
  uploadSingleImage('icon_file'),
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/categories/{categoryId}:
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
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy Chủ đề
 */
router.delete(
  '/:categoryId',
  authMiddleware,
  checkAdmin,
  categoryController.deleteCategory
);

/* ======================================================
   PUBLIC ROUTES (Ai cũng xem được)
====================================================== */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: "Lấy danh sách Chủ đề đang hoạt động"
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Danh sách Chủ đề active
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/', categoryController.getCategoriesPublic);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   get:
 *     summary: "Lấy chi tiết Chủ đề (Public)"
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết Chủ đề
 *       404:
 *         description: Không tìm thấy hoặc Chủ đề đã bị ẩn
 */
router.get('/:categoryId', categoryController.getCategoryPublic);

export default router;
