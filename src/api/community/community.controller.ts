import { Request, Response } from 'express';
import * as communityService from './community.service';
import { DiscussionType } from './discussion.entity';
import { VoteType } from './vote.entity';
import {
    successResponse,
    createdResponse,
    noContentResponse,
    BadRequestError,
} from '../../utils/apiResponse';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';


export const createDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const { problem_id, lesson_id, title, content, discussion_type, is_solution } = req.body;
    const userId = req.user!.user_id;

    const newDiscussion = await communityService.createDiscussion({
        problem_id: problem_id ? parseInt(problem_id) : undefined,
        lesson_id: lesson_id ? parseInt(lesson_id) : undefined,
        title,
        content,
        discussion_type: discussion_type as DiscussionType,
        is_solution,
    }, userId);

    createdResponse(res, 'Tạo Discussion/Solution thành công', newDiscussion);
});

export const getDiscussions = asyncHandler(async (req: Request, res: Response) => {
    const problemId = req.query.problem_id ? parseInt(req.query.problem_id as string) : undefined;
    const lessonId = req.query.lesson_id ? parseInt(req.query.lesson_id as string) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const type = req.query.type as DiscussionType;
    const isSolution = req.query.is_solution !== undefined ? req.query.is_solution === 'true' : undefined;

    if (!problemId && !lessonId) {
        throw new BadRequestError('Phải cung cấp problem_id hoặc lesson_id');
    }

    const result = await communityService.getDiscussionsByTarget(
        problemId,
        lessonId,
        page,
        limit,
        type,
        isSolution
    );

    successResponse(res, 'Fetched discussions successfully', result);
});

export const getDiscussionDetail = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = parseInt(req.params.discussionId);

    const discussion = await communityService.getDiscussionById(discussionId);

    successResponse(res, 'Fetched discussion detail successfully', discussion);
});

export const updateDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = parseInt(req.params.discussionId);
    const updateData = req.body;

    const updatedDiscussion = await communityService.updateDiscussion(discussionId, updateData);

    successResponse(res, 'Cập nhật discussion thành công', updatedDiscussion);
});

export const deleteDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = parseInt(req.params.discussionId);

    await communityService.deleteDiscussion(discussionId);

    noContentResponse(res);
});


export const createReply = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = parseInt(req.params.discussionId);
    const { content } = req.body; 
    const userId = req.user!.user_id;

    const newReply = await communityService.createReply(
        discussionId, 
        content, 
        userId, 
    );

    createdResponse(res, 'Tạo reply thành công', newReply);
});
export const getReplies = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = parseInt(req.params.discussionId);
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await communityService.getRepliesByDiscussion(discussionId, page, limit);

    successResponse(res, 'Fetched replies successfully', result);
});

export const deleteReply = asyncHandler(async (req: Request, res: Response) => {
    const replyId = parseInt(req.params.replyId);

    await communityService.deleteReply(replyId);

    noContentResponse(res);
});

export const handleVote = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.user_id;
    const { discussion_id, reply_id, vote_type } = req.body;

    const result = await communityService.handleVote(
        userId,
        vote_type as VoteType,
        discussion_id ? parseInt(discussion_id) : undefined,
        reply_id ? parseInt(reply_id) : undefined
    );

    successResponse(res, 'Vote updated successfully', result);
});