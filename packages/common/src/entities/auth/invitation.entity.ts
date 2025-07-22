import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InvitationChanel {
  EMAIL = 'email',
  PHONE = 'phone',
}
export enum InvitationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  USED = 'used',
  CANCELLED = 'cancelled',
}

@Entity('Invitations')
export class InvitationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', length: 255 })
  public code!: string;

  @Column({ type: 'varchar', length: 255 })
  public invitedUserRole!: string;

  @Column({ type: 'timestamp', nullable: false })
  public expiresAt!: Date;

  @Column({
    type: 'enum',
    enum: InvitationChanel,
    default: InvitationChanel.EMAIL,
  })
  public channel!: InvitationChanel;

  @Column({ type: 'varchar', length: 255 })
  public contact!: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.ACTIVE,
  })
  public status!: InvitationStatus;

  @Column({ type: 'uuid' })
  public createdBy!: string;

  @Column({ type: 'uuid', nullable: true })
  public usedBy?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  public updatedAt!: Date;
}
