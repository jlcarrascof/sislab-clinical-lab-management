import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TenantPlan {
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ unique: true, length: 100 })
  slug!: string;

  /** Fiscal ID (RIF in Venezuela, RUT/CUIT/NIT elsewhere) */
  @Column({ type: 'varchar', length: 20, nullable: true })
  tax_id!: string | null;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ type: 'enum', enum: TenantPlan, default: TenantPlan.BASIC })
  plan!: TenantPlan;

  @Column({ default: true })
  is_active!: boolean;

  /** Sales tax percentage applied on invoices (Sprint 8) */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 16,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  tax_rate!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
