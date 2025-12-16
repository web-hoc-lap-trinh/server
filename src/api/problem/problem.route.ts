import { Router } from 'express';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';
import * as problemController from './problem.controller';
import * as aiController from './ai.controller';

const router = Router();

// ==========================================
// LANGUAGE ROUTES
// ==========================================

/**
 * @swagger
 * /api/problems/languages:
 *   get:
 *     summary: Lấy danh sách ngôn ngữ lập trình hỗ trợ
 *     tags: [Languages]
 *     security: []
 *     responses:
 *       200:
 *         description: Danh sách ngôn ngữ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Language'
 *             example:
 *               success: true
 *               data:
 *                 - id: cpp
 *                   name: C++
 *                   version: "17"
 *                   compiler: g++
 *                   file_extension: .cpp
 *                   docker_image: gcc:11
 *                 - id: python
 *                   name: Python
 *                   version: "3.11"
 *                   file_extension: .py
 *                   docker_image: python:3.11-slim
 */
router.get('/languages', problemController.getLanguages);

// ==========================================
// PROBLEM ROUTES
// ==========================================

/**
 * @swagger
 * /api/problems:
 *   get:
 *     summary: Lấy danh sách bài tập
 *     description: |
 *       Lấy danh sách bài tập với các bộ lọc và phân trang.
 *       - Hỗ trợ lọc theo độ khó, danh mục
 *       - Hỗ trợ tìm kiếm theo tiêu đề
 *       - Hỗ trợ sắp xếp theo nhiều tiêu chí
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 10
 *         description: Số bài tập mỗi trang (tối đa 100)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD]
 *         description: Lọc theo độ khó
 *       - in: query
 *         name: tag_id
 *         schema:
 *           type: integer
 *         description: Lọc theo tag ID
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Lọc theo tag slug (ví dụ "array", "dynamic-programming")
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề (LIKE %search%)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created_at, title, difficulty, submission_count, accepted_count]
 *           default: created_at
 *         description: Sắp xếp theo trường
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách bài tập
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Problem'
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authMiddleware, problemController.getProblems);

/**
 * @swagger
 * /api/problems/{id}:
 *   get:
 *     summary: Lấy chi tiết bài tập
 *     description: Lấy thông tin chi tiết của một bài tập bao gồm test cases mẫu
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     responses:
 *       200:
 *         description: Chi tiết bài tập
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
 *       404:
 *         description: Không tìm thấy bài tập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Problem not found
 */
router.get('/:id', authMiddleware, problemController.getProblemById);

/**
 * @swagger
 * /api/problems:
 *   post:
 *     summary: Tạo bài tập mới
 *     description: |
 *       Tạo một bài tập lập trình mới.
 *       
 *       **Yêu cầu:** Quyền Admin
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProblemRequest'
 *           example:
 *             title: Tổng Hai Số
 *             description: "<p>Cho hai số nguyên <code>a</code> và <code>b</code>, hãy tính tổng của chúng.</p>"
 *             difficulty: EASY
 *             tag_ids:
 *               - 1
 *               - 4
 *             input_format: "Dòng đầu tiên chứa số nguyên a (-10^9 ≤ a ≤ 10^9)\nDòng thứ hai chứa số nguyên b (-10^9 ≤ b ≤ 10^9)"
 *             output_format: "In ra một số nguyên duy nhất là tổng a + b"
 *             constraints: "-10^9 ≤ a, b ≤ 10^9"
 *             samples:
 *               - input: "3\n5"
 *                 output: "8"
 *                 explanation: "3 + 5 = 8"
 *               - input: "-5\n10"
 *                 output: "5"
 *                 explanation: "-5 + 10 = 5"
 *             time_limit: 1000
 *             memory_limit: 256
 *             points: 100
 *             is_published: true
 *     responses:
 *       201:
 *         description: Tạo bài tập thành công
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
 *                   $ref: '#/components/schemas/Problem'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền Admin
 */
router.post('/', authMiddleware, checkAdmin, problemController.createProblem);

/**
 * @swagger
 * /api/problems/{id}:
 *   put:
 *     summary: Cập nhật bài tập
 *     description: |
 *       Cập nhật thông tin bài tập.
 *       
 *       **Yêu cầu:** Quyền Admin
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProblemRequest'
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
 *                   $ref: '#/components/schemas/Problem'
 *       404:
 *         description: Không tìm thấy bài tập
 *       403:
 *         description: Không có quyền Admin
 */
