import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from '../lesson/lesson.entity';

/**
 * Exercise types - currently only multiple choice supported
 */
export enum ExerciseType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',  // 4 options
  TRUE_FALSE = 'TRUE_FALSE',             // 2 options (true/false)
}

/**
 * Exercise Option Interface for JSON column
 */
export interface ExerciseOption {
  id: string;        // 'A', 'B', 'C', 'D' or 'TRUE', 'FALSE'
  text: string;      // Option content
}

@Entity('lesson_exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  exercise_id!: number;

  @Column()
  lesson_id!: number;

  @Column({ type: 'varchar', length: 200 })
  question!: string;

  @Column({
    type: 'enum',
    enum: ExerciseType,
    default: ExerciseType.MULTIPLE_CHOICE,
  })
  exercise_type!: ExerciseType;

  @Column({ type: 'json' })
  options!: ExerciseOption[];

  @Column({ type: 'varchar', length: 10 })
  correct_answer!: string;  // 'A', 'B', 'C', 'D' or 'TRUE', 'FALSE'

  @Column({ type: 'text', nullable: true })
  explanation!: string | null;  // Explanation shown after answering

  @Column({ type: 'int', default: 0 })
  order_index!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;
}
