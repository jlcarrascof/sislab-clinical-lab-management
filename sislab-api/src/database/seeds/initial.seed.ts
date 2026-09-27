import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Tenant, TenantPlan } from '../../tenants/entities/tenant.entity';
import { User, UserRole } from '../../users/entities/user.entity';

export const DEMO_TENANT_SLUG = 'lab-demo';
export const DEMO_PASSWORD = 'password123';

const DEMO_USERS = [
  {
    email: 'admin@lab-demo.com',
    role: UserRole.ADMIN,
    first_name: 'Admin',
    last_name: 'Sistema',
  },
  {
    email: 'tecnico@lab-demo.com',
    role: UserRole.TECNICO,
    first_name: 'Carlos',
    last_name: 'Pérez',
  },
  {
    email: 'medico@lab-demo.com',
    role: UserRole.MEDICO,
    first_name: 'María',
    last_name: 'Rodríguez',
  },
  {
    email: 'recepcion@lab-demo.com',
    role: UserRole.RECEPCIONISTA,
    first_name: 'Ana',
    last_name: 'Gómez',
  },
];

/** Idempotente: se puede correr varias veces sin duplicar datos */
export async function runInitialSeed(dataSource: DataSource): Promise<void> {
  const tenantRepo = dataSource.getRepository(Tenant);
  const userRepo = dataSource.getRepository(User);

  let tenant = await tenantRepo.findOneBy({ slug: DEMO_TENANT_SLUG });
  if (!tenant) {
    tenant = await tenantRepo.save(
      tenantRepo.create({
        name: 'Laboratorio Clínico Demo',
        slug: DEMO_TENANT_SLUG,
        rif: 'J-12345678-9',
        direccion: 'Av. Principal, Caracas',
        telefono: '0212-1234567',
        email: 'info@lab-demo.com',
        plan: TenantPlan.PROFESIONAL,
      }),
    );
    console.log(`✔ Tenant creado: ${DEMO_TENANT_SLUG}`);
  } else {
    console.log(`• Tenant ya existe: ${DEMO_TENANT_SLUG}`);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const data of DEMO_USERS) {
    const exists = await userRepo.existsBy({
      tenant_id: tenant.id,
      email: data.email,
    });
    if (exists) {
      console.log(`• Usuario ya existe: ${data.email}`);
      continue;
    }
    await userRepo.save(
      userRepo.create({
        ...data,
        tenant_id: tenant.id,
        password_hash: passwordHash,
      }),
    );
    console.log(`✔ Usuario creado: ${data.email} (${data.role})`);
  }

  console.log(
    `\nX-Tenant-ID: ${DEMO_TENANT_SLUG} — password de todos: ${DEMO_PASSWORD}`,
  );
}
