import { Request, Response, NextFunction } from 'express';
import * as submissionService from './submission.service';
import { SubmissionStatus } from './submission.entity';
import { addJudgeJob, executeSynchronously } from './services/queue.service';
import {
  successResponse,
  createdResponse,
  BadRequestError,
} from '../../utils/apiResponse';

// ==========================================
// SUBMISSION CONTROLLERS
// ==========================================

/**
 * @swagger
 * /api/problems/{id}/submit:
 *   post:
 *     summary: Submit code for a problem
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Problem ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - source_code
 *             properties:
 *               language:
 *                 type: string
 *                 description: Language code (e.g., 'cpp', 'python', 'javascript')
 *               source_code:
 *                 type: string
 *                 description: Source code to submit
 *     responses:
 *       201:
 *         description: Submission created and queued for judging
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Problem not found
 */
export const submitCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Support both: /api/problems/:id/submit (params.id) and /api/submissions (body.problem_id)
    let problemId = parseInt(req.params.id);
    
    if (isNaN(problemId)) {
      // Try to get from body
      problemId = parseInt(req.body.problem_id);
    }
    
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid or missing problem_id');
    }

    // Support both 'code' and 'source_code' field names
    const { language, source_code, code } = req.body;
    const sourceCode = source_code || code;
    const userId = req.user!.user_id;

    // Validate required fields
    if (!language) {
      throw new BadRequestError('Missing required field: language');
    }
    if (!sourceCode) {
      throw new BadRequestError('Missing required field: code or source_code');
    }

    // Create submission with pending status
    const submission = await submissionService.createSubmission({
      user_id: userId,
      problem_id: problemId,
      language,
      source_code: sourceCode,
    });

    // Try to add job to queue, fallback to synchronous execution
    const jobData = {
      submissionId: submission.submission_id,
      problemId,
      userId,
    };

    const job = await addJudgeJob(jobData);
    
    if (!job) {
      // Queue not available, execute synchronously (blocking)
      // Queue unavailable, executing synchronously
      // Run in background without blocking the response
      executeSynchronously(jobData).catch((err: any) => {
        console.error(`[Submit] Synchronous execution failed for ${submission.submission_id}:`, err);
      });
    }

    return createdResponse(res, 'Submission created and queued for judging', {
      submission_id: submission.submission_id,
      status: submission.status,
      message: 'Your code is being evaluated...',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Get submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Submission details
 *       404:
 *         description: Submission not found
 */
export const getSubmissionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      throw new BadRequestError('Invalid submission ID');
    }

    // Non-admin users can only view their own submissions
    const userId = req.user?.role === 'ADMIN' ? undefined : req.user!.user_id;
    const submission = await submissionService.getSubmissionById(submissionId, userId);

    return successResponse(res, 'Submission retrieved successfully', submission);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Get all submissions with filters
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: problem_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, accepted, wrong_answer, time_limit, memory_limit, runtime_error, compile_error]
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of submissions
 */
export const getSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, problem_id, status, language } = req.query;

    const filters: submissionService.SubmissionFilters = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      problem_id: problem_id ? parseInt(problem_id as string) : undefined,
      status: status as SubmissionStatus | undefined,
      language: language as string | undefined,
    };

    // Non-admin users can only see their own submissions
    if (req.user?.role !== 'ADMIN') {
      filters.user_id = req.user!.user_id;
    }

    const { submissions, total } = await submissionService.getSubmissions(filters);

    return successResponse(res, 'Submissions retrieved successfully', {
      submissions,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        totalPages: Math.ceil(total / (filters.limit || 20)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/submissions/my:
 *   get:
 *     summary: Get current user's submissions
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: problem_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's submissions
 */
export const getMySubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, problem_id, status } = req.query;

    const filters: submissionService.SubmissionFilters = {
      user_id: req.user!.user_id,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      problem_id: problem_id ? parseInt(problem_id as string) : undefined,
      status: status as SubmissionStatus | undefined,
    };

    const { submissions, total } = await submissionService.getSubmissions(filters);

    return successResponse(res, 'Submissions retrieved successfully', {
      submissions,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        totalPages: Math.ceil(total / (filters.limit || 20)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/submissions/stats:
 *   get:
 *     summary: Get current user's submission statistics
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's submission statistics
 */
export const getMyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await submissionService.getUserSubmissionStats(req.user!.user_id);
    return successResponse(res, 'Statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/problems/{id}/leaderboard:
 *   get:
 *     summary: Get leaderboard for a problem
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Problem leaderboard
 */
export const getProblemLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problemId = parseInt(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    const leaderboard = await submissionService.getProblemLeaderboard(problemId, limit);
    return successResponse(res, 'Leaderboard retrieved successfully', leaderboard);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/submissions/{id}/status:
 *   get:
 *     summary: Get submission status (for polling)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Submission status
 */
export const getSubmissionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      throw new BadRequestError('Invalid submission ID');
    }

    const userId = req.user?.role === 'ADMIN' ? undefined : req.user!.user_id;
    const submission = await submissionService.getSubmissionById(submissionId, userId);

    return successResponse(res, 'Status retrieved successfully', {
      submission_id: submission.submission_id,
      status: submission.status,
      execution_time: submission.execution_time,
      memory_used: submission.memory_used,
      points_earned: submission.points_earned,
      test_cases_passed: submission.test_cases_passed,
      total_test_cases: submission.total_test_cases,
      error_message: submission.error_message,
    });
  } catch (error) {
    next(error);
  }
};
