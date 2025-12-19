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
import { User } from '../user/user.entity';
import { Problem } from '../problem/problem.entity';
import { Lesson } from '../lesson/lesson.entity';
import { DiscussionReply } from './reply.entity';
import { Vote } from './vote.entity';

export enum DiscussionType {
    QUESTION = 'QUESTION',
    SOLUTION = 'SOLUTION',
    GENERAL = 'GENERAL',
    BUG_REPORT = 'BUG_REPORT',
}

@Entity('discussions')
export class Discussion {
    @PrimaryGeneratedColumn()
    discussion_id!: number;

    @Column({ nullable: true })
    problem_id!: number | null;

    @Column({ nullable: true })
    lesson_id!: number | null;

    @Column()
    user_id!: number;

    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'longtext' })
    content!: string;

    @Column({
        type: 'enum',
        enum: DiscussionType,
        default: DiscussionType.QUESTION,
    })
    discussion_type!: DiscussionType;

    @Column({ default: false })
    is_solution!: boolean;

    @Column({ default: 0 })
    upvotes!: number;

    @Column({ default: 0 })
    downvotes!: number;

    @Column({ default: 0 })
    view_count!: number;

    @Column({ default: 0 })
    reply_count!: number;

    @Column({ default: false })
    is_pinned!: boolean;

    @Column({ default: false })
    is_locked!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relations
    @ManyToOne(() => Problem, (problem) => problem.discussions)
    @JoinColumn({ name: 'problem_id' })
    problem?: Problem;

    @ManyToOne(() => Lesson, (lesson) => lesson.discussions)
    @JoinColumn({ name: 'lesson_id' })
    lesson?: Lesson;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany(() => DiscussionReply, (reply) => reply.discussion)
    replies?: DiscussionReply[];
    
    @OneToMany(() => Vote, (vote) => vote.discussion)
    votes?: Vote[];
}