import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PermissionEntity } from './permissions.entity';

@Entity('Roles')
export class RoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', unique: true })
  public name!: string;

  @Column({ type: 'varchar', nullable: true })
  public description!: string;

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

  @ManyToMany(() => PermissionEntity, { cascade: true })
  @JoinTable({ name: 'RolePermissions' })
  public permissions!: PermissionEntity[];
}
