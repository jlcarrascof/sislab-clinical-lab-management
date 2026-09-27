import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Tenant, TenantPlan } from '../../tenants/entities/tenant.entity';
import { User, UserRole } from '../../users/entities/user.entity';

export const DEMO_TENANT_SLUG = 'lab-demo';
export const DEMO_PASSWORD = 'password123';

// Demo data represents a Spanish-speaking laboratory; code stays in English
const DEMO_USERS = [
  {
    email: 'admin@lab-demo.com',
    role: UserRole.ADMIN,
    first_name: 'Admin',
    last_name: 'Sistema',
  },
  {
    email: 'tech@lab-demo.com',
    role: UserRole.TECHNICIAN,
    first_name: 'Carlos',
    last_name: 'Pérez',
  },
  {
    email: 'doctor@lab-demo.com',
    role: UserRole.DOCTOR,
    first_name: 'María',
    last_name: 'Rodríguez',
  },
  {
    email: 'reception@lab-demo.com',
    role: UserRole.RECEPTIONIST,
    first_name: 'Ana',
    last_name: 'Gómez',
  },
];

/** Idempotent: safe to run multiple times without duplicating data */
export async function runInitialSeed(dataSource: DataSource): Promise<void> {
  const tenantRepo = dataSource.getRepository(Tenant);
  const userRepo = dataSource.getRepository(User);

  let tenant = await tenantRepo.findOneBy({ slug: DEMO_TENANT_SLUG });
  if (!tenant) {
    tenant = await tenantRepo.save(
      tenantRepo.create({
        name: 'Laboratorio Clínico Demo',
        slug: DEMO_TENANT_SLUG,
        tax_id: 'J-12345678-9',
        address: 'Av. Principal, Caracas',
        phone: '0212-1234567',
        email: 'info@lab-demo.com',
        plan: TenantPlan.PROFESSIONAL,
      }),
    );
    console.log(`✔ Tenant created: ${DEMO_TENANT_SLUG}`);
  } else {
    console.log(`• Tenant already exists: ${DEMO_TENANT_SLUG}`);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const data of DEMO_USERS) {
    const exists = await userRepo.existsBy({
      tenant_id: tenant.id,
      email: data.email,
    });
    if (exists) {
      console.log(`• User already exists: ${data.email}`);
      continue;
    }
    await userRepo.save(
      userRepo.create({
        ...data,
        tenant_id: tenant.id,
        password_hash: passwordHash,
      }),
    );
    console.log(`✔ User created: ${data.email} (${data.role})`);
  }

  console.log(
    `\nX-Tenant-ID: ${DEMO_TENANT_SLUG} — password for every user: ${DEMO_PASSWORD}`,
  );
}
