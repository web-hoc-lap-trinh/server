import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Unique
} from 'typeorm';
import { User } from '../user/user.entity';
import { Discussion } from './discussion.entity';
import { DiscussionReply } from './reply.entity';

export enum VoteType {
    UPVOTE = 'UPVOTE',
    DOWNVOTE = 'DOWNVOTE',
}

@Entity('votes')
@Unique(['user_id', 'discussion_id', 'reply_id'])
export class Vote {
    @PrimaryGeneratedColumn()
    vote_id!: number;

    @Column()
    user_id!: number;

    @Column({ nullable: true })
    discussion_id!: number | null;

    @Column({ nullable: true })
    reply_id!: number | null;

    @Column({ type: 'enum', enum: VoteType })
    vote_type!: VoteType;

    @CreateDateColumn()
    created_at!: Date;

    // Relations
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Discussion, (discussion) => discussion.votes)
    @JoinColumn({ name: 'discussion_id' })
    discussion?: Discussion;

    @ManyToOne(() => DiscussionReply, (reply) => reply.votes)
    @JoinColumn({ name: 'reply_id' })
    reply?: DiscussionReply;
}