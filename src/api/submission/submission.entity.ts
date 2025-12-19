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

export enum SubmissionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  ACCEPTED = 'ACCEPTED',
  WRONG_ANSWER = 'WRONG_ANSWER',
  TIME_LIMIT = 'TIME_LIMIT',
  MEMORY_LIMIT = 'MEMORY_LIMIT',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  COMPILE_ERROR = 'COMPILE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface TestCaseResult {
  test_case_id: number;
  status: SubmissionStatus;
  execution_time: number;
  memory_used: number;
  stdout: string;
  stderr: string;
  expected_output?: string;
  actual_output?: string;
  score: number;
  is_sample: boolean;
}

export interface ExecutionLogs {
  test_case_results: TestCaseResult[];
  compile_output?: string;
  compile_time?: number;
  total_execution_time: number;
  max_memory_used: number;
  judged_at: string;
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  submission_id!: number;

  @Column({ type: 'int' })
  user_id!: number;

  @Column({ type: 'int' })
  problem_id!: number;

  @Column({ type: 'int' })
  language_id!: number;

  @Column({ type: 'longtext' })
  source_code!: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status!: SubmissionStatus;

  @Column({ type: 'int', nullable: true, comment: 'Execution time in milliseconds' })
  execution_time!: number | null;

  @Column({ type: 'int', nullable: true, comment: 'Memory used in KB' })
  memory_used!: number | null;

  @Column({ type: 'int', default: 0 })
  points_earned!: number;

  @Column({ type: 'int', default: 0 })
  test_cases_passed!: number;

  @Column({ type: 'int', default: 0 })
  total_test_cases!: number;

  @Column({ type: 'text', nullable: true })
  error_message!: string | null;

  // ==========================================
  // NEW FIELDS FOR ONLINE JUDGE
  // ==========================================

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Language name' })
  language!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Language version' })
  language_version!: string | null;

  @Column({ type: 'longtext', nullable: true, comment: 'Standard output' })
  stdout!: string | null;

  @Column({ type: 'longtext', nullable: true, comment: 'Standard error' })
  stderr!: string | null;

  @Column({ type: 'json', nullable: true, comment: 'Detailed execution logs' })
  execution_logs!: ExecutionLogs | null;

  // ==========================================
  // TIMESTAMPS
  // ==========================================

  @CreateDateColumn()
  submitted_at!: Date;

  // ==========================================
  // RELATIONS
  // ==========================================

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Problem, (problem) => problem.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problem_id' })
  problem!: Problem;
}