router.put('/:id', authMiddleware, checkAdmin, problemController.updateProblem);

/**
 * @swagger
 * /api/problems/{id}:
 *   delete:
 *     summary: Xóa bài tập
 *     description: |
 *       Xóa bài tập và tất cả test cases liên quan.
 *       
 *       **Yêu cầu:** Quyền Admin
 *       
 *       **Lưu ý:** Hành động này không thể hoàn tác!
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
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
 *               message: Problem deleted successfully
 *       404:
 *         description: Không tìm thấy bài tập
 *       403:
 *         description: Không có quyền Admin
 */
router.delete('/:id', authMiddleware, checkAdmin, problemController.deleteProblem);

// ==========================================
// TEST CASE ROUTES
// ==========================================

/**
 * @swagger
 * /api/problems/{id}/testcases:
 *   get:
 *     summary: Lấy danh sách test cases
 *     description: |
 *       Lấy tất cả test cases của một bài tập.
 *       
 *       - User thường chỉ thấy test cases mẫu (is_sample = true)
 *       - Admin thấy tất cả test cases
 *     tags: [Test Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     responses:
 *       200:
 *         description: Danh sách test cases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestCase'
 *       404:
 *         description: Không tìm thấy bài tập
 */
router.get('/:id/testcases', authMiddleware, problemController.getTestCases);

/**
 * @swagger
 * /api/problems/{id}/testcases:
 *   post:
 *     summary: Thêm test case
 *     description: |
 *       Thêm một test case mới cho bài tập.
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
 *         description: ID bài tập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTestCaseRequest'
 *           example:
 *             input_data: "3\n5"
 *             expected_output: "8"
 *             score: 20
 *             is_sample: true
 *             is_hidden: false
 *             explanation: "3 + 5 = 8"
 *     responses:
 *       201:
 *         description: Thêm test case thành công
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
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy bài tập
 */
router.post('/:id/testcases', authMiddleware, checkAdmin, problemController.addTestCase);

/**
 * @swagger
 * /api/problems/{id}/testcases/bulk:
 *   post:
 *     summary: Thêm nhiều test cases
 *     description: |
 *       Thêm nhiều test cases cùng lúc cho bài tập.
 *       
 *       **Yêu cầu:** Quyền Admin
 *       
 *       **Lưu ý:** Nếu một test case lỗi, tất cả sẽ không được thêm (transaction).
 *     tags: [Test Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkTestCaseRequest'
 *           example:
 *             test_cases:
 *               - input_data: "3\n5"
 *                 expected_output: "8"
 *                 score: 20
 *                 is_sample: true
 *                 is_hidden: false
 *                 explanation: "3 + 5 = 8"
 *               - input_data: "-5\n10"
 *                 expected_output: "5"
 *                 score: 20
 *                 is_sample: true
 *                 is_hidden: false
 *                 explanation: "-5 + 10 = 5"
 *               - input_data: "1000000000\n1000000000"
 *                 expected_output: "2000000000"
 *                 score: 30
 *                 is_sample: false
 *                 is_hidden: true
 *               - input_data: "-1000000000\n-1000000000"
 *                 expected_output: "-2000000000"
 *                 score: 30
 *                 is_sample: false
 *                 is_hidden: true
 *     responses:
 *       201:
 *         description: Thêm test cases thành công
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
 *                     count:
 *                       type: integer
 *                       description: Số test cases đã thêm
 *                     testcases:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TestCase'
 *             example:
 *               success: true
 *               message: Added 3 test cases successfully
 *               data:
 *                 count: 3
 *                 testcases: []
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền Admin
 *       404:
 *         description: Không tìm thấy bài tập
 */
router.post('/:id/testcases/bulk', authMiddleware, checkAdmin, problemController.addBulkTestCases);

// ==========================================
// AI CHAT ROUTES
// ==========================================

/**
 * @swagger
 * components:
 *   schemas:
 *     AiConversation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         problem_id:
 *           type: integer
 *           example: 5
 *         user_id:
 *           type: integer
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *     AiMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         conversation_id:
 *           type: integer
 *           example: 1
 *         role:
 *           type: string
 *           enum: [user, assistant]
 *           example: user
 *         message:
 *           type: string
 *           example: "Giải thích constraints cho mình"
 *         created_at:
 *           type: string
 *           format: date-time
 *     ChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         conversationId:
 *           type: integer
 *           nullable: true
 *           description: ID cuộc trò chuyện (nếu đã có). Nếu không truyền, hệ thống sẽ tự tìm hoặc tạo mới.
 *         message:
 *           type: string
 *           description: Tin nhắn gửi cho AI
 *           example: "Giải thích constraints cho mình"
 *     ChatResponse:
 *       type: object
 *       properties:
 *         conversationId:
 *           type: integer
 *           example: 1
 *         answer:
 *           type: string
 *           example: "Constraints của bài toán yêu cầu..."
 *         provider:
 *           type: string
 *           enum: [gemini, openai, none]
 *           example: gemini
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AiMessage'
 */

