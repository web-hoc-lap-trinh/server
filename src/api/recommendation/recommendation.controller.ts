import { Request, Response, NextFunction } from 'express';
import * as RecommendationService from './recommendation.service';
import { RecommendationType } from './recommendation.entity';
import { successResponse, BadRequestError } from '../../utils/apiResponse';

// ==========================================
// RECOMMENDATION CONTROLLERS
// ==========================================

/**
 * Get recommendations for the authenticated user
 * GET /api/recommendations
 */
export async function getRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      throw new BadRequestError('User not authenticated');
    }

    const { type, page, limit } = req.query;

    // Validate type if provided
    let recommendationType: RecommendationType | undefined;
    if (type) {
      const upperType = (type as string).toUpperCase();
      if (upperType !== 'PROBLEM' && upperType !== 'LESSON') {
        throw new BadRequestError('Invalid recommendation type. Must be PROBLEM or LESSON');
      }
      recommendationType = upperType as RecommendationType;
    }

    const result = await RecommendationService.getRecommendations({
      user_id: userId,
      type: recommendationType,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    });

    // Handle Cold Start: If no recommendations, return appropriate fallback based on type
    if (result.recommendations.length === 0) {
      // If requesting LESSON type, return beginner lessons
      if (recommendationType === RecommendationType.LESSON) {
        const coldStartLessons = await RecommendationService.getRandomBeginnerLessons(10);
        
        const coldStartRecommendations = coldStartLessons.map((lesson) => ({
          id: 0, // Virtual recommendation
          user_id: userId,
          type: RecommendationType.LESSON,
          item_id: lesson.lesson_id,
          reason: 'Recommended beginner lesson to get started',
          created_at: new Date(),
          lesson: {
            lesson_id: lesson.lesson_id,
            title: lesson.title,
            description: lesson.description,
            difficulty_level: lesson.difficulty_level,
            category_id: lesson.category_id,
          },
        }));

        successResponse(res, 'Recommendations retrieved successfully (cold start)', {
          recommendations: coldStartRecommendations,
          is_cold_start: true,
          pagination: {
            total: coldStartRecommendations.length,
            page: 1,
            limit: 10,
            total_pages: 1,
          },
        });
        return;
      }

      // Default: return random EASY problems (for PROBLEM type or no type specified)
      const coldStartProblems = await RecommendationService.getRandomEasyProblems(userId, 10);
      
      const coldStartRecommendations = coldStartProblems.map((problem) => ({
        id: 0, // Virtual recommendation
        user_id: userId,
        type: RecommendationType.PROBLEM,
        item_id: problem.problem_id,
        reason: 'Recommended for beginners to get started',
        created_at: new Date(),
        problem: {
          problem_id: problem.problem_id,
          title: problem.title,
          difficulty: problem.difficulty,
          points: problem.points,
          acceptance_rate: problem.acceptance_rate,
        },
      }));

      successResponse(res, 'Recommendations retrieved successfully (cold start)', {
        recommendations: coldStartRecommendations,
        is_cold_start: true,
        pagination: {
          total: coldStartRecommendations.length,
          page: 1,
          limit: 10,
          total_pages: 1,
        },
      });
      return;
    }

    successResponse(res, 'Recommendations retrieved successfully', {
      recommendations: result.recommendations,
      is_cold_start: false,
      pagination: {
        total: result.total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        total_pages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 10)),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Trigger recommendation update for a specific submission
 * POST /api/recommendations/analyze/:submissionId
 * This can be called manually or automatically after judging
 */
export async function analyzeSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      throw new BadRequestError('User not authenticated');
    }

    const submissionId = parseInt(req.params.submissionId);
    if (isNaN(submissionId)) {
      throw new BadRequestError('Invalid submission ID');
    }

    await RecommendationService.updateRecommendations(userId, submissionId);

    successResponse(res, 'Recommendations updated based on submission analysis');
  } catch (error) {
    next(error);
  }
}

/**
 * Clear all recommendations for the authenticated user
 * DELETE /api/recommendations
 */
export async function clearRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      throw new BadRequestError('User not authenticated');
    }

    await RecommendationService.clearUserRecommendations(userId);

    successResponse(res, 'Recommendations cleared successfully');
  } catch (error) {
    next(error);
  }
}
