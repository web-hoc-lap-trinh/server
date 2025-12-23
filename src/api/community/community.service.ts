import { AppDataSource } from '../../config/data-source';
import { Discussion, DiscussionType } from './discussion.entity';
import { DiscussionReply } from './reply.entity';
import { Vote, VoteType } from './vote.entity';
import { Problem } from '../problem/problem.entity';
import { Lesson } from '../lesson/lesson.entity';
import {
    NotFoundError,
    BadRequestError,
} from '../../utils/apiResponse';
import {
    emitNewDiscussion,
    emitNewReply,
    emitVoteUpdate,
    emitDeleteDiscussion,
} from '../../realtime/events';
import { FindOptionsWhere } from 'typeorm';
import { getPaginationOptions } from '../../utils/pagination';

const discussionRepository = AppDataSource.getRepository(Discussion);
const replyRepository = AppDataSource.getRepository(DiscussionReply);
const voteRepository = AppDataSource.getRepository(Vote);
const problemRepository = AppDataSource.getRepository(Problem);
const lessonRepository = AppDataSource.getRepository(Lesson);

// Hàm dùng chung để validate Problem/Lesson ID
const validateTarget = async (problemId?: number, lessonId?: number) => {
    if (!problemId && !lessonId) {
        throw new BadRequestError('Phải có problem_id hoặc lesson_id');
    }
    if (problemId && lessonId) {
        throw new BadRequestError('Chỉ được phép gắn với problem_id hoặc lesson_id');
    }

    if (problemId) {
        const problem = await problemRepository.findOneBy({ problem_id: problemId });
        if (!problem) throw new NotFoundError('Problem không tồn tại');
    }

    if (lessonId) {
        const lesson = await lessonRepository.findOneBy({ lesson_id: lessonId });
        if (!lesson) throw new NotFoundError('Lesson không tồn tại');
    }
};


const getDiscussionWithRelations = async (discussionId: number) => {
    return await discussionRepository.findOne({
        where: { discussion_id: discussionId },
        relations: ['user', 'problem', 'lesson'],
    });
};

const getReplyWithRelations = async (replyId: number) => {
    return await replyRepository.findOne({
        where: { reply_id: replyId },
        relations: ['user', 'discussion', 'discussion.problem', 'discussion.lesson'], 
    });
};

export const createDiscussion = async (
    data: {
        problem_id?: number;
        lesson_id?: number;
        title: string;
        content: string;
        discussion_type?: DiscussionType;
        is_solution?: boolean;
    },
    userId: number
) => {
    await validateTarget(data.problem_id, data.lesson_id);

    const newDiscussion = discussionRepository.create({
        ...data,
        user_id: userId,
    });
    const savedDiscussion = await discussionRepository.save(newDiscussion);

    const discussionWithRelations = await getDiscussionWithRelations(savedDiscussion.discussion_id);
    
    if (discussionWithRelations) {
        emitNewDiscussion(discussionWithRelations); 
    }

    return discussionWithRelations; 
};

export const getDiscussionsByTarget = async (
    problemId?: number,
    lessonId?: number,
    page: number = 1,
    limit: number = 10,
    type?: DiscussionType,
    isSolution?: boolean
) => {
    const where: FindOptionsWhere<Discussion> = {};
    if (problemId) where.problem_id = problemId;
    if (lessonId) where.lesson_id = lessonId;
    if (type) where.discussion_type = type;
    if (isSolution !== undefined) where.is_solution = isSolution;

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
    };
};

export const getDiscussionById = async (discussionId: number) => {
    const discussion = await getDiscussionWithRelations(discussionId); 

    if (!discussion) {
        throw new NotFoundError('Discussion không tồn tại.');
    }
    return discussion; 
};

export const updateDiscussion = async (discussionId: number, updateData: Partial<Discussion>) => {
    const discussion = await discussionRepository.findOneBy({ discussion_id: discussionId });
    if (!discussion) {
        throw new NotFoundError('Discussion không tồn tại.');
    }
    await discussionRepository.update({ discussion_id: discussionId }, updateData);
    
    const updatedDiscussion = await getDiscussionWithRelations(discussionId);
    return updatedDiscussion;
};

export const deleteDiscussion = async (discussionId: number) => {
    const discussion = await discussionRepository.findOneBy({ discussion_id: discussionId });
    if (!discussion) {
        throw new NotFoundError('Discussion không tồn tại.');
    }

    // Emit Realtime trước khi xóa
    emitDeleteDiscussion(
        discussion.discussion_id,
        discussion.lesson_id !== null ? discussion.lesson_id : undefined, 
        discussion.problem_id !== null ? discussion.problem_id : undefined 
    );    
    await discussionRepository.delete({ discussion_id: discussionId });
};


