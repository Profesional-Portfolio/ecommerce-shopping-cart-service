import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { env } from '../config/env';

@Injectable()
export class RedisService
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    super({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
    });
  }

  onModuleInit() {
    this.logger.log(
      `Connected to Redis on ${env.REDIS_HOST}:${env.REDIS_PORT}`,
    );
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from Redis...');
    await this.quit();
  }
}
