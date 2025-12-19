import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity'; 

@Entity('daily_activities')
export class DailyActivity {
    @PrimaryGeneratedColumn()
    activity_id!: number;

    @Column()
    user_id!: number;

    @Column({ type: 'date' }) 
    activity_date!: string; 

    @Column({ default: 0 })
    problems_solved!: number;

    @Column({ default: 0 })
    lessons_completed!: number;

    @Column({ default: 0 })
    time_spent!: number;

    @Column({ default: 0 })
    points_earned!: number;

    @Column({ default: 0 }) 
    streak_day!: number; 

    @CreateDateColumn()
    created_at!: Date;

    // Relations
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}