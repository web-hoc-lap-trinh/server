import { AppDataSource } from '../../config/data-source';
import { Discussion } from '../community/discussion.entity';
import { DiscussionReply } from '../community/reply.entity';
import { NotFoundError } from '../../utils/apiResponse';
import { emitDeleteDiscussion } from '../../realtime/events';
import { getPaginationOptions } from '../../utils/pagination';
import { FindOptionsWhere, Like } from 'typeorm';

const discussionRepository = AppDataSource.getRepository(Discussion);
const replyRepository = AppDataSource.getRepository(DiscussionReply);

/**
 * Get all discussions with filters (Admin)
 */
export const getAllDiscussions = async (
    page: number = 1,
    limit: number = 10,
    problemId?: number,
    lessonId?: number,
    isSolution?: boolean,
    search?: string
) => {
    const where: FindOptionsWhere<Discussion> = {};

    if (problemId) where.problem_id = problemId;
    if (lessonId) where.lesson_id = lessonId;
    if (isSolution !== undefined) where.is_solution = isSolution;

    // Add search filter if provided
    if (search) {
        where.title = Like(`%${search}%`);
    }

    const { skip, take } = getPaginationOptions(page, limit);

    const [discussions, total] = await discussionRepository.findAndCount({
        where,
        relations: ['user', 'problem', 'lesson'],
        order: {
            created_at: 'DESC',
        },
        skip,
        take,
    });

    return {
        data: discussions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * Get all replies for a discussion (Admin)
 */
export const getDiscussionReplies = async (
    discussionId: number,
    page: number = 1,
    limit: number = 10
) => {
    // Verify discussion exists
    const discussion = await discussionRepository.findOneBy({ discussion_id: discussionId });
    if (!discussion) {
        throw new NotFoundError('Discussion không tồn tại.');
    }

    const { skip, take } = getPaginationOptions(page, limit);

    const [replies, total] = await replyRepository.findAndCount({
        where: { discussion_id: discussionId },
        relations: ['user', 'discussion'],
        order: {
            created_at: 'ASC',
        },
        skip,
        take,
    });

    return {
        data: replies,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * Mark a discussion as solution
 */
export const markAsSolution = async (discussionId: number) => {
    const discussion = await discussionRepository.findOne({
        where: { discussion_id: discussionId },
        relations: ['user', 'problem', 'lesson'],
    });

    if (!discussion) {
        throw new NotFoundError('Discussion không tồn tại.');
    }

    // Update is_solution to true
    await discussionRepository.update(
        { discussion_id: discussionId },
        { is_solution: true }
    );

    // Return updated discussion with relations
    const updatedDiscussion = await discussionRepository.findOne({
        where: { discussion_id: discussionId },
        relations: ['user', 'problem', 'lesson'],
    });

    return updatedDiscussion;
};

/**
 * Delete a discussion (Admin)
 */
export const deleteDiscussionAdmin = async (discussionId: number) => {
    const discussion = await discussionRepository.findOneBy({ discussion_id: discussionId });
    if (!discussion) {
        throw new NotFoundError('Discussion không tồn tại.');
    }

    // Emit real-time event before deleting
    emitDeleteDiscussion(
        discussion.discussion_id,
        discussion.lesson_id !== null ? discussion.lesson_id : undefined,
        discussion.problem_id !== null ? discussion.problem_id : undefined
    );

    // Delete the discussion
    await discussionRepository.delete({ discussion_id: discussionId });
};
