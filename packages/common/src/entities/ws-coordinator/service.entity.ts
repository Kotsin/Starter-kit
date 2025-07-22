import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ServiceStatus, ServiceType } from '../../interfaces';

@Entity('Service')
export class ServiceEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'text', unique: true })
  public url!: string;

  @Column({ type: 'enum', enum: ServiceType })
  public type!: ServiceType;

  @Column({ type: 'numeric', default: 0 })
  public load!: number;

  @Column({ type: 'enum', enum: ServiceStatus })
  public status!: ServiceStatus;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'last_updated',
  })
  public lastUpdated!: Date;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  public createdAt!: Date;
}