/**
 * @swagger
 * /api/problems/{problemId}/ai/chat:
 *   post:
 *     summary: Gửi tin nhắn đến AI và nhận phản hồi
 *     description: |
 *       Gửi một tin nhắn đến AI để hỏi về bài toán.
 *       - AI sẽ nhận context của bài toán (title, description, constraints, examples)
 *       - AI nhớ lịch sử trò chuyện (multi-turn)
 *       - Nếu chưa có conversation, hệ thống sẽ tự tạo mới
 *     tags: [AI Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Phản hồi từ AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "AI response"
 *                 result:
 *                   $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy bài tập
 */
router.post('/:problemId/ai/chat', authMiddleware, aiController.chat);

/**
 * @swagger
 * /api/problems/{problemId}/ai/conversation:
 *   get:
 *     summary: Lấy hoặc tạo cuộc trò chuyện AI cho bài tập
 *     description: |
 *       Lấy cuộc trò chuyện hiện có hoặc tạo mới nếu chưa có.
 *       Mỗi user chỉ có 1 conversation cho mỗi problem.
 *     tags: [AI Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     responses:
 *       200:
 *         description: Thông tin cuộc trò chuyện
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
 *                     conversation:
 *                       $ref: '#/components/schemas/AiConversation'
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AiMessage'
 */
router.get('/:problemId/ai/conversation', authMiddleware, aiController.getConversation);

/**
 * @swagger
 * /api/problems/{problemId}/ai/messages:
 *   get:
 *     summary: Lấy tất cả tin nhắn của cuộc trò chuyện
 *     description: Lấy lịch sử tin nhắn của cuộc trò chuyện AI cho bài tập
 *     tags: [AI Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
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
 *                     conversationId:
 *                       type: integer
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AiMessage'
 */
router.get('/:problemId/ai/messages', authMiddleware, aiController.getMessages);

/**
 * @swagger
 * /api/problems/{problemId}/ai/conversation:
 *   delete:
 *     summary: Xóa cuộc trò chuyện AI
 *     description: Xóa toàn bộ cuộc trò chuyện và tất cả tin nhắn
 *     tags: [AI Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:problemId/ai/conversation', authMiddleware, aiController.deleteConversation);

/**
 * @swagger
 * /api/problems/{problemId}/ai/messages:
 *   delete:
 *     summary: Xóa tất cả tin nhắn (giữ lại conversation)
 *     description: Xóa tất cả tin nhắn trong cuộc trò chuyện nhưng giữ lại conversation
 *     tags: [AI Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài tập
 *     responses:
 *       200:
 *         description: Xóa tin nhắn thành công
 */
router.delete('/:problemId/ai/messages', authMiddleware, aiController.clearMessages);

// ======================================================================
// DAILY CHALLENGE ROUTES
// ======================================================================

/**
 * @swagger
 * /api/problems/daily-challenge:
 *   get:
 *     summary: Lấy Bài tập Thử thách Hàng ngày (Daily Challenge)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chi tiết bài tập Daily Challenge
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
 *                   $ref: '#/components/schemas/Problem'
 *             example:
 *               success: true
 *               message: "Daily Challenge retrieved successfully"
 *               data:
 *                 problem_id: 101
 *                 title: "Sắp xếp tăng dần"
 *                 description: "Yêu cầu sắp xếp một mảng..."
 *                 difficulty: "MEDIUM"
 *                 time_limit: 1000
 *                 points: 100
 *                 is_daily_challenge: true
 *                 challenge_date: "2025-12-14"
 *                 tags:
 *                   - tag_id: 6
 *                     name: "Sorting"
 *
 *       404:
 *         description: Chưa có Challenge nào được setup cho hôm nay
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Chưa có Thử thách hàng ngày nào được thiết lập cho hôm nay."
 *               error:
 *                 details: {}
 */
router.get(
  '/daily-challenge',
  authMiddleware,
  problemController.getDailyChallengeProblem
);



export default router;
