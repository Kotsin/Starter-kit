import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  // OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DefaultRole, UserStatus } from '../../enums';

import { TwoFactorPermissionsEntity } from './2fa-permissions.entity';
import { UserEntryMethodsEntity } from './entry-method.entity';
import { UserRoleEntity } from './user-role.entity';

@Index(['type', 'status'])
@Entity('Users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
    name: 'full_name',
  })
  public fullName!: string;

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

  @Column({
    type: 'numeric',
    unique: true,
    default: null,
    name: 'referral_code',
  })
  public referralCode!: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  public status!: UserStatus;

  @Index()
  @Column({
    type: 'enum',
    enum: DefaultRole,
    default: DefaultRole.USER,
  })
  public type!: DefaultRole;

  @Column({ type: 'jsonb', nullable: false, default: {}, name: 'extra_data' })
  public extraData?: any;

  @Column({ type: 'uuid', nullable: true, name: 'invited_by_id' })
  public invitedById?: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  public invitedBy?: UserEntity | null;

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

  @DeleteDateColumn({
    type: 'timestamptz',
    default: null,
    name: 'deleted_at',
  })
  public deletedAt!: Date;

  @OneToMany(() => UserEntryMethodsEntity, (loginMethod) => loginMethod.user, {
    cascade: true,
  })
  public loginMethods!: UserEntryMethodsEntity[];

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
