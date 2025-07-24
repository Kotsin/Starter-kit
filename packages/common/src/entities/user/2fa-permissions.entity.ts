import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntryMethodsEntity } from './entry-method.entity';
import { PermissionEntity } from './permissions.entity';
import { UserEntity } from './user.entity';

@Unique(['user', 'permission', 'confirmationMethod'])
@Entity('TwoFactorPermissions')
export class TwoFactorPermissionsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => UserEntity, (user) => user.twoFaPermissions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  public user!: UserEntity;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'permission_id' })
  public permission!: PermissionEntity;

  @ManyToOne(() => UserEntryMethodsEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'confirmation_method_id' })
  public confirmationMethod!: UserEntryMethodsEntity;

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
