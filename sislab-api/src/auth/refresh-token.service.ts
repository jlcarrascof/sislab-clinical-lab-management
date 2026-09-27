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
 * Opaque refresh tokens stored in Redis (key = SHA-256 hash of the token).
 * - Rotation: every use invalidates the token and issues a new one.
 * - Revocation: logout deletes the key; deactivating a user cuts their session on the next refresh.
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

  /** Atomic read-and-delete: a token can only be used once */
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
