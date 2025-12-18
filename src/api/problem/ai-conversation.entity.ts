import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Problem } from './problem.entity';
// Avoid direct type import to prevent circular resolution issues

@Entity('ai_conversations')
export class AiConversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  problem_id!: number;

  @Column()
  user_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Problem)
  @JoinColumn({ name: 'problem_id' })
  problem!: Problem;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => (require('./ai-message.entity') as any).AiMessage, (msg: any) => (msg as any).conversation)
  messages!: any[];
}
