import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PermissionEntity } from './permissions.entity';
import { RoleEntity } from './role.entity';
import { UserEntity } from './user.entity';

@Index(['user'])
@Entity('UserRoles')
export class UserRoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => UserEntity, (user) => user.roles, { onDelete: 'CASCADE' })
  public user!: UserEntity;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  public role!: RoleEntity;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updated_at!: Date;

  @ManyToMany(() => PermissionEntity, { cascade: true })
  @JoinTable({ name: 'UserRolePermissions' })
  permissions!: PermissionEntity[];
}
