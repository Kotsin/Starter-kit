import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SessionStatus {
  ACTIVE = 'active',
  TERMINATED = 'terminated',
  INACTIVE = 'inactive',
}

@Entity('Session')
export class SessionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', length: 255, name: 'user_id' })
  public userId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'user_agent',
  })
  public userAgent!: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  public role!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'user_ip',
  })
  public userIp!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public fingerprint!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public country!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public city!: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  public status!: 'active' | 'terminated' | 'expired';

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  public createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  public updatedAt!: Date;
}
