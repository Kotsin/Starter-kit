import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

export enum LoginMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  TELEGRAM = 'telegram',
  GOOGLE = 'google',
  TWITTER = 'twitter',
}

@Entity('UserLoginMethods')
@Index(['login'], { unique: true })
export class UserLoginMethodsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => UserEntity, (user) => user.loginMethods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  public user!: UserEntity;

  @Column({ type: 'varchar', nullable: false })
  public user_id!: string;

  @Column({ type: 'enum', enum: LoginMethod })
  public method!: LoginMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public login!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public token!: string;

  @Column({ type: 'boolean', default: true })
  public is_primary!: boolean;

  @Column({ type: 'numeric', nullable: true })
  public code!: number;

  @Column({ type: 'timestamptz', nullable: true })
  public code_lifetime!: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at!: Date;
}
