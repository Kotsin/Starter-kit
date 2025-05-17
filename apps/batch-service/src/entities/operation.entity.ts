import { BatchOperationStatus, UserOperationTypeEnum } from '@crypton-nestjs-kit/common';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('BatchOperation')
export class OperationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'enum', enum: UserOperationTypeEnum })
  public operation_type!: UserOperationTypeEnum;

  @Column({ type: 'varchar' })
  public sql!: string;

  @Column({ type: 'enum', enum: BatchOperationStatus })
  public status!: BatchOperationStatus;

  @Column({ type: 'varchar', nullable: true })
  public error!: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at!: Date;
}
