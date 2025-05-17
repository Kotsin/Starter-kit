import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  // OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserStatus, UserType } from '../../enums';
import { TwoFactorPermissionsEntity } from './2fa-permissions.entity';
import { UserLoginMethodsEntity } from './user-login-method.entity';
import { UserRoleEntity } from './user-role.entity';

@Index(['type', 'status'])
@Entity('User')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  public full_name!: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  public username!: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  public password!: string;

  @Column({ type: 'numeric', unique: true, default: null })
  public referral_code!: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  public status!: UserStatus;

  @Index()
  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.USER,
  })
  public type!: UserType;

  @Column({ type: 'jsonb', nullable: false, default: {} })
  public extra_data?: any;

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

  @DeleteDateColumn({
    type: 'timestamptz',
    default: null,
  })
  public deleted_at!: Date;

  @OneToMany(() => UserLoginMethodsEntity, (loginMethod) => loginMethod.user, {
    cascade: true,
  })
  public loginMethods!: UserLoginMethodsEntity[];

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user, {
    cascade: true,
  })
  public roles!: UserRoleEntity[];

  @OneToMany(
    () => TwoFactorPermissionsEntity,
    (twoFactorPermission) => twoFactorPermission.user,
    { cascade: true },
  )
  public twoFaPermissions!: TwoFactorPermissionsEntity[];
}
