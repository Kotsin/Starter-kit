import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserOperationTypeEnum } from '../../enums';
import { BatchOperationStatus } from '../../types';

@Entity('BatchOperation')
export class OperationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'enum', enum: UserOperationTypeEnum, name: 'operation_type' })
  public operationType!: UserOperationTypeEnum;

  @Column({ type: 'varchar' })
  public sql!: string;

  @Column({ type: 'enum', enum: BatchOperationStatus })
  public status!: BatchOperationStatus;

  @Column({ type: 'varchar', nullable: true })
  public error!: string | null;

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
