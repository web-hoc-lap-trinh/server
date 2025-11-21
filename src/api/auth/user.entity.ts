import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash!: string; 

  @Column({ type: 'varchar', length: 100, nullable: true })
  full_name!: string; 
                     

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_url!: string | null; 

  @Column({
    type: 'enum',
    enum: ['STUDENT', 'ADMIN'],
    default: 'STUDENT',
  })
  role!: string; 

  @Column({ type: 'int', default: 0 })
  total_score!: number;

  @Column({ type: 'int', default: 0 })
  solved_problems!: number;

  @Column({ type: 'int', default: 0 })
  current_streak!: number;

  @Column({ type: 'int', default: 0 })
  max_streak!: number; 

  @Column({ type: 'datetime', nullable: true })
  last_active!: Date | null; 

  @Column({ type: 'varchar', length: 10, nullable: true, select: false })
  reset_otp!: string | null;

  @Column({ type: 'datetime', nullable: true, select: false })
  reset_otp_expires!: Date | null; 

  @Column({ type: 'varchar', length: 10, nullable: true, select: false })
  change_password_otp!: string | null;

  @Column({ type: 'datetime', nullable: true, select: false })
  change_password_otp_expires!: Date | null;
  
  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true, select: false })
  verification_otp!: string | null;

  @Column({ type: 'datetime', nullable: true, select: false })
  verification_otp_expires!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date; 
}