import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Problem } from '../problem/problem.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  tag_id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 7, nullable: true, comment: 'Hex color code' })
  color!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Icon class or name' })
  icon!: string | null;

  @Column({ type: 'int', default: 0, comment: 'Display order' })
  order_index!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'int', default: 0, comment: 'Number of problems with this tag' })
  problem_count!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // ==========================================
  // RELATIONS
  // ==========================================

  @ManyToMany(() => Problem, (problem) => problem.tags)
  problems!: Problem[];
}
