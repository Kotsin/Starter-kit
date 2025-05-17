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

import { PermissionEntity } from './permissions.entity';
import { UserEntity } from './user.entity';
import { UserLoginMethodsEntity } from './user-login-method.entity';

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

  @ManyToOne(() => UserLoginMethodsEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'confirmation_method_id' })
  public confirmationMethod!: UserLoginMethodsEntity;

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
}