export const createReply = async (
    discussionId: number,
    content: string,
    userId: number,
) => {
    const discussion = await discussionRepository.findOne({
        where: { discussion_id: discussionId },
        relations: ['problem', 'lesson'] 
    });

    if (!discussion) {
        throw new NotFoundError('Discussion không tồn tại.');
    }
    const newReply = replyRepository.create({
        discussion_id: discussionId,
        content: content,
        user_id: userId,
    });

    const savedReply = await replyRepository.save(newReply);
    
    await discussionRepository.increment({ discussion_id: discussionId }, 'reply_count', 1);

    const replyWithRelations = await getReplyWithRelations(savedReply.reply_id);

    if (replyWithRelations) {
        emitNewReply(replyWithRelations); 
    }

    return replyWithRelations;
};

export const getRepliesByDiscussion = async (
    discussionId: number,
    page: number = 1,
    limit: number = 10
) => {
    const discussion = await discussionRepository.findOneBy({ discussion_id: discussionId });
    if (!discussion) {
        throw new NotFoundError('Discussion không tồn tại.');
    }

    const { skip, take } = getPaginationOptions(page, limit);

    const [replies, total] = await replyRepository.findAndCount({
        where: { discussion_id: discussionId },
        relations: ['user'], 
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
    };
};

export const deleteReply = async (replyId: number) => {
    const reply = await replyRepository.findOneBy({ reply_id: replyId });
    if (!reply) {
        throw new NotFoundError('Reply không tồn tại.');
    }

    await discussionRepository.decrement({ discussion_id: reply.discussion_id }, 'reply_count', 1);

    await replyRepository.delete({ reply_id: replyId });
};


export const handleVote = async (
    userId: number,
    voteType: VoteType,
    discussionId?: number,
    replyId?: number
) => {
    if (!discussionId && !replyId) {
        throw new BadRequestError('Phải có discussion_id hoặc reply_id');
    }
    
    let target: Discussion | DiscussionReply | null = null;
    let targetRepository: any;

    if (discussionId) {
        target = await discussionRepository.findOneBy({ discussion_id: discussionId });
        targetRepository = discussionRepository;
        if (!target) throw new NotFoundError('Discussion không tồn tại');
    } else if (replyId) {
        target = await replyRepository.findOne({ 
            where: { reply_id: replyId },
            relations: ['discussion', 'discussion.problem', 'discussion.lesson']
        });
        targetRepository = replyRepository;
        if (!target) throw new NotFoundError('Reply không tồn tại');
    }

    if (!target) {
        throw new NotFoundError('Target không tồn tại');
    }

    const existingVote = await voteRepository.findOneBy({
        user_id: userId,
        discussion_id: discussionId || undefined, 
        reply_id: replyId || undefined,           
    });

    let upvoteChange = 0;
    let downvoteChange = 0;

    if (existingVote) {
        if (existingVote.vote_type === voteType) {
            await voteRepository.remove(existingVote);
            if (voteType === VoteType.UPVOTE) upvoteChange = -1;
            else downvoteChange = -1;
        } else {
            existingVote.vote_type = voteType;
            await voteRepository.save(existingVote);

            if (voteType === VoteType.UPVOTE) {
                upvoteChange = 1;
                downvoteChange = -1;
            } else {
                upvoteChange = -1;
                downvoteChange = 1;
            }
        }
    } else {
        const newVote = voteRepository.create({
            user_id: userId,
            discussion_id: discussionId || undefined, 
            reply_id: replyId || undefined,           
            vote_type: voteType,
        });
        await voteRepository.save(newVote);
        if (voteType === VoteType.UPVOTE) upvoteChange = 1;
        else downvoteChange = 1;
    }


    if (upvoteChange !== 0) {
        await targetRepository.increment({ [discussionId ? 'discussion_id' : 'reply_id']: discussionId || replyId }, 'upvotes', upvoteChange);
        target.upvotes += upvoteChange;
    }
    if (downvoteChange !== 0) {
        await targetRepository.increment({ [discussionId ? 'discussion_id' : 'reply_id']: discussionId || replyId }, 'downvotes', downvoteChange);
        target.downvotes += downvoteChange;
    }

    emitVoteUpdate(target, target.upvotes, target.downvotes);

    return { upvotes: target.upvotes, downvotes: target.downvotes };
};

