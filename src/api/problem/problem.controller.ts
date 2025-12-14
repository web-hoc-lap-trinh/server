import { Request, Response, NextFunction } from 'express';
import * as problemService from './problem.service';
import { ProblemDifficulty } from './problem.entity';
import {
  successResponse,
  createdResponse,
  noContentResponse,
  BadRequestError,
} from '../../utils/apiResponse';

// ==========================================
// PROBLEM CONTROLLERS
// ==========================================

/**
 * @swagger
 * /api/problems:
 *   post:
 *     summary: Create a new problem
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - difficulty
 *             properties:
 *               title:
 *                 type: string
 *                 description: Problem title
 *               description:
 *                 type: string
 *                 description: Problem description (supports markdown)
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *               tag_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of tag IDs to associate with the problem
 *               time_limit:
 *                 type: integer
 *                 description: Time limit in milliseconds (default 1000)
 *               memory_limit:
 *                 type: integer
 *                 description: Memory limit in MB (default 256)
 *               points:
 *                 type: integer
 *                 description: Problem points (default 100)
 *               input_format:
 *                 type: string
 *                 description: Description of input format
 *               output_format:
 *                 type: string
 *                 description: Description of output format
 *               constraints:
 *                 type: string
 *                 description: Problem constraints
 *               samples:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: string
 *                     output:
 *                       type: string
 *                     explanation:
 *                       type: string
 *               author_notes:
 *                 type: string
 *                 description: Private notes for author
 *               is_published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Problem created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const createProblem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, difficulty, tag_ids, time_limit, memory_limit,
      points, input_format, output_format, constraints, samples, author_notes, is_published } = req.body;

    const problem = await problemService.createProblem({
      title,
      description,
      difficulty,
      tag_ids,
      time_limit,
      memory_limit,
      points,
      input_format,
      output_format,
      constraints,
      samples,
      author_notes,
      is_published,
      created_by: req.user!.user_id,
    });

    return createdResponse(res, 'Problem created successfully', problem);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/problems:
 *   get:
 *     summary: Get all problems with pagination and filters
 *     tags: [Problems]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 20)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD]
 *       - in: query
 *         name: tag_id
 *         schema:
 *           type: integer
 *         description: Filter by tag ID
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag slug
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of problems
 */
