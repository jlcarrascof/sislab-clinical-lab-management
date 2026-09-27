import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from '../users/entities/user.entity';

config({ quiet: true });

/** Standalone DataSource (outside Nest) for seeders and, later, migrations */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [Tenant, User],
  synchronize: process.env.NODE_ENV === 'development',
});
