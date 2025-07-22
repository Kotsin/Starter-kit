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

import { DefaultRole } from '../../enums';

import { PermissionEntity } from './permissions.entity';

@Entity('Roles')
export class RoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', default: DefaultRole.USER, unique: true })
  public name!: DefaultRole.USER;

  @Column({ type: 'varchar', nullable: true })
  public description!: string;

  @Column({ type: 'int', default: 0 })
  public level!: number;

  @Column({ type: 'varchar', nullable: true })
  public createdBy!: string;

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
