import { Router } from 'express';
import * as exerciseController from './exercise.controller';
import { authMiddleware, checkAdmin } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExerciseOption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Option ID (A, B, C, D for multiple choice; TRUE, FALSE for true/false)
 *           example: "A"
 *         text:
 *           type: string
 *           description: Option content
 *           example: "document.getElementById()"
 *
 *     Exercise:
 *       type: object
 *       properties:
 *         exercise_id:
 *           type: integer
 *           example: 1
 *         lesson_id:
 *           type: integer
 *           example: 1
 *         question:
 *           type: string
 *           example: "Phương thức nào được sử dụng để lấy một phần tử HTML theo ID?"
 *         exercise_type:
 *           type: string
 *           enum: [MULTIPLE_CHOICE, TRUE_FALSE]
 *           example: "MULTIPLE_CHOICE"
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ExerciseOption'
 *         correct_answer:
 *           type: string
 *           example: "A"
 *         explanation:
 *           type: string
 *           nullable: true
 *           example: "document.getElementById() là phương thức được sử dụng để lấy phần tử theo ID"
 *         order_index:
 *           type: integer
 *           example: 0
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     ExerciseNavigation:
 *       type: object
 *       properties:
 *         current_index:
 *           type: integer
 *           description: Vị trí câu hỏi hiện tại (1-based)
 *           example: 2
 *         total_questions:
 *           type: integer
 *           description: Tổng số câu hỏi
 *           example: 5
 *         remaining_questions:
 *           type: integer
 *           description: Số câu còn lại
 *           example: 3
 *         is_first:
 *           type: boolean
 *           description: Đây có phải câu đầu tiên?
 *           example: false
 *         is_last:
 *           type: boolean
 *           description: Đây có phải câu cuối cùng?
 *           example: false
 *         next_exercise_id:
 *           type: integer
 *           nullable: true
 *           description: ID câu tiếp theo (null nếu là câu cuối)
 *           example: 3
 *         prev_exercise_id:
 *           type: integer
 *           nullable: true
 *           description: ID câu trước đó (null nếu là câu đầu)
 *           example: 1
 *
 *     ExerciseWithNavigation:
 *       type: object
 *       properties:
 *         exercise:
 *           type: object
 *           properties:
 *             exercise_id:
 *               type: integer
 *             lesson_id:
 *               type: integer
 *             question:
 *               type: string
 *             exercise_type:
 *               type: string
 *             options:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExerciseOption'
 *             order_index:
 *               type: integer
 *         navigation:
 *           $ref: '#/components/schemas/ExerciseNavigation'
 *
 *     AnswerResult:
 *       type: object
 *       properties:
 *         is_correct:
 *           type: boolean
 *           example: true
 *         correct_answer:
 *           type: string
 *           example: "A"
 *         explanation:
 *           type: string
 *           nullable: true
 *           example: "Giải thích về đáp án đúng"
 *         navigation:
 *           $ref: '#/components/schemas/ExerciseNavigation'
 *
 *     ExerciseSummary:
 *       type: object
 *       properties:
 *         lesson_id:
 *           type: integer
 *           example: 1
 *         total_questions:
 *           type: integer
 *           example: 5
 *         exercises:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               exercise_id:
 *                 type: integer
 *               question_preview:
 *                 type: string
 *               exercise_type:
 *                 type: string
 *               order:
 *                 type: integer
 *
 *     CreateExerciseRequest:
 *       type: object
 *       required:
 *         - lesson_id
 *         - question
 *         - exercise_type
 *         - options
 *         - correct_answer
 *       properties:
 *         lesson_id:
 *           type: integer
 *           example: 1
 *         question:
 *           type: string
 *           example: "Phương thức nào được sử dụng để lấy một phần tử HTML theo ID?"
 *         exercise_type:
 *           type: string
 *           enum: [MULTIPLE_CHOICE, TRUE_FALSE]
 *           example: "MULTIPLE_CHOICE"
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ExerciseOption'
 *           example:
 *             - id: "A"
 *               text: "document.getElementById()"
 *             - id: "B"
 *               text: "document.querySelector()"
 *             - id: "C"
 *               text: "document.getElement()"
 *             - id: "D"
 *               text: "document.findById()"
 *         correct_answer:
 *           type: string
 *           example: "A"
 *         explanation:
 *           type: string
 *           example: "document.getElementById() là phương thức chuẩn để lấy phần tử theo ID"
 *         order_index:
 *           type: integer
 *           example: 0
 */

