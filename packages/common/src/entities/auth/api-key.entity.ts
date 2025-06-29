import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('api_keys')
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', unique: true, name: 'encrypted_key' })
  public encryptedKey!: string;

  @Column({ type: 'varchar' })
  public type!: string; // enum: 'read', 'write', 'admin', etc.

  @Column('simple-array', { nullable: true, name: 'encrypted_allowed_ips' })
  public encryptedAllowedIps!: string[];

  @Column('simple-array', { nullable: true })
  public permissions!: string[];

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  public isActive!: boolean;

  @Column({ type: 'timestamp', nullable: false, name: 'expired_at' })
  public expiredAt!: Date;

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
