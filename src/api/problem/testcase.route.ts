import { Router } from 'express';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';
import * as problemController from '../problem/problem.controller';

const router = Router();

// ==========================================
// TEST CASE ROUTES (Standalone)
// ==========================================

/**
 * @swagger
 * /api/testcases/{id}:
 *   put:
 *     summary: Cập nhật test case
 *     description: |
 *       Cập nhật thông tin của một test case.
 *       
 *       **Yêu cầu:** Quyền Admin
 *     tags: [Test Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của test case
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: string
 *                 description: Dữ liệu input mới
 *               expected_output:
 *                 type: string
 *                 description: Output mong đợi mới
 *               score:
 *                 type: integer
 *                 description: Điểm của test case
 *               is_sample:
 *                 type: boolean
 *                 description: Có phải test case mẫu?
 *               order:
 *                 type: integer
 *                 description: Thứ tự test case
 *           example:
 *             input: "10\n20"
 *             expected_output: "30"
 *             score: 15
 *             is_sample: false
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TestCase'
 *             example:
 *               success: true
 *               message: Test case updated successfully
 *               data:
 *                 id: 1
 *                 input: "10\n20"
 *                 expected_output: "30"
 *                 score: 15
 *                 is_sample: false
 *                 order: 1
 *       403:
 *         description: Không có quyền Admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy test case
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Test case not found
 */
router.put('/:id', authMiddleware, checkAdmin, problemController.updateTestCase);

/**
 * @swagger
 * /api/testcases/{id}:
 *   delete:
 *     summary: Xóa test case
 *     description: |
 *       Xóa một test case khỏi bài tập.
 *       
 *       **Yêu cầu:** Quyền Admin
 *       
 *       **Lưu ý:** Hành động này không thể hoàn tác!
 *     tags: [Test Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của test case
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
 *             example:
 *               success: true
 *               message: Test case deleted successfully
 *       403:
 *         description: Không có quyền Admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy test case
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Test case not found
 */
router.delete('/:id', authMiddleware, checkAdmin, problemController.deleteTestCase);

export default router;