// ==================== PUBLIC ROUTES ====================

/**
 * @swagger
 * /api/exercises/lesson/{lessonId}:
 *   get:
 *     summary: Lấy danh sách bài tập của một bài học (không có đáp án)
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài học
 *     responses:
 *       200:
 *         description: Thành công
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
 *                   example: "Lấy danh sách bài tập thành công"
 *                 result:
 *                   $ref: '#/components/schemas/ExerciseSummary'
 */
router.get('/lesson/:lessonId', exerciseController.getExercisesByLesson);

/**
 * @swagger
 * /api/exercises/lesson/{lessonId}/start:
 *   get:
 *     summary: Bắt đầu làm bài tập - lấy câu hỏi đầu tiên
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài học
 *     responses:
 *       200:
 *         description: Thành công
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
 *                   example: "Lấy bài tập đầu tiên thành công"
 *                 result:
 *                   allOf:
 *                     - type: object
 *                       properties:
 *                         has_exercises:
 *                           type: boolean
 *                           example: true
 *                     - $ref: '#/components/schemas/ExerciseWithNavigation'
 */
router.get('/lesson/:lessonId/start', exerciseController.getFirstExerciseByLesson);

// ==================== SUBMISSION HISTORY ROUTES (Must be before /:exerciseId) ====================

/**
 * @swagger
 * /api/exercises/history:
 *   get:
 *     summary: "Xem toàn bộ lịch sử làm bài"
 *     description: "Lấy lịch sử làm bài của người dùng hiện tại (tất cả lesson)"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Số lượng bản ghi mỗi trang
 *       - in: query
 *         name: lesson_id
 *         schema:
 *           type: integer
 *         description: Lọc theo lesson ID
 *       - in: query
 *         name: only_correct
 *         schema:
 *           type: boolean
 *         description: Chỉ lấy câu trả lời đúng
 *     responses:
 *       200:
 *         description: Lấy lịch sử thành công
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
 *                 result:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Tổng số bản ghi
 *                     page:
 *                       type: integer
 *                       description: Trang hiện tại
 *                     limit:
 *                       type: integer
 *                       description: Số bản ghi mỗi trang
 *                     total_pages:
 *                       type: integer
 *                       description: Tổng số trang
 *                     has_next:
 *                       type: boolean
 *                       description: Có trang tiếp theo không
 *                     has_prev:
 *                       type: boolean
 *                       description: Có trang trước không
 *                     submissions:
 *                       type: array
 */
router.get('/history', authMiddleware, exerciseController.getUserHistory);

/**
 * @swagger
 * /api/exercises/stats:
 *   get:
 *     summary: "Xem thống kê làm bài tập"
 *     description: "Lấy thống kê tổng hợp của người dùng hiện tại"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
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
 *                 result:
 *                   type: object
 *                   properties:
 *                     total_submissions:
 *                       type: integer
 *                     correct_submissions:
 *                       type: integer
 *                     overall_success_rate:
 *                       type: integer
 *                     unique_exercises_attempted:
 *                       type: integer
 *                     unique_lessons_attempted:
 *                       type: integer
 *                     first_attempt_success_rate:
 *                       type: integer
 *                     average_time_spent_seconds:
 *                       type: integer
 */
router.get('/stats', authMiddleware, exerciseController.getUserStats);

/**
 * @swagger
 * /api/exercises/{exerciseId}:
 *   get:
 *     summary: Lấy chi tiết một bài tập (với thông tin điều hướng)
 *     tags: [Exercise]
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài tập
 *     responses:
 *       200:
 *         description: Thành công
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
 *                   example: "Lấy bài tập thành công"
 *                 result:
 *                   $ref: '#/components/schemas/ExerciseWithNavigation'
 *       404:
 *         description: Không tìm thấy bài tập
 */
router.get('/:exerciseId', exerciseController.getExercise);

/**
 * @swagger
 * /api/exercises/{exerciseId}/submit:
 *   post:
 *     summary: Nộp câu trả lời cho một bài tập
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài tập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: Câu trả lời (A/B/C/D hoặc TRUE/FALSE)
 *                 example: "A"
 *               time_spent_seconds:
 *                 type: integer
 *                 description: Thời gian làm bài (giây)
 *                 example: 30
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra
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
 *                   example: "Chính xác! 🎉"
 *                 result:
 *                   $ref: '#/components/schemas/AnswerResult'
 */
