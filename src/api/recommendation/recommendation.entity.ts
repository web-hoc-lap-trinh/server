import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Problem } from '../problem/problem.entity';
import { Lesson } from '../lesson/lesson.entity';

export enum RecommendationType {
  PROBLEM = 'PROBLEM',
  LESSON = 'LESSON',
}

@Entity('user_recommendations')
export class UserRecommendation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  user_id!: number;

  @Column({
    type: 'enum',
    enum: RecommendationType,
    default: RecommendationType.PROBLEM,
  })
  type!: RecommendationType;

  @Column({ type: 'int' })
  item_id!: number;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  // ==========================================
  // RELATIONS
  // ==========================================

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Virtual relations - will be populated based on type
  problem?: Problem;
  lesson?: Lesson;
}
