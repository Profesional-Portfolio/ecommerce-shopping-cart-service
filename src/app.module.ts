import { Module } from '@nestjs/common';
import { RedisModule } from './modules/redis/redis.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [RedisModule, CartModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