router.post('/:exerciseId/submit', authMiddleware, exerciseController.submitAnswer);

/**
 * @swagger
 * /api/exercises/{exerciseId}/history:
 *   get:
 *     summary: "Xem lịch sử làm bài tập cụ thể"
 *     description: "Lấy tất cả lần làm của người dùng hiện tại cho một exercise"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài tập
 *     responses:
 *       200:
 *         description: Lấy lịch sử thành công
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
 *                   example: "Lấy lịch sử làm bài tập thành công"
 *                 result:
 *                   type: object
 *                   properties:
 *                     exercise_id:
 *                       type: integer
 *                     total_attempts:
 *                       type: integer
 *                     correct_attempts:
 *                       type: integer
 *                     success_rate:
 *                       type: integer
 *                       description: "Tỷ lệ thành công (%)"
 *                     first_attempt_correct:
 *                       type: boolean
 *                     submissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           submission_id:
 *                             type: integer
 *                           user_answer:
 *                             type: string
 *                           correct_answer:
 *                             type: string
 *                           is_correct:
 *                             type: boolean
 *                           time_spent_seconds:
 *                             type: integer
 *                             nullable: true
 *                           attempt_number:
 *                             type: integer
 *                           submitted_at:
 *                             type: string
 *                             format: date-time
 */
router.get('/:exerciseId/history', authMiddleware, exerciseController.getExerciseHistory);

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /api/exercises/admin/lesson/{lessonId}:
 *   get:
 *     summary: "[ADMIN] Lấy tất cả bài tập của bài học (bao gồm đáp án)"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exercise'
 */
router.get('/admin/lesson/:lessonId', authMiddleware, checkAdmin, exerciseController.getExercisesByLessonAdmin);

/**
 * @swagger
 * /api/exercises/admin/{exerciseId}:
 *   get:
 *     summary: "[ADMIN] Lấy chi tiết bài tập (bao gồm đáp án)"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/admin/:exerciseId', authMiddleware, checkAdmin, exerciseController.getExerciseAdmin);

/**
 * @swagger
 * /api/exercises:
 *   post:
 *     summary: "[ADMIN] Tạo bài tập mới"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExerciseRequest'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Tạo bài tập thành công"
 *                 result:
 *                   $ref: '#/components/schemas/Exercise'
 */
router.post('/', authMiddleware, checkAdmin, exerciseController.createExercise);

/**
 * @swagger
 * /api/exercises/{exerciseId}:
 *   put:
 *     summary: "[ADMIN] Cập nhật bài tập"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               exercise_type:
 *                 type: string
 *                 enum: [MULTIPLE_CHOICE, TRUE_FALSE]
 *               options:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ExerciseOption'
 *               correct_answer:
 *                 type: string
 *               explanation:
 *                 type: string
 *               order_index:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:exerciseId', authMiddleware, checkAdmin, exerciseController.updateExercise);

/**
 * @swagger
 * /api/exercises/{exerciseId}:
 *   delete:
 *     summary: "[ADMIN] Xóa bài tập"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:exerciseId', authMiddleware, checkAdmin, exerciseController.deleteExercise);

/**
 * @swagger
 * /api/exercises/admin/lesson/{lessonId}/reorder:
 *   put:
 *     summary: "[ADMIN] Sắp xếp lại thứ tự bài tập"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     exercise_id:
 *                       type: integer
 *                     order_index:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Sắp xếp thành công
 */
router.put('/admin/lesson/:lessonId/reorder', authMiddleware, checkAdmin, exerciseController.reorderExercises);

/**
 * @swagger
 * /api/exercises/lesson/{lessonId}/history:
 *   get:
 *     summary: "Xem lịch sử làm bài của cả bài học"
 *     description: "Lấy lịch sử làm tất cả exercise trong một lesson"
 *     tags: [Exercise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bài học
 *     responses:
 *       200:
 *         description: Lấy lịch sử thành công
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
 *                   example: "Lấy lịch sử làm bài của bài học thành công"
 *                 result:
 *                   type: object
 *                   properties:
 *                     lesson_id:
 *                       type: integer
 *                     total_submissions:
 *                       type: integer
 *                     correct_submissions:
 *                       type: integer
 *                     overall_success_rate:
 *                       type: integer
 *                     unique_exercises_attempted:
 *                       type: integer
 *                     exercises:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/lesson/:lessonId/history', authMiddleware, exerciseController.getLessonHistory);

export default router;
