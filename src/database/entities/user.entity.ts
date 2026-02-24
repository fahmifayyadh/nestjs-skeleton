import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, nullable: true })
  phone!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  profilePicture!: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status!: string;

  @Column({ nullable: true })
  resetPasswordToken!: string;

  @Column({ nullable: true })
  resetPasswordExpires!: Date;

  @Column({ nullable: true })
  lastLogin!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
