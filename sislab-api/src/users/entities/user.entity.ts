import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  DOCTOR = 'DOCTOR',
  RECEPTIONIST = 'RECEPTIONIST',
}

@Entity('users')
@Index(['tenant_id', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenant_id!: string;

  @ManyToOne(() => Tenant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column()
  email!: string;

  // select: false → never loaded unless explicitly requested
  @Column({ select: false })
  password_hash!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ length: 100 })
  first_name!: string;

  @Column({ length: 100 })
  last_name!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
