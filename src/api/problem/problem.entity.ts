import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { TestCase } from './testcase.entity';
import { Tag } from '../tag/tag.entity';
import { Discussion } from '../community/discussion.entity'; 

export enum ProblemDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface SampleIO {
  input: string;
  output: string;
  explanation?: string;
}

@Entity('problems')
export class Problem {
  @PrimaryGeneratedColumn()
  problem_id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'longtext' })
  description!: string;

  @Column({
    type: 'enum',
    enum: ProblemDifficulty,
    default: ProblemDifficulty.EASY,
  })
  difficulty!: ProblemDifficulty;

  @Column({ type: 'int', default: 1000, comment: 'Time limit in milliseconds' })
  time_limit!: number;

  @Column({ type: 'int', default: 256, comment: 'Memory limit in MB' })
  memory_limit!: number;

  @Column({ type: 'int', default: 100 })
  points!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  acceptance_rate!: number;

  @Column({ type: 'int', default: 0 })
  total_submissions!: number;

  @Column({ type: 'int', default: 0 })
  accepted_submissions!: number;

  @Column({ type: 'int' })
  created_by!: number;

  @Column({ type: 'boolean', default: false })
  is_published!: boolean;

  @Column({ type: 'boolean', default: false })
  is_daily_challenge!: boolean;

  @Column({ type: 'date', nullable: true })
  challenge_date!: Date | null;

  // ==========================================
  // NEW FIELDS FOR ONLINE JUDGE
  // ==========================================

  @Column({ type: 'text', nullable: true, comment: 'Description of input format' })
  input_format!: string | null;

  @Column({ type: 'text', nullable: true, comment: 'Description of output format' })
  output_format!: string | null;

  @Column({ type: 'text', nullable: true, comment: 'Problem constraints' })
  constraints!: string | null;

  @Column({ type: 'json', nullable: true, comment: 'Sample inputs/outputs' })
  samples!: SampleIO[] | null;

  @Column({ type: 'text', nullable: true, comment: 'Private notes from author' })
  author_notes!: string | null;

  // ==========================================
  // TIMESTAMPS
  // ==========================================

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // ==========================================
  // RELATIONS
  // ==========================================

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  author!: User;

  @OneToMany(() => TestCase, (testCase) => testCase.problem)
  test_cases!: TestCase[];

  @ManyToMany(() => Tag, (tag) => tag.problems)
  @JoinTable({
    name: 'problem_tags',
    joinColumn: { name: 'problem_id', referencedColumnName: 'problem_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags!: Tag[];

  // Submissions relation - uses forward reference to avoid circular dependency
  @OneToMany('Submission', 'problem')
  submissions!: any[];
  
  @OneToMany(() => Discussion, (discussion) => discussion.problem)
  discussions?: Discussion[]; 
}
