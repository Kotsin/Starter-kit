import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Unique(['alias', 'route'])
@Entity('Permissions')
export class PermissionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', unique: false })
  public route!: string;

  @Column({ type: 'varchar', nullable: true })
  public method!: string;

  @Column({ type: 'varchar', nullable: true })
  public alias!: string;

  @Column({ type: 'text', nullable: true })
  public description!: string;

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
