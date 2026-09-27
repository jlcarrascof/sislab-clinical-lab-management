import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import Redis from 'ioredis';
import { REDIS } from '../redis/redis.module';

interface RefreshSession {
  userId: string;
  tenantId: string;
}

/**
 * Refresh tokens opacos guardados en Redis (clave = hash SHA-256 del token).
 * - Rotación: cada uso invalida el token y emite uno nuevo.
 * - Revocación: logout borra la clave; desactivar un usuario corta su sesión en el próximo refresh.
 */
@Injectable()
export class RefreshTokenService {
  private readonly ttlSeconds: number;

  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    config: ConfigService,
  ) {
    this.ttlSeconds = Number(config.get('JWT_REFRESH_EXPIRES_SECONDS', 604800));
  }

  async issue(session: RefreshSession): Promise<string> {
    const token = randomBytes(48).toString('base64url');
    await this.redis.set(
      this.key(token),
      JSON.stringify(session),
      'EX',
      this.ttlSeconds,
    );
    return token;
  }

  /** Lee y borra de forma atómica: un token solo se puede usar una vez */
  async consume(token: string): Promise<RefreshSession | null> {
    const raw = await this.redis.getdel(this.key(token));
    return raw ? (JSON.parse(raw) as RefreshSession) : null;
  }

  async revoke(token: string): Promise<void> {
    await this.redis.del(this.key(token));
  }

  private key(token: string): string {
    return `refresh:${createHash('sha256').update(token).digest('hex')}`;
  }
}
