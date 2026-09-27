import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TenantPlan {
  BASICO = 'BASICO',
  PROFESIONAL = 'PROFESIONAL',
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

  @Column({ type: 'varchar', length: 20, nullable: true })
  rif!: string | null;

  @Column({ type: 'varchar', nullable: true })
  direccion!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  @Column({ type: 'enum', enum: TenantPlan, default: TenantPlan.BASICO })
  plan!: TenantPlan;

  @Column({ default: true })
  is_active!: boolean;

  // Configuración del laboratorio (Sprint 8: facturación)
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 16,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  impuesto_porcentaje!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
