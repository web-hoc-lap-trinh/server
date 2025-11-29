import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Problem } from './problem.entity';

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn()
  test_case_id!: number;

  @Column({ type: 'int' })
  problem_id!: number;

  @Column({ type: 'longtext' })
  input_data!: string;

  @Column({ type: 'longtext' })
  expected_output!: string;

  @Column({ type: 'boolean', default: false, comment: 'Is this a sample test case shown to user' })
  is_sample!: boolean;

  @Column({ type: 'boolean', default: true, comment: 'Is this test case hidden from user' })
  is_hidden!: boolean;

  @Column({ type: 'text', nullable: true, comment: 'Explanation for sample test cases' })
  explanation!: string | null;

  // ==========================================
  // NEW FIELD FOR SCORING
  // ==========================================

  @Column({ type: 'int', default: 1, comment: 'Score for this test case' })
  score!: number;

  // ==========================================
  // TIMESTAMPS
  // ==========================================

  @CreateDateColumn()
  created_at!: Date;

  // ==========================================
  // RELATIONS
  // ==========================================

  @ManyToOne(() => Problem, (problem) => problem.test_cases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problem_id' })
  problem!: Problem;
}
