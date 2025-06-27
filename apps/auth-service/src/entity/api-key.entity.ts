import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ApiKeys')
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  encryptedKey: string;

  @Column()
  type: string; // enum: 'read', 'write', 'admin', etc.

  @Column('simple-array', { nullable: true })
  encryptedAllowedIps: string[];

  @Column('simple-array', { nullable: true })
  permissions: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: false })
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
