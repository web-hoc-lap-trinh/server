import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

/**
 * @swagger
 * /api/admin/analytics/user-growth:
 *   get:
 *     summary: Lấy dữ liệu tăng trưởng người dùng theo thời gian
 *     description: Trả về dữ liệu cho biểu đồ đường/cột thể hiện số lượng người dùng tăng theo ngày
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 7
 *           maximum: 365
 *         description: Số ngày muốn xem dữ liệu (mặc định 30 ngày)
 *     responses:
 *       200:
 *         description: Dữ liệu tăng trưởng người dùng
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
 *                   example: "Lấy dữ liệu tăng trưởng người dùng thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-12-01"
 *                       total_users:
 *                         type: integer
 *                         example: 1250
 *                         description: Tổng số người dùng tích lũy đến ngày này
 *                       new_users:
 *                         type: integer
 *                         example: 15
 *                         description: Số người dùng mới đăng ký trong ngày
 *       403:
 *         description: Không có quyền Admin
 */
export const getUserGrowth = asyncHandler(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const data = await analyticsService.getUserGrowthData(days);
    successResponse(res, 'Lấy dữ liệu tăng trưởng người dùng thành công', data);
});

/**
 * @swagger
 * /api/admin/analytics/category-distribution:
 *   get:
 *     summary: Lấy phân bố các danh mục (Categories)
 *     description: Trả về dữ liệu cho biểu đồ tròn thể hiện phân bố số lượng bài học theo từng danh mục. Có thể lọc theo thời gian để xem danh mục nào có bài học mới trong khoảng thời gian cụ thể.
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         description: Ngày bắt đầu lọc (tùy chọn) - chỉ đếm bài học được tạo sau ngày này
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *         description: Ngày kết thúc lọc (tùy chọn) - chỉ đếm bài học được tạo trước ngày này
 *     responses:
 *       200:
 *         description: Phân bố danh mục
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
 *                   example: "Lấy phân bố danh mục thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id:
 *                         type: integer
 *                         example: 1
 *                       category_name:
 *                         type: string
 *                         example: "JavaScript"
 *                       lesson_count:
 *                         type: integer
 *                         example: 25
 *                         description: Số lượng bài học trong danh mục
 *                       view_count:
 *                         type: integer
 *                         example: 1500
 *                         description: Tổng lượt xem của các bài học trong danh mục
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 35.5
 *                         description: Phần trăm bài học trong danh mục so với tổng
 *       403:
 *         description: Không có quyền Admin
 */
export const getCategoryDistribution = asyncHandler(async (req: Request, res: Response) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const data = await analyticsService.getCategoryDistribution({ startDate, endDate });
    successResponse(res, 'Lấy phân bố danh mục thành công', data);
});

/**
 * @swagger
 * /api/admin/analytics/submission-status:
 *   get:
 *     summary: Lấy phân bố trạng thái submissions
 *     description: Trả về dữ liệu cho biểu đồ tròn thể hiện tỷ lệ các trạng thái submission (Accepted, Wrong Answer, etc.). Có thể lọc theo thời gian để xem xu hướng trong tháng/năm cụ thể.
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         description: Ngày bắt đầu lọc (tùy chọn) - chỉ đếm submissions sau ngày này
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *         description: Ngày kết thúc lọc (tùy chọn) - chỉ đếm submissions trước ngày này
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2025
 *         description: Lọc theo năm (tùy chọn) - shortcut cho startDate và endDate
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 12
 *         description: Lọc theo tháng (tùy chọn, cần kết hợp với year) - shortcut cho startDate và endDate
 *     responses:
 *       200:
 *         description: Phân bố trạng thái submissions
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
 *                   example: "Lấy phân bố trạng thái submissions thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [PENDING, RUNNING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT, MEMORY_LIMIT, RUNTIME_ERROR, COMPILE_ERROR, INTERNAL_ERROR]
 *                         example: "ACCEPTED"
 *                       count:
 *                         type: integer
 *                         example: 5420
 *                         description: Số lượng submissions với trạng thái này
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 45.2
 *                         description: Phần trăm submissions với trạng thái này
 *       403:
 *         description: Không có quyền Admin
 */
export const getSubmissionStatus = asyncHandler(async (req: Request, res: Response) => {
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    // Handle year/month filter
    if (req.query.year) {
        const year = parseInt(req.query.year as string);
        const month = req.query.month ? parseInt(req.query.month as string) : undefined;
        
        if (month) {
            // Filter by specific month
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
        } else {
            // Filter by entire year
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);
        }
    } else {
        // Handle explicit date range
        startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    }
    
    const data = await analyticsService.getSubmissionStatusDistribution({ startDate, endDate });
    successResponse(res, 'Lấy phân bố trạng thái submissions thành công', data);
});



/**
 * @swagger
 * /api/admin/analytics/problem-difficulty:
 *   get:
 *     summary: Lấy phân bố độ khó của Problems
 *     description: Trả về dữ liệu cho biểu đồ tròn thể hiện tỷ lệ các bài toán theo độ khó (Easy, Medium, Hard)
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Phân bố độ khó của problems
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
 *                   example: "Lấy phân bố độ khó problems thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       difficulty:
 *                         type: string
 *                         enum: [EASY, MEDIUM, HARD]
 *                         example: "MEDIUM"
 *                       count:
 *                         type: integer
 *                         example: 125
 *                         description: Số lượng problems với độ khó này
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 41.7
 *                         description: Phần trăm problems với độ khó này
 *       403:
 *         description: Không có quyền Admin
 */
export const getProblemDifficulty = asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getProblemDifficultyDistribution();
    successResponse(res, 'Lấy phân bố độ khó problems thành công', data);
});


