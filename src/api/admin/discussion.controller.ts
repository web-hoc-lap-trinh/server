import { Request, Response } from 'express';
import * as discussionService from './discussion.service';
import { successResponse, noContentResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';

/**
 * Get all discussions (Admin)
 */
export const getAllDiscussions = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const problemId = req.query.problem_id ? parseInt(req.query.problem_id as string) : undefined;
    const lessonId = req.query.lesson_id ? parseInt(req.query.lesson_id as string) : undefined;
    const isSolution = req.query.is_solution !== undefined ? req.query.is_solution === 'true' : undefined;
    const search = req.query.search as string | undefined;

    const result = await discussionService.getAllDiscussions(
        page,
        limit,
        problemId,
        lessonId,
        isSolution,
        search
    );

    successResponse(res, 'Fetched all discussions successfully', result);
});

/**
 * Get all replies for a discussion (Admin)
 */
export const getDiscussionReplies = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = parseInt(req.params.discussionId);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await discussionService.getDiscussionReplies(discussionId, page, limit);

    successResponse(res, 'Fetched discussion replies successfully', result);
});

/**
 * Mark a discussion as solution (Admin)
 */
export const markAsSolution = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = parseInt(req.params.discussionId);

    const updatedDiscussion = await discussionService.markAsSolution(discussionId);

    successResponse(res, 'Marked discussion as solution successfully', updatedDiscussion);
});

/**
 * Delete a discussion (Admin)
 */
export const deleteDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = parseInt(req.params.discussionId);

    await discussionService.deleteDiscussionAdmin(discussionId);

    noContentResponse(res);
});
