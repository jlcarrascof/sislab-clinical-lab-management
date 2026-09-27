import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, TenantsModule],
  controllers: [HealthController],
})
export class AppModule {}
