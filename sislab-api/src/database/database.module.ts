import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get('NODE_ENV') === 'development';
        return {
          type: 'postgres' as const,
          host: config.getOrThrow<string>('DATABASE_HOST'),
          port: Number(config.getOrThrow('DATABASE_PORT')),
          database: config.getOrThrow<string>('DATABASE_NAME'),
          username: config.getOrThrow<string>('DATABASE_USER'),
          password: config.getOrThrow<string>('DATABASE_PASSWORD'),
          autoLoadEntities: true,
          synchronize: isDev, // dev only; production will use migrations
          logging: isDev ? ['error', 'warn'] : ['error'],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
