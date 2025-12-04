import { io, LessonRoom, ProblemRoom, SubmissionRoom } from './rooms';
import { Discussion } from '../api/community/discussion.entity';
import { DiscussionReply } from '../api/community/reply.entity';
import { ServerToClientEvents, SubmissionUpdatePayload } from './socket.types'; 


const getTargetRoom = (discussion: Discussion) => {
    if (discussion.lesson_id) return LessonRoom(discussion.lesson_id);
    if (discussion.problem_id) return ProblemRoom(discussion.problem_id);
    return null;
};

export const emitNewDiscussion = (discussion: Discussion) => {
    const room = getTargetRoom(discussion);
    if (room) {
        io.to(room).emit('lesson:new-discussion', discussion);
    }
};

export const emitDeleteDiscussion = (discussion_id: number, lesson_id?: number, problem_id?: number) => {
    let room = null;
    if (lesson_id) room = LessonRoom(lesson_id);
    if (problem_id) room = ProblemRoom(problem_id);
    
    if (room) {
        io.to(room).emit('lesson:delete-discussion', { discussion_id });
    }
};

export const emitNewReply = (reply: DiscussionReply) => {
    const room = getTargetRoom(reply.discussion);
    if (room) {
        io.to(room).emit('lesson:new-reply', reply);
    }
};

export const emitVoteUpdate = (
    target: Discussion | DiscussionReply,
    upvotes: number,
    downvotes: number
) => {
    let room: string | null = null;
    let discussion_id: number | undefined = undefined;
    let reply_id: number | undefined = undefined;

    if (target instanceof Discussion) {
        room = getTargetRoom(target);
        discussion_id = target.discussion_id;
    } else if (target instanceof DiscussionReply) {
        room = getTargetRoom(target.discussion);
        discussion_id = target.discussion_id;
        reply_id = target.reply_id;
    }

    if (room && discussion_id) { 
        io.to(room).emit('lesson:vote-update', {
            discussion_id,
            reply_id,
            upvotes,
            downvotes,
        });
    }
};


export const emitSubmissionStatusUpdate = (data: SubmissionUpdatePayload) => {
    io.to(SubmissionRoom(data.submission_id)).emit('submission:status-update', data);
};