export const getProblems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, difficulty, tag_id, tag, search } = req.query;

    const filters = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      difficulty: difficulty as ProblemDifficulty | undefined,
      tag_id: tag_id ? parseInt(tag_id as string) : undefined,
      tag_slug: tag as string | undefined,
      search: search as string | undefined,
      is_published: req.user?.role !== 'ADMIN' ? true : undefined,
    };

    const { problems, total } = await problemService.getProblems(filters);

    return successResponse(res, 'Problems retrieved successfully', {
      problems,
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
 * /api/problems/{id}:
 *   get:
 *     summary: Get a problem by ID
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Problem details
 *       404:
 *         description: Problem not found
 */
export const getProblemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problemId = parseInt(req.params.id);
    
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    // Include hidden test cases only for admin or problem author
    const isAdmin = req.user?.role === 'ADMIN';
    const problem = await problemService.getProblemById(problemId, true, isAdmin);

    // Check if unpublished problem is being accessed by non-admin
    if (!problem.is_published && !isAdmin && problem.created_by !== req.user?.user_id) {
      throw new BadRequestError('Problem not found');
    }

    return successResponse(res, 'Problem retrieved successfully', problem);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/problems/{id}:
 *   put:
 *     summary: Update a problem
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProblem'
 *     responses:
 *       200:
 *         description: Problem updated successfully
 *       404:
 *         description: Problem not found
 */
export const updateProblem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problemId = parseInt(req.params.id);
    
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    const problem = await problemService.updateProblem(problemId, req.body);
    return successResponse(res, 'Problem updated successfully', problem);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/problems/{id}:
 *   delete:
 *     summary: Delete a problem
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Problem deleted successfully
 *       404:
 *         description: Problem not found
 */
export const deleteProblem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problemId = parseInt(req.params.id);
    
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    await problemService.deleteProblem(problemId);
    return noContentResponse(res);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// TEST CASE CONTROLLERS
// ==========================================

/**
 * @swagger
 * /api/problems/{id}/testcases:
 *   post:
 *     summary: Add a test case to a problem
 *     tags: [Test Cases]
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
 *               - input_data
 *               - expected_output
 *             properties:
 *               input_data:
 *                 type: string
 *                 description: Test case input
 *               expected_output:
 *                 type: string
 *                 description: Expected output
 *               is_sample:
 *                 type: boolean
 *                 description: Is this a sample test case (shown to user)
 *               is_hidden:
 *                 type: boolean
 *                 description: Is this test case hidden
 *               explanation:
 *                 type: string
 *                 description: Explanation for sample test cases
 *               score:
 *                 type: integer
 *                 description: Score for this test case (default 1)
 *     responses:
 *       201:
 *         description: Test case added successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Problem not found
 */
export const addTestCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problemId = parseInt(req.params.id);
    
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    const { input_data, expected_output, is_sample, is_hidden, explanation, score } = req.body;

    const testCase = await problemService.addTestCase(problemId, {
      input_data,
      expected_output,
      is_sample,
      is_hidden,
      explanation,
      score,
    });

    return createdResponse(res, 'Test case added successfully', testCase);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/problems/{id}/testcases/bulk:
 *   post:
 *     summary: Add multiple test cases to a problem
 *     tags: [Test Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               test_cases:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     input_data:
 *                       type: string
 *                     expected_output:
 *                       type: string
 *                     is_sample:
 *                       type: boolean
 *                     is_hidden:
 *                       type: boolean
 *                     explanation:
 *                       type: string
 *                     score:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Test cases added successfully
 */
export const addBulkTestCases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problemId = parseInt(req.params.id);
    
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    const { test_cases } = req.body;

    if (!Array.isArray(test_cases) || test_cases.length === 0) {
      throw new BadRequestError('test_cases must be a non-empty array');
    }

    const createdTestCases = await problemService.addBulkTestCases(problemId, test_cases);
    return createdResponse(res, 'Test cases added successfully', createdTestCases);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/problems/{id}/testcases:
 *   get:
 *     summary: Get all test cases for a problem
 *     tags: [Test Cases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of test cases
 */
export const getTestCases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problemId = parseInt(req.params.id);
    
    if (isNaN(problemId)) {
      throw new BadRequestError('Invalid problem ID');
    }

    // Include hidden test cases only for admin
    const includeHidden = req.user?.role === 'ADMIN';
    const testCases = await problemService.getTestCases(problemId, includeHidden);

    return successResponse(res, 'Test cases retrieved successfully', testCases);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/testcases/{id}:
 *   put:
 *     summary: Update a test case
 *     tags: [Test Cases]
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
 *         description: Test case updated successfully
 */
export const updateTestCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const testCaseId = parseInt(req.params.id);
    
    if (isNaN(testCaseId)) {
      throw new BadRequestError('Invalid test case ID');
    }

    const testCase = await problemService.updateTestCase(testCaseId, req.body);
    return successResponse(res, 'Test case updated successfully', testCase);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/testcases/{id}:
 *   delete:
 *     summary: Delete a test case
 *     tags: [Test Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Test case deleted successfully
 */
export const deleteTestCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const testCaseId = parseInt(req.params.id);
    
    if (isNaN(testCaseId)) {
      throw new BadRequestError('Invalid test case ID');
    }

    await problemService.deleteTestCase(testCaseId);
    return noContentResponse(res);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LANGUAGE CONTROLLERS
// ==========================================

/**
 * @swagger
 * /api/languages:
 *   get:
 *     summary: Get all supported programming languages
 *     tags: [Languages]
 *     responses:
 *       200:
 *         description: List of supported languages
 */
export const getLanguages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const languages = await problemService.getLanguages();
    return successResponse(res, 'Languages retrieved successfully', languages);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/problems/daily-challenge:
 *   get:
 *     summary: Lấy bài tập Thử thách Hàng ngày (Daily Challenge)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chi tiết bài tập Daily Challenge
 *       404:
 *         description: Chưa có Challenge nào được setup cho hôm nay
 */
export const getDailyChallengeProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const problem = await problemService.getDailyChallenge();

    return successResponse(
      res,
      'Daily Challenge retrieved successfully',
      problem
    );
  } catch (error) {
    next(error);
  }
};
