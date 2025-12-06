import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Discussion } from './discussion.entity';
import { Vote } from './vote.entity';

@Entity('discussion_replies')
export class DiscussionReply {
    @PrimaryGeneratedColumn()
    reply_id!: number;

    @Column()
    discussion_id!: number;

    @Column({ nullable: true })
    parent_reply_id!: number | null;

    @Column()
    user_id!: number;

    @Column({ type: 'longtext' })
    content!: string;

    @Column({ default: 0 })
    upvotes!: number;

    @Column({ default: 0 })
    downvotes!: number;

    @Column({ default: false })
    is_accepted!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relations
    @ManyToOne(() => Discussion, (discussion) => discussion.replies)
    @JoinColumn({ name: 'discussion_id' })
    discussion!: Discussion;

    @ManyToOne(() => DiscussionReply, (reply) => reply.replies)
    @JoinColumn({ name: 'parent_reply_id' })
    parent_reply?: DiscussionReply;

    @OneToMany(() => DiscussionReply, (reply) => reply.parent_reply)
    replies?: DiscussionReply[]; // Replies of this reply (nested comments)

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany(() => Vote, (vote) => vote.reply)
    votes?: Vote[];
}