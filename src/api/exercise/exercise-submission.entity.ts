import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Exercise } from './exercise.entity';

/**
 * Exercise Submission History Entity
 * Lưu toàn bộ lịch sử làm bài tập của người dùng
 */
@Entity('exercise_submissions')
export class ExerciseSubmission {
  @PrimaryGeneratedColumn()
  submission_id!: number;

  @Column()
  user_id!: number;

  @Column()
  exercise_id!: number;

  @Column()
  lesson_id!: number;

  @Column({ type: 'varchar', length: 10 })
  user_answer!: string; // 'A', 'B', 'C', 'D' or 'TRUE', 'FALSE'

  @Column({ type: 'varchar', length: 10 })
  correct_answer!: string; // Lưu lại đáp án đúng tại thời điểm làm

  @Column({ type: 'boolean' })
  is_correct!: boolean;

  @Column({ type: 'int', nullable: true })
  time_spent_seconds!: number | null; // Thời gian làm bài (giây)

  @Column({ type: 'int', default: 1 })
  attempt_number!: number; // Lần thử thứ mấy cho exercise này

  @CreateDateColumn()
  submitted_at!: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exercise_id' })
  exercise!: Exercise;
}
