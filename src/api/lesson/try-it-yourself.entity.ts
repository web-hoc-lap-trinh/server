import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { Language } from '../problem/language.entity';

@Entity('try_it_yourself')
export class TryItYourself {
  @PrimaryGeneratedColumn()
  try_it_yourself_id!: number;

  @Column({ unique: true })
  lesson_id!: number;

  @Column()
  language_id!: number;

  @Column({ type: 'text' })
  example_code!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToOne(() => Lesson, (lesson) => lesson.tryItYourself, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;

  @ManyToOne(() => Language)
  @JoinColumn({ name: 'language_id' })
  language!: Language;
}
