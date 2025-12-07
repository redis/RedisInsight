import { Module } from '@nestjs/common';
import { RedisSentinelService } from 'src/modules/redis-sentinel/redis-sentinel.service';
import { RedisSentinelController } from 'src/modules/redis-sentinel/redis-sentinel.controller';
import { RedisSentinelAnalytics } from 'src/modules/redis-sentinel/redis-sentinel.analytics';

@Module({
  controllers: [RedisSentinelController],
  providers: [RedisSentinelService, RedisSentinelAnalytics],
  exports: [RedisSentinelService, RedisSentinelAnalytics],
})
export class RedisSentinelModule {}
