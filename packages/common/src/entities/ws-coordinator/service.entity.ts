import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ServiceStatus, ServiceType } from '../../types';

@Entity('Service')
export class ServiceEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'text', unique: true })
  public url!: string;

  @Column({ enum: ServiceType })
  public type!: ServiceType;

  @Column({ default: 0 })
  public load!: number;

  @Column({ enum: ServiceStatus })
  public status!: ServiceStatus;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public last_updated!: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public created_at!: Date;
}
