import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as submissionController from './submission.controller';

const router = Router();

// ==========================================
// SUBMISSION ROUTES
// ==========================================

/**
 * @swagger
 * /api/submissions/my:
 *   get:
 *     summary: Lấy danh sách bài nộp của tôi
 *     description: |
 *       Lấy tất cả bài nộp của user đang đăng nhập.
 *       
 *       Hỗ trợ lọc theo bài tập và phân trang.
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: problem_id
 *         schema:
 *           type: integer
 *         description: Lọc theo ID bài tập
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
 *         description: Số bài nộp mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bài nộp
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
 *                         $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/my', authMiddleware, submissionController.getMySubmissions);

/**
 * @swagger
 * /api/submissions/stats:
 *   get:
 *     summary: Lấy thống kê của tôi
 *     description: |
 *       Lấy thống kê chi tiết về các bài nộp của user đang đăng nhập.
 *       
 *       Bao gồm:
 *       - Tổng số bài nộp
 *       - Số lần AC, WA, TLE, MLE, RE, CE
 *       - Tỷ lệ đúng
 *       - Số bài đã giải / đã thử
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê submission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SubmissionStats'
 *             example:
 *               success: true
 *               data:
 *                 total_submissions: 50
 *                 accepted_count: 30
 *                 wrong_answer_count: 15
 *                 tle_count: 3
 *                 mle_count: 1
 *                 re_count: 1
 *                 ce_count: 0
 *                 acceptance_rate: "60.00%"
 *                 problems_solved: 10
 *                 problems_attempted: 15
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/stats', authMiddleware, submissionController.getMyStats);

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Lấy danh sách tất cả bài nộp
 *     description: |
 *       Lấy danh sách bài nộp với các bộ lọc.
 *       
 *       - Admin có thể xem tất cả bài nộp
 *       - User thường chỉ xem được bài nộp của mình
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: problem_id
 *         schema:
 *           type: integer
 *         description: Lọc theo ID bài tập
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Lọc theo ID user (chỉ Admin)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, RUNNING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR, PARTIAL]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [cpp, c, python, javascript, java]
 *         description: Lọc theo ngôn ngữ
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách bài nộp
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
 *                         $ref: '#/components/schemas/Submission'
 */
router.get('/', authMiddleware, submissionController.getSubmissions);

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Nộp bài giải
 *     description: |
 *       Nộp code để chấm điểm tự động.
 *       
 *       ## Quy trình chấm bài
 *       1. Code được lưu với trạng thái `PENDING`
 *       2. Job được đẩy vào hàng đợi (nếu Redis available) hoặc chấm ngay (sync mode)
 *       3. Code được biên dịch và chạy trong Docker sandbox
 *       4. So sánh output với expected output của từng test case
 *       5. Tính điểm dựa trên số test case đúng
 *       6. Cập nhật thống kê user và bài tập
 *       
 *       ## Giới hạn
 *       - Time limit: Theo cấu hình bài tập (mặc định 1000ms)
 *       - Memory limit: Theo cấu hình bài tập (mặc định 256MB)
 *       - Code size: Tối đa 64KB
 *       
 *       ## Ngôn ngữ hỗ trợ
 *       | ID | Ngôn ngữ | Version | Docker Image |
 *       |----|----------|---------|--------------|
 *       | cpp | C++ | 17 | gcc:11 |
 *       | c | C | 11 | gcc:11 |
 *       | python | Python | 3.11 | python:3.11-slim |
 *       | javascript | JavaScript | ES2022 | node:20-slim |
 *       | java | Java | 17 | openjdk:17-slim |
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubmissionRequest'
 *           examples:
 *             cpp:
 *               summary: Ví dụ C++ - Tổng Hai Số
 *               value:
 *                 problem_id: 1
 *                 language: cpp
 *                 code: |
 *                   #include <iostream>
 *                   using namespace std;
 *                   int main() {
 *                       long long a, b;
 *                       cin >> a >> b;
 *                       cout << a + b << endl;
 *                       return 0;
 *                   }
 *             python:
 *               summary: Ví dụ Python - Tổng Hai Số
 *               value:
 *                 problem_id: 1
 *                 language: python
 *                 code: |
 *                   a = int(input())
 *                   b = int(input())
 *                   print(a + b)
 *             javascript:
 *               summary: Ví dụ JavaScript - Tổng Hai Số
 *               value:
 *                 problem_id: 1
 *                 language: javascript
 *                 code: |
 *                   const readline = require('readline');
 *                   const rl = readline.createInterface({
 *                     input: process.stdin,
 *                     output: process.stdout
 *                   });
 *                   let lines = [];
 *                   rl.on('line', (line) => lines.push(line));
 *                   rl.on('close', () => {
 *                     const a = BigInt(lines[0]);
 *                     const b = BigInt(lines[1]);
 *                     console.log((a + b).toString());
 *                   });
 *             java:
 *               summary: Ví dụ Java - Tổng Hai Số
 *               value:
 *                 problem_id: 1
 *                 language: java
 *                 code: |
 *                   import java.util.Scanner;
 *                   public class Solution {
 *                       public static void main(String[] args) {
 *                           Scanner sc = new Scanner(System.in);
 *                           long a = sc.nextLong();
 *                           long b = sc.nextLong();
 *                           System.out.println(a + b);
 *                       }
 *                   }
 *             c:
 *               summary: Ví dụ C - Tổng Hai Số
 *               value:
 *                 problem_id: 1
 *                 language: c
 *                 code: |
 *                   #include <stdio.h>
 *                   int main() {
 *                       long long a, b;
 *                       scanf("%lld", &a);
 *                       scanf("%lld", &b);
 *                       printf("%lld\\n", a + b);
 *                       return 0;
 *                   }
 *     responses:
 *       201:
 *         description: Nộp bài thành công
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
 *                 result:
 *                   type: object
 *                   properties:
 *                     submission_id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     message:
 *                       type: string
 *             example:
 *               code: 201
 *               message: Submission created and queued for judging
 *               result:
 *                 submission_id: 1
 *                 status: PENDING
 *                 message: Your code is being evaluated...
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_code:
 *                 summary: Thiếu code
 *                 value:
 *                   code: 400
 *                   error: "Missing required field: code or source_code"
 *               invalid_language:
 *                 summary: Ngôn ngữ không hỗ trợ
 *                 value:
 *                   code: 400
 *                   error: "Language 'ruby' is not supported"
 *       404:
 *         description: Không tìm thấy bài tập
 *       401:
 *         description: Chưa đăng nhập
 */
