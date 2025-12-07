import { Module, Type } from '@nestjs/common';
import { RedisClientFactory } from 'src/modules/redis/redis.client.factory';
import { IoredisRedisConnectionStrategy } from 'src/modules/redis/connection/ioredis.redis.connection.strategy';
import { NodeRedisConnectionStrategy } from 'src/modules/redis/connection/node.redis.connection.strategy';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import { LocalRedisClientFactory } from 'src/modules/redis/local.redis.client.factory';

@Module({})
export class RedisModule {
  static register(
    redisClientFactory: Type<RedisClientFactory> = LocalRedisClientFactory,
  ) {
    return {
      module: RedisModule,
      providers: [
        RedisClientStorage,
        {
          provide: RedisClientFactory,
          useClass: redisClientFactory,
        },
        IoredisRedisConnectionStrategy,
        NodeRedisConnectionStrategy,
      ],
      exports: [RedisClientStorage, RedisClientFactory],
    };
  }
}
