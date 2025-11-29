import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  language_id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  version!: string | null;

  @Column({ type: 'varchar', length: 100 })
  docker_image!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  compile_command!: string | null;

  @Column({ type: 'varchar', length: 500 })
  run_command!: string;

  @Column({ type: 'varchar', length: 10 })
  file_extension!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