router.post('/', authMiddleware, submissionController.submitCode);

/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Lấy chi tiết bài nộp
 *     description: |
 *       Lấy thông tin chi tiết của một bài nộp bao gồm kết quả từng test case.
 *       
 *       - User chỉ xem được bài nộp của mình
 *       - Admin xem được tất cả
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài nộp
 *     responses:
 *       200:
 *         description: Chi tiết bài nộp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Submission'
 *             example:
 *               success: true
 *               data:
 *                 id: 123
 *                 user_id: 1
 *                 problem_id: 1
 *                 code: "#include <iostream>..."
 *                 language: cpp
 *                 status: ACCEPTED
 *                 score: 100
 *                 execution_time: 50
 *                 memory_used: 1024
 *                 execution_logs:
 *                   test_results:
 *                     - test_case_id: 1
 *                       passed: true
 *                       execution_time: 25
 *                       memory_used: 512
 *                     - test_case_id: 2
 *                       passed: true
 *                       execution_time: 25
 *                       memory_used: 512
 *       403:
 *         description: Không có quyền xem bài nộp này
 *       404:
 *         description: Không tìm thấy bài nộp
 */
router.get('/:id', authMiddleware, submissionController.getSubmissionById);

/**
 * @swagger
 * /api/submissions/{id}/status:
 *   get:
 *     summary: Lấy trạng thái bài nộp (Polling)
 *     description: |
 *       Endpoint nhẹ để poll trạng thái bài nộp.
 *       
 *       Sử dụng endpoint này để kiểm tra bài nộp đã chấm xong chưa
 *       thay vì gọi endpoint chi tiết liên tục.
 *       
 *       ## Cách sử dụng
 *       ```javascript
 *       // Poll mỗi 2 giây cho đến khi chấm xong
 *       const pollStatus = async (submissionId) => {
 *         const response = await fetch(`/api/submissions/${submissionId}/status`);
 *         const data = await response.json();
 *         
 *         if (data.data.status === 'PENDING' || data.data.status === 'RUNNING') {
 *           setTimeout(() => pollStatus(submissionId), 2000);
 *         } else {
 *           // Đã chấm xong, lấy chi tiết
 *           const detail = await fetch(`/api/submissions/${submissionId}`);
 *           // ...
 *         }
 *       };
 *       ```
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bài nộp
 *     responses:
 *       200:
 *         description: Trạng thái bài nộp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [PENDING, RUNNING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR, PARTIAL]
 *                     score:
 *                       type: number
 *                     execution_time:
 *                       type: integer
 *                     memory_used:
 *                       type: integer
 *             examples:
 *               pending:
 *                 summary: Đang chờ chấm
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 123
 *                     status: PENDING
 *                     score: null
 *               running:
 *                 summary: Đang chạy
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 123
 *                     status: RUNNING
 *                     score: null
 *               accepted:
 *                 summary: Đúng hoàn toàn
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 123
 *                     status: ACCEPTED
 *                     score: 100
 *                     execution_time: 50
 *                     memory_used: 1024
 *               wrong_answer:
 *                 summary: Sai đáp án
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 123
 *                     status: WRONG_ANSWER
 *                     score: 40
 *                     execution_time: 50
 *                     memory_used: 1024
 *       404:
 *         description: Không tìm thấy bài nộp
 */
router.get('/:id/status', authMiddleware, submissionController.getSubmissionStatus);

export default router;
