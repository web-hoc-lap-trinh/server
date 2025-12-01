import { Router } from 'express';
import * as RecommendationController from './recommendation.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get learning recommendations for the authenticated user
 *     description: Returns personalized problem/lesson recommendations based on submission history. Handles cold start with random EASY problems.
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PROBLEM, LESSON]
 *         description: Filter by recommendation type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
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
 *                   type: object
 *                   properties:
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           user_id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                             enum: [PROBLEM, LESSON]
 *                           item_id:
 *                             type: integer
 *                           reason:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           problem:
 *                             type: object
 *                             properties:
 *                               problem_id:
 *                                 type: integer
 *                               title:
 *                                 type: string
 *                               difficulty:
 *                                 type: string
 *                               points:
 *                                 type: integer
 *                               acceptance_rate:
 *                                 type: number
 *                     is_cold_start:
 *                       type: boolean
 *                       description: True if recommendations are from cold start (no prior data)
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, RecommendationController.getRecommendations);

/**
 * @swagger
 * /api/recommendations/analyze/{submissionId}:
 *   post:
 *     summary: Analyze a submission and update recommendations
 *     description: Analyzes the error output from a submission using LLM and generates new learning recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The submission ID to analyze
 *     responses:
 *       200:
 *         description: Recommendations updated successfully
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
 *       400:
 *         description: Invalid submission ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Submission not found
 */
router.post('/analyze/:submissionId', authMiddleware, RecommendationController.analyzeSubmission);

/**
 * @swagger
 * /api/recommendations:
 *   delete:
 *     summary: Clear all recommendations for the authenticated user
 *     description: Removes all stored recommendations for the current user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations cleared successfully
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
 *       401:
 *         description: Unauthorized
 */
router.delete('/', authMiddleware, RecommendationController.clearRecommendations);

export default router;
