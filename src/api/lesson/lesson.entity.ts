import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Category } from '../category/category.entity';
import { User } from '../auth/user.entity';
import { TryItYourself } from './try-it-yourself.entity';
import { Discussion } from '../community/discussion.entity'; 

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  lesson_id!: number;

  @Column()
  category_id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'longtext' })
  content!: string;

  @Column({
    type: 'enum',
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    default: 'BEGINNER',
  })
  difficulty_level!: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @Column({ type: 'int', default: 0 })
  order_index!: number;

  @Column({ type: 'boolean', default: false })
  is_published!: boolean;

  @Column({ type: 'int', default: 0 })
  view_count!: number;

  @Column()
  created_by!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Category, (category) => category.lessons)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by_user!: User;

  @OneToOne(() => TryItYourself, (tryItYourself) => tryItYourself.lesson, { cascade: true })
  tryItYourself?: TryItYourself;

  @OneToMany(() => Discussion, (discussion) => discussion.lesson)
  discussions?: Discussion[]; 
}