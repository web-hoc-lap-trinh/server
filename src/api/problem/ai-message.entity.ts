import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
// Avoid direct type import to prevent circular resolution issues

@Entity('ai_messages')
export class AiMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  conversation_id!: number;

  @Column({ type: 'enum', enum: ['user', 'assistant'] })
  role!: 'user' | 'assistant';

  @Column({ type: 'text' })
  message!: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => (require('./ai-conversation.entity') as any).AiConversation, (conv: any) => (conv as any).messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: any;
}
