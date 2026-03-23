import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  RABBITMQ_URLS: z.array(z.string()),
  RABBITMQ_QUEUE: z.string().default('ecommerce_queue'),
  REDIS_HOST: z.string().default('redis'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default('redis123'),
});

console.log('envs', process.env.NODE_ENV);

export const result = envSchema.safeParse({
  ...process.env,
  RABBITMQ_URLS: process.env.RABBITMQ_URLS?.split(',').filter(Boolean) || [
    'amqp://rabbitmq:rabbitmq123@localhost:5672',
  ],
});

if (!result.success) {
  console.error('Invalid environment variables:', result.error.format());
  process.exit(1);
}

export type EnvType = z.infer<typeof envSchema>;

export const env = result.data;
