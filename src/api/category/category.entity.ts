import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Lesson } from '../lesson/lesson.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  category_id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon_url!: string | null;

  @Column({ type: 'int', default: 0 })
  order_index!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  // Relation
  @OneToMany(() => Lesson, (lesson) => lesson.category)
  lessons!: Lesson[];
